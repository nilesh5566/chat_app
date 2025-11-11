"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function Dashboard() {
  const { data: session } = useSession();
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'online'
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user?.email) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      query: {
        userId: session.user.email,
        userName: session.user.name,
      },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server");
    });

    // Listen for online users updates
    socketInstance.on("onlineUsers", (users) => {
      setOnlineUsers(users.filter((u) => u.userId !== session.user.email));
    });

    // Listen for all users
    socketInstance.on("allUsers", (users) => {
      setAllUsers(users.filter((u) => u.userId !== session.user.email));
    });

    // Listen for friends list
    socketInstance.on("friendsList", (friendsList) => {
      setFriends(friendsList);
    });

    // Listen for friend requests
    socketInstance.on("friendRequests", (requests) => {
      setFriendRequests(requests);
    });

    // Listen for new friend request
    socketInstance.on("newFriendRequest", (request) => {
      setFriendRequests((prev) => [...prev, request]);
    });

    // Listen for friend request accepted
    socketInstance.on("friendRequestAccepted", (friend) => {
      setFriends((prev) => [...prev, friend]);
      setFriendRequests((prev) => prev.filter((req) => req.userId !== friend.userId));
    });

    // Listen for incoming messages
    socketInstance.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for message history
    socketInstance.on("messageHistory", (history) => {
      setMessages(history);
    });

    // Listen for messages cleared
    socketInstance.on("messagesCleared", ({ userId1, userId2 }) => {
      if (
        (userId1 === session.user.email && userId2 === selectedUser?.userId) ||
        (userId2 === session.user.email && userId1 === selectedUser?.userId)
      ) {
        setMessages([]);
      }
    });

    socketRef.current = socketInstance;

    // Request initial data
    socketInstance.emit("getFriends");
    socketInstance.emit("getFriendRequests");
    socketInstance.emit("getAllUsers");

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [session]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history when selecting a user
  useEffect(() => {
    if (socketRef.current && selectedUser) {
      socketRef.current.emit("loadChatHistory", {
        senderId: session.user.email,
        receiverId: selectedUser.userId,
      });
    }
  }, [selectedUser, session]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUser || !socketRef.current) return;

    const message = {
      senderId: session.user.email,
      senderName: session.user.name,
      receiverId: selectedUser.userId,
      text: messageInput,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("sendMessage", message);
    setMessages((prev) => [...prev, message]);
    setMessageInput("");
  };

  const handleClearMessages = () => {
    if (!selectedUser || !socketRef.current) return;

    if (confirm(`Are you sure you want to clear all messages with ${selectedUser.userName}?`)) {
      socketRef.current.emit("clearMessages", {
        userId1: session.user.email,
        userId2: selectedUser.userId,
      });
      setMessages([]);
    }
  };

  const handleSendFriendRequest = (userId, userName) => {
    if (!socketRef.current) return;

    socketRef.current.emit("sendFriendRequest", {
      fromUserId: session.user.email,
      fromUserName: session.user.name,
      toUserId: userId,
      toUserName: userName,
    });

    alert(`Friend request sent to ${userName}!`);
    setShowAllUsers(false);
  };

  const handleAcceptFriendRequest = (userId, userName) => {
    if (!socketRef.current) return;

    socketRef.current.emit("acceptFriendRequest", {
      fromUserId: userId,
      fromUserName: userName,
      toUserId: session.user.email,
      toUserName: session.user.name,
    });
  };

  const handleRejectFriendRequest = (userId) => {
    if (!socketRef.current) return;

    socketRef.current.emit("rejectFriendRequest", {
      fromUserId: userId,
      toUserId: session.user.email,
    });

    setFriendRequests((prev) => prev.filter((req) => req.userId !== userId));
  };

  const handleLogout = async () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  const getDisplayUsers = () => {
    if (activeTab === 'friends') {
      return friends;
    } else {
      return onlineUsers;
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  const isUserFriend = (userId) => {
    return friends.some((f) => f.userId === userId);
  };

  const hasPendingRequest = (userId) => {
    return friendRequests.some((req) => req.userId === userId);
  };

  return (
    <div className="h-screen flex flex-col md:grid md:grid-cols-12 bg-gray-100">
      {/* Sidebar */}
      <div className="md:col-span-3 bg-white shadow-md p-4 md:p-6 flex flex-col w-full md:w-auto">
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Dashboard</h2>

          {/* User Info */}
          <div className="bg-gray-200 p-4 rounded-lg mb-4">
            <p>
              <span className="font-semibold">Name: </span>
              {session?.user?.name}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Email: </span>
              {session?.user?.email}
            </p>
            <div className="mt-2 flex items-center">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span className="text-sm">
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
            >
              Add Friend
            </button>
            <button
              onClick={() => setShowFriendRequests(!showFriendRequests)}
              className="relative flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
            >
              Requests
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Add Friend Modal */}
          {showAllUsers && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 border-2 border-blue-500">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">All Users</h3>
                <button
                  onClick={() => setShowAllUsers(false)}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No users available</p>
                ) : (
                  allUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex justify-between items-center p-2 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{user.userName}</p>
                        <p className="text-xs text-gray-600">{user.userId}</p>
                      </div>
                      {isUserFriend(user.userId) ? (
                        <span className="text-xs text-green-600 font-semibold">Friend</span>
                      ) : hasPendingRequest(user.userId) ? (
                        <span className="text-xs text-yellow-600 font-semibold">Pending</span>
                      ) : (
                        <button
                          onClick={() => handleSendFriendRequest(user.userId, user.userName)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Friend Requests Modal */}
          {showFriendRequests && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 border-2 border-green-500">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">Friend Requests</h3>
                <button
                  onClick={() => setShowFriendRequests(false)}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friendRequests.length === 0 ? (
                  <p className="text-sm text-gray-500">No pending requests</p>
                ) : (
                  friendRequests.map((request) => (
                    <div key={request.userId} className="p-2 bg-white rounded border">
                      <p className="text-sm font-semibold">{request.userName}</p>
                      <p className="text-xs text-gray-600 mb-2">{request.userId}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptFriendRequest(request.userId, request.userName)}
                          className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectFriendRequest(request.userId)}
                          className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'friends'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'online'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Online ({onlineUsers.length})
            </button>
          </div>

          {/* Users List */}
          <div className="mb-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getDisplayUsers().length === 0 ? (
                <p className="text-sm text-gray-500">
                  {activeTab === 'friends' ? 'No friends yet' : 'No users online'}
                </p>
              ) : (
                getDisplayUsers().map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedUser?.userId === user.userId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            isUserOnline(user.userId) ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        <span className="text-sm font-medium">{user.userName}</span>
                      </div>
                      {activeTab === 'friends' && (
                        <span className={`text-xs ${
                          selectedUser?.userId === user.userId ? 'text-white' : 'text-gray-500'
                        }`}>
                          {isUserOnline(user.userId) ? 'Online' : 'Offline'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 md:px-6 py-2 rounded-lg font-bold w-full text-center hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-9 flex flex-col p-4 md:p-6">
        {/* Chat Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            {selectedUser ? `Chat with ${selectedUser.userName}` : "Select a user to chat"}
          </h2>
          {selectedUser && (
            <button
              onClick={handleClearMessages}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-xl mb-2">💬 Welcome!</p>
                <p>Select a user from the sidebar to start chatting</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-xl mb-2">👋 Say Hello!</p>
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages
                .filter(
                  (msg) =>
                    (msg.senderId === session?.user?.email &&
                      msg.receiverId === selectedUser.userId) ||
                    (msg.senderId === selectedUser.userId &&
                      msg.receiverId === session?.user?.email)
                )
                .map((msg, index) => (
                  <div
                    key={index}
                    className={`my-2 p-3 rounded-lg w-fit max-w-[80%] break-words ${
                      msg.senderId === session?.user?.email
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-200"
                    }`}
                  >
                    <p className="text-xs font-bold mb-1">
                      {msg.senderId === session?.user?.email ? "You" : msg.senderName}
                    </p>
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="mt-4 flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            placeholder={selectedUser ? "Type your message..." : "Select a user first..."}
            className="flex-1 border p-3 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={!selectedUser}
          />
          <button
            onClick={handleSendMessage}
            disabled={!selectedUser || !messageInput.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold w-full sm:w-auto hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}