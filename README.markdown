# TempoDB Node.js API Client

The TempoDB Node.js API Client makes calls to the [TempoDB API](http://tempo-db.com/api/).  The module is available on npm as tempodb.

1. Install tempodb

```
npm install tempodb
```

1. After installing tempodb, download [tempodb-write-demo.js](https://github.com/tempodb/tempodb-node-js/blob/master/demo/tempodb-write-demo.js).

1. Edit *your-api-key* and *your-api-secret* in tempodb-write-demo.js.

1. Run tempodb-write-demo.js to insert 10 days worth of test data.

```
node tempodb-write-demo
```

1. Download [tempodb-read-demo.js](https://github.com/tempodb/tempodb-node-js/blob/master/examples/tempodb-read-demo.js)

1. Edit *your-api-key* and *your-api-secret* in tempodb-read-demo.js.

1. Run tempodb-read-demo.js to read back the data you just wrote in.

```
node tempodb-read-demo
```

# TempoDBClient Object 

Stores the session information for authenticating and accessing TempoDB.  You can specify an optional hostname, port, protocol (http or https), and version. This is used if you are on a private cluster.
The default hostname and port should work for the standard cluster.


    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');


You can specify an optional third argument Object to TempoDBClient

    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret', {hostname: 'your-host.name', port: 123});

### Options
* *hostname* (string) default: 'api.tempo-db.com'
* *port* (Integer) default: 443
* *secure* (Boolean) default: true
* *version* (string) default: 'v1'


# API

## Callbacks and returned Objects
Most of the API functions allow you to pass in an optional *callback* function.  In general, the callback function is passed a single argument Object with two parameters:

* *response* (Integer) - the HTTP response code
* *body* (Object or string)- the parsed JSON body of successful API calls.  For calls that return error codes, the plain text body is returned.

The return types below show what is returned in the *body* parameter of successful calls.

## TempoDBClient#create_series(*key*, *callback*)
Creates a new series with an optionally specified key.  If no key is given, only the system generated id is returned.

### Parameters

* key - key for the series (string)

### Returns
The newly created series object

    { 
     "id":"71a81e6936c24274b6bb53c57004af8b",
     "key":"my-custom-key",
     "name":"",
     "attributes":{},
     "tags":[]
    }

### Example

The following example creates two series, one with a given key of "my-custom-key", one with a randomly generated key.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');

    var series1, series2;

    tempodb.create_series('my-custom-key'), function(result) {
        if (result.response == 200) {
            series1 = result.body;
        }
    });

    tempodb.create_series(null, function(result) {
        if (result.response == 200) {
            series2 = result.body;
        }
    });


## TempoDBClient#get_series(*options*, *callback*)
Gets a list of series objects, optionally filtered by the provided parameters. Series can be filtered by id, key, tag and
attribute.

### Parameters

* options is an object containing any of the following
    * id - an array of ids to include (array of strings)
        * can also pass single string if only one id
    * key - an array of keys to include (array of strings)
        * can also pass single string if only one key
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)

### Returns
An array of series objects

    [
      {
        "id":"6ee327867a9f45a5b4d9feb5601897ab",
        "key":"Daily_Rainfall",
        "name":"",
        "attributes":{},
        "tags":[]
      },
      {
        "id":"da06acfe538249a69c22c212149142b3",
        "key":"1",
        "name":"",
        "attributes":{},
        "tags":[]
      }
    ]

### Example

The following example returns all series with tags "tag1" and "tag2" and attribute "attr1" equal to "value1".

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

    var options = {
        tag: ['tag1', 'tag2'],
        attr: { attr1: 'value1'}
    }

    tempodb.get_series(options, function(result){
    if (result.response == 200) {
        var series_list = result.body;

        for (var i = 0; i < series_list.length; i++) {
            var series = series_list[i];
            console.log(series.id, series.key);
        }
    }
});


## TempoDBClient#update_series(*series_id*, *series_key*, *name*, *attributes*, *tags*, *callback*)
Updates a series.  Currently, only tags and attributes can be modified. The easiest way to use this method is through a read-modify-write cycle.

### Parameters

* series_id - id for the series (string)
* series_key - key for the series (string)
* name - name of the series (string)
* attributes - an object of attribute key/value pairs (object)
* tags - an array of tags (array of strings)

### Returns
The updated series object

    { 
     "id":"92a81e6936c24274b6bb53c57004afce",
     "key":"test1",
     "name":"",
     "attributes":{unit: 'Fahrenheit', user_id: 27},
     "tags":['foo', 'bar']
    }

### Example

The following example reads the list of series with key *test1* (should only be one) and replaces the tags and attributes.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

    var options = {
        key: 'test1'
    }

    tempodb.get_series(options, function(result) {
        if (result.response == 200) {
            var series = result.body[0];
            var new_tags = ['foo', 'bar'];
            var new_attr = {unit: 'Fahrenheit', user_id: 27};
            tempodb.update_series(series.id, series.key, series.name, new_tags, new_attr, cb);
        }
    });


## TempoDBClient#read(*start*, *end*, *options*, *callback*)
Gets one or more series and corresponding time-series data between the specified start and end dates.  The optional interval parameter allows you to specify a rollup period. For example, "1hour" will roll the data up on the hour using the provided function. The function parameter specifies the folding function to use while rolling the data up. A rollup is selected automatically if no interval or function is given. The auto rollup interval is calculated by the total time range (end - start) as follows:

* range <= 2 days - raw data is returned
* range <= 30 days - data is rolled up on the hour
* else - data is rolled up by the day

Rollup intervals are specified by a number and a time period. For example, 1day or 5min. Supported time periods:

* min
* hour
* day
* month
* year

Supported rollup functions:

* sum
* max
* min
* avg or mean
* stddev (standard deviation)
* count

You can also retrieve raw data by specifying "raw" as the interval. The series to query can be filtered using the remaining parameters.

### Parameters

* start - start time for the query (Date)
* end - end time for the query (Date)

* options is an object containing any of the following
    * interval - the rollup interval (string)
    * function - the rollup folding function (string)
    * id - an array of ids to include (array of strings)
        * can also pass single string if only one id
    * key - an array of keys to include (array of strings)
        * can also pass single string if only one key
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)



