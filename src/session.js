var http = require('http');
var https = require('https');
var zlib = require('zlib');

var Session = exports.Session = 
	function(key, secret, options) {
        const HOST = 'api.tempo-db.com',
              PORT = 443,
              VERSION = 'v1',
              SECURE = true;

		this.key = key;
		this.secret = secret;
		this.host = options.hostname || HOST;
		this.port = options.port || PORT;
		this.version = options.version || VERSION;
		this.secure = options.secure || SECURE;
		this.path = '/' + this.version

    var auth = 'Basic ' + new Buffer(key+':'+secret).toString('base64');
    this.headers = {
      'Host': hostname,
      'Authorization': auth,
      'User-Agent': "tempodb-nodejs/1.0.0",
      'Accept-Encoding': 'gzip',
      'Connection': 'keep-alive'
    };

    this.connection = (options.secure !== false) && SECURE ? https : http; // Have to check if boolean is false and not just undefined

	}

Session.prototype.doRequest = function(method, path, queryParams, body, callback, errback) {
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

    var req = this.connection.request(options, function (res) {
        var data = '';
        var response = res.statusCode;

        if(res.headers['content-encoding'] == 'gzip') {
          res = res.pipe(zlib.createGunzip());
        }

        //the listener that handles the response chunks
        res.addListener('data', function (chunk) {
            data += chunk.toString();
        });

        res.addListener('end', function() {
            var result = '';
            if (data) {
                if (response < 300) {
                    result = JSON.parse(data);
                }
                else {
                    result = data;
                }
            }

            if (typeof callback != 'undefined') {
                callback({
                    response: response,
                    body: result
                });
            }
        });
    });

    req.on('error', function (error) {
      if (typeof errback != 'undefined') {
         errback(error);
      	}
    });

    if (body) {
        req.write(json_body);
    }
    req.end();
}

Session.prototype.get = function(path, params, body, callback, errback) {
	return this.doRequest('GET', path, params, null);
}

Session.prototype.post = function(path, params, body, callback, errback) {
	return this.doRequest('POST', path, params, body);
}

Session.prototype.put = function(path, params, body, callback, errback) {
	return this.doRequest('PUT', path, params, body);
}

Session.prototype.delete = function(path, params, body, callback, errback) {
	return this.doRequest('DELETE', path, params, null);
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

var ISODateString = function(d) {
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
