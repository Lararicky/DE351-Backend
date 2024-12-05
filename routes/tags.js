const express = require("express");
const router = express.Router();
const Tag = require("./../db/tags");

// Create a new tag
router.post("/newtag", async (req, res) => {
    let model = req.body;

    let tag = new Tag({
        tag_name: model.tag_name,
    });

    await tag.save(); // ใช้ await เพื่อรอให้บันทึกเสร็จ
    res.send(tag.toObject());
});

// Get all tags
router.get("/tags", async (req, res) => {
    try {
        const tags = await Tag.find(); // Fetch all tags from the database
        res.json(tags); // Send the tags as a JSON response
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle any errors
    }
});

module.exports = router;