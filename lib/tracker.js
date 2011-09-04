var events = require('events'),
	http = require('http'),
	bencode = require('dht-bencode'),
	hash = require('hashlib'),
	url = require('url'),
	util = require('util'),
	encoder = require('./util.js').urlEncodeBuffer,
	qs = require('querystring'),
	hexy = require('hexy'),
	Buffers = require('buffers'),
	Peer = require('./peer.js');

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
	
	// Tracker response (defaults)
	this.response = {
		'failure reason' : null,
		'warning message' : null,
		interval : 2700,
		'min interval' : 2700,
		'tracker id' : null,
		complete : 0,
		incomplete : 0,
		peers : []
	};
	
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
		/*if(res.headers['content-type'] != 'text/plain'){
			console.log('Tracker didn\' respond with text/plain');
			return;
		}*/
		console.log('Tracker responded: ' + util.inspect(res.headers));
		
		var buffs = Buffers(),
			buffer,
			response;
	
		/* !! */
		res.on('data', function(chunk){
			buffs.push(chunk);
		});
		
		res.on('end', function(){
			buffer = new Buffer(buffs.length);
			buffs.copy(buffer, 0, 0, buffs.length);
			
			self._parseResponse(buffer);
			//Tracker.prototype._parseResponse.call(self, buffer);
		});
		
		/* !! */
		
		self.emit('announced');
	}
	
	function handleError(err){
		console.log('Got error' + err.message);
	}
	
	function dummyEncoder(x){ return x; }
	
	/* Preparing parameters for announcement */
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
	// info_hash'd get encoded twice, which we do
	// not want - need better solution?
	encodingFunc = qs.escape;
	qs.escape = dummyEncoder;
	reqString = qs.stringify(params, '&', '=');
	qs.escape = encodingFunc;
	
	// Send the announcement
	send();
};

/**
 * Parses tracker response
 * 
 * @param {Buffer} resultBuffer
 */
Tracker.prototype._parseResponse = function(resultBuffer){
	var response = bencode.bdecode(resultBuffer);
	
	// If present, don't process response any further
	if(response['failure reason']){
		this.response['failure reason'] = response['failure reason'];
		return;
	}
	
	// Set response info
	this.response['failure reason'] = null;
	this.response['warning message'] = response['warning message'] || null;
	this.response['interval'] = response['interval']; // || this.response['interval'];
	this.response['min interval'] = response['min interval'] || this.response['min interval'];
	this.response['tracker id'] = response['tracker id'] || this.response['tracker id'];
	this.response['complete'] = response['complete']; // || this.response['complete'];
	this.response['incomplete'] = response['incomplete'];
	
	// Peers binary model. First 4 bytes represent IP, last 2 represent port
	var peersBinary = response['peers'],
		peers = [],
		peer;
	
	// @TODO
	for(var i = 0, ii = peersBinary.length; i < ii; i+=6){
		peer = new Peer(peersBinary.slice(i, i+4), peersBinary.slice(i+5, i+6));
		peers.push(peer);
	}
	
	// @TODO: peers dictionary model
};

/**
 * Returns event type
 * @param {String} event 
 */
Tracker.prototype._getEvent = function(event){
	if(!this.announcedStart){
		this.announcedStart = true;
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
