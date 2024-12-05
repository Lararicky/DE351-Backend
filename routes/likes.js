const express = require("express");
const router = express.Router();
const Like = require("../db/likes");

// Add a like to a story
router.post("/", async (req, res) => {
    const { user_id, story_id } = req.body;

    if (!user_id || !story_id) {
        return res.status(400).json({ message: "user_id and story_id are required." });
    }

    try {
        // ห้าม Like ซ้ำ
        const existingLike = await Like.findOne({ user_id, story_id });
        if (existingLike) {
            return res.status(400).json({ message: "You have already liked this story." });
        }

        const like = new Like({ user_id, story_id });
        const savedLike = await like.save();
        res.status(201).json(savedLike);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a like
router.delete("/:id", async (req, res) => {
    const { user_id } = req.body; // ดึง user_id จาก body (อาจส่งมาพร้อม request)
    const story_id = req.params.id;

    if (!user_id || !story_id) {
        return res.status(400).json({ message: "user_id and story_id are required." });
    }

    try {
        const deletedLike = await Like.findOneAndDelete({ user_id, story_id });

        if (!deletedLike) {
            return res.status(404).json({ message: "Like not found." });
        }

        res.status(200).json({ message: "Like removed successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all likes for a story
router.get("/story/:id", async (req, res) => {
    try {
        const likes = await Like.find({ story_id: req.params.id });
        res.json(likes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/count/story/:story_id", async (req, res) => {
    try {
        const { story_id } = req.params;
        const count = await Like.countDocuments({ story_id });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;