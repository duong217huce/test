const mongoose = require('mongoose');

const userAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedAnswers: [{ type: mongoose.Schema.Types.ObjectId }], // IDs của đáp án được chọn
  isCorrect: { type: Boolean, default: false }
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mode: {
    type: String,
    enum: ['practice', 'exam'], // Ôn thi / Thi thử
    required: true
  },
  answers: [userAnswerSchema],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  timeSpent: { type: Number }, // Giây
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    shuffleAnswers: { type: Boolean, default: false },
    autoAdvance: { type: Number, default: 0 } // Giây
  }
});

// Tính điểm khi lưu
quizAttemptSchema.pre('save', function(next) {
  if (this.completedAt) {
    // Công thức: (10 / Tổng số câu) × Số câu đúng
    this.score = (10 / this.totalQuestions) * this.correctAnswers;
    this.score = Math.round(this.score * 10) / 10; // Làm tròn 1 chữ số
  }
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
