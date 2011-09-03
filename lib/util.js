/**
 * Extracted from http://code.jquery.com/jquery-latest.js
 */
var extend = function() {
	 var options, name, src, copy, copyIsArray, clone,
	 target = arguments[0] || {},
	 i = 1,
	 length = arguments.length,
	 deep = false;
	 
	 // Handle a deep copy situation
	 if ( typeof target === "boolean" ) {
		 deep = target;
		 target = arguments[1] || {};
		 // skip the boolean and the target
		 i = 2;
	 }
	 
	 // Handle case when target is a string or something (possible in deep copy)
	 if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		 target = {};
	 }
	 
	 // extend jQuery itself if only one argument is passed
	 if ( length === i ) {
		 target = this;
		 --i;
	 }
	 
	 for ( ; i < length; i++ ) {
		 // Only deal with non-null/undefined values
		 if ( (options = arguments[ i ]) != null ) {
			 // Extend the base object
			 for ( name in options ) {
				 src = target[ name ];
				 copy = options[ name ];
				 
				 // Prevent never-ending loop
				 if ( target === copy ) {
					 continue;
				 }
				 
				 // Recurse if we're merging plain objects or arrays
				 if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					 if ( copyIsArray ) {
						 copyIsArray = false;
						 clone = src && jQuery.isArray(src) ? src : [];
						 
					 } else {
						 clone = src && jQuery.isPlainObject(src) ? src : {};
					 }
					 
					 // Never move original objects, clone them
					 target[ name ] = jQuery.extend( deep, clone, copy );
					 
					 // Don't bring in undefined values
				 } else if ( copy !== undefined ) {
					 target[ name ] = copy;
				 }
			 }
		 }
	 }
	 
	 // Return the modified object
	 return target;
 };

 /**
  * URL encodes binary data storead as node Buffer object 
  * Allowed chars: [0-9a-zA-Z\._~-], everything else gets
  * encoded using the %nn format (nn is hexadecimal value of byte)
  */
var urlEncodeBuffer = function(buffer){
	
	function isInRange(byte){
		var specials = (byte == 0x2d || byte == 0x2e || byte == 0x5f || byte == 0x7e),
			nums = (byte > 0x2f && byte < 0x3a),
			uchars = (byte > 0x40 && byte < 0x5b),
			lchars = (byte > 0x60 && byte < 0x7b);
			
		if(specials || nums || uchars || lchars){
			return true;
		} 
		
		return false;
	}
	
	if( ! Buffer.isBuffer(buffer) ){
		throw 'Not a buffer object';
	}
	
	var str = '',
		ch;

	for(var i = 0, ii = buffer.length; i < ii; i++){
		
		if( isInRange(buffer[i]) ){
			ch = String.fromCharCode(buffer[i]);
		}
		else if (buffer[i] < 0x10) {
			ch = '%0' + buffer[i].toString(16);
		}
		else{
			ch = '%' + buffer[i].toString(16);
		}
		
		str += ch;
	}
	
	return str;
};
 
module.exports.extend = extend; 
module.exports.urlEncodeBuffer = urlEncodeBuffer;