const port = process.env.PORT || 3000;
const io = require('socket.io')(port);

console.log(`Listening on Port ${port}...`);

let allClients = [];
let textContainer = [];

io.on('connection', socket => {
	socket.on('init-info', (data) => {
		let currSocket = {
			clientID: socket.id,
			clientName: data.clientName,
			socker: socket
		}
		if (data.clientName != "9123QWERTY") {
			send_INFO(`${data.clientName} has joined the chat!`);
			allClients.push(currSocket);
			let address = socket.handshake.address;
  			console.log('New connection from ' + address.address + ':' + address.port);
		}
	})

	socket.on('update-info', (data) => {
		for (let i = 0; i < allClients.length; i++)
		{
			if (allClients[i].clientID == data.clientID) {
				allClients[i].clientName = data.clientName
			}
		}
	})

	function send_INFO(data)
	{
		//used by: disconnect, get-info
		io.emit('receive-info', data);
	}

	socket.on('disconnect', () => {
		for (let i = 0; i < allClients.length; i++)
		{
			if (allClients[i].clientID == socket.id) {
				send_INFO(msg=`${allClients[i].clientName} has left the chat!`);
				allClients.splice(i, 1);
			}
		}
	})

	socket.on('get-info', (infoTYPE) => {
		if (infoTYPE == 'client-num') {
			let currArr = [];
			for (let client of allClients) {
				currArr.push({ID: client.clientID, Name: client.clientName})
			}
			send_INFO(currArr);
		}
	})

	socket.on('broadcast-message-SEND', (data) => {
		let lis = data.msg.split(" ");
		// console.log(lis);
		if (data.extra == "figlet-ghost" && lis[0] == "9123") {
			// let num = lis[1];
			// let client_ID = allClients[num].clientID
			// // console.log(client_ID);
			// let kill_SK = allClients[num].socket
			if (lis[1] == "add") {
				textContainer.push(lis.slice(2).join(" "));
			} else if (lis[1] == "show") {
				socket.emit('receive-info', textContainer);
			}
			// kill_SK.disconnect()
		} else {
			if (!data.broadcast) {
				//send to all (sender + others)
				io.emit('broadcast-message-RECIEVE', data);
			} else {
				socket.broadcast.emit('broadcast-message-RECIEVE', data);
			}
		}
	})
})
