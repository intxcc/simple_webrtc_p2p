"use strict";

import $ from "jquery";
import RTConnect from "./ws.js";

require("jquery-qrcode");

var rtConnect = new RTConnect(true);
console.log("ID: " + rtConnect.id);

$("#qrcode_c").qrcode({
	"size": 100,
	"color": "#3a3",
	"text": ("http://127.0.0.1/#" + rtConnect.id)
});

var hash = document.URL.substr(document.URL.indexOf("#") + 1);
hash = (document.URL.indexOf("#") !== -1) ? hash : "";

if (hash != "") {
	setTimeout(function() {
		rtConnect.openConnection(hash);
	}, 1000);
}

rtConnect.setOnReceive((data) => {
	console.log(data);
});

$("#send_btn").click(function() {
	rtConnect.send("ping");
});

$("#scan_btn").click(function() {
	rtConnect.openConnection($("#rid_input").val());
});
