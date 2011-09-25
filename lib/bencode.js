function bdecode(buffer, encoding){	
	// UTF-8 is default encoding
	encoding = encoding || 'binary';
	
	if( ! Buffer.isBuffer(buffer) ){
		buffer = new Buffer(buffer, encoding);
	}
	
	var buffLen = buffer.
}
