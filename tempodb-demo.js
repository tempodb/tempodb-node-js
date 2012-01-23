var tempodb = require('./tempodb-client');

var tdb = new tempodb.TempoDB({
	api_key: 'your_api_key',
	api_secret: 'your_api_secret'
});

/* update to one of your series_name */
/* if you write to a name that doesn't yet exist, it will create it for you */
var series_name = 1;


// uncomment to add data for a range of days
/*
var d = new Date('2013-01-01');
// loop through 10 days, and add 1 data point per minute of that day
for (var day = 0; day < 10; day++) {
	data = []
	// 1440 minutes in one day
	for (var min = 0; min < 1440; min++) {
		data.push({t:new Date(d.getTime()+min*1000), v:Math.random()*50})
	}

	var add_args = {
		series_name: series_name,
		data: data
	}
	console.log(day, data[0]);

	tdb.add(add_args, function(result){
		console.log('added');
	});
	//bump by 1 day (86400000)
	d.setTime(d.getTime() + 86400000);
}
*/

// read a date range
var args = {
	series_name: series_name,
	start: new Date('2013-01-01'),
	end: new Date('2013-01-03')
}

var tick = new Date();
tdb.range(args, function(result){
	var tock = new Date();
	console.log(result);
	console.log('done in', tock - tick, 'ms');
});
