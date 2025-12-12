const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  latitude:    { type: Number, required: true },
  longitude:   { type: Number, required: true },
  imageUrl:    { type: String },
  status:      { type: String, enum: ['open', 'resolved'], default: 'open' },
  reportedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);