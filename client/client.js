const io = require('socket.io-client');
const chalk = require('chalk');
const readline = require('readline');
const socket = io("http://localhost:3000");

// Readline Init
const rl = readline.createInterface({input: process.stdin, output: process.stdout, terminal: false});

const nickname = "guy-Man"

const chalk_COLOURS = [chalk.magentaBright, chalk.yellow, chalk.green, chalk.cyan]
let clientInfo = {
	"msg" : "xyz",
	"name" : "guy-Man",
	"socketID": undefined,
	"room": "default",
	"extra": "default",
	"tColour": chalk_COLOURS[0],
	"var": 0
}

let displayInfo = {
	//['hex(#FFA500'): orange, etc, red, yellow, cyan, green, white]
	textColour: 'red',
	bg: false
}

const figlet  = require('figlet');

console.log("Connecting to the server...");

// Basic listeners

socket.on('connect', () => {
	console.log(`Connection estabilished! id: ${socket.id}`);
	clientInfo.socketID = socket.id;
	socket.emit('info-init', clientInfo);
})

socket.on('message', (data) => {
	console.log(data)
})

//----------------------------------------------------------------

rl.on("line", (input) => {
	filterInput(input);
})

let text_COLOUR = clientInfo.tColour;
// Common message
socket.on('broadcast-message', (data) => {
	if (data.extra === 'figlet') {
		figlet(data.msg, (err, figData) => {
			if (err) {
				console.log("Something went wrong!!!");
				console.dir(err);
				return;
			}
			console.log(figData);
		})
	} else 
	{
		console.log(text_COLOUR(`${data.name}`) + `: ${data.msg}`);
	}
})

socket.on('general-data-message', (data) => {
	console.log(data);
})


function filterInput(input)
{
	if (input.startsWith("/") == true) {
		// handling command
		let lis = input.split(" ");
		let nonCommand = lis.splice()

		if (lis[0] == '/f') {
			clientInfo.msg = lis.splice(1).join(" ");
			clientInfo.extra = "figlet";
			mainBroadcast();
		} else if (lis[0] == '/num')
		{
			clientsNum();
		} else if (lis[0] == '/change-username')
		{
			clientInfo.name = lis.splice(1).join(" ");
		} else if (lis[0] == '/help')
		{
			help_COMMANDS();
		} else if (lis[0] == '/change-colour')
		{
			change_TEXTCOLOUR(lis.splice(1).join(" "));
		}
		else {
			console.log(chalk.yellow("Invalid Command \n"));
		}

	} else {
		// handling message
		clientInfo.msg = input;
		clientInfo.extra = "default";
		mainBroadcast();
	}
}

function change_TEXTCOLOUR(input)
{
	if (input.startsWith('#')) {
		if (input.length() == 7) {
			let hexVal = input.slice(1);
			clientInfo.tColour = chalk.hex(hexVal);
			return
		} else {
			console.log(chalk.yellow("Invalid!"));
			return;
		}
	}
	else {
		if (input == "magentaBright") {
			clientInfo.tColour = chalk_COLOURS[0];
			text_COLOUR = clientInfo.tColour;

		} else if (input == "yellow")
		{
			clientInfo.tColour = chalk_COLOURS[1];
			text_COLOUR = clientInfo.tColour;

		} else if (input == "green")
		{
			clientInfo.tColour = chalk_COLOURS[2];
			text_COLOUR = clientInfo.tColour;

		} else if (input === "cyan")
		{
			clientInfo.tColour = chalk_COLOURS[3];
			text_COLOUR = clientInfo.tColour;

		} else {
			console.log(chalk.yellow('Invalid! 2nd'));
			return
		}
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

function mainBroadcast()
{
	socket.emit('broadcast', clientInfo);
}

// Check num of clients
function clientsNum()
{
	socket.emit('clients-num');
}

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