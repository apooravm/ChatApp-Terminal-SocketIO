const port = process.env.PORT || 3000;
const io = require('socket.io')(port);

console.log(`Listening on Port ${port}...`);

let allClients = [];

io.on('connection', socket => {
	// allClients.push(socket.id);
	// console.log(`${socket.id} has joined!`);

	socket.on('info-init', (info) => {
		console.log(`${info.name} has joined!`);
		let currSocket = {
			clientID: info.socketID,
			clientName: info.name
		}
		allClients.push(currSocket);
		socket.broadcast.emit('message', `${info.name} has joined!`);
	})

	socket.emit('message', 'Welcome to the Server...');

	socket.on('disconnect', () => {
		console.log(`${socket.id} has left`);
		for (var i = 0; i < allClients.length; i++) {
			if (allClients[i].clientID == socket.id) {
				allClients.splice(i, 1);
			}
		}
		socket.broadcast.emit('message', `${socket.id} has left`);
	})

	socket.on('broadcast', (data) => {
		if (data.msg != '') {
			socket.broadcast.emit('broadcast-message', data);
		}
	})

	socket.on('clients-num', () => {
		console.log(allClients);
		io.emit('general-data-message', allClients);
	})

	//Rooms
	socket.on('join-room', (room) => {
		socket.join(room);
	})
})
