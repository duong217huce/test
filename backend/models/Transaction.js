import mongoose from 'mongoose';

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['earn', 'spend', 'purchase'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }, // optional
  balanceAfter: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
