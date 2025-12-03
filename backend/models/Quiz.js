const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

const questionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['single', 'multiple'], 
    default: 'single' 
  },
  topic: { type: String }, // Chú đề học tập
  answers: [answerSchema],
  order: { type: Number, default: 0 }
});

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  questions: [questionSchema],
  order: { type: Number, default: 0 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  grade: { type: String }, // Lớp
  subject: { type: String }, // Môn học
  duration: { type: Number, required: true }, // Phút
  password: { type: String }, // Mật khẩu (optional)
  sections: [sectionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware tự động update updatedAt
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);