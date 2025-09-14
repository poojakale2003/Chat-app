const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required']
  },
  text: {
    type: String,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  image: {
    type: String,
    default: ''
  },
  file: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  seen: {
    type: Boolean,
    default: false
  },
  seenAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, seen: 1 });

// Mark message as seen
messageSchema.methods.markAsSeen = function() {
  this.seen = true;
  this.seenAt = new Date();
  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(userId1, userId2, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  const messages = await this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ]
  })
  .populate('senderId', 'fullName profilePic')
  .populate('receiverId', 'fullName profilePic')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

  // Transform image and file URLs to full URLs
  return messages.map(msg => {
    if (msg.image && !msg.image.startsWith('http')) {
      msg.image = process.env.NODE_ENV === 'production' 
        ? `https://chat-app-s-nine.vercel.app${msg.image}`
        : `http://localhost:5000${msg.image}`;
    }
    if (msg.file && !msg.file.startsWith('http')) {
      msg.file = process.env.NODE_ENV === 'production' 
        ? `https://chat-app-s-nine.vercel.app${msg.file}`
        : `http://localhost:5000${msg.file}`;
    }
    return msg;
  });
};

// Static method to get unread messages count
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiverId: userId,
    seen: false
  });
};

module.exports = mongoose.model('Message', messageSchema);
