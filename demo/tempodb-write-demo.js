/* http://tempo-db.com/api/write-series/#write-series-by-key */

var TempoDBClient = require('tempodb').TempoDBClient;
var tempodb = new TempoDBClient('your-api-key', 'your-api-secret')

const MINUTES_IN_DAY = 1440;
const MS_IN_DAY = 86400000;
const MS_IN_MIN = 60000;

/* update to one of your series_key */
/* if you write to a key that doesn't yet exist, it will create it for you */
var series_key = 'your-custom-key';
var series_start_date = new Date('2012-01-01');

// loop through 10 days, and add 1 data point per minute of that day
for (var day = 0; day < 10; day++) {
    data = []

    for (var min = 0; min < MINUTES_IN_DAY; min++) {
        data.push({t:new Date(series_start_date.getTime() + min * MS_IN_MIN), v:Math.random()*50})
    }

    var add_args = {
        series_key: series_key,
        data: data
    }

    console.log(day, data[0]);

    tempodb.write(add_args, function(result){
        var out = result.response;
        if (result.body) {
            out += ': ' + JSON.stringify(result.body);
        }
        console.log(out+'\n');
    });

    //bump by 1 day
    series_start_date.setTime(series_start_date.getTime() + MS_IN_DAY);
}
