const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { fullName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).select('-password').limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// @route   GET /api/users/all
// @desc    Get all users (for chat list)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ isOnline: -1, lastSeen: -1 });

    // Get unread message counts for each user
    const usersWithUnreadCounts = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: req.user._id,
          seen: false
        });

        return {
          ...user.toObject(),
          unreadCount
        };
      })
    );

    res.json({ users: usersWithUnreadCounts });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user by ID
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/online
// @desc    Set user as online
// @access  Private
router.put('/online', auth, async (req, res) => {
  try {
    await req.user.setOnline();
    res.json({ message: 'User set as online' });
  } catch (error) {
    console.error('Set online error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/offline
// @desc    Set user as offline
// @access  Private
router.put('/offline', auth, async (req, res) => {
  try {
    await req.user.updateLastSeen();
    res.json({ message: 'User set as offline' });
  } catch (error) {
    console.error('Set offline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
