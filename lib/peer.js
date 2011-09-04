module.exports = Peer;

function Peer(nbo, port){
	this.host = this._ntohl(nbo);
	
	console.log(this.host);
}

/**
 * 4-byte nbo to host
 * @param {Buffer} nbo
 */
Peer.prototype._ntohl = function(nbo){
	return (
		((0xff & nbo[0]) << 24) | ((0xff & nbo[1]) << 16) |
		 ((0xff & nbo[2]) << 8) | (0xff & nbo[3])
	);
};
