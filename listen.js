const app = require("./app.js");
const socket = require("socket.io");
const { PORT = 9090 } = process.env;

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
