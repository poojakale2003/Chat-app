# Chat App Backend Server

A comprehensive Express.js backend server for the chat application with real-time messaging capabilities.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Real-time Messaging**: Socket.io integration for instant messaging
- **File Uploads**: Image sharing with multer middleware
- **User Management**: Profile management and user search
- **Message Management**: Send, receive, and manage messages
- **Online Status**: Track user online/offline status
- **Message Status**: Read receipts and unread message counts

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `POST /logout` - Logout user
- `PUT /profile` - Update user profile

### User Routes (`/api/users`)
- `GET /search?q=query` - Search users
- `GET /all` - Get all users for chat list
- `GET /:userId` - Get specific user
- `PUT /online` - Set user as online
- `PUT /offline` - Set user as offline

### Message Routes (`/api/messages`)
- `GET /:userId` - Get conversation with user
- `POST /send` - Send a message
- `PUT /:messageId/seen` - Mark message as seen
- `GET /unread/count` - Get total unread messages count
- `GET /unread/:userId` - Get unread messages count with specific user
- `DELETE /:messageId` - Delete a message

## Socket.io Events

### Client to Server
- `join` - Join user's personal room
- `sendMessage` - Send a message
- `typing` - Send typing indicator

### Server to Client
- `receiveMessage` - Receive new message
- `messageSent` - Confirm message sent
- `userTyping` - Receive typing indicator
- `error` - Error messages

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `config.env` and update the values:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret key for JWT tokens
     - `PORT`: Server port (default: 5000)

3. **Database Setup**
   - Make sure MongoDB is running
   - The server will automatically create the database and collections

4. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## Database Models

### User Model
- `fullName`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `bio`: User bio/status
- `profilePic`: Profile picture URL
- `isOnline`: Online status
- `lastSeen`: Last seen timestamp

### Message Model
- `senderId`: Reference to sender user
- `receiverId`: Reference to receiver user
- `text`: Message text content
- `image`: Image URL (optional)
- `seen`: Read status
- `seenAt`: Read timestamp

## File Uploads

- Images are uploaded to `/uploads` directory
- Supported formats: PNG, JPG, JPEG
- Maximum file size: 5MB
- Files are served statically at `/uploads` endpoint

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- File type validation for uploads

## Error Handling

- Comprehensive error handling middleware
- Validation error responses
- Database error handling
- Socket.io error handling

## Development

The server is configured to work with the React frontend running on `http://localhost:5173`. Make sure to update CORS settings if your frontend runs on a different port.
