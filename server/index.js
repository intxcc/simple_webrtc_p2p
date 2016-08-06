var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var clients = {};
var connected = {};

function checkid(id) {
	return (id in connected);
}

io.on("connection", function(socket){
	console.log("a user connected");

	clients[socket.client.conn.id] = socket;


	socket.emit("init", "init");

	socket.on("init", function (msg) {
		connected[msg["id"]] = socket.client.conn.id;
		clients[socket.client.conn.id].simpleid = msg["id"];

		console.log("init: " + msg["id"]);
	}.bind(socket));

	socket.on("offer", function (msg) {
		if (!checkid(msg["rid"])) {
			clients[connected[msg["id"]]].emit("err", "idnotfound");
			return;
		}

		clients[connected[msg["rid"]]].emit("offer", msg);

		console.log("offer: " + msg["id"] + " to " + msg["rid"]);
	});

	socket.on("answer", function (msg) {
		if (!checkid(msg["rid"])) {
			clients[connected[msg["id"]]].emit("err", "idnotfound");
			return;
		}

		clients[connected[msg["rid"]]].emit("answer", msg);

		console.log("answer: " + msg["id"] + " to " + msg["rid"]);
	});

	socket.on("candidate", function (msg) {
		if (!checkid(msg["rid"])) {
			clients[connected[msg["cid"]]].emit("err", "idnotfound");
			return;
		}

		clients[connected[msg["rid"]]].emit("candidate", msg);

		console.log("candidate: " + clients[socket.client.conn.id].simpleid + " to " + msg["rid"]);
	});

	socket.on("disconnect", function () {
		console.log("disconnect: " + clients[socket.client.conn.id].simpleid);

		delete connected[clients[socket.client.conn.id].simpleid];
		delete clients[socket.client.conn.id];
	});
});

http.listen(3000, function(){
	console.log("listening on *:3000");
});
