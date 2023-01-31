const app = require("./app.js");
const socket = require("socket.io");
const { PORT = 9090 } = process.env;

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}...`));

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_session", (session) => {
    socket.join(session);
  });

  socket.on("send_message", ({ session, message }) => {
    socket.to(session).emit("receive_message", message);
  });
});