### Returns

An array of Objects containing the series information, time-series data, and a summary of statistics for the specified time period.

    [
        {
            series: {
                id: '6fefeba655504694b21235acf8cdae5f',
                key: 'your-custom-key',
                name: '',
                attributes: {},
                tags: []
            },
            start: '2012-01-01T00:00:00.000+0000',
            end: '2012-01-02T00:00:00.000+0000',
            data: [ 
                { t: '2012-01-01T00:00:00.000+0000', v: 23.559637793913357 },
                { t: '2012-01-01T01:00:00.000+0000', v: 24.887018265425514 },
                { t: '2012-01-01T02:00:00.000+0000', v: 24.103298434838965 },
                ...
                { t: '2012-01-01T23:00:00.000+0000', v: 23.1820437503413 }
            ],
            summary: {
                sum: 35680.95450980151,
                mean: 24.778440631806603,
                max: 49.96850016748075,
                min: 0.057467774982028486,
                stddev: 14.356117758209086,
                ss: 296575.1904890079,
                count: 1440
            }
         },
         {
            series: {
                id: '235fa655504694b21235acf8ae3415',
                key: 'your-custom-key-2',
                name: '',
                attributes: {},
                tags: []
            },
            start: '2012-01-01T00:00:00.000+0000',
            end: '2012-01-02T00:00:00.000+0000',
            data: [ 
                { t: '2012-01-01T00:00:00.000+0000', v: 17.43 },
                { t: '2012-01-01T01:00:00.000+0000', v: 21.42232 },
                { t: '2012-01-01T02:00:00.000+0000', v: 20.32423 },
                ...
                { t: '2012-01-01T23:00:00.000+0000', v: 19.5431 }
            ],
            summary: {
                sum: 23680.95450980151,
                mean: 15.778440631806603,
                max: 50.96850016748075,
                min: 0.03746777498202845,
                stddev: 11.34217758209086,
                ss: 196213.1904890079,
                count: 1440
            }
         }
     ]

### Example

