var bencode = require('bencode'),
	util = require('./util.js'),
	events = require('events');

module.exports = Metainfo;

function Metainfo(metainfo, options){
	this.options = util.extend({}, Metainfo.options, options);
	this.metainfo = {};
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
	
	this.fs.readFile(this._torrentFile, 'utf8', function(err, data){
		if(err || !data){
			console.log('No torrent file found: ' + this.torrentFile );
		}
		
		// Parse torrent
		self.metainfo = bencode.decode(data);
		
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
