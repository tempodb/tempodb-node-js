var httplink = require('http-link')

function Cursor(response, data) {
	this.response = response;
	this.data = data;
	this.isDone = false;
}

Cursor.prototype.next = function(callback) {
	if (this.isDone === true) {
		throw "cursor is exhausted";
	}
	var cursor = this;
	this.data.then(function(dataObj) {
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
	this.response = this.response.session.get(link);
	this.data = this.response.data['data']
}
