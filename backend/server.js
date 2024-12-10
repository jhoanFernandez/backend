const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Permitir solicitudes desde tu frontend
    methods: ["GET", "POST"],
  },
});

app.use(cors()); // Habilitar CORS para todas las rutas

const sessions = {};

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join", (sessionId) => {
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }
    sessions[sessionId].push(socket.id);
    socket.join(sessionId);
    console.log(`Client joined session: ${sessionId}`);
  });

  socket.on("drawing", (data) => {
    const { sessionId, ...drawingData } = data;
    socket.to(sessionId).emit("drawing", drawingData);
  });

  socket.on("comment", (comment) => {
    const { sessionId, text } = comment;
    socket.to(sessionId).emit("comment", { text });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    for (const sessionId in sessions) {
      sessions[sessionId] = sessions[sessionId].filter(
        (id) => id !== socket.id
      );
      if (sessions[sessionId].length === 0) {
        delete sessions[sessionId];
      }
    }
  });
});

app.get("/new-session", (req, res) => {
  const sessionId = uuidv4();
  res.send({ sessionId });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
