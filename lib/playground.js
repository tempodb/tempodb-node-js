var q = require('q');
var http = require('http');
var https = require('https');
var zlib = require('zlib');

var options = {
		host: '127.0.0.1',
		port: '8000',
		path: '/',
		method: 'GET'
};

function Cursor(client, init) {
	this.data = init;
	this.client = client;
	this.isDone = false;
}

Cursor.prototype.next = function(callback) {
	if (this.isDone === true) {
		throw "cursor is exhausted";
	}
	var cursor = this;
	this.data.then(function(dataArr) {
		var n = dataArr.shift();
		if (n === undefined) {
			cursor.data = cursor.client();
			cursor.data.then(function(d) {
				if (d.length === 0) {
					cursor.isDone = true;
				} else {
					callback(d.shift());
				}
			});
		} else {
			callback(n)
		}
	});
}

var doRequest = function() {
	var deferred = q.defer();
	callback = function(response) {
			var str = '';

  //another chunk of data has been recieved, so append it to `str`
  		response.on('data', function (chunk) {
    		str += chunk;
  		});

  	//the whole response has been recieved, so we just print it out here
  		response.on('end', function () {
   			deferred.resolve(JSON.parse(str));
  		});
	}

	http.request(options, callback).end() 
	return deferred.promise;
};

var getData = function() {
	var cursor = new Cursor(doRequest, doRequest());
	return cursor
}

var c = function(item) { console.log('in callback'); console.log(item); }


exports.doRequest = doRequest
exports.Cursor = Cursor
exports.getData = getData
exports.c = c
