const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// VNPay Configuration
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || 'YOUR_TMN_CODE';
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'YOUR_HASH_SECRET';
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:5173/payment/callback';

// Helper function to create VNPay payment URL
function createPaymentUrl(amount, orderId, orderInfo, userId) {
  const vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = VNPAY_TMN_CODE;
  vnp_Params['vnp_Amount'] = amount * 100; // VNPay expects amount in cents
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_ReturnUrl'] = VNPAY_RETURN_URL;
  vnp_Params['vnp_IpAddr'] = '127.0.0.1';
  vnp_Params['vnp_CreateDate'] = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '000';

  // Sort params
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

  // Create query string
  const signData = new URLSearchParams(sortedParams).toString();
  
  // Create secure hash
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(signData).digest('hex');
  
  // Add signature to params
  sortedParams['vnp_SecureHash'] = signed;

  // Build payment URL
  const paymentUrl = VNPAY_URL + '?' + new URLSearchParams(sortedParams).toString();
  
  return paymentUrl;
}

// Helper function to verify VNPay callback
function verifyPaymentCallback(vnp_Params) {
  const secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Sort params
  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

  // Create query string
  const signData = new URLSearchParams(sortedParams).toString();
  
  // Create secure hash
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(signData).digest('hex');

  return secureHash === signed;
}

// @route   POST /api/payment/create
// @desc    Create VNPay payment URL
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { amount } = req.body; // amount in VND

    if (!amount || amount < 10000) {
      return res.status(400).json({ 
        message: 'Số tiền nạp tối thiểu là 10,000 VND' 
      });
    }

    if (amount > 10000000) {
      return res.status(400).json({ 
        message: 'Số tiền nạp tối đa là 10,000,000 VND' 
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique order ID
    const orderId = `RECHARGE_${userId}_${Date.now()}`;
    
    // Calculate DP to add (10 DP = 10000 VND, so 1 DP = 1000 VND)
    const dpToAdd = Math.floor(amount / 1000);
    
    // Create order info
    const orderInfo = `Nap tien ${dpToAdd} DP - ${user.username}`;

    // Create payment URL
    const paymentUrl = createPaymentUrl(amount, orderId, orderInfo, userId);

    // Save transaction record (pending)
    await Transaction.create({
      userId: userId,
      type: 'deposit',
      amount: dpToAdd,
      orderId: orderId,
      status: 'pending'
    });

    console.log(`✅ Created payment URL for user ${user.username}: ${amount} VND = ${dpToAdd} DP`);

    res.json({
      success: true,
      paymentUrl: paymentUrl,
      orderId: orderId,
      amount: amount,
      dpToAdd: dpToAdd
    });

  } catch (error) {
    console.error('❌ Error creating payment:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi tạo thanh toán', 
      error: error.message 
    });
  }
});

// @route   GET /api/payment/callback
// @desc    Handle VNPay payment callback
// @access  Public
router.get('/callback', async (req, res) => {
  try {
    const vnp_Params = req.query;
    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const transactionStatus = vnp_Params['vnp_TransactionStatus'];
    const amount = parseInt(vnp_Params['vnp_Amount']) / 100; // Convert from cents to VND

    // Verify payment signature
    const isValid = verifyPaymentCallback({ ...vnp_Params });

    if (!isValid) {
      console.error('❌ Invalid payment signature');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?success=false&message=Invalid signature`);
    }

    // Check payment status
    if (responseCode === '00' && transactionStatus === '00') {
      // Payment successful
      // Extract userId from orderId (format: RECHARGE_userId_timestamp)
      const orderParts = orderId.split('_');
      if (orderParts.length < 3 || orderParts[0] !== 'RECHARGE') {
        console.error('❌ Invalid order ID format:', orderId);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?success=false&message=Invalid order ID`);
      }

      const userId = orderParts[1];
      const user = await User.findById(userId);

      if (!user) {
        console.error('❌ User not found:', userId);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?success=false&message=User not found`);
      }

      // Calculate DP to add (10 DP = 10000 VND)
      const dpToAdd = Math.floor(amount / 1000);

      // Add DP to user
      user.coins += dpToAdd;
      await user.save();

      // Update transaction record
      const transaction = await Transaction.findOne({
        orderId: orderId,
        userId: userId,
        type: 'deposit'
      });

      if (transaction) {
        transaction.amount = dpToAdd;
        transaction.status = 'completed';
        await transaction.save();
      } else {
        // Create new transaction if not found
        await Transaction.create({
          userId: userId,
          type: 'deposit',
          amount: dpToAdd,
          orderId: orderId,
          status: 'completed'
        });
      }

      console.log(`✅ Payment successful: User ${user.username} received ${dpToAdd} DP (${amount} VND)`);

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?success=true&amount=${amount}&dp=${dpToAdd}`);
    } else {
      // Payment failed
      console.error('❌ Payment failed:', {
        responseCode,
        transactionStatus,
        orderId
      });

      // Update transaction status to failed
      const transaction = await Transaction.findOne({
        orderId: orderId
      });

      if (transaction) {
        transaction.status = 'failed';
        await transaction.save();
      }

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?success=false&message=Payment failed`);
    }

  } catch (error) {
    console.error('❌ Error processing payment callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback?success=false&message=Server error`);
  }
});

module.exports = router;

