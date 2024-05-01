const socketIo = require("socket.io");
const userSockets = require("../Model/userSockets_model");
let io;
function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // socket.on('message', (data) => {
    //   // Handle messages
    //   console.log('Received message:', data);
    //   io.emit('message', { recipientSocketId: socket.id, message: data });
    // });
    socket.on("create_connection", async (data) => {
      console.log({ data });

      // Check if the user already exists in the database
      const existingUser = await userSockets.findOne({ userId: data.userId });

      if (existingUser) {
        // If the user exists, update the socketId
        await userSockets.findOneAndUpdate(
          { userId: data.userId },
          { socketId: socket.id }
        );
        console.log("Connection updated:", data);
      } else {
        // If the user doesn't exist, create a new connection entry
        await userSockets.create({ userId: data.userId, socketId: socket.id });
        console.log("Connection created:", data);
      }
    });
    socket.on("disconnect", (data) => {
      console.log("User disconnected:", data);
    });
  });

  return io;
}

module.exports = {
  initializeSocket,
  getIo: () => io, // Export a function to get the io instance
};
