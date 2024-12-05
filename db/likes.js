const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    story_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
        required: true
    },
},
    {
        timestamps: true
    });

likeSchema.index({ user_id: 1, story_id: 1 }, { unique: true }); // ห้าม Like ซ้ำ
module.exports = mongoose.model("Like", likeSchema);