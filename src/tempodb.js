var http = require('http');
var https = require('https');
var zlib = require('zlib');
var session = require('./session.js')
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
            id (Array of ids or single id)
            key (Array of keys or single key)
            tag (string or Array[string])
            attr ({key: val, key2: val2})

    */
    options = options || {};
    return this.session.doRequest('GET', '/series/', options, null, callback);
}

TempoDBClient.prototype.delete_series = function(options, callback) {
    /*
        options
            id (Array of ids or single id)
            key (Array of keys or single key)
            tag (string or Array[string])
            attr ({key: val, key2: val2})
            allow_truncation (Boolean)

    */
    options = options || {};
    return this.session.doRequest('DELETE', '/series/', options, null, callback);
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

    return this.session.doRequest('PUT', '/series/id/' + series_id + '/', null, data, callback);
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

    return this.session.doRequest('GET', '/data/', options, null, callback);
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

    return this.session.doRequest('GET', '/series/id/' + series_id + '/data/', options, null, callback);
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

    return this.session.doRequest('GET', '/series/key/' + series_key + '/data/', options, null, callback);
}

TempoDBClient.prototype.single_value_by_id = function(series_id, ts, options, callback) {
  options = options || {};
  options.ts = ISODateString(ts);

  return this.session.doRequest('GET', '/series/id/' + series_id + '/single/', options, null, callback);
}

TempoDBClient.prototype.single_value_by_key = function(series_key, ts, options, callback) {
  options = options || {};
  options.ts = ISODateString(ts);

  return this.session.doRequest('GET', '/series/key/' + series_key + '/single/', options, null, callback);
}

TempoDBClient.prototype.single_value = function(ts, options, callback) {
    /*
        options
            direction (Specify direction to search in)
            id (Array of ids or single id)
            key (Array of keys or single key)
            tag (Array of tags)
            attr (Object of attributes)

    */
    options = options || {};
    options.ts = ISODateString(ts);

    return this.session.doRequest('GET', '/single/', options, null, callback);
};

TempoDBClient.prototype.write_id = function(series_id, data, callback) {
    return this.session.doRequest('POST', '/series/id/' + series_id + '/data/', null, data, callback);
}

TempoDBClient.prototype.write_key = function(series_key, data, callback) {
    return this.session.doRequest('POST', '/series/key/' + series_key + '/data/', null, data, callback);
}

TempoDBClient.prototype.write_bulk = function(ts, data, callback) {
    var body = {
        t: ISODateString(ts),
        data: data
    }

    return this.session.doRequest('POST', '/data/', null, body, callback);
}

TempoDBClient.prototype.write_multi = function(data, callback) {
    return this.session.doRequest('POST', '/multi/', null, data, callback)
}

TempoDBClient.prototype.increment_multi = function(data, callback) {
    return this.session.doRequest('POST', '/multi/increment/', null, data, callback)
}

TempoDBClient.prototype.increment_id = function(series_id, data, callback) {
    return this.session.doRequest('POST', '/series/id/' + series_id + '/increment/', null, data, callback);
}

TempoDBClient.prototype.increment_key = function(series_key, data, callback) {
    return this.session.doRequest('POST', '/series/key/' + series_key + '/increment/', null, data, callback);
}

TempoDBClient.prototype.increment_bulk = function(ts, data, callback) {
    var body = {
        t: ISODateString(ts),
        data: data
    }

    return this.session.doRequest('POST', '/increment/', null, body, callback);
}

TempoDBClient.prototype.delete_id = function(series_id, start, end, callback) {
  var options = {
    start: ISODateString(start),
    end:   ISODateString(end)
  }

  return this.session.doRequest('DELETE', '/series/id/'+series_id+'/data/', options, null, callback);
}

TempoDBClient.prototype.delete_key = function(series_key, start, end, callback) {
  var options = {
    start: ISODateString(start),
    end:   ISODateString(end)
  }

  return this.session.doRequest('DELETE', '/series/key/'+series_key+'/data/', options, null, callback);
}


