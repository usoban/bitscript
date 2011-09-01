var events = require('events'),
	http = require('http'),
	bencode = require('bencode'),
	hash = require('hashlib'),
	url = require('url'),
	util = require('util'),
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
			this._peerId = '-JT0001-' + Math.round((new Date()).getTime() / 1000);
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
	 * Hashes bencoded info metadata
	 */
	function hashBencodeInfo(){
		return hash.sha1(bencode.encode(self.metainfo.get('info')));
	}
	
	/*
	 * Sends announce request to the tracker
	 */
	function send(){
		var trackerInfo = url.parse(self.url), 
		getOpts = {
			host : trackerInfo.hostname,
			port : trackerInfo.port,
			path : trackerInfo.pathname + '?' + reqString
		};	
		
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
	
	var params = {
		info_hash : encodeURIComponent(hashBencodeInfo()),
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
	reqString = qs.stringify(params, '&', '=');
	
	send(url);
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
