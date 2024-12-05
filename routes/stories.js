const express = require("express");
const router = express.Router();
const Story = require("../db/stories");
const Collaboration = require('../db/collab'); // ใช้โมเดล Collaboration ที่เก็บข้อมูลคอลแลป
const fileUpload = require("express-fileupload");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'Shush12345';

// Middleware สำหรับตรวจสอบ JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token.' });
        req.user = { _id: decoded.userId }; // ตั้งค่าผู้ใช้ที่ผ่านการตรวจสอบ Token
        next();
    });
};

// Get all stories
router.get("/stories", async (req, res) => {
    try {
        const stories = await Story.find()
            .populate('genre')
            .populate('created_by')
            .sort({ created_at: -1 }); // เรียงลำดับจากล่าสุดไปเก่า
        res.json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get story by ID
router.get("/stories/:id", async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate('genre')
            .populate('created_by');
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(story);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Use fileUpload middleware
router.use(fileUpload());

// Apply verifyToken middleware to route for creating a new story
router.post("/newstory", verifyToken, async (req, res) => {
    try {
        const { title, genre, status, content } = req.body;

        console.log(title, genre, status, content)
        const created_by = req.user._id;

        // Validate that required fields are provided
        if (!title || !content || !created_by) {
            return res.status(400).json({ message: "Title, content, and creator are required." });
        }

        // ตรวจสอบว่ามีไฟล์อัพโหลดหรือไม่
        let coverImage = null;
        if (req.files && req.files.coverImage) {
            const image = req.files.coverImage;
            coverImage = image.data.toString('base64'); // แปลงข้อมูลไฟล์เป็น Base64 string
        }

        // ตรวจสอบว่า genre ที่ส่งมาเป็น ObjectId หรือไม่ (แปลงจากชื่อ tag ถ้าจำเป็น)
        // สมมติว่า genre เป็น array ของชื่อ tag

        const Tag = require("../db/tags");  // สมมติว่า Tag เป็น Model ของ tags ที่มี _id
        const genreIds = await Tag.find({ tag_name: { $in: genre } }).select('_id'); // ค้นหา ObjectId จาก tag_name
        const genreIdsArray = genreIds.map(tag => tag._id);

        const story = new Story({
            title,
            genre: genreIdsArray,  // ใช้ ObjectId แทน string
            status,
            content,
            created_by,
            coverImage
        });

        // Save the new story
        const newStory = await story.save();
        res.status(201).json(newStory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// API ดึงเรื่องราวตาม ID (ยังคงเดิม)
router.get("/stories/:id", async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate("genre")
            .populate("created_by");
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }
        res.json(story);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API ดึงข้อมูล Collaboration แยกต่างหาก
router.get("/stories/:id/collaborations", async (req, res) => {
    const { id } = req.params;
    try {
        // ดึงข้อมูล Collaboration ทั้งหมดที่เกี่ยวข้องกับ story_id
        const collaborations = await Collaboration.find({ story_id: id }).sort({ created_at: 1 });
        res.status(200).json(collaborations);
    } catch (error) {
        console.error("Error fetching collaborations:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// API สำหรับเพิ่ม Collaboration
router.post("/stories/:id/collaborations", async (req, res) => {
    const { id } = req.params;
    const { username, content } = req.body;

    try {
        if (!username || !content) {
            return res.status(400).json({ error: "Username and content are required." });
        }

        // สร้าง Collaboration ใหม่
        const newCollab = new Collaboration({
            story_id: id,
            username,
            content,
        });

        // บันทึกลง MongoDB
        await newCollab.save();

        // ส่งข้อมูลกลับไปยัง Frontend
        res.status(201).json(newCollab);
    } catch (error) {
        console.error("Error saving collaboration:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// API ดึงข้อมูล Story รวม Collaborations
router.get('/stories/:id/full', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate('genre')
            .populate('created_by');

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        const collaborations = await Collaboration.find({ story_id: req.params.id }).sort({ created_at: 1 });

        // รวมเนื้อหา Collaboration เข้าไปใน story.content
        const fullContent = [story.content, ...collaborations.map(c => `\n\n${c.username}: ${c.content}`)].join('');

        res.json({
            ...story.toObject(), // แปลง Story เป็น Object
            content: fullContent // แทนที่เนื้อหาด้วยเนื้อหาเต็ม
        });
    } catch (err) {
        console.error('Error fetching story with collaborations:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;