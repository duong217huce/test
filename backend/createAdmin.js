const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educonnect');
    console.log('📦 Connected to MongoDB');

    // Xóa admin cũ
    const deleted = await User.deleteOne({ username: 'admin' });
    console.log('🗑️ Deleted old admin:', deleted.deletedCount);

    // Hash password "123" - Tạo hash MỚI mỗi lần chạy
    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔒 Hashed password for "123":', hashedPassword);
    
    // Tạo admin mới
    const admin = new User({
      username: 'admin',
      email: 'admin@educonnect.com',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'admin',
      coins: 999999,
      phone: '',
      hocCap: '',
      lop: '',
      chuyenNganh: '',
      bio: ''
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    
    // Test password ngay lập tức
    const testUser = await User.findOne({ username: 'admin' });
    const isPasswordValid = await bcrypt.compare('123', testUser.password);
    
    console.log('\n═══════════════════════════════════');
    console.log('✅ ADMIN ACCOUNT CREATED');
    console.log('═══════════════════════════════════');
    console.log('Username:', testUser.username);
    console.log('Password:', password);
    console.log('Role:', testUser.role);
    console.log('Password Test:', isPasswordValid ? '✅ PASS' : '❌ FAIL');
    console.log('═══════════════════════════════════\n');
    
    if (!isPasswordValid) {
      console.error('❌ ERROR: Password verification FAILED!');
      process.exit(1);
    }
    
    await mongoose.connection.close();
    console.log('🎉 Admin account ready to use!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
