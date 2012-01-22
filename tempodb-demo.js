var tempodb = require('./tempodb-client');

var tdb = new tempodb.TempoDB({
	api_user: 'myagley',
	api_password: 'opensesame'
});

var args = {
	series_id: 3,
	start: new Date('2011-01-13'),
	end: new Date('2011-01-14')
}

var tick = new Date();

tdb.range(args, function(result){
	var tock = new Date();
	//console.log(result);
	console.log('done in', tock - tick, 'ms');
});