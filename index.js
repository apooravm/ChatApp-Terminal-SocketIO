const Client = require("./src/client/client");
const localPort = process.env.PORT;
const AuthKey = process.env.PASS;
const c1 = new Client(AuthKey, `http://localhost:${localPort}`);
c1.run();