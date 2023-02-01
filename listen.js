const app = require("./app.js");
const socket = require("socket.io");
const { PORT = 9090 } = process.env;

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}...`));

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log(`connection on ${JSON.stringify(socket)}`);

  socket.on("join_session", (session) => {
    console.log(`joining session: ${JSON.stringify(session)}`);
    socket.join(session);
  });

  socket.on("send_message", ({ session, message }) => {
    socket.to(session).emit("receive_message", message);
  });
});
