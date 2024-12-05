const express = require("express");
const router = express.Router();
const Comment = require("../db/comments");
const Story = require("../db/stories");
const User = require("../db/users");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "Shush12345";

// Middleware สำหรับตรวจสอบ JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "No token provided." });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Failed to authenticate token." });
        req.user = { _id: decoded.userId }; // ตั้งค่า userId ใน request
        next();
    });
};

// POST: เพิ่มคอมเม้นต์ใหม่
router.post("/", verifyToken , async (req, res) => {
    try {
        const { content, story_id } = req.body;
        const created_by = req.user._id;

        if (!content || !story_id) {
            return res.status(400).json({ error: "Content and story_id are required." });
        }

        const newComment = new Comment({ content, created_by, story_id });
        await newComment.save();

        const savedComment = await Comment.findById(newComment._id).populate("created_by", "username");

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// GET: ดึงคอมเม้นต์ทั้งหมดของเรื่องหนึ่ง
router.get("/story/:story_id", async (req, res) => {
    try {
        const { story_id } = req.params;

        const comments = await Comment.find({ story_id })
            .populate("created_by", "username") // ดึงข้อมูล username ของผู้สร้างคอมเม้นต์
            .exec();

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// PUT: แก้ไขคอมเม้นต์
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Content is required." });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { content },
            { new: true } // ส่งกลับคอมเม้นต์ที่ถูกอัปเดต
        );

        if (!updatedComment) {
            return res.status(404).json({ error: "Comment not found." });
        }

        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// DELETE: ลบคอมเม้นต์
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedComment = await Comment.findByIdAndDelete(id);

        if (!deletedComment) {
            return res.status(404).json({ error: "Comment not found." });
        }

        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/count/story/:story_id", async (req, res) => {
    try {
        const { story_id } = req.params;
        const count = await Comment.countDocuments({ story_id });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
