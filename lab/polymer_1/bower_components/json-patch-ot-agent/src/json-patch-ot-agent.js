/**
 * [JSONPatchOTAgent description]
 * @param {Function} transform function(seqenceA, sequences) that transforms `seqenceA` against `sequences`.
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
 * @param {Boolean} purity       [description]
 * @constructor
 * @extends {JSONPatchQueue}
 */
var JSONPatchOTAgent = function(transform, versionPaths, apply, purity){
	JSONPatchQueue.call(this, versionPaths, apply, purity);
	this.transform = transform;
	/**
	 * Function to apply JSONPatchSequence to JSON object
	 * @type {Function}
	 */
	this.apply = JSONPatchOTAgent.applyOT( apply );
	/**
	 * History of performed JSON Patch sequences that maight not yet be acknowledged by Peer
	 * @type {Array<JSONPatch>}
	 */
	this.pending = [];

};
JSONPatchOTAgent.prototype = Object.create(JSONPatchQueue.prototype);
JSONPatchOTAgent.prototype.constructor = JSONPatchOTAgent;
JSONPatchOTAgent.prototype.ackLocalVersion = 0;

/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}          
 */
JSONPatchOTAgent.prototype.send = function(sequence){
	var newSequence = sequence.slice(0);
	newSequence.unshift({ // test for conflict resolutions
		op: "test",
		path: this.remotePath,
		value: this.remoteVersion
	});
	this.pending.push(sequence);
	return JSONPatchQueue.prototype.send.call(this, newSequence);
};

JSONPatchOTAgent.applyOT = function(callback){
	return function applyOT(obj, remoteVersionedJsonPatch){
		// console.log("applyPatch", this, arguments);
        // transforming / applying
        var consecutivePatch = remoteVersionedJsonPatch.slice(0);

        // shift first operation object as it should contain test for our local version.
        // ! We assume correct sequence structure, and queuing applied before.
        // 
        // Latest local version acknowledged by remote
        // Thanks to the queue version may only be higher or equal to current.
        var localVersionAckByRemote = consecutivePatch.shift().value;
        var ackDistance = localVersionAckByRemote - this.ackLocalVersion;
        this.ackLocalVersion = localVersionAckByRemote;

        //clear pending operations
        this.pending.splice(0,ackDistance);
        if(this.pending.length){// is there any pending local operation?
            // => Remote sent us something based on outdated versionDistance
            // console.info("Transformation needed", consecutivePatch, 'by', this.nonAckList);
            consecutivePatch = this.transform(
                    consecutivePatch,
                    this.pending
                );

        }
        callback(obj, consecutivePatch);
	};
};