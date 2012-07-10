var http = require('http');
var https = require('https');

exports.TempoDB = function(opts) {
    /*
        required opts
            key (String)
            secret (String)

        optional opts
            hostname (String)
            port (Integer)
            secure (Boolean)
            version (String)
    */

    var ID = 'TempoDB: ';

    var Client = function(opts){
        /* make sure that key and secret are provided */
        var key,
            secret;

        if (!(key = opts.key))
            throw ID + 'missing API key';
        if (!(secret = opts.secret))
            throw ID + 'missing API secret';

        var hostname = opts.hostname || 'api.tempo-db.com';
        var auth = 'Basic ' + new Buffer(key+':'+secret).toString('base64');
        var headers = {'Host': hostname, 'Authorization': auth};

        this.key = key;
        this.secret = secret;
        this.hostname = hostname;
        this.port = opts.port || 443;
        this.connection = opts.secure || true ? https : http;
        this.version = opts.version || 'v1';
        this.path = '/' + this.version;
        this.headers = headers;
    };

    Client.prototype.call = function(method, path, body, callback) {
        if (body) {
            this.headers['Content-Length'] = body.length;
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
                    result = JSON.parse(data);
                }
                callback({
                            response: response,
                            body: result
                        });
            });
        });

        if (body) {
            req.write(body);
        }
        req.end();
    }

    Client.prototype.read = function(args, callback) {
        /*
            required args
                start (Date)
                end (Date)
            must include either
                series_id (Integer)
                series_key (String)
            optional args
                interval (String)
                function (String)
        */
        var series_type,
            series_val;

        if (!(args.start))
            throw ID + 'missing start date';

        if (!(args.end))
            throw ID + 'missing end date';

        if (args.series_id) {
            series_type = 'id';
            series_val = args.series_id;
        }
        else if (args.series_key) {
            series_type = 'key';
            series_val = args.series_key;
        }
        else {
            throw ID + 'missing series type';
        }

        query_string = "?";
        query_string += 'start=' + ISODateString(args.start);
        query_string += '&end=' + ISODateString(args.end);

        if (args.interval) {
            query_string += '&interval=' + args.interval;
        }

        if (args['function']) {
            query_string += '&function=' + args['function'];
        }

        return this.call('GET', '/series/' + series_type + '/' + series_val + '/data/' + query_string, null, callback);
    };

    Client.prototype.write = function(args, callback) {
        /*
            required args
                data (Array of {t:, v:} objects)
            must include either
                series_id (Integer)
                series_key (String)
        */

        var series_type,
            series_val;

        if (!(args.data))
            throw ID + 'missing data';

        if (args.series_id) {
            series_type = 'id';
            series_val = args.series_id;
        }
        else if (args.series_key) {
            series_type = 'key';
            series_val = args.series_key;
        }
        else {
            throw ID + 'missing series type';
        }

        return this.call('POST', '/series/' + series_type + '/' + series_val + '/data/', JSON.stringify(args.data), callback);
    };

    Client.prototype.write_bulk = function(data, callback) {
        return this.call('POST', '/data/', JSON.stringify(data), callback);
    };


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


    return new Client(opts);
};