The following example reads the list of series with key *your-custom-key* (should only be one) and returns the data rolled up to an hourly average.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

    var series_key = 'your-custom-key';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-02');

    var options = {
        key: series_key,
        interval: '1hour',
        'function': 'mean'
    }

    tempodb.read(series_start_date, series_end_date, options, function(result){
        for (var i = 0; i < result.body.length; i++) {
            var series = result.body[i];
            console.log(series);
        }
    });


## TempoDBClient#read_id(*series_id*, *start*, *end*, *options*, *callback*)
Gets a single series by id and corresponding time-series data between the specified start and end dates.  The same rollup rules apply as with the read() function above.

### Parameters

* series_id - id for the series to read from (string)
* start - start time for the query (Date)
* end - end time for the query (Date)

* options is an object containing any of the following
    * interval - the rollup interval (string)
    * function - the rollup folding function (string)
    * id - an array of ids to include (array of strings)
        * can also pass single string if only one id
    * key - an array of keys to include (array of strings)
        * can also pass single string if only one key
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)



### Returns

An Object containing the series information, time-series data, and a summary of statistics for the specified time period.

    {
        series: {
            id: '6fefeba655504694b21235acf8cdae5f',
            key: 'your-custom-key',
            name: '',
            attributes: {},
            tags: []
        },
        start: '2012-01-01T00:00:00.000+0000',
        end: '2012-01-02T00:00:00.000+0000',
        data: [ 
            { t: '2012-01-01T00:00:00.000+0000', v: 23.559637793913357 },
            { t: '2012-01-01T01:00:00.000+0000', v: 24.887018265425514 },
            { t: '2012-01-01T02:00:00.000+0000', v: 24.103298434838965 },
            ...
            { t: '2012-01-01T23:00:00.000+0000', v: 23.1820437503413 }
        ],
        summary: {
            sum: 35680.95450980151,
            mean: 24.778440631806603,
            max: 49.96850016748075,
            min: 0.057467774982028486,
            stddev: 14.356117758209086,
            ss: 296575.1904890079,
            count: 1440
        }
     }

### Example

The following example reads data for the series with id *6fefeba655504694b21235acf8cdae5f* and returns the minimum datapoint for each day.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

    var series_id = '6fefeba655504694b21235acf8cdae5f';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-14');

    var options = {
        interval: '1day',
        'function': 'min'
    }

    tempodb.read_id(series_id, series_start_date, series_end_date, options, cb);


## TempoDBClient#read_key(*series_key*, *start*, *end*, *options*, *callback*)
Gets a single series by key and corresponding time-series data between the specified start and end dates.  The same rollup rules apply as with the read() function above.

### Parameters

* series_key - key for the series to read from (string)
* start - start time for the query (Date)
* end - end time for the query (Date)

* options is an object containing any of the following
    * interval - the rollup interval (string)
    * function - the rollup folding function (string)
    * id - an array of ids to include (array of strings)
        * can also pass single string if only one id
    * key - an array of keys to include (array of strings)
        * can also pass single string if only one key
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)



### Returns

An Object containing the series information, time-series data, and a summary of statistics for the specified time period.

    {
        series: {
            id: '6fefeba655504694b21235acf8cdae5f',
            key: 'your-custom-key',
            name: '',
            attributes: {},
            tags: []
        },
        start: '2012-01-01T00:00:00.000+0000',
        end: '2012-01-02T00:00:00.000+0000',
        data: [ 
            { t: '2012-01-01T00:00:00.000+0000', v: 23.559637793913357 },
            { t: '2012-01-01T01:00:00.000+0000', v: 24.887018265425514 },
            { t: '2012-01-01T02:00:00.000+0000', v: 24.103298434838965 },
            ...
            { t: '2012-01-01T23:00:00.000+0000', v: 23.1820437503413 }
        ],
        summary: {
            sum: 35680.95450980151,
            mean: 24.778440631806603,
            max: 49.96850016748075,
            min: 0.057467774982028486,
            stddev: 14.356117758209086,
            ss: 296575.1904890079,
            count: 1440
        }
     }

### Example

The following example reads data for the series with id *your-custom-key* and returns the minimum datapoint for each day.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

    var series_key = 'your-custom-key';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-14');

    var options = {
        interval: '1day',
        'function': 'min'
    }

    tempodb.read_id(series_id, series_start_date, series_end_date, options, cb);
