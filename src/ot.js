/**
 * [JSONPatchOTAgent description]
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} purity       [description]
 */
var JSONPatchOTAgent = function(versionPaths, apply, purity){
	/**
	 * History of performed JSON Patch sequences that maight not yet be acknowledged by Peer
	 * @type {Array<JSONPatch>}
	 */
	this.pending = [];
	/**
	 * JSON-Pointer to local version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.versionPath = versionPaths[0];
	/**
	 * JSON-Pointer to remote version in shared JSON document
	 * @type {JSONPointer}
	 */
	this.remotePath = versionPaths[1];
	/**
	 * Versioned JSON Patch queue
	 * @type {JSONPatchQueue}
	 */
	this.queue = new JSONPatchQueue(this.versionPath, apply, purity);

	Object.defineProperty(this, "remoteVersion",{
		get: function(){
			return this.queue.version;
		}
	});
	/**
	 * Function to apply JSONPatchSequence to JSON object
	 * @type {Function}
	 */
	this.apply = apply;

};
/** local version */
JSONPatchOTAgent.prototype.version = 0;
/** Latest localVersion that we know that was acknowledged by remote */
JSONPatchOTAgent.prototype.ackVersion = 0;
/** Latest acknowledged remote version */
//JSONPatchOTAgent.prototype.remoteVersion = 0;

// instance property
//  JSONPatchOTAgent.prototype.waiting = [];
/** needed? OT only? */
// JSONPatchOTAgent.prototype.pending = [];
/* applies or adds to queue */
JSONPatchOTAgent.prototype.receive = function(obj, doubleVersionedJsonPatch){
	//TODO: transform/reject if needed (tomalec)
	var versionedJsonPatch = doubleVersionedJsonPatch;
	// strip local version test operation object / convert Double- to just Versioned JSON Patch;
		var testRemote = versionedJsonPatch.shift();

	this.queue.receive(obj, versionedJsonPatch);
};
/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}          
 */
JSONPatchOTAgent.prototype.send = function(sequence){
	sequence.unshift({ // test for OT
		op: "test",
		path: this.remotePath,
		value: this.remoteVersion
	});
	return this.queue.send.call(this, sequence);
};