require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected!');
    process.exit(0);
  })
  .catch(err => {
    console.log('Mongo Error:', err);
    process.exit(1);
  });
