
import chalk from "chalk";
import express from "express";
import socket from "socket.io";
import path from "path";
import fs from "fs";
import datetime from "node-datetime";
import ansiToHtml from "ansi-to-html";
import { spawn } from "child_process";

const port = 7777;
const app = express();
const server = app.listen(port);
const io = socket(server);
var convert = new ansiToHtml();

//const saves_path = path.resolve(__dirname, "text-adventure/saves");
const input_path = path.resolve(__dirname, "text-adventure/input");
const output_path = path.resolve(__dirname, "text-adventure/output");

console.log(chalk.green.bold("server running on port " + port));

app.get("/", (req,res) => {
	res.sendFile(path.resolve(__dirname, "public/index.html"))
});

app.get("/res/:file", (req,res) => {
	res.sendFile(path.resolve(__dirname, "public", req.params.file))
});


io.sockets.on("connection", (socket) => {

	const IP = socket.handshake.address/*.substr(7)*/;
	console.log(chalk.green(chalk.underline(curDate("H:M:S")) + " - connected: " + chalk.bold(socket.id + " - " + IP)));
	var cur_savefile = false;
	var game = false;

	socket.on("savefile", (savefile) => {
		fs.writeFileSync(path.resolve(__dirname, "text-adventure/input/", savefile));
		fs.writeFileSync(path.resolve(__dirname, "text-adventure/output/", savefile));
		cur_savefile = savefile;

		console.log(chalk.blue.bold("spawning game child_process with savefile: " + cur_savefile));
		game = spawn("ruby", [path.resolve(__dirname, "text-adventure/main.rb"), cur_savefile]);
		game.stdout.on("data", (output) => {
			console.log(chalk.red("GAME OUTPUT savefile: " + cur_savefile));
			//socket.emit("stdout",convert.toHtml(output));
		});
		game.stderr.on("data", (err) => {
			console.log(chalk.red.bold("game error (" + cur_savefile + "): "));
		});
		game.on("close", (code) => {
			console.log(chalk.red.bold("game (" + cur_savefile + ") exited with code " + code));
		});
	});

	socket.on("stdin", (string) => {
		if (!cur_savefile) return;
		fs.writeFileSync(path.resolve(input_path, cur_savefile), string);
	});


	function read_output() {
		if (!cur_savefile) return "";
		var output = convert.toHtml(fs.readFileSync(path.resolve(output_path, cur_savefile),{encoding: "UTF-8"}));
		socket.emit("stdout",output);
	}

	var stdout_interval = setInterval(read_output, 500);


	socket.on("disconnect", () => {
		console.log(chalk.red(chalk.underline(curDate("H:M:S")) + " - disconnected: " + chalk.bold(socket.id + " - " + IP)));
	});

});


function curDate(frmt) {
	return datetime.create().format(frmt);
}

