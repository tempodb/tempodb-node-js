var httplink = require('http-link')

function Cursor(response) {
	this.response = response;
	this.isDone = false;
}

Cursor.prototype.next = function(callback) {
	if (this.isDone === true) {
		throw "cursor is exhausted";
	}
	var cursor = this;
	this.response.data.then(function(dataObj) {
		var n = dataObj['data'].shift();
		if (n === undefined) {
			if (cursor.response.headers['link'] !== undefined) {
				cursor.loadFromServer()
				cursor.data.then(function(d) {
					callback(d['data'].shift());
				});
			} else {
				this.isDone = true;
			}
		} else {
			callback(n)
		}
	});
}

Cursor.prototype.loadFromServer = function() {
	var link = httplink.parse(this.headers['link']);
	this.response = this.response.get(link);
}
