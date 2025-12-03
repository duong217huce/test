# Hướng dẫn cấu hình VNPay

## 1. Đăng ký tài khoản VNPay

1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản merchant
3. Lấy thông tin:
   - **TMN Code** (Terminal Code)
   - **Hash Secret** (Secret Key)

## 2. Cấu hình biến môi trường

Thêm các biến sau vào file `.env` trong thư mục `backend/`:

```env
# VNPay Configuration
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/callback
FRONTEND_URL=http://localhost:5173
```

### Giải thích:

- **VNPAY_TMN_CODE**: Mã Terminal Code từ VNPay
- **VNPAY_HASH_SECRET**: Secret Key để tạo và verify chữ ký
- **VNPAY_URL**: URL của VNPay (sandbox hoặc production)
  - Sandbox: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
  - Production: `https://www.vnpay.vn/paymentv2/vpcpay.html`
- **VNPAY_RETURN_URL**: URL callback sau khi thanh toán (phải khớp với cấu hình trên VNPay)
- **FRONTEND_URL**: URL frontend của bạn

## 3. Cấu hình trên VNPay Dashboard

1. Đăng nhập vào VNPay Dashboard
2. Vào phần **Cấu hình** > **Thông tin website**
3. Thêm **Return URL**: `http://localhost:5173/payment/callback` (hoặc URL production của bạn)

## 4. Quy đổi tiền tệ

- **10 DP = 10,000 VND** (1 DP = 1,000 VND)
- Số tiền nạp tối thiểu: **10,000 VND** (10 DP)
- Số tiền nạp tối đa: **10,000,000 VND** (10,000 DP)

## 5. Luồng thanh toán

1. User chọn số tiền nạp trên trang `/recharge`
2. Hệ thống tạo payment URL từ VNPay
3. User được chuyển đến trang thanh toán VNPay
4. User thanh toán trên VNPay
5. VNPay redirect về `/payment/callback` với kết quả
6. Backend xác thực chữ ký và cộng DP cho user
7. Frontend hiển thị kết quả và cập nhật số dư DP

## 6. Test với tài khoản sandbox

VNPay cung cấp các thẻ test:
- **Ngân hàng**: NCB
- **Số thẻ**: 9704198526191432198
- **Tên chủ thẻ**: NGUYEN VAN A
- **Ngày phát hành**: 07/15
- **Mã OTP**: 123456

## 7. Chuyển sang Production

Khi sẵn sàng chuyển sang production:

1. Đăng ký tài khoản production tại https://www.vnpay.vn/
2. Cập nhật `.env`:
   ```env
   VNPAY_URL=https://www.vnpay.vn/paymentv2/vpcpay.html
   VNPAY_RETURN_URL=https://yourdomain.com/payment/callback
   FRONTEND_URL=https://yourdomain.com
   ```
3. Cập nhật Return URL trên VNPay Dashboard
4. Test lại toàn bộ luồng thanh toán

## 8. Xử lý lỗi thường gặp

### Lỗi "Invalid signature"
- Kiểm tra `VNPAY_HASH_SECRET` có đúng không
- Đảm bảo không có khoảng trắng thừa trong `.env`

### Lỗi "Return URL mismatch"
- Kiểm tra `VNPAY_RETURN_URL` trong `.env` khớp với cấu hình trên VNPay Dashboard

### Payment không cộng DP
- Kiểm tra logs trong backend console
- Kiểm tra transaction trong database
- Đảm bảo callback URL có thể truy cập được từ internet (production)

