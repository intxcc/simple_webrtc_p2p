var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var clients = {};

io.on("connection", function(socket){
	console.log("a user connected");

	clients[socket.client.conn.id] = socket;

	socket.on("offer", function (msg) {
		for (var c in clients) {
			if (socket != clients[c]) {
				clients[c].emit("offer", msg);
			}
		}

		console.log(msg);
	});

	socket.on("answer", function (msg) {
		for (var c in clients) {
			if (socket != clients[c]) {
				clients[c].emit("answer", msg);
			}
		}

		console.log(msg);
	});

	socket.on("candidate", function (msg) {
		for (var c in clients) {
			if (socket != clients[c]) {
				clients[c].emit("candidate", msg);
			}
		}

		console.log(msg);
	});

	socket.on("disconnect", function () {
		delete clients[socket.client.conn.id];
	});

	for (var c in clients) {
		console.log(c);
	}

	console.log("------");
});

http.listen(3000, function(){
	console.log("listening on *:3000");
});
