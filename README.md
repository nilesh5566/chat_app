# 💬 Real-time Chat Application

A modern, feature-rich real-time chat application built with Next.js, Socket.io, and MongoDB. Connect with friends, send messages instantly, and enjoy a seamless chat experience.

![Chat App](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-green?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

---
### ✨ Screenshot
<p align="center">
  <img src="Screenshot 2025-11-11 144853.png" width="900" hight="300>
</p>
    <br><br><br>

<p align="center">
  <img src="Screenshot 2025-11-11 144911.png" width="900" hight="300>
</p>
    <br><br><br>
<p align="center">
  <img src="Screenshot 2025-11-11 145016.png" width="900" hight="300>
</p>
    <br><br><br>
<p align="center">
  <img src="Screenshot 2025-11-11 145124.png" width="900" hight="300>
</p>
    <br><br><br>
<p align="center">
  <img src="Screenshot 2025-11-11 145139.png" width="900" hight="300>
</p>
    <br><br><br>
<p align="center">
  <img src="Screenshot 2025-11-11 145216.png" width="900" hight="300>
</p>

---
---
## ✨ Features

### 🔐 Authentication
- User registration and login
- Secure password handling with NextAuth.js
- Session management
- Protected routes

### 💬 Real-time Messaging
- Instant message delivery
- Real-time typing indicators
- Message read receipts
- Auto-scroll to latest messages
- Message timestamps

### 👥 Friend System
- Send friend requests to users
- Accept or reject incoming requests
- View all registered users
- Friends-only chat access
- Real-time friend request notifications
- Badge notifications for pending requests

### 🗑️ Message Management
- Clear entire chat history
- Confirmation dialog before deletion
- Sync deletion across both users
- Permanent message removal from database

### 🟢 Online Status
- Real-time online/offline indicators
- Green dot for online users
- Gray dot for offline users
- Last seen timestamps

### 🎨 Modern UI/UX
- Clean and responsive design
- Mobile-friendly interface
- Smooth animations and transitions
- Tailwind CSS styling
- Dark mode support (optional)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Socket.io Client** - Real-time bidirectional communication
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io Server** - WebSocket server
- **Prisma** - Next-generation ORM
- **MongoDB Atlas** - Cloud database

### DevOps
- **Vercel** - Frontend hosting (recommended)
- **Railway/Render** - Backend hosting (recommended)
- **MongoDB Atlas** - Database hosting

---

## 📁 Project Structure

```
chat_app/
├── Client/                          # Main Next.js application
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       ├── messages/
│   │   │       │   └── route.js    # Messages API
│   │   │       ├── users/
│   │   │       │   └── route.js    # Users API
│   │   │       └── online/
│   │   │           └── route.js    # Online users API
│   │   ├── dashboard/
│   │   │   └── page.jsx            # Main chat interface
│   │   ├── login/
│   │   │   └── page.jsx            # Login page
│   │   ├── register/
│   │   │   └── page.jsx            # Registration page
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── UserInfo.jsx
│   ├── lib/
│   │   └── mongodb.js              # MongoDB connection
│   ├── models/
│   │   └── user.js                 # User model
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── services/
│   │   └── socket-server/          # Socket.io server
│   │       ├── prisma/
│   │       │   └── schema.prisma
│   │       ├── server.js           # Main server file
│   │       ├── package.json
│   │       └── .env
│   ├── .env                        # Environment variables
│   ├── .env.local
│   ├── package.json
│   └── next.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB Atlas** account (or local MongoDB)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app/Client
   ```

2. **Install dependencies for main project**
   ```bash
   npm install
   npm install socket.io-client
   ```

3. **Install dependencies for socket server**
   ```bash
   cd services/socket-server
   npm install
   cd ../..
   ```

4. **Setup MongoDB**
   - Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
   - Create a new cluster
   - Get your connection string
   - Whitelist your IP address
   - Create database user with credentials

5. **Configure environment variables**

   **Main Project (`.env`):**
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority"
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXTAUTH_SECRET="generate-random-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   **Socket Server (`services/socket-server/.env`):**
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority"
   CLIENT_URL=http://localhost:3000
   PORT=3001
   ```

6. **Setup Prisma**
   ```bash
   # In main project
   npx prisma generate
   npx prisma db push

   # In socket server
   cd services/socket-server
   npx prisma generate
   cd ../..
   ```

7. **Run the application**

   Open **two terminals**:

   **Terminal 1 - Socket Server:**
   ```bash
   cd services/socket-server
   npm run dev
   ```

   **Terminal 2 - Next.js App:**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password: String (hashed)
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  senderId: String,
  senderName: String,
  receiverId: String,
  text: String,
  timestamp: Date,
  read: Boolean
}
```

### Friend Requests Collection
```javascript
{
  _id: ObjectId,
  senderId: String,
  senderName: String,
  receiverId: String,
  receiverName: String,
  status: "pending" | "accepted" | "rejected",
  createdAt: Date,
  updatedAt: Date
}
```

### Friendships Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  userName: String,
  friendId: String,
  friendName: String,
  createdAt: Date
}
```

### Online Users Collection
```javascript
{
  _id: ObjectId,
  userId: String (unique),
  userName: String,
  socketId: String,
  lastSeen: Date,
  isOnline: Boolean
}
```

---

## 🎯 Usage Guide

### 1. Register an Account
- Navigate to `/register`
- Fill in your details
- Click "Register"

### 2. Login
- Navigate to `/login`
- Enter your credentials
- Access the dashboard

### 3. Add Friends
- Go to "All Users" tab
- Click "Add" button next to any user
- Wait for them to accept

### 4. Accept Friend Requests
- Click on "Requests" tab (shows badge if you have requests)
- Click "Accept" or "Reject"

### 5. Start Chatting
- Go to "Friends" tab
- Click on a friend's name
- Type your message and press Enter or click Send

### 6. Clear Chat History
- Open a conversation
- Click "Clear Chat" button
- Confirm deletion

---

## 🔧 Configuration

### Socket.io Events

**Client → Server:**
- `sendMessage` - Send a message
- `loadChatHistory` - Load chat history
- `clearMessages` - Clear chat history
- `sendFriendRequest` - Send friend request
- `acceptFriendRequest` - Accept friend request
- `rejectFriendRequest` - Reject friend request

**Server → Client:**
- `onlineUsers` - List of online users
- `allUsers` - All registered users
- `friendsList` - User's friends
- `friendRequests` - Pending friend requests
- `receiveMessage` - New message received
- `messageHistory` - Chat history
- `messagesCleared` - Messages were cleared
- `friendRequestReceived` - New friend request
- `friendRequestAccepted` - Request accepted

---

## 🚀 Deployment

### Deploy Next.js App (Vercel)

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Add environment variables:**
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SOCKET_URL` (your deployed socket server URL)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. **Deploy**

