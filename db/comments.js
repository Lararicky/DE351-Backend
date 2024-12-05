const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    story_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Comment", commentSchema);