const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Cấu hình multer cho ảnh bìa quiz
const coversDir = path.join(__dirname, '../uploads/quiz-covers');

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coversDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận ảnh: JPG, PNG, GIF'));
    }
  }
});

// @route   GET /api/quizzes
// @desc    Lấy danh sách quiz
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { grade, subject, createdBy } = req.query;
    let filter = { isPublished: true };
    
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (createdBy) filter.createdBy = createdBy;
    
    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .select('-sections.questions.answers.isCorrect'); // Ẩn đáp án đúng
    
    res.json(quizzes);
  } catch (error) {
    console.error('❌ Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Lấy chi tiết quiz
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'username fullName');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Ẩn đáp án đúng nếu không phải người tạo
    const isOwner = req.user && req.user.id === quiz.createdBy._id.toString();
    
    if (!isOwner) {
      quiz.sections.forEach(section => {
        section.questions.forEach(question => {
          question.answers = question.answers.map(answer => ({
            _id: answer._id,
            content: answer.content
            // Không trả về isCorrect
          }));
        });
      });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('❌ Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/quizzes
// @desc    Tạo quiz mới
// @access  Private
router.post('/', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, grade, subject, duration, password, sections, isPublished } = req.body;
    
    let coverImageUrl = null;
    if (req.file) {
      coverImageUrl = `${req.protocol}://${req.get('host')}/uploads/quiz-covers/${req.file.filename}`;
    }
    
    const parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
    
    // Xử lý isPublished: FormData gửi string, cần convert sang boolean
    // Nếu không có thì mặc định là true (publish ngay)
    let published = true;
    if (isPublished !== undefined) {
      if (typeof isPublished === 'string') {
        published = isPublished === 'true' || isPublished === '1';
      } else {
        published = Boolean(isPublished);
      }
    }
    
    console.log('📝 Creating quiz with isPublished:', published, '(from:', isPublished, ')');
    
    const newQuiz = new Quiz({
      title,
      description,
      coverImage: coverImageUrl,
      grade,
      subject,
      duration: parseInt(duration),
      password,
      sections: parsedSections || [],
      createdBy: req.user.id,
      isPublished: published
    });
    
    const savedQuiz = await newQuiz.save();
    
    // Thêm vào danh sách quiz của user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { quizzesCreated: savedQuiz._id }
    });
    
    console.log('✅ Quiz created:', savedQuiz._id);
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('❌ Error creating quiz:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Cập nhật quiz
// @access  Private (Owner only)
router.put('/:id', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, description, grade, subject, duration, password, sections, isPublished } = req.body;
    
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (grade) quiz.grade = grade;
    if (subject) quiz.subject = subject;
    if (duration) quiz.duration = parseInt(duration);
    if (password !== undefined) quiz.password = password;
    if (sections) {
      quiz.sections = typeof sections === 'string' ? JSON.parse(sections) : sections;
    }
    if (isPublished !== undefined) quiz.isPublished = isPublished;
    
    if (req.file) {
      // Xóa ảnh cũ
      if (quiz.coverImage) {
        const oldFilename = path.basename(quiz.coverImage);
        const oldPath = path.join(coversDir, oldFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      quiz.coverImage = `${req.protocol}://${req.get('host')}/uploads/quiz-covers/${req.file.filename}`;
    }
    
    await quiz.save();
    
    console.log('✅ Quiz updated:', quiz._id);
    res.json(quiz);
  } catch (error) {
    console.error('❌ Error updating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Xóa quiz
// @access  Private (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Xóa ảnh bìa
    if (quiz.coverImage) {
      const filename = path.basename(quiz.coverImage);
      const filePath = path.join(coversDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Quiz.findByIdAndDelete(req.params.id);
    
    console.log('✅ Quiz deleted:', req.params.id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/quizzes/:id/start
// @desc    Bắt đầu làm quiz
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const { mode, settings, password } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Kiểm tra mật khẩu
    if (quiz.password && quiz.password !== password) {
      return res.status(403).json({ message: 'Incorrect password' });
    }
    
    // Đếm tổng số câu hỏi
    const totalQuestions = quiz.sections.reduce((sum, section) => sum + section.questions.length, 0);
    
    const attempt = new QuizAttempt({
      quiz: quiz._id,
      user: req.user.id,
      mode,
      totalQuestions,
      settings: settings || {}
    });
    
    await attempt.save();
    
    // Thêm vào danh sách attempts của user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { quizAttempts: attempt._id }
    });
    
    console.log('✅ Quiz attempt started:', attempt._id);
    res.status(201).json({ attemptId: attempt._id, quiz });
  } catch (error) {
    console.error('❌ Error starting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Nộp bài quiz
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    
    const attempt = await QuizAttempt.findById(attemptId).populate('quiz');
    
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const quiz = attempt.quiz;
    let correctCount = 0;
    
    // Chấm điểm
    const gradedAnswers = answers.map(userAnswer => {
      const question = quiz.sections
        .flatMap(s => s.questions)
        .find(q => q._id.toString() === userAnswer.questionId);
      
      if (!question) return { ...userAnswer, isCorrect: false };
      
      const correctAnswerIds = question.answers
        .filter(a => a.isCorrect)
        .map(a => a._id.toString());
      
      const selectedIds = userAnswer.selectedAnswers.map(id => id.toString());
      
      // Kiểm tra đúng: số lượng và nội dung phải khớp
      const isCorrect = 
        selectedIds.length === correctAnswerIds.length &&
        selectedIds.every(id => correctAnswerIds.includes(id));
      
      if (isCorrect) correctCount++;
      
      return {
        questionId: userAnswer.questionId,
        selectedAnswers: userAnswer.selectedAnswers,
        isCorrect
      };
    });
    
    attempt.answers = gradedAnswers;
    attempt.correctAnswers = correctCount;
    attempt.completedAt = new Date();
    attempt.timeSpent = Math.floor((attempt.completedAt - attempt.startedAt) / 1000);
    
    await attempt.save();
    
    console.log('✅ Quiz submitted:', attempt._id, 'Score:', attempt.score);
    res.json({
      score: attempt.score,
      correctAnswers: correctCount,
      totalQuestions: attempt.totalQuestions,
      answers: gradedAnswers
    });
  } catch (error) {
    console.error('❌ Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;