const express = require("express");
const router = express.Router();
const User = require("../db/users");
const bcrypt = require("bcrypt"); // สำหรับการเปรียบเทียบรหัสผ่านที่เข้ารหัส
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'Shush12345'; // ใช้คีย์ลับที่ปลอดภัยสำหรับ production

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // เพิ่ม debug log
        console.log("Login attempt:", { username });

        // ค้นหาผู้ใช้ตาม username
        const user = await User.findOne({ username });
        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // debug log สำหรับ password comparison
        console.log("Found user:", {
            username: user.username,
            hashedPassword: user.password
        });

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ล็อกอินสำเร็จ - สร้าง JWT token
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Signup
router.post("/signup", async (req, res) => {
    try {
        // เช็ค username ซ้ำ
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // สร้าง User โดยไม่ต้องแฮชรหัสผ่านในที่นี้ เพราะจะถูกจัดการโดย Mongoose middleware
        const user = new User({
            email: req.body.email,
            password: req.body.password, // ส่งรหัสผ่านแบบ plaintext ให้ Mongoose middleware จัดการ
            username: req.body.username,
        });

        const newUser = await user.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all users 
router.get('/list', async (req, res) => {
    try {
        const users = await User.find({}, 'username _id'); // ดึง username และ _id
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/details', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'User not logged in' });
    }
    res.json({ userId: req.session.userId });
});

// Get a specific user 
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a user 
router.patch("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a user 
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;