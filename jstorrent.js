require.paths.push('/home/usoban/local/node/lib/node_modules');

var torrentServer = require('./lib/server.js'),
	torrentClient = require('./lib/torrent.js'),
	step = require('step'),
	util = require('util');

// Start server
torrentServer.start(6621);

// Create client and announce

var c = new torrentClient('./torrents/test2.torrent');

c.on('ready', function(){
	c.announceAll('started');
});

process.on('exit', function(){
	c.announceAll('stopped');
});

/*
process.on('uncaughtException', function(){
	c.announceAll('stopped');
});*/