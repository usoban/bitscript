var net = require('net');

module.exports = BitServer;

function BitServer(){
	
}

BitServer.start = function(port){
	net.createServer(function(conn){
		
		// handle connection
		
	}).listen(port, '192.168.1.145');
};
