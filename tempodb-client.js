var http = require('http');
var ID = 'TempoDB: ';

exports.TempoDB = function(opts) {
	/*
		required opts 
			api_key (String)
			api_secret (String)

		optional opts
			api_server (String)
			path (String)
			connection (Boolean)	
	*/

	var createTempoDBClient = function(opts){
		/* make sure that user and password are provided */
		var api_key, api_secret;
		if (!(api_key = opts.api_key)) throw ID+'missing API user';
		if (!(api_secret = opts.api_secret)) throw ID+'missing API password';

		var api_server = opts.api_server || 'api.tempo-db.com';
		var auth = 'Basic ' + new Buffer(api_key+':'+api_secret).toString('base64');
		var headers = {'Host': api_server, 'Authorization': auth};

		var client = TempoDBClient({
			api_server: api_server,
			api_key: api_key,
			api_secret: api_secret,
			connection: opts.secure ? https : http,
			path: opts.path || '/',
			headers: headers,
		});
		return client;
	}

	var TempoDBClient = function(obj) {
		obj.call = function(method, path, body, callback) {
			if (body) {
				obj.headers['Content-Length'] = body.length;
			}

			var options = {
		      host: obj.api_server,
		      path: '/v1'+path || obj.path,
		      method: method,
		      headers: obj.headers
		    };

		    var req = obj.connection.request(options, function (res) {
			    var data = '';
				//the listener that handles the response chunks
				res.addListener('data', function (chunk) {
					data += chunk.toString()
				})
				res.addListener('end', function() {
					result = '';
					if (data) {
						result = JSON.parse(data);
					}
					callback(result);
				})
			});

			if (body) {
				req.write(body);
			}
			req.end()
		}

		obj.range = function(args, callback) {
			/*
				required args
					start (Date)
					end (Date)
				must include either
					series_id (Integer)
					series_name (String)
			*/
			var series_type,
				series_val;

			if (!(args.start)) throw ID+'missing start date';
			if (!(args.end)) throw ID+'missing end date';

			if (args.series_id) {
				series_type = 'id';
				series_val = args.series_id;
			}
			else if (args.series_name) {
				series_type = 'name';
				series_val = args.series_name;
			}
			else {
				throw ID+'missing series type';
			}

			return obj.call('GET', '/series/'+series_type+'/'+series_val+'/data/?start='+ISODateString(args.start)+'&end='+ISODateString(args.end), null, callback);
		}

		obj.add = function(args, callback) {
			/*
				required args
					data (Array of {t:, v:} objects)
				must include either
					series_id (Integer)
					series_name (String)
			*/

			var series_type,
				series_val;

			if (!(args.data)) throw ID+'missing data';

			if (args.series_id) {
				series_type = 'id';
				series_val = args.series_id;
			}
			else if (args.series_name) {
				series_type = 'name';
				series_val = args.series_name;
			}
			else {
				throw ID+'missing series type';
			}

			return obj.call('POST', '/series/'+series_type+'/'+series_val+'/data/', JSON.stringify(args.data), callback);
		}
		
		return obj;
	}

	var ISODateString = function(d){
		function pad(n){return n<10 ? '0'+n : n}
		return d.getUTCFullYear()+'-'
			+ pad(d.getUTCMonth()+1)+'-'
			+ pad(d.getUTCDate())+'T'
			+ pad(d.getUTCHours())+':'
			+ pad(d.getUTCMinutes())+':'
			+ pad(d.getUTCSeconds())+'Z'
	}

	return createTempoDBClient(opts);	
}