const io = require('socket.io-client');
const chalk = require('chalk');
const readline = require('readline');
// const socket = io("http://localhost:3000");
const socket = io("https://chat-app-1fjn.onrender.com");

// Readline Init
const rl = readline.createInterface({input: process.stdin, output: process.stdout, terminal: false});

const chalk_COLOURS = [chalk.magentaBright, chalk.yellow, chalk.green, chalk.cyan]

let clientInfo = {
	"name" : require("os").userInfo().username,
	"socketID": undefined,
	"room": "default",
	"extra": "default",
	"tColour": chalk_COLOURS[0]
}

const figlet  = require('figlet');

console.log("Connecting to the server...");

//----------------------------------------------------------------

socket.on('connect', () => {
	clientInfo.socketID = socket.id;
	socket.emit('init-info', {clientID: clientInfo.socketID, clientName: clientInfo.name});
})

rl.on("line", (input) => {
	filterInput(input);
})

function filterInput(input)
{
	if (input.startsWith("/") == true) {
		// handling command
		let lis = input.split(" ");
		let nonCommand = lis.slice(1)

		if (lis[0] == '/f') {
			send_MESSAGE(msg=nonCommand.join(" "), broadcast=false, extra="figlet")

		} else if (lis[0] == '/fg') {
			send_MESSAGE(msg=nonCommand.join(" "), broadcast=false, extra="figlet-ghost")

		} else if (lis[0] == '/num')
		{
			get_INFO('client-num');

		} else if (lis[0] == '/change-name')
		{
			let newName = lis.splice(1).join(" ");
			send_MESSAGE(msg=`changed their name to ${clientInfo.tColour(newName)}`, broadcast=false);
			clientInfo.name = newName
			update_INFO();

		} else if (lis[0] == '/help')
		{
			help_COMMANDS();
		} 	else {
			console.log(chalk.yellow("Invalid Command \n"));
		}

	} else {
		send_MESSAGE(msg=input);
	}
}

function help_COMMANDS()
{
	for (let cmd of [chalk.cyan('/f') + chalk.grey(' <message>'), 
					 chalk.cyan('/num') + chalk.grey(' => Num of clients in room!'),
					 chalk.cyan('/change-username') + chalk.grey(' <username>')]) {
		console.log(cmd);
	}
}

function rooms_INIT()
{
	let allRooms = ['room-1', 'room-2']
	function rooms(input)
	{
		if (input.slice(7, 12) == "-join") {
			let room_Choice = input.slice(13);
			for (let room of allRooms) {
				if (room_Choice == room) {
					//Join the room
					console.log(`\nJoining ${room}\n`);
					socket.emit('join-room', `${room}`);
					return
				}
			}
			console.log("\n8================D Invalid Input\n");
			return
		}
		console.log("Current rooms: ");
		for (let i of allRooms)
		{
			console.log(i);
		}
	}
}

// Normal messages + figlet
function send_MESSAGE(msg, broadcast=true, extra="default")
{
	let data = {msg: msg, broadcast: broadcast, extra: extra, name: clientInfo.name};
	socket.emit('broadcast-message-SEND', data);
}

socket.on('broadcast-message-RECIEVE', (data) => {
	if (data.extra != "default") {
		// Figlet or Figlet Ghost
		if (data.extra == "figlet") {
			print_FIGLET(data.msg);
			return;
		} else if (data.extra == "figlet-ghost"){
			print_FIGLET(data.msg, 'Ghost');
			return;
		} else {
			print_COLOURED("Invalid Extra Argument");
			return;
		}
	}
	console.log(clientInfo.tColour(`${data.name}`) + `: ${data.msg}`);
	return;

})

function special_FUNC()
{
	console.log('not for u ;)');
}

function print_FIGLET(inp, font='Standard')
// layout [default, full, fitted]
{
	figlet.text(inp, {
	    font: font,
	    horizontalLayout: 'default',
	    verticalLayout: 'default',
	    width: 80,
	    whitespaceBreak: true
	}, function(err, data) {
	    if (err) {
	        console.log('Something went wrong...');
	        console.dir(err);
	        return;
	    }
	    console.log(data);
	});

}

function print_COLOURED(message, colourArg="error")
{
	if (colourArg == "error") {
		console.log(chalk.bold.red(message));
	}
}

function update_INFO()
{
	let data = {clientID: clientInfo.socketID, clientName: clientInfo.name};
	socket.emit('update-info', data);
}

function get_INFO(infoTYPE)
{
	// infoTYPE: client-num
	socket.emit('get-info', infoTYPE);
}
socket.on('receive-info', (data) => {
	console.log(data);
})

//infoType: client-num
//socket.emit('get-info', infoTYPE);

// data = {clientID, clientName}
//socket.emit('update-info', data);

// let data = {msg: msg, broadcast: broadcast, extra: extra, name: clientInfo.name};
// 	socket.emit('broadcast-message-SEND', data);
