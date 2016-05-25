"use strict";

import io from "socket.io-client";

require("webrtc-adapter");

class WSControl {
	constructor(id, port, pc, debug = false) {
		this.socket = io(":" + port);
		this.id = id;
		this.rid = 0;
		this.debug = debug;
		this.pc = pc;

		this.socket.on("offer", (data) => {
			this.onoffer(data);
		});

		this.socket.on("answer", (data) => {
			this.onanswer(data);
		});

		this.socket.on("candidate", (data) => {
			this.oncandidate(data);
		});
	}

	onoffer(data) {
		if (this.debug) {
			console.debug("Socket: offer");
		}

		this.rid = data.id;
		this.pc.setRemoteDescription(data.sdp).then(() => (
			this.pc.createAnswer()
		)).then((data) => (
			this.pc.setLocalDescription(data)
		)).then(() => (
			this.socket.emit("answer", {"sdp": this.pc.localDescription, "id": this.id, "rid": this.rid})
		));
	}

	onanswer(data) {
		if (this.debug) {
			console.debug("Socket: answer");
		}

		this.pc.setRemoteDescription(data.sdp);
	}

	oncandidate(data) {
		if (this.debug) {
			console.debug("Socket: candidate");
		}

		var candidate = new RTCIceCandidate({sdpMLineIndex: data.label, candidate: data.candidate});
		this.pc.addIceCandidate(candidate);
	}

	emitCandidate(event) {
		this.socket.emit("candidate", {type: "candidate",
			label: event.candidate.sdpMLineIndex,
			id: event.candidate.sdpMid,
			candidate: event.candidate.candidate,
			rid: this.rid});
	}

	emitOffer(sdp) {
		this.socket.emit("offer", {"sdp": sdp, "id": this.id});
	}
}

class RTConnect {
	constructor(debug = false) {
		this.id = Math.floor((Math.random() * 100000) + 1);
		this.socket_port = 3000;
		this.connected = false;
		this.debug = debug;
		this.onreceive = () => {};

		try {
			var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}], optional: [{RtpDataChannels: true}]};
			this.pc = new RTCPeerConnection(pc_config);

			this.wscontrol = new WSControl(this.id, this.socket_port, this.pc, this.debug);

			this.pc.onicecandidate = (event) => {
				if (this.debug) {
					console.debug("onIceCandidate");
				}

				if (event.candidate) {
					this.wscontrol.emitCandidate(event);
				}
			};

			this.pc.ondatachannel = (event) => {
				if (this.debug) {
					console.debug("New dataChannel");
				}

				this.dataChannel = event.channel;
				this.handleOnDataChannel();
			};
		} catch (e) {
			if (this.debug) {
				console.debug("Failed to create PeerConnection, exception: " + e.message);
			}
		}
	}

	openConnection() {
		this.dataChannel = this.pc.createDataChannel("sendDataChannel");
		this.handleOnDataChannel();

		this.pc.createOffer().then((sdp) => {
			if (this.debug) {
				console.debug("Created p2p offer");
			}

			this.pc.setLocalDescription(sdp);
			this.wscontrol.emitOffer(sdp);
		});
	}

	handleOnDataChannel() {
		this.dataChannel.onmessage = (event) => {
			this.handleReceive(event.data);
		};

		this.dataChannel.onopen = () => {
			if (this.debug) {
				console.debug("Opened dataChannel");
			}

			this.connected = true;
		};

		this.dataChannel.onclose = () => {
			if (this.debug) {
				console.debug("Closed dataChannel");
			}

			this.connected = false;
		};
	}

	handleReceive(data) {
		if (this.debug) {
			console.debug("RTC Incoming: " + data);
		}

		this.onreceive(data);
	}

	setOnReceive(callback) {
		this.onreceive = callback;
	}

	send(data) {
		if (this.debug) {
			console.debug("RTC Outgoing: " + data);
		}

		this.dataChannel.send(data);
	}

	getId() {
		return this.id;
	}
}

export default RTConnect;
