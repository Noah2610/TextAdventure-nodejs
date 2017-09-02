
var input_savefile = document.querySelector("input#input_savefile");
var input_savefile_btn = document.querySelector("input#input_savefile_submit");
var input_stdin = document.querySelector("input#input_stdin");
var input_stdin_btn = document.querySelector("input#input_stdin_submit");
var stdout = document.querySelector("#stdout");

var port = 7777;
var socketAddr = "http://192.168.0.78:" + port;

var socket = io.connect(socketAddr);

var cur_savefile = false;

socket.on("stdout", function (output) {
	stdout.innerHTML = output;
});

input_savefile_btn.addEventListener("click", function () {
	cur_savefile = input_savefile.value;
	socket.emit("savefile", input_savefile.value);
});
input_savefile.addEventListener("keydown", function (e) {
	if (e.code == "Enter") {
		cur_savefile = input_savefile.value;
		socket.emit("savefile", input_savefile.value);
	}
});

input_stdin_btn.addEventListener("click", function () {
	socket.emit("stdin", input_stdin.value);
});
input_stdin.addEventListener("keydown", function (e) {
	if (e.code == "Enter")
		socket.emit("stdin", input_stdin.value);
});

