var events = require('events'),
	Tracker = require('./tracker.js'),
	//peer = require('./peer'),
	//piece = require('./piece'),
	meta = require('./metainfo.js'),
	//stats = require('./stats.js'),
	util = require('./util.js');
	
module.exports = Torrent;
	
/**
 * Torrent instance
 * @param {String} torrent
 * @param {Object} options
 */
function Torrent(torrent, options) {
	// Torrent options
	this.options = util.extend({}, Torrent.options, options);
	
	// Array of trackers
	this.trackers = [];
	
	// Torrent metainfo
	this.metainfo = new meta(torrent, this.options.metainfo);
	
	this.peers = [];
	
	this._construct();
}

Torrent.prototype = new events.EventEmitter();

/**
 * Announces to all trackers
 */
Torrent.prototype.announceAll = function(event){
	for(var i = 0, ii = this.trackers.length; i < ii; i++){
		this.trackers[i].announce(event);
	}
};


/**
 * Constructs needed objects 
 */
Torrent.prototype._construct = function(){
	var self = this;
	
	this.metainfo.on('ready', function(){
		Torrent.prototype._loadTrackers.call(self);
	});
};

/**
 * Creates list of trackers
 */
Torrent.prototype._loadTrackers = function(){
	var announceList = this.metainfo.get('announce-list'),
		tracker,
		trackerParams,
		self = this;
	
	if(!announceList || announceList.length == 0){
		announceList = [[this.metainfo.get('announce')]];
	}
	
	// Create tracker and peer list
	for(var i = 0, ii = announceList.length; i < ii; i++){
		for(var j = 0, jj = announceList[i].length; j < jj; j++){
			
			trackerParams = {
				url : announceList[i][j].toString('utf8'),
				metainfo : this.metainfo
			};
			
			tracker = new Tracker(trackerParams);
			
			// Add peer when ready
			tracker.on('peers', function(peers){
				self.addPeers(peers);
			});
			
			this.trackers.push(tracker);
		}
	}
	
	this.emit('ready');
};

Torrent.prototype.addPeers = function(peers){
	var num = peers.length;
	
	for(var i = 0; i < num; i++){
		console.log('Peer ' + peers[i].address + ':' + peers[i].port + ' found');	
	}
};

/**
 * Torrent defaults
 */
Torrent.options = {
	// ...
};