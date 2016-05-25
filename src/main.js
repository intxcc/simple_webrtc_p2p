"use strict";

import $ from "jquery";
import RTConnect from "./ws.js";

var rtConnect = new RTConnect();
console.log("ID: " + rtConnect.id);


/*rtConnect.setOnReceive((data) => {
	console.log(data);
});

$("#send_btn").click(function() {
	rtConnect.send("ping");
});

$("#scan_btn").click(function() {
	rtConnect.openConnection();
});*/
