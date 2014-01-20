var httplink = require('http-link');
var q = require('q');

var Cursor = exports.Cursor = function(session, data, linkHeader) {
	this.session = session;
	this.data = data;
	this.linkHeader = linkHeader;
	this.isDone = false;
	this.loading = false;
	this.deferreds = []
}

Cursor.prototype.next = function(callback) {
	var deferred = q.defer();
	deferred.promise.then(callback);
	this.deferreds.push(deferred);
	this._resolve();
}

Cursor.prototype._resolve = function() {
	var nextc;
	var n = this.data['data'].shift();
	var cursor = this;
	if (n !== undefined) {
		nextc = this.deferreds.shift();
		nextc.resolve(n);
	} else if (this.loading === false) {
		var respP = this._loadFromServer()
		if (respP === null) {
			this.isDone = true;
			return;
		}

		respP.then(function(r) {
			cursor.loading = false;
			cursor.data = r.json
			cursor.linkHeader = r.headers['link'];
			var n, nextc;
			//nextc = cursor.deferreds.shift();
			//
			while (cursor.deferreds.length > 0) {
				if (cursor.data['data'].length === 0) {
					break;
				}
				var n = cursor.data['data'].shift()
				nextc = cursor.deferreds.shift();
				nextc.resolve(n)
			}

			if (cursor.deferreds.length > 0) {
				cursor._resolve();
			}
		});

	}
}

Cursor.prototype._loadFromServer = function() {
	if (this.linkHeader === undefined) {
		return null;
	}
	this.loading = true;
	var link = httplink.parse(this.linkHeader);
	var respP = this.session.get(link, null, null, false);
	return respP;
}

Cursor.prototype.nextPage = function(cb) {
	var respP = this._loadFromServer();
	if (respP === null) {
		return null
	}
	var deferred = q.defer();

	var cursor = this;
	var p = respP.then(function(r) {
		cursor.loading = false;
		cursor.linkHeader = r.headers['link'];
		cursor.data = r.json;

		if (r.status < 300) {
			cb(null, cursor.data['data']);
		} else {
			cb(r.json, r)
		}

		deferred.resolve();
	});
	return deferred.promise;
}

Cursor.prototype.map = function(cb) {
	var allrets = new Array();
	var ret = cb(this.data['data']);
	var cursor = this;
	for (var i=0; i<ret.length; i++) {
		allrets.push(ret[i]);
	}

	var wrapper = function() {
		if (cursor.linkHeader === undefined) {
			return null;
		} else {
			next = cursor.nextPage(cb);
			next.then(function(ret) {
				wrapper();
			});
		}
	}
	wrapper();


}

exports.waitUntilDone = function(cursor) {
	while (cursor.isDone === false) {
		var f = Fiber.current;
		//f.run();
		Fiber.yield();
	//	//pausedExecution = undefined;
	}
	/*var fiber = Fiber.current;
	setTimeout(function() {
		fiber.run();
	}, 10000);
	Fiber.yield();*/

}
