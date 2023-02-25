require('dotenv').config();
const port = process.env.PORT || 3000;
const io = require('socket.io')(port);
const AuthKey = process.env.PASS;
const adKey = process.env.admn;
const comp = require('./openaiAPI');
const modelName = "davinci";

async function complete(text) {
    const resp = await comp(text, modelName);
	return resp;
}

class Server {
	constructor() {
		this.allClients = [];

		// Consts
		this.MAX_GPT_CALLS = 20;
	}

	run() {
		console.log(`Listening on Port ${port}...`);
		io.on('connection', socket => {
			socket.on('client-to-server-message', (dataframe) => {
				if (this.authCheck(dataframe.AuthKey)) {
					const serverGet = dataframe.serverGet;
					const serverPost = dataframe.serverPost;

					if (serverGet != null) {
						// getInfo(dataframe);
						if (dataframe.serverGet == 'client-num') {
							let currArr = [];
							for (let client of this.allClients) {
								currArr.push({ID: client.clientID, Name: client.clientName})
							}
							const msgFrame = this.getDataFrame();
							msgFrame.message = currArr;
							msgFrame['info-type'] = true;
							sendMessage(msgFrame, false);
						} else if (dataframe.serverGet == 'ai-complete') {
							const msgFrame = this.getDataFrame();
							msgFrame.name = dataframe.name + " To GPT";
							msgFrame.message = dataframe.message;
							msgFrame.extra = dataframe.extra;
							sendMessage(msgFrame);
							// Increase Gpt call count
							for (let i = 0; i < this.allClients.length; i++) {
								if (this.allClients[i].clientID === socket.id) {
									if (this.allClients[i].gptCalls <= this.MAX_GPT_CALLS) {
										// Increment Call Record
										this.allClients[i].gptCalls += 1;
										// Return completion
										complete(dataframe.message).then((res) => {
											const msgFrame = this.getDataFrame();
											msgFrame.message = res;
											msgFrame.name = `${modelName}-001`;
											msgFrame.extra = 'default';
											sendMessage(msgFrame, false);
										})
									} else {
										let df = this.getDataFrame();
										df.message = `${this.allClients[i].clientName} GPT Call limit reached!`;
										sendMessage(df, false);
									}
								}
								
							}
						}
					} else if (serverPost != null) {
						if (dataframe.serverPost == 'init-info') {
							let currSocket = {
								"clientID": socket.id,
								"clientName": dataframe.name,
								// "socket": socket,
								"gptCalls": 0
							}
							if (currSocket.clientName != adKey) {
								const msgFrame = this.getDataFrame();
								msgFrame.message = `${dataframe.name} has joined the chat!`;
								msgFrame['info-type'] = true;
								msgFrame.ID = socket.id;
								// Send back socketId for sync
								sendMessage(msgFrame, dataframe.broadcast);
								this.allClients.push(currSocket);
							}
						} else if (dataframe.serverPost == 'update-info') {
							for (let i = 0; i < this.allClients.length; i++)
							{
								if (this.allClients[i].clientID == dataframe.clientID) {
									this.allClients[i].clientName = dataframe.name;
								}
							}
						} else if (dataframe.serverPost == 'miscadmn') {
							for (let i = 0; i < this.allClients.length; i++)
							{
								if (this.allClients[i].clientID == socket.id) {
									const msgFrame = this.getDataFrame();
									msgFrame.message = `${this.allClients[i].clientName} has left the chat!`;
									msgFrame['info-type'] = true;
									sendMessage(msgFrame, false);
									this.allClients.splice(i, 1);
								}
							}
						}
					} else {
						const messageToBeSent = this.getDataFrame();
						messageToBeSent.message = dataframe.message;
						messageToBeSent.name = dataframe.name;
						messageToBeSent.extra = dataframe.extra;

						sendMessage(messageToBeSent, dataframe.broadcast);
					}
				}
			})

			socket.on('disconnect', () => {
				for (let i = 0; i < this.allClients.length; i++)
				{
					if (this.allClients[i].clientID == socket.id) {
						const msgFrame = this.getDataFrame();
						msgFrame.message = `${this.allClients[i].clientName} has left the chat!`;
						msgFrame['info-type'] = true;
						sendMessage(msgFrame, false);
						this.allClients.splice(i, 1);
					}
				}
			})

			function sendMessage(message=null, broadcast=true) {
				if (broadcast) {
					// Normal Message
					socket.broadcast.emit('server-to-client-message', message);
				} else {
					io.emit('server-to-client-message', message);
				}
			}
		});
	}

	miscdmn(socket) {
		for (let i = 0; i < this.allClients.length; i++)
		{
			if (this.allClients[i].clientID == socket.id) {
				const msgFrame = this.getDataFrame();
				msgFrame.message = `${this.allClients[i].clientName} has left the chat!`;
				msgFrame['info-type'] = true;
				sendMessage(msgFrame, false);
				this.allClients.splice(i, 1);
			}
		}
		return this.allClients;
	}

	getDataFrame() {
		return {
			"message": null,
			"name": "Server",
			"extra": "default",
			"info-type": false,
			"ID": null
		}
	}

	authCheck(pass) {
		return pass == AuthKey
	}
}

module.exports = Server;