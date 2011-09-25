module.exports.ntohl = ntohl;
module.exports.ntoipv4 = ntoipv4;
module.exports.ntoport = ntoport;

/**
 * Converts network byte order to host order (32bit address)
 * @param {Buffer} nbo
 */
function ntohl(nbo){
	if( ! Buffer.isBuffer(nbo) ){
		throw 'Parameter is not a buffer';
	}

	return (
		((0xff & nbo[0]) << 24) | ((0xff & nbo[1]) << 16) |
		((0xff & nbo[2]) << 8) | (0xff & nbo[3])
	);
}

/**
 * Converts network byte order directly into IPv4 string
 * @param {Buffer} nbo
 */
function ntoipv4(nbo){
	var str = '';
	
	for(var i = 0, ii = nbo.length; i < ii; i++){
		str += nbo[i] + ((i < 3) ? '.' : '');
	}
	
	return str;
}

/**
 * Converts 2 binary bytes to decimal port number
 */
function ntoport(bytes){
	if( ! Buffer.isBuffer(bytes) ){
		throw 'Parameter is not a buffer';
	}
	
	var hexStr = bytes.toString();
	
	return parseInt( bytes[0].toString(16) + bytes[1].toString(16) , 16);
}