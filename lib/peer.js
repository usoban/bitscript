var nettools = require('./common/nbo.js'),
	events = require('events');

module.exports = Peer;

function Peer(params){
	this.id = params.id || 'none';
	this.address = nettools.ntoipv4(params.address);
	this.port = nettools.ntoport(params.port);
}

Peer.prototype = new events.EventEmitter();