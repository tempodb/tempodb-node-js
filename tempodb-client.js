var http = require('http');
var ID = 'TempoDB: ';

exports.TempoDB = function(opts) {
	/*
		required opts 
			api_user (String)
			api_password (String)

		optional opts
			api_server (String)
			path (String)
			connection (Boolean)	
	*/

	var createTempoDBClient = function(opts){
		/* make sure that user and password are provided */
		var api_user, api_password;
		if (!(api_user = opts.api_user)) throw ID+'missing API user';
		if (!(api_password = opts.api_password)) throw ID+'missing API password';

		var api_server = opts.api_server || '50.56.214.81';
		var auth = 'Basic ' + new Buffer(api_user+':'+api_password).toString('base64');
		var headers = {'Host': api_server, 'Authorization': auth};

		var client = TempoDBClient({
			api_server: api_server,
			api_user: api_user,
			api_password: api_password,
			connection: opts.secure ? https : http,
			path: opts.path || '/',
			headers: headers,

		});
		return client;
	}

	var TempoDBClient = function(obj) {
		obj.call = function(path, callback) {
			var options = {
		      host: obj.api_server,
		      path: path || obj.path,
		      method: 'GET',
		      headers: obj.headers
		    };

		    var req = obj.connection.request(options, function (res) {
			    var data = '';
				//the listener that handles the response chunks
				res.addListener('data', function (chunk) {
					data += chunk.toString()
				})
				res.addListener('end', function() {
					/*
					var parser = new xml2js.Parser();
					parser.addListener('end', function(result) {
					  callback(result);
					});
					parser.parseString(data);
					*/
					result = JSON.parse(data);
					callback(result);
				})
			});
			//req.write(body)
			req.end()
		}

		obj.range = function(series, start, end, callback) {
			return obj.call('/series/'+series+'/data/?start='+ISODateString(start)+'&end='+ISODateString(end), callback);
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