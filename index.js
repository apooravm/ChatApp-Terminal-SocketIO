const Client = require("./src/client/client");
const localPort = process.env.PORT;
const AuthKey = process.env.PASS;
const localhost = `http://localhost:${localPort}`;
const c1 = new Client(AuthKey, 'https://chat-app-terminal-socket-io.vercel.app/');
c1.run();