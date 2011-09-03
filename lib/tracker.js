var events = require('events'),
	http = require('http'),
	bencode = require('dht-bencode'),
	hash = require('hashlib'),
	url = require('url'),
	util = require('util'),
	encoder = require('./util.js').urlEncodeBuffer,
	qs = require('querystring');

module.exports = Tracker;

/**
 * Tracker 
 * 
 * params : {
 *   url : tracker url,
 *   metainfo : metainfo object
 * }
 * 
 * @param {Object} params
 */
function Tracker(params){
	// Tracker URL
	this.url = params.url;
	
	// Torrent metainfo
	this.metainfo = params.metainfo || {};
	
	this.trackerInfo = url.parse(this.url);
	
	// Has event 'started' been announced
	this.announcedStart = false;
	
	// Has event 'completed' been announced 
	this.announcedCompletion = false;
}

Tracker.prototype = new events.EventEmitter();

/**
 * Returns generated peer id
 */
Tracker.prototype.peerId = function(){
	return (function(){
		if(this._peerId === undefined){
			this._peerId = '-BS000001-' + Math.round((new Date()).getTime() / 1000);
		}
		
		return this._peerId;
	})();
};

/**
 * Announces to the tracker
 * @param {String} event
 */
Tracker.prototype.announce = function(event){
	var self = this;
	
	/*
	 * Sends announce request to the tracker
	 */
	function send(){
		// Generate tracker announce url 
		var tracker = self.trackerInfo,
			getOpts = {
				host : tracker.hostname,
				port : tracker.port,
				path : tracker.pathname
			};	
		
		// Attach URL parameters
		if(!tracker.search){
			getOpts.path += '?' + reqString;
		} else {
			getOpts.path += tracker.search + '&' + reqString;
		}
		
		// Do the announcing
		http.get(getOpts, receive).on('error', handleError);
	}
	
	/*
	 * Receives response from the tracker
	 */
	function receive(res){
		console.log('Tracker responded: ' + util.inspect(res.headers));
	
		/* !! */
		res.on('data', function(chunk){
			console.log(chunk.toString('utf8'));
		});
		
		/* !! */
		
		self.emit('announced');
	}
	
	function handleError(err){
		console.log('Got error' + err.message);
	}
	
	function dummyEncoder(x){ return x; }
	
	var params = {
		info_hash : encoder(this.metainfo.infohash),
		peer_id : encodeURIComponent(this.peerId()),
		port : 6621 /*@TODO!*/,
		uploaded : 0 /*@TODO!*/,
		downloaded : 0 /*@TODO!*/,
		left : 100 /*@TODO!*/,
		compact : 1,
		no_peer_id : 0,
		event : this._getEvent(event)
		/*ip : ,
		 numwant : ,
		 key : ,
		 trackerid : */
	},
	reqString,
	encodingFunc;
	
	// The dirty work:
	// Substitute escape function - using native,
	// info_hash'd get encoded twice
	encodingFunc = qs.escape;
	qs.escape = dummyEncoder;
	reqString = qs.stringify(params, '&', '=');
	qs.escape = encodingFunc;
	
	send();
};

/**
 * Returns event type
 * @param {String} event 
 */
Tracker.prototype._getEvent = function(event){
	if(!this.announcedStart){
		return 'started';
	}
	else if (event == 'started' && this.announcedStart || event == 'completed' && this.announcedCompletion){
		return '';
	}
	else if (event == 'completed' || event == 'stopped'){
		return event;
	} else {
		return '';
	}
};
