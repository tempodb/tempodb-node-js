var http = require('http');
var https = require('https');
var zlib = require('zlib');
var session = require('./session.js')
var ID = 'TempoDB: ';
var q = require('q');
q.longStackSupport = true;

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
			this.session = new session.Session(key, secret, options)
    }

TempoDBClient.prototype.create_series = function(key, callback) {
    data = {};

    if (typeof key == 'string' && key) {
        data.key = key;
    }

    return this.session.doRequest('POST', '/series/', null, data, callback);
}

TempoDBClient.prototype.get_series = function(options, callback) {
    /*
        options
            key (Array of keys or single key)
            tag (string or Array[string])
            attr ({key: val, key2: val2})

    */
    options = options || {};
		//last argument indicates this is a cursored request
    return this.session.doRequest('GET', '/series/segment/', options, null, callback. true);
}

TempoDBClient.prototype.delete_series = function(options, callback) {
    /*
        options
            key (Array of keys or single key)
            tag (string or Array[string])
            attr ({key: val, key2: val2})
            allow_truncation (Boolean)

    */
    options = options || {};
    return this.session.doRequest('DELETE', '/series/', options, null, callback);
}

TempoDBClient.prototype.update_series = function(series_key, name, attributes, tags, callback) {
    if (!(tags instanceof Array)) {
        throw ID + 'tags must be an array';
    }

    if (!(attributes instanceof Object)) {
        throw ID + 'attributes must be an Object';
    }

    data = {
        key: series_key,
        name: name,
        attributes: attributes,
        tags: tags
    }

    return this.session.doRequest('PUT', '/series/key/' + encodeURIComponent(series_key) + '/', null, data, callback);
}

/*TempoDBClient.prototype.read = function(start, end, options, callback) {
    /*
        options
            key (Array of keys or single key)
            interval (string)
            function (string)

    */
/*
    options = options || {};
    options.start = session.ISODateString(start);
    options.end = session.ISODateString(end);

    return this.session.doRequest('GET', '/data/segment/', options, null, callback, true);
};*/

TempoDBClient.prototype.read = function(series_key, start, end, options, callback) {
    /*
        options
            interval (string)
            function (string)

    */
    options = options || {};
    options.start = session.ISODateString(start);
    options.end = session.ISODateString(end);

    return this.session.doRequest('GET', '/series/key/' + encodeURIComponent(series_key) + '/segment', 
				options, null, callback, true);
}


TempoDBClient.prototype.single_value_by_key = function(series_key, ts, options, callback) {
  options = options || {};
  options.ts = session.ISODateString(ts);

  return this.session.doRequest('GET', '/series/key/' + encodeURIComponent(series_key) + '/single/', options, null, callback);
}

TempoDBClient.prototype.single_value = function(ts, options, callback) {
    /*
        options
            direction (Specify direction to search in)
            key (Array of keys or single key)
            tag (Array of tags)
            attr (Object of attributes)

    */
    options = options || {};
    options.ts = session.ISODateString(ts);

    return this.session.doRequest('GET', '/single/', options, null, callback);
};

TempoDBClient.prototype.write_key = function(series_key, data, callback) {
    return this.session.doRequest('POST', '/series/key/' + encodeURIComponent(series_key) + '/data/', 
				null, data, callback);
}

TempoDBClient.prototype.write_bulk = function(ts, data, callback) {
    var body = {
        t: session.ISODateString(ts),
        data: data
    }

    return this.session.doRequest('POST', '/data/', null, body, callback);
}

TempoDBClient.prototype.write_multi = function(data, callback) {
    return this.session.doRequest('POST', '/multi/', null, data, callback)
}

/* TempoDBClient.prototype.increment_multi = function(data, callback) {
    return this.session.doRequest('POST', '/multi/increment/', null, data, callback)
}

TempoDBClient.prototype.increment_key = function(series_key, data, callback) {
    return this.session.doRequest('POST', '/series/key/' + series_key + '/increment/', null, data, callback);
}

TempoDBClient.prototype.increment_bulk = function(ts, data, callback) {
    var body = {
        t: session.ISODateString(ts),
        data: data
    }

    return this.session.doRequest('POST', '/increment/', null, body, callback);
} */

TempoDBClient.prototype.delete_key = function(series_key, start, end, callback) {
  var options = {
    start: session.ISODateString(start),
    end:   session.ISODateString(end)
  }

  return this.session.doRequest('DELETE', '/series/key/'+encodeURIComponent(series_key)+'/data/', 
			options, null, callback);
}


