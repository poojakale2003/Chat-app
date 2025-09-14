const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/messages/:userId
// @desc    Get conversation with a specific user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify the other user exists
    const otherUser = await User.findById(userId).select('-password');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get conversation
    const messages = await Message.getConversation(
      req.user._id,
      userId,
      parseInt(page),
      parseInt(limit)
    );

    // Mark messages as seen
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: req.user._id,
        seen: false
      },
      { seen: true, seenAt: new Date() }
    );

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      otherUser
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/send
// @desc    Send a message
// @access  Private
router.post('/send', auth, upload.single('file'), async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (!text && !req.file) {
      return res.status(400).json({ message: 'Message text or file is required' });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId).select('-password');
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create message
    const messageData = {
      senderId: req.user._id,
      receiverId,
      text: text || ''
    };

    if (req.file) {
      console.log('📁 File uploaded:', req.file);
      const fileUrl = process.env.NODE_ENV === 'production' 
        ? `https://your-app-name.vercel.app/uploads/${req.file.filename}`
        : `http://localhost:5000/uploads/${req.file.filename}`;
      
      // Check if it's an image
      if (req.file.mimetype.startsWith('image/')) {
        messageData.image = fileUrl;
        console.log('📷 Image URL set to:', messageData.image);
      } else {
        // It's a regular file
        messageData.file = fileUrl;
        messageData.fileName = req.file.originalname;
        messageData.fileType = req.file.mimetype;
        messageData.fileSize = req.file.size;
        console.log('📁 File URL set to:', messageData.file);
      }
    }

    const message = new Message(messageData);
    await message.save();

    // Populate sender and receiver info
    await message.populate('senderId', 'fullName profilePic');
    await message.populate('receiverId', 'fullName profilePic');

    // Ensure URLs are full URLs
    if (message.image && !message.image.startsWith('http')) {
      message.image = process.env.NODE_ENV === 'production' 
        ? `https://your-app-name.vercel.app${message.image}`
        : `http://localhost:5000${message.image}`;
    }
    if (message.file && !message.file.startsWith('http')) {
      message.file = process.env.NODE_ENV === 'production' 
        ? `https://your-app-name.vercel.app${message.file}`
        : `http://localhost:5000${message.file}`;
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:messageId/seen
// @desc    Mark message as seen
// @access  Private
router.put('/:messageId/seen', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the receiver can mark as seen
    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as seen' });
    }

    await message.markAsSeen();
    res.json({ message: 'Message marked as seen' });
  } catch (error) {
    console.error('Mark seen error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread messages count
// @access  Private
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user._id);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread/:userId
// @desc    Get unread messages count with specific user
// @access  Private
router.get('/unread/:userId', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      senderId: req.params.userId,
      receiverId: req.user._id,
      seen: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
