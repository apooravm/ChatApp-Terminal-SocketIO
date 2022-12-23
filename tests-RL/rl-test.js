// const readline = require('readline');
// const rl = readline.createInterface(process.stdin, process.stdout);

// let msg = [];

// const nickname = "slceMAN"

// rl.on("line", (input) => {
    
//     // if (true === input.startsWith("b;")) {
//     //     var str = input.slice(2);
//     //     socket.emit("broadcast", {"sender": nickname, "action": "broadcast", "msg": str});
//     // }
//     // msg.push(input);
//     // console.log(msg)
//     // socket.emit('broadcast', {"sender": nickname, "action": "broadcast", "msg": input})
// });


let ls = ['a', 'b', 'c'];
let wrd = 'p'

for (let i of ls) {
	if (wrd == i)
	{
		console.log("joining room");
		// return
	}
}
// console.log("Invalid input!");

let word = "/f-com --ags message";
let lis = word.split(" ");
console.log(lis);


lis = [1, 2, 3, 4, 4, 5, 6];
console.log(lis.splice(1).join(" "))

const chalk = require('chalk');

console.log(chalk.blue('bruh'))

const j = {
	a:1,
	b:2
}

console.log("bruh");
console.log(chalk.magentaBright('bruh'));

for (let cmd of [chalk.cyan('/f') + chalk.grey(' <message>')]) {
		console.log(cmd);
	}

console.log("#FFFFFF".slice(1))