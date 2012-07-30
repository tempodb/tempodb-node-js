var TempoDBClient = require('../tempodb').TempoDBClient;
var tempodb = new TempoDBClient('myagley','opensesame')
var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

var options = {
    tag: ['foo']
}

tempodb.get_series(null, function(result){
    if (result.response == 200) {
        for (var i = 0; i < result.body.length; i++) {
            var series = result.body[i];
            console.log(series.id, series.key);
        }
    }
});
