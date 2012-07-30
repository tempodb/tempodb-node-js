var http = require('http');
var https = require('https');
var ID = 'TempoDB: ';

var TempoDBClient = exports.TempoDBClient = 
    function(key, secret, options) {
        /*
            options
                hostname (string)
                port (Integer)
                secure (Boolean)
                version (string)
        */
        options = options || {};
        
        const HOST = 'api.tempo-db.com',
              PORT = 443,
              VERSION = 'v1',
              SECURE = true;

        var hostname = options.hostname || HOST;
        var auth = 'Basic ' + new Buffer(key+':'+secret).toString('base64');
        var headers = {
                'Host': hostname,
                'Authorization': auth,
                'User-Agent': "tempodb-nodejs/0.2.1"
        };

        this.key = key;
        this.secret = secret;
        this.hostname = hostname;
        this.port = options.port || PORT;
        this.connection = options.secure || SECURE ? https : http;
        this.version = options.version || VERSION;
        this.path = '/' + this.version;
        this.headers = headers;
    }

TempoDBClient.prototype.call = function(method, path, body, callback) {
    var json_body = '';
    if (body) {
        json_body = JSON.stringify(body);
        this.headers['Content-Length'] = json_body.length;
    }

    var options = {
        host: this.hostname,
        port: this.port,
        path: this.path+path || this.path,
        method: method,
        headers: this.headers
    };

    var req = this.connection.request(options, function (res) {
        var data = '';

        //the listener that handles the response chunks
        res.addListener('data', function (chunk) {
            data += chunk.toString();
		});

        res.addListener('end', function() {
            result = '';
            response = res.statusCode;
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

    if (body) {
        req.write(json_body);
    }
    req.end();
}

TempoDBClient.prototype.create_series = function(key, callback) {
    data = {};

    if (typeof key == 'string' && key) {
        data.key = key;
    }

    return this.call('POST', '/series/', data, callback);
}

TempoDBClient.prototype.get_series = function(options, callback) {
    /*
        options
            id (Array of ids or single id)
            key (Array of keys or single key)
            tag (string or Array[string])
            attr ({key: val, key2: val2})

    */
    options = options || {};
    query_string = '?' + EncodeQueryData(options);
    
    return this.call('GET', '/series/' + query_string, null, callback);
}

TempoDBClient.prototype.update_series = function(series_id, series_key, name, attributes, tags, callback) {
    if (!(tags instanceof Array)) {
        throw ID + 'tags must be an array';
    }

    if (!(attributes instanceof Object)) {
        throw ID + 'attributes must be an Object';
    }

    data = {
        id: series_id,
        key: series_key,
        name: name,
        attributes: attributes,
        tags: tags
    }

    return this.call('PUT', '/series/id/' + series_id + '/', data, callback);
}

TempoDBClient.prototype.read = function(start, end, options, callback) {
    /*
        options
            id (Array of ids or single id)
            key (Array of keys or single key)
            interval (string)
            function (string)

    */
    options = options || {};
    options.start = ISODateString(start);
    options.end = ISODateString(end);
    query_string = '?' + EncodeQueryData(options);

    return this.call('GET', '/data/' + query_string, null, callback);
};

TempoDBClient.prototype.read_id = function(series_id, start, end, options, callback) {
    /*
        options
            interval (string)
            function (string)

    */
    options = options || {};
    options.start = ISODateString(start);
    options.end = ISODateString(end);
    query_string = '?' + EncodeQueryData(options);

    return this.call('GET', '/series/id/' + series_id + '/data/' + query_string, null, callback);
}

TempoDBClient.prototype.read_key = function(series_key, start, end, options, callback) {
    /*
        options
            interval (string)
            function (string)

    */
    options = options || {};
    options.start = ISODateString(start);
    options.end = ISODateString(end);
    query_string = '?' + EncodeQueryData(options);

    return this.call('GET', '/series/key/' + series_key + '/data/' + query_string, null, callback);
}

TempoDBClient.prototype.write_id = function(series_id, data, callback) {
    return this.call('POST', '/series/id/' + series_id + '/data/', data, callback);
}

TempoDBClient.prototype.write_key = function(series_key, data, callback) {
    return this.call('POST', '/series/key/' + series_key + '/data/', data, callback);
}

TempoDBClient.prototype.write_bulk = function(ts, data, callback) {
    var body = {
        ts: ISODateString(ts),
        data: data
    }

    return this.call('POST', '/data/', body, callback);
}

TempoDBClient.prototype.increment_id = function(series_id, data, callback) {
    return this.call('POST', '/series/id/' + series_id + '/increment/', data, callback);
}

TempoDBClient.prototype.increment_key = function(series_key, data, callback) {
    return this.call('POST', '/series/key/' + series_key + '/increment/', data, callback);
}

TempoDBClient.prototype.increment_bulk = function(ts, data, callback) {
    var body = {
        ts: ISODateString(ts),
        data: data
    }

    return this.call('POST', '/increment/', body, callback);
}

var EncodeQueryData = function(data) {
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
            ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
    }

   return ret.join("&");
}

var ISODateString = function(d) {
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
