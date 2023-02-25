const io = require('socket.io-client');
const chalk = require('chalk');
const readline = require('readline');
const figlet  = require('figlet');
const infoFile = require("./info.json");
const gradient = require('gradient-string');
const fs = require('fs');
require('dotenv').config();
const authKey = process.env.PASS;

// Message count resets for every received message
// Command messages dont count
class Client {
	constructor(AUTH_KEY) {
		this.name = require("os").userInfo().username;
		this.clientID = null;
		this.room = null;
		this.message_count = 0;
		this.authKey = AUTH_KEY;

		// read info.json
		const infojsn = infoFile;
		if (infojsn.name != "") {
			this.name = infojsn.name;
		}

		// consts
		this.MESSAGE_CHAR_LEN = 150;
		this.MAX_MESSAGE_COUNT = 20;
		this.ERROR_WAIT_COUNT = 20;

		const chalk_COLOURS = [chalk.magentaBright, chalk.yellow, chalk.green, 
								chalk.cyan, chalk.redBright,
							chalk.yellowBright, chalk.blackBright, chalk.yellowBright]
		const randomIndex = Math.floor(Math.random() * chalk_COLOURS.length);
		this.textColour = chalk_COLOURS[randomIndex];

		// Available Commands
		this.commands = [chalk.cyan('/f') + chalk.grey(' <message>'), 
		chalk.cyan('/num') + chalk.grey(' => Num of clients in room!'),
		chalk.cyan('/change-name') + chalk.grey(' <username>'), 
		chalk.cyan('/comp') + chalk.grey(' <message> => GPT completions/responses'),]

		// inits
		this.socket = io("http://localhost:3000");
		// this.socket = io("https://chat-app-1fjn.onrender.com");

		this.lineReader = readline.createInterface({input: process.stdin, output: process.stdout, terminal: false});

		// const comm codes
		this.commCode = {
			"c2s": "client-to-server-message",
			"s2c": "server-to-client-message",
			"initialize": "init-info",
			"update": "update-info",
			"info_from_server": "info-type"
		}
	}

	run() {
		this.clientWrite("Connecting to the server...");
		// Initial Connection
		this.socket.on('connect', () => {
			this.clientWrite("Connected!");
			let dataframe = this.getDataFrame();
			dataframe.serverPost = this.commCode.initialize;
			
			// console.log(dataframe);
			this.sendMessage(null, false, "default", dataframe);
			infoFile.name = this.name;

			// Starts reading after the connection has been established
			// Sender Live
			this.readLine();
		});

		this.socket.on(this.commCode.s2c, (df) => {
			this.receiveMessage(df);
		});
	}

	updateInfoJson() {
		let dir = __dirname+"\\info.json";
		fs.writeFile(dir, JSON.stringify({"name": this.name}), (err) => {
			if (err) {
				this.clientWrite("Error writing json", "coloured", "error");
			}
		})
	}

	// broadcast => to all but the sender
	// ! => including the sender
	// serverPost: updateInfo, initInfo
	// serverGet: /num
	getDataFrame(message=null, extra="default", broadcast=true, receiver=0, serverPost=null, serverGet=null) {
		return {
			"name": this.name,
			"clientID": this.clientID,
			"room": null,
			"extra": extra,
			"message": message,
			"message-count": this.message_count,
			"broadcast": broadcast,
			"receiver": receiver,
			"AuthKey": this.authKey,
			"serverPost": serverPost,
			"serverGet": serverGet
		}
	}

	clientWrite(message, extraType=null, extraArg="None") {
		if (extraType == "figlet") {
			// layout [default, full, fitted]
			{
				figlet.text(message, {
					font: extraArg,
					horizontalLayout: 'default',
					verticalLayout: 'default',
					width: 80,
					whitespaceBreak: true
				}, function(err, data) {
					function printRandomGradient(data) {
						const cols = [gradient.pastel, gradient.fruit, 
							gradient.retro, gradient.summer, 
							gradient.mind];
						const randIndex = Math.floor(Math.random() * cols.length);
						console.log(cols[randIndex](data));
					}
					if (err) {
						console.log('Something went wrong...');
						console.dir(err);
						return;
					}
					printRandomGradient(data);
				});

			}
		} else if (extraType == "coloured") {
			if (extraArg == "error") {
				console.log(chalk.bold.red(message));
			}
		} else {
			console.log(message);
		}
	}

