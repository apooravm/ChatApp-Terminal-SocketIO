const Client = require("./src/client/client");
const localPort = process.env.PORT;
const AuthKey = process.env.PASS;
const localhost = `http://localhost:${localPort}`;
const c1 = new Client(AuthKey, 'https://terminal-chat-app.vercel.app/');
c1.run();