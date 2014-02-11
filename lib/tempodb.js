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
								maxconns (Integer)
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

TempoDBClient.prototype.createSeries = function(key, callback) {
	return this.create_series(key, callback)
}

TempoDBClient.prototype.get_series = function(options, callback) {
    /*
        options
            key (Array of keys or single key)
            tag (string or Array[string])
            attr ({key: val, key2: val2})
						limit (Integer)

    */
    options = options || {};
		options.limit = options.limit || 5000;
		//last argument indicates this is a cursored request
    return this.session.doRequest('GET', '/series/segment/', options, null, callback, true);
}

TempoDBClient.prototype.getSeries = function(options, callback) {
	return this.get_series(options, callback);
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

TempoDBClient.prototype.deleteSeries = function(options, callback) {
	return this.delete_series(options, callback);
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

    return this.session.doRequest('PUT', '/series/key/' + series_key + '/', null, data, callback);
}

TempoDBClient.prototype.updateSeries = function(series_key, name, attributes, tags, callback) {
	return this.update_series(series_key, name, attributes, tags, callback);
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
						limit (integer)

    */
    options = options || {};
    options.start = session.ISODateString(start);
    options.end = session.ISODateString(end);
		options.limit = options.limit || 5000;

    return this.session.doRequest('GET', '/series/key/' + series_key + '/segment', 
				options, null, callback, true);
}

TempoDBClient.prototype.find_by_key = function(series_key, start, end, options, callback) {
    /*
        options
            predicate.function (string)
            predicate.period (string)
						tz (string)
						limit (integer)

    */
    options = options || {};
    options.start = session.ISODateString(start);
    options.end = session.ISODateString(end);
		options.limit = options.limit || 5000;

    return this.session.doRequest('GET', '/series/key/' + series_key + '/find', 
				options, null, callback, true);
}

TempoDBClient.prototype.findByKey = function(series_key, start, end, options, callback) {
	return this.find_by_key(series_key, start, end, options, callback);
}

TempoDBClient.prototype.single_value_by_key = function(series_key, ts, options, callback) {
  options = options || {};
  options.ts = session.ISODateString(ts);

  return this.session.doRequest('GET', '/series/key/' + series_key + '/single/', options, null, callback);
}

TempoDBClient.prototype.singleValueByKey = function(series_key, ts, options, callback) {
	this.single_value_by_key(series_key, ts, options, callback);
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

TempoDBClient.prototype.singleValue = function(ts, options, callback) {
	return this.single_value(ts, options, callback);
}

TempoDBClient.prototype.write_key = function(series_key, data, callback) {
    return this.session.doRequest('POST', '/series/key/' + series_key + '/data/', 
				null, data, callback);
}

TempoDBClient.prototype.writeKey = function(series_key, data, callback) {
	return this.write_key(series_key, data, callback);
}

TempoDBClient.prototype.write_bulk = function(ts, data, callback) {
    var body = {
        t: session.ISODateString(ts),
        data: data
    }

    return this.session.doRequest('POST', '/data/', null, body, callback);
}

TempoDBClient.prototype.writeBulk = function(ts, data, callback) {
	return this.write_bulk(ts, data, callback);
}

TempoDBClient.prototype.write_multi = function(data, callback) {
    return this.session.doRequest('POST', '/multi/', null, data, callback)
}

TempoDBClient.prototype.writeMulti = function(data, callback) {
	return this.write_multi(data, callback);
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

  return this.session.doRequest('DELETE', '/series/key/'+ series_key + '/data/', 
			options, null, callback);
}

TempoDBClient.prototype.deleteKey = function(series_key, start, end, callback) {
	return this.delete_key(series_key, start, end, callback);
}


