const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    genre: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Tag",
        required: true
     }
    ],
    status: {
        type: String,
        enum: ["draft", "active", "inactive", "completed"], // Example status values
        default: "active"
    },
    content: { 
        type: String, 
        required: true 
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true
    },
    coverImage: { // ฟิลด์ใหม่สำหรับเก็บรูปภาพ
        type: String, // เก็บเป็น Base64 หรือ URL
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Story", storySchema);