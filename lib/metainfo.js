var bencode = require('dht-bencode'),
	util = require('./util.js'),
	events = require('events'),
	crypto = require('crypto');

module.exports = Metainfo;

function Metainfo(metainfo, options){
	this.options = util.extend({}, Metainfo.options, options);
	this.metainfo = {};
	this.infohash = '';
	this._torrentFile = metainfo;
	
	if(typeof this.options.fsapi != 'Object'){
		this.fs = require(this.options.fsapi);
	}
	
	this._load();
}

Metainfo.prototype = new events.EventEmitter();

/**
 * Parses torrent file
 */ 
Metainfo.prototype._load = function(){
	var self = this;
	
	// Generates torrent info hash
	function infoHash(){
		var buffer = bencode.bencode(self.metainfo.info),
			shasum = crypto.createHash('sha1');
			
		return new Buffer(shasum.update(buffer).digest('binary'), 'binary');
	}
	
	// Read torrent 
	this.fs.readFile(this._torrentFile, function(err, data){
		if(err || !data){
			console.log('No torrent file found: ' + this._torrentFile );
		}
		
		// Parse torrent and generate hash
		self.metainfo = bencode.bdecode(data);
		self.infohash = infoHash();
		
		// Emit to the system metainfo is ready
		self.emit('ready');
	});
};

/**
 * Returns metainfo property
 */
Metainfo.prototype.get = function(key){
	if(this.metainfo.hasOwnProperty(key)){
		return this.metainfo[key];
	}
	
	return null;
};

/**
 * Metainfo defaults
 */
Metainfo.options = {
	fsapi : 'fs'
};