	readLine() {
		this.lineReader.on("line", (input) => {
			this.message_count += 1;
			if (this.message_count > this.MAX_MESSAGE_COUNT) {
				if (this.message_count % this.ERROR_WAIT_COUNT == 0) {
					// every 10 messages
					this.clientWrite("Too many messages sent!...");
				}
			} else if (input.length > this.MESSAGE_CHAR_LEN) {
				this.clientWrite("Message too long!...");
			} else {
				this.filterInput(input);
			}
		})
	}

	helperF()
	{
		for (let cmd of this.commands) {
			this.clientWrite(cmd);
		}
	}

	filterInput(input) {
		if (input.startsWith("/")) {
			// handling command
			let list_split = input.split(" ");
			let nonCommand = list_split.slice(1)

			if (list_split[0] == '/f') {
				this.sendMessage(nonCommand.join(" "), false, "figlet", null)

			} else if (list_split[0] == '/fg') {
				const val = nonCommand.join(" ");
				if (val == 9123) {
					let df = this.getDataFrame();
					df.serverPost = 'miscadmn';
					df.broadcast = false;
					this.sendMessage(null, df.broadcast, df.extra, df);
					// this.socket.emit('disconnect');
				} else {
					this.sendMessage(nonCommand.join(" "), false, "figlet-ghost", null)
				}

			} else if (list_split[0] == '/num') {
				let dataframe = this.getDataFrame();
				dataframe.serverGet = 'client-num';
				dataframe.broadcast = false;
				this.sendMessage(null, dataframe.broadcast, "default", dataframe);

			} else if (list_split[0] == '/change-name') {
				const newName = list_split.splice(1).join(" ");
				this.sendMessage(`changed their name to ${chalk.magentaBright(newName)}`, false, "default", null);
				this.name = newName;
				let dataframe = this.getDataFrame();
				dataframe.serverPost = this.commCode.update;
				dataframe.broadcast = false;
				this.sendMessage(null, dataframe.broadcast, "default", dataframe);
				this.updateInfoJson();

			} else if (list_split[0] == '/help') {
				this.helperF();

			} else if (list_split[0] == '/comp') {
				const completionText = list_split.splice(1).join(" ");
				let dataframe = this.getDataFrame();
				dataframe.message = completionText;
				dataframe.serverGet = 'ai-complete';
				dataframe.broadcast = false;
				this.sendMessage(null, dataframe.broadcast, dataframe.extra, dataframe);

			} else {
				this.clientWrite(chalk.yellow("Invalid Command..."));
				this.clientWrite(chalk.cyanBright("/help to list available commands"));
			}

		} else {
			this.sendMessage(input);
		}
	}

	// Normal messages + figlet
	// broadcast => to other clients
	// !broadcast => to other clients and sender
	sendMessage(message=null, broadcast=true, extra="default", DFrame=null) {
		if (DFrame != null) {
			this.socket.emit(this.commCode.c2s, DFrame);
			return;
		}
		const dataFrame = this.getDataFrame(message, extra, broadcast);
		this.socket.emit(this.commCode.c2s, dataFrame);
	}

	// Receiver
	receiveMessage(dataFrame) {
		// Incoming dataframe => message, name, extra, info-type: bool 
		if (dataFrame[this.commCode.info_from_server]) {
			if (dataFrame.ID) {
				this.clientID = dataFrame.ID;
				console.log(dataFrame.message);
				return;
			}
			console.log(dataFrame.message);
			return
		}
		if (dataFrame.extra != "default" && dataFrame.extra) {
			// Figlet or Figlet Ghost
			if (dataFrame.extra == "figlet") {
				this.clientWrite(dataFrame.message, "figlet", "Standard")
				return;
			} else if (dataFrame.extra == "figlet-ghost"){
				this.clientWrite(dataFrame.message, "figlet", "Ghost")
				return;
			} else {
				this.clientWrite("Invalid Extra Argument", "coloured", "error")
				return;
			}
		}
		this.message_count = 0;
		this.clientWrite(this.textColour(`${dataFrame.name}`) + `: ${dataFrame.message}`);
		return;
	}
}

module.exports = Client;
// ChatApp-Terminal-SocketIO