### Deploy Socket Server (Railway)

1. **Create new project in Railway**
2. **Connect GitHub repository**
3. **Set root directory:** `Client/services/socket-server`
4. **Add environment variables:**
   - `DATABASE_URL`
   - `CLIENT_URL` (your deployed Next.js URL)
   - `PORT=3001`
5. **Deploy**

### MongoDB Atlas Setup
- Enable network access from anywhere (0.0.0.0/0)
- Or whitelist your deployment IPs
- Use connection string in environment variables

---

## 🐛 Troubleshooting

### Socket Connection Issues
- Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check if socket server is running
- Ensure CORS is configured properly
- Check browser console for errors

### Database Connection Errors
- Verify MongoDB connection string
- Check if IP is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions
- Run `npx prisma db push` to sync schema

### Messages Not Appearing
- Check if users are friends
- Verify socket connection (green indicator)
- Check socket server logs
- Clear browser cache

### Friend Requests Not Working
- Ensure Prisma schema is updated
- Run `npx prisma generate`
- Check MongoDB for collections
- Restart socket server

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ Environment variable protection
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting (recommended to add)
- ✅ XSS protection

---

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue
        secondary: '#10B981', // Green
      }
    }
  }
}
```

### Modify Message Limit
In `socket-server/server.js`:
```javascript
take: 100, // Change to your preferred limit
```

### Add New Features
- Typing indicators
- Voice messages
- File sharing
- Group chats
- Video calls
- Emojis and reactions

---

## 📈 Performance Optimization

- Messages limited to last 100 per conversation
- Efficient database indexing
- WebSocket connection pooling
- Lazy loading for chat history
- Automatic cleanup of old data
- Optimized re-renders with React hooks

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@nilesh5566](https://github.com/nilesh5566)
- Email: nkn33785@gmail.com


---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 📞 Support

For support, email nkn33785@gmail.com or open an issue in the GitHub repository.

---

## 🗺️ Roadmap

- [ ] Add typing indicators
- [ ] Implement message reactions
- [ ] Add file/image sharing
- [ ] Create group chat functionality
- [ ] Add voice/video calls
- [ ] Implement message search
- [ ] Add user profiles
- [ ] Create mobile app (React Native)
- [ ] Add message encryption
- [ ] Implement push notifications

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/chat-app?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/chat-app?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/chat-app)
![GitHub license](https://img.shields.io/github/license/yourusername/chat-app)

---

**⭐ Star this repo if you find it helpful!**

**Made with ❤️ and ☕**
