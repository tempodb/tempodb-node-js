/* http://tempo-db.com/api/write-series/#write-series-by-key */

var tempodb = require('./tempodb');

var tdb = new tempodb.TempoDB({
    api_key: 'myagley',
    api_secret: 'opensesame',
    api_server: '127.0.0.1:4242'
});

/* update to one of your series_key */
/* if you write to a key that doesn't yet exist, it will create it for you */
var series_key = 'andy-local1';

var d = new Date('2012-01-01');
// loop through 10 days, and add 1 data point per minute of that day
for (var day = 0; day < 365; day++) {
    data = []
    var tick = new Date();
    // 1440 minutes in one day
    for (var min = 0; min < 1440; min++) {
        data.push({t:new Date(d.getTime()+min*60000), v:Math.random()*50})
    }

    var add_args = {
        series_key: series_key,
        data: data
    }

    console.log(day, data[0]);
    
    tdb.write(add_args, function(result){
        console.log(new Date()-tick);
    });
    //bump by 1 day (86400000)
    d.setTime(d.getTime() + 86400000);
}
