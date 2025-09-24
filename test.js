const { io } = require("socket.io-client");

// Replace this with the exact JWT from your browser cookie
const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNmU4OTI5MTI1ZTFhZmU0MDhlMzIxMjJiOWE5N2ViZjo5MzRkOWZlODZkZWU0YmNkMzNmYTAyM2RkYmQ5OTYyNGVlNDU5ODEyYTM1MmEwZjA0NjcyN2Q3MDhkMzE2OGM2IiwiaWF0IjoxNzU4NzAzODg4LCJleHAiOjE3NTg3OTAyODh9.Kfgew0COoFM8bMpgZ4tmBQRjWfDyKcpm0rZ20SCJ5MI";

const socket = io("http://localhost:3000", {
    transports: ["websocket"],
    extraHeaders: {
        Cookie: `token=${JWT}`
    }
});

// On connect
socket.on("connect", () => {
  console.log("✅ Connected as", socket.id);

  // Send private message
  socket.emit("private-chat", {
    receiverId: "68d243cdd098f47c9be3c2c3", // put MongoDB ObjectId of another user
    msg: "Hello from test client!"
  });
});

// When receiving private message
socket.on("private-chat", (message) => {
  console.log("📩 New private message:", message);
});

// Handle errors
socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});