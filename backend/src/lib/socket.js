import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? ["https://smartchatty.onrender.com"]
      : ["http://localhost:5173"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  const socketIds = userSocketMap[userId];
  // Return first socket if user has multiple connections (multiple tabs)
  return socketIds && socketIds.length > 0 ? socketIds[0] : null;
}

// used to store online users - now supports multiple connections per user
const userSocketMap = {}; // {userId: [socketId1, socketId2, ...]}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    // Initialize array for user if doesn't exist
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    // Add this socket to user's connections
    userSocketMap[userId].push(socket.id);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    if (userId) {
      // Remove only this socket from user's connections
      userSocketMap[userId] = userSocketMap[userId].filter(
        (socketId) => socketId !== socket.id
      );
      
      // Delete user entry if no more connections
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
