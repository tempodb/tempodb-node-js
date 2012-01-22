var tempodb = require('./tempodb-client');

var tdb = new tempodb.TempoDB({
	api_user: 'myagley',
	api_password: 'opensesame'
});

tick = new Date();

var start = new Date('2011-01-13');
var end = new Date('2011-01-14');

tdb.range(3, start, end, function(result){
	console.log(result);
	console.log('done in', new Date() - tick, 'ms');
});