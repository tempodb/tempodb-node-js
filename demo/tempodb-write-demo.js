/* http://tempo-db.com/api/write-series/#write-series-by-key */

var tempodb = require('tempodb');

var tdb = new tempodb.TempoDB({
    api_key: 'your-api-key',
    api_secret: 'your-api-secret'
});

const MINUTES_IN_DAY = 1440;
const MS_IN_DAY = 86400000;
const MS_IN_MIN = 60000;

/* update to one of your series_key */
/* if you write to a key that doesn't yet exist, it will create it for you */
var series_key = 'your-custom-key';
var series_start_date = new Date('2012-01-01');

// loop through 10 days, and add 1 data point per minute of that day
for (var day = 0; day < 365; day++) {
    data = []

    for (var min = 0; min < MINUTES_IN_DAY; min++) {
        data.push({t:new Date(series_start_date.getTime() + min * MS_IN_MIN), v:Math.random()*50})
    }

    var add_args = {
        series_key: series_key,
        data: data
    }

    console.log(day, data[0]);
    var start_time = new Date();

    tdb.write(add_args, function(result){
        /* write out request length in ms */
        console.log(new Date()-start_time, 'ms');
    });

    //bump by 1 day
    series_start_date.setTime(series_start_date.getTime() + MS_IN_DAY);
}
