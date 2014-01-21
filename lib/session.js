var http = require('http');
var https = require('https');
var zlib = require('zlib');
var q = require('q');
var response = require('./response');

var Session = exports.Session = 
	function(key, secret, options) {
        const HOST = 'api.tempo-db.com',
              PORT = 443,
              VERSION = 'v1',
              SECURE = true,
							MAXCONNS = 10;

		this.key = key;
		this.secret = secret;
		this.hostname = options.hostname || HOST;
		this.port = options.port || PORT;
		this.version = options.version || VERSION;
		this.secure = options.secure || SECURE;
		this.maxconns = options.maxconns || 10
		this.path = '/' + this.version

    var auth = 'Basic ' + new Buffer(key+':'+secret).toString('base64');
    this.headers = {
      'Host': this.hostname,
      'Authorization': auth,
      'User-Agent': "tempodb-nodejs/1.0.0",
      'Accept-Encoding': 'gzip',
      'Connection': 'keep-alive'
    };

    this.connection = (options.secure !== false) && SECURE ? https : http; // Have to check if boolean is false and not just undefined
		this.connection.globalAgent.maxSockets = this.maxconns;

	}

Session.prototype.doRequest = function(method, path, queryParams, body, callback, cursored) {
		cursored = cursored || false;
		var wrapped = function(resp) {
			var cb;
			if (callback === undefined) {
				cb = function(err, result) {};
			} else {
				cb = callback;
			}
			if (resp.status < 300) {
				cb(null, resp)
			} else {
				cb(resp, resp)
			}

		}

    path = this.path + encodeURI(path);
    if(queryParams) {
        path += '?' + encodeQueryData(queryParams);
    }

    var json_body = '';
    if (body) {
        json_body = JSON.stringify(body);
        this.headers['Content-Length'] = json_body.length;
    }
    else {
      this.headers['Content-Length'] = 0
    }

    var options = {
        host: this.hostname,
        port: this.port,
        path: path,
        method: method,
        headers: this.headers
    };

		var deferred = q.defer();
		var session = this;
    var req = this.connection.request(options, function (res) {
        var data = '';
        var statusc = res.statusCode;

        if(res.headers['content-encoding'] == 'gzip') {
          res = res.pipe(zlib.createGunzip());
        }

        //the listener that handles the response chunks
        res.addListener('data', function (chunk) {
            data += chunk.toString();
        });

        res.addListener('end', function() {
            var result = '';
						var respObj = new response.Response(res, data, session, cursored);
            if (statusc < 300) {
								deferred.resolve(respObj)
            }
            else {
								deferred.reject(respObj)
            }
        });
    });

    req.on('error', function (error) {
			//var respObj = new response.Response(res, data, this.session, false);
			deferred.reject(error);
    });

    if (body) {
        req.write(json_body);
    }
    req.end();
		return deferred.promise.then(wrapped).fail(wrapped)
}

Session.prototype.get = function(path, params, cursored, callback) {
	return this.doRequest('GET', path, params, null, callback, cursored)
}

Session.prototype.post = function(path, params, body, callback) {
	return this.doRequest('POST', path, params, body, callback, false);
}

Session.prototype.put = function(path, params, body, callback) {
	return this.doRequest('PUT', path, params, body, callback, false);
}

Session.prototype.delete = function(path, params, callback) {
	return this.doRequest('DELETE', path, params, null, callback, false);
}

var encodeQueryData = function(data) {
   var ret = [];
   for (var key in data) {
        var value = data[key];

        if (value instanceof Array) {
            for (var v in value){
                ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(value[v]));
            }
        }
        else if (value instanceof Object) {
            for (var v in value){
                ret.push(encodeURIComponent(key) + "[" + encodeURIComponent(v) + "]=" + encodeURIComponent(value[v]));
            }
        }
        else {
            // plain value
            ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(value.toString()));
        }
    }

   return ret.join("&");
}

var ISODateString = exports.ISODateString = function(d) {
    // If you pass a string for a date we will assume that it is already in ISO format
    if(typeof(d) == 'string') {
        return d;
    }

    function pad(n) {
        return n<10 ? '0' + n : n;
    }

    return d.getUTCFullYear() + '-' +
        pad(d.getUTCMonth() + 1) + '-' +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds()) + 'Z';
};
