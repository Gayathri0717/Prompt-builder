const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title: { type: String, required: true },
  role: { type: String, required: true },
  task: { type: String, required: true },
  context: { type: String },
  persona: { type: String },
  category: { type: String, default: 'General' },
   text: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Prompt', promptSchema);
