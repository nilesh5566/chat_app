const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
app.use(cors());

const prisma = new PrismaClient();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store online users in memory for quick access
const onlineUsers = new Map();

io.on("connection", async (socket) => {
  const { userId, userName } = socket.handshake.query;

  if (!userId || !userName) {
    console.log("❌ Connection rejected: Missing userId or userName");
    socket.disconnect();
    return;
  }

  console.log(`✅ User connected: ${userName} (${userId})`);

  try {
    // Update or create user in database
    await prisma.onlineUser.upsert({
      where: { userId },
      update: {
        socketId: socket.id,
        isOnline: true,
        lastSeen: new Date(),
      },
      create: {
        userId,
        userName,
        socketId: socket.id,
        isOnline: true,
      },
    });

    // Add user to online users map
    onlineUsers.set(socket.id, { userId, userName, socketId: socket.id });

    // Broadcast updated online users list
    io.emit("onlineUsers", Array.from(onlineUsers.values()));

    // Handle sending messages
    socket.on("sendMessage", async (message) => {
      try {
        // Save message to database
        const newMessage = await prisma.message.create({
          data: {
            senderId: message.senderId,
            senderName: message.senderName,
            receiverId: message.receiverId,
            text: message.text,
            timestamp: new Date(message.timestamp),
            read: false,
          },
        });

        // Find receiver's socket
        const receiverSocket = Array.from(onlineUsers.entries()).find(
          ([_, user]) => user.userId === message.receiverId
        );

        // Send message to receiver if online
        if (receiverSocket) {
          io.to(receiverSocket[0]).emit("receiveMessage", {
            ...message,
            id: newMessage.id,
          });
        }

        console.log(`📨 Message saved and sent`);
      } catch (error) {
        console.error("❌ Error saving message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle loading chat history
    socket.on("loadChatHistory", async ({ senderId, receiverId }) => {
      try {
        const chatHistory = await prisma.message.findMany({
          where: {
            OR: [
              { senderId, receiverId },
              { senderId: receiverId, receiverId: senderId },
            ],
          },
          orderBy: { timestamp: "asc" },
          take: 100,
        });

        socket.emit("messageHistory", chatHistory);

        // Mark messages as read
        await prisma.message.updateMany({
          where: {
            senderId: receiverId,
            receiverId: senderId,
            read: false,
          },
          data: { read: true },
        });

        console.log(`📜 Loaded chat history`);
      } catch (error) {
        console.error("❌ Error loading chat history:", error);
        socket.emit("historyError", { error: "Failed to load chat history" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        console.log(`👋 User disconnected: ${user.userName}`);

        try {
          await prisma.onlineUser.update({
            where: { userId: user.userId },
            data: {
              isOnline: false,
              lastSeen: new Date(),
            },
          });

          onlineUsers.delete(socket.id);
          io.emit("onlineUsers", Array.from(onlineUsers.values()));
        } catch (error) {
          console.error("❌ Error updating user status:", error);
        }
      }
    });
  } catch (error) {
    console.error("❌ Error during connection setup:", error);
    socket.disconnect();
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});



// Add this to your socket server setup (e.g., in server.js or socket handler file)

const users = new Map(); // Store online users
const messages = new Map(); // Store messages in memory (use DB in production)
const friends = new Map(); // Store friends relationships
const friendRequests = new Map(); // Store pending friend requests

io.on('connection', (socket) => {
  const { userId, userName } = socket.handshake.query;
  
  console.log(`User connected: ${userName} (${userId})`);
  
  // Add user to online users
  users.set(socket.id, { userId, userName, socketId: socket.id });
  
  // Initialize user data structures if not exists
  if (!friends.has(userId)) {
    friends.set(userId, []);
  }
  if (!friendRequests.has(userId)) {
    friendRequests.set(userId, []);
  }
  
  // Broadcast updated online users list
  const onlineUsers = Array.from(users.values());
  io.emit('onlineUsers', onlineUsers);
  
  // Send all users to the connected user
  const allUsersArray = Array.from(new Set([
    ...onlineUsers.map(u => ({ userId: u.userId, userName: u.userName })),
    ...Array.from(friends.keys()).map(id => {
      const userInfo = Array.from(users.values()).find(u => u.userId === id);
      return { userId: id, userName: userInfo?.userName || id };
    })
  ]));
  socket.emit('allUsers', allUsersArray);
  
  // Send friends list
  const userFriends = friends.get(userId) || [];
  socket.emit('friendsList', userFriends);
  
  // Send friend requests
  const userRequests = friendRequests.get(userId) || [];
  socket.emit('friendRequests', userRequests);

  // Get all users
  socket.on('getAllUsers', () => {
    const allUsersArray = Array.from(new Set([
      ...Array.from(users.values()).map(u => ({ userId: u.userId, userName: u.userName })),
      ...Array.from(friends.keys()).map(id => {
        const userInfo = Array.from(users.values()).find(u => u.userId === id);
        return { userId: id, userName: userInfo?.userName || id };
      })
    ]));
    socket.emit('allUsers', allUsersArray);
  });

  // Get friends list
  socket.on('getFriends', () => {
    const userFriends = friends.get(userId) || [];
    socket.emit('friendsList', userFriends);
  });

  // Get friend requests
  socket.on('getFriendRequests', () => {
    const userRequests = friendRequests.get(userId) || [];
    socket.emit('friendRequests', userRequests);
  });

  // Send friend request
  socket.on('sendFriendRequest', ({ fromUserId, fromUserName, toUserId, toUserName }) => {
    console.log(`Friend request: ${fromUserName} -> ${toUserName}`);
    
    // Add to recipient's friend requests
    const recipientRequests = friendRequests.get(toUserId) || [];
    
    // Check if request already exists
    if (!recipientRequests.some(req => req.userId === fromUserId)) {
      recipientRequests.push({ userId: fromUserId, userName: fromUserName });
      friendRequests.set(toUserId, recipientRequests);
      
      // Notify recipient if they're online
      const recipientSocket = Array.from(users.values()).find(u => u.userId === toUserId);
      if (recipientSocket) {
        const recipientSocketId = recipientSocket.socketId;
        io.to(recipientSocketId).emit('newFriendRequest', { userId: fromUserId, userName: fromUserName });
      }
    }
  });

  // Accept friend request
  socket.on('acceptFriendRequest', ({ fromUserId, fromUserName, toUserId, toUserName }) => {
    console.log(`Friend request accepted: ${fromUserName} <-> ${toUserName}`);
    
    // Add to both users' friends lists
    const user1Friends = friends.get(toUserId) || [];
    const user2Friends = friends.get(fromUserId) || [];
    
    if (!user1Friends.some(f => f.userId === fromUserId)) {
      user1Friends.push({ userId: fromUserId, userName: fromUserName });
      friends.set(toUserId, user1Friends);
    }
    
    if (!user2Friends.some(f => f.userId === toUserId)) {
      user2Friends.push({ userId: toUserId, userName: toUserName });
      friends.set(fromUserId, user2Friends);
    }
    
    // Remove from friend requests
    const requests = friendRequests.get(toUserId) || [];
    friendRequests.set(toUserId, requests.filter(req => req.userId !== fromUserId));
    
    // Notify both users
    socket.emit('friendsList', friends.get(toUserId));
    socket.emit('friendRequests', friendRequests.get(toUserId));
    
    const requesterSocket = Array.from(users.values()).find(u => u.userId === fromUserId);
    if (requesterSocket) {
      io.to(requesterSocket.socketId).emit('friendRequestAccepted', { userId: toUserId, userName: toUserName });
      io.to(requesterSocket.socketId).emit('friendsList', friends.get(fromUserId));
    }
  });

  // Reject friend request
  socket.on('rejectFriendRequest', ({ fromUserId, toUserId }) => {
    console.log(`Friend request rejected: ${fromUserId} -> ${toUserId}`);
    
    const requests = friendRequests.get(toUserId) || [];
    friendRequests.set(toUserId, requests.filter(req => req.userId !== fromUserId));
    
    socket.emit('friendRequests', friendRequests.get(toUserId));
  });

  // Load chat history
  socket.on('loadChatHistory', ({ senderId, receiverId }) => {
    const chatKey1 = `${senderId}-${receiverId}`;
    const chatKey2 = `${receiverId}-${senderId}`;
    
    const history = messages.get(chatKey1) || messages.get(chatKey2) || [];
    socket.emit('messageHistory', history);
  });

  // Send message
  socket.on('sendMessage', (message) => {
    const { senderId, receiverId } = message;
    const chatKey = `${senderId}-${receiverId}`;
    
    // Store message
    const chatMessages = messages.get(chatKey) || [];
    chatMessages.push(message);
    messages.set(chatKey, chatMessages);
    
    // Send to receiver if online
    const receiverUser = Array.from(users.values()).find(u => u.userId === receiverId);
    if (receiverUser) {
      io.to(receiverUser.socketId).emit('receiveMessage', message);
    }
  });

  // Clear messages
  socket.on('clearMessages', ({ userId1, userId2 }) => {
    console.log(`Clearing messages between ${userId1} and ${userId2}`);
    
    const chatKey1 = `${userId1}-${userId2}`;
    const chatKey2 = `${userId2}-${userId1}`;
    
    messages.delete(chatKey1);
    messages.delete(chatKey2);
    
    // Notify both users
    socket.emit('messagesCleared', { userId1, userId2 });
    
    const otherUser = Array.from(users.values()).find(u => u.userId === userId2);
    if (otherUser) {
      io.to(otherUser.socketId).emit('messagesCleared', { userId1, userId2 });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userName} (${userId})`);
    users.delete(socket.id);
    
    // Broadcast updated online users list
    io.emit('onlineUsers', Array.from(users.values()));
  });
});