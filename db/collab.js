const mongoose = require('mongoose');

const collabSchema = new mongoose.Schema({
  story_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  username: { type: String, required: true }, // ชื่อผู้คอลแลป
  content: { type: String, required: true }, // เนื้อหาคอลแลป
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collaboration', collabSchema);
