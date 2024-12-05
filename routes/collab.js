const express = require('express');
const router = express.Router();
const Collaboration = require('../db/collab');

// เพิ่มคอลแลปใหม่
router.post('/', async (req, res) => {
    const { story_id, username, content } = req.body;
  
    try {
      // ตรวจสอบข้อมูลที่ส่งมา
      if (!story_id || !username || !content) {
        return res.status(400).json({ error: 'Story ID, username, and content are required.' });
      }
  
      // สร้าง Collaboration ใหม่
      const newCollab = new Collaboration({
        story_id,
        username,
        content
      });
  
      // บันทึกใน MongoDB
      await newCollab.save();

      // ส่งข้อมูลแบบเรียลไทม์ผ่าน WebSocket หลังจาก Response แล้ว
      req.io.emit('newCollab', newCollab);
  
      // ส่งข้อมูลกลับให้ผู้เรียกก่อนที่จะส่งผ่าน WebSocket
      res.status(201).json(newCollab);
  
      
  
    } catch (error) {
      console.error('Error saving collaboration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// ดึงข้อมูลคอลแลปทั้งหมดที่เกี่ยวข้องกับ Story
router.get('/:storyId', async (req, res) => {
  const { storyId } = req.params;

  try {
    // ดึงคอลแลปทั้งหมดที่เกี่ยวข้องกับ Story ID
    const collaborations = await Collaboration.find({ story_id: storyId }).sort({ created_at: 1 });

    res.status(200).json(collaborations);
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
