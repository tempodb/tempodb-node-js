# TempoDB Node.js API Client

The TempoDB Node.js API Client makes calls to the [TempoDB API](http://tempo-db.com/api/).  The module is available on npm as tempodb.

1. Install tempodb

```
npm install tempodb
```

1. Edit *your-database-id*, *your-api-key* and *your-api-secret* in tempodb-write-demo.js.

1. Run tempodb-write-demo.js to insert 10 days worth of test data.

```
node tempodb-write-demo
```

1. Download [tempodb-read-demo.js](https://github.com/tempodb/tempodb-node-js/blob/master/demo/tempodb-read-demo.js)

1. Edit *your-database-id*, *your-api-key* and *your-api-secret* in tempodb-read-demo.js.

1. Run tempodb-read-demo.js to read back the data you just wrote in.

```
node tempodb-read-demo
```

# TempoDBClient Object

Stores the session information for authenticating and accessing TempoDB.  You can specify an optional hostname, port, protocol (http or https), and version. This is used if you are on a private cluster.
The default hostname and port should work for the standard cluster.


    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-database-id', 'your-api-key', 'your-api-secret');


For now, the database ID and API key are the same value.  You can specify an optional four argument Object to TempoDBClient

    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret', {hostname: 'your-host.name', port: 123});

### Options
* *hostname* (string) default: 'api.tempo-db.com'
* *port* (Integer) default: 443
* *secure* (Boolean) default: true
* *version* (string) default: 'v1'


# API

## Method naming convention

For backwards compatibility purposes, each method has both an _ separated and camelCase naming style:

    Client.write_multi
    Client.writeMulti

These can be used interchangeably, even though the documentation below reflects the camelCase style.

## Callbacks and returned Objects
Most of the API functions allow you to pass in an optional *callback* function.  In general, the callback should be a function accepting
two arguments:

    tempodb.read('foo', function(err, resp) {
        if (err) {
            (...)
        } else {
            (...)
        }
    }

The error parameter's type will depend on what function you are working with, but typically it will be a Response object as described below.  If an error is encountered before the client can make it all the way to an HTTP response from the REST API, then it will be a standard node.js error instead.

The second parameter supplied to the call back will be a Response object that has many useful properties.

* *status* (Integer) - the HTTP response code
* *headers* (Object) - all response headers from the API
* *json* (Object or string)- the parsed JSON body of successful API calls.  For calls that return error codes, the plain text body is returned.  For endpoints returning data cursors, the json will have a *data* attribute that is a cursor object.  For more details, see below.
* *successful* (Integer) - whether the HTTP request was successful.  Possible values are supplied by the exported constants in the response module - SUCCESS, FAILURE, PARTIAL.
* *error* (Object or string) - if the request failed, any error message that came back.  Will be null for successful requests

The return types below show what is returned in the *body* parameter of successful calls.

## Cursors

Some endpoints (all those that return multiple values - read, readMulti, listSeries, and findByKey as of this release) return Cursors (defined in *lib/cursor.js*) as the 'data' attribute in the json of the response.  Cursors represent paginated data, but can be used as if they represented all the data in the return call.  To work with the cursor, you can do this:

    Client.read('foo', function(err, resp) {
        var cursor = resp.json['data'];
        (...)
    }

There are two main abstractions for working with cursors: readAll and map:

### Cursor.readAll(*callback*)
Read the data page by page, calling the given callback for each *page* of data.  For instance, if you call Client.read() with a page limit of 5000, your callback will receive chunks of 5000 datapoints at a time until the cursor is exhausted.  Using readAll() is appropriate when your processing doesn't depend on being able to see all the data at once.

### Cursor.map(*callback*, *finalCallback*)
Map will call the first callback with each *point* of data until it reaches the end of the cursor.  Anything your callback function returns will be collected into a list that will then be passed to finalCallback.  For example:

    Cursor.map(function(err, datapoint) {
        datapoint.v += 2.0;
        return datapoint
    }, function(err, datapoints) {
        for (d in datapoints) {
            console.log(d);
        }
    });

In this case, the final output of this call will be printing each datapoint to the console with its value incremented by 2.0.  You can use map when you need to run a final function that sees the total output of your read call.

### Cursor.toArray(*callback*)
Convert the cursor into an array of all the points returned and pass the into callback. *WARNING*: this will construct an array of every point in the range of the query in memory.  For large queries, you could run out of memory.

## TempoDBClient#createSeries(*key*, *callback*)
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

The following example creates two series: one with a given key of "my-custom-key" and one without a key specified.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');

    var series1, series2;

    tempodb.createSeries('my-custom-key'), function(err, result) {
        if (result.status == 200) {
            series1 = result.json;
        }
    });

    tempodb.createSeries(null, function(result) {
        if (result.status == 200) {
            series2 = result.json;
        }
    });


## TempoDBClient#getSeries(*key*, *callback*) 
Gets a single series object, identified by key.

### Parameters

* key - an string key for the series to get

### Returns
A series object

      {
        "id":"6ee327867a9f45a5b4d9feb5601897ab",
        "key":"Daily_Rainfall",
        "name":"",
        "attributes":{},
        "tags":[]
      }

### Example

The following example gets a single series with the key 'key1' 

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');

    tempodb.getSeries('key1', function(err, result){
        if (result.status == 200) {
            var series_list = result.json['data'];
            console.log(result.json);
        }
    });


## TempoDBClient#listSeries(*options*, *callback*) *CURSORED ENDPOINT*
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
    var cb = function(result){ console.log(result.status+': '+ JSON.stringify(result.json)); }

    var options = {
        tag: ['tag1', 'tag2'],
        attr: { attr1: 'value1'}
    }

    tempodb.listSeries(options, function(err, result){
        if (result.status == 200) {
            var series_list = result.json['data'];

            series_list.readAll(function(err, seriesPage) {
                for (var i = 0; i < seriesPage.length; i++) {
                    var series = series_list[i];
                    console.log(series.id, series.key);
                }
            }
        }
    });


## TempoDBClient#updateSeries(*series_id*, *series_key*, *name*, *attributes*, *tags*, *callback*)
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
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var options = {
        key: 'test1'
    }

    tempodb.getSeries(options, function(err, result) {
        if (result.status == 200) {
            var series = result.json[0];
            var new_tags = ['foo', 'bar'];
            var new_attr = {unit: 'Fahrenheit', user_id: 27};
            tempodb.update_series(series.id, series.key, series.name, new_attr, new_tags, cb);
        }
    });

## TempoDBClient#deleteSeries(*options*, callback)
Delete series objects by the given filter criteria.
This method has the same query parameters as `get_series`. Series can be
deleted by id, key, tag and attribute. You must specify at least one filter
query param for deletion. If you want to truncate your database (remove all
series), you must specify `allow_truncation: true`.

### Parameters
* id - an array of ids to include (Array of strings)
* key - an array of keys to include (Array of strings)
* tag - an array of tags to filter on. These tags are and'd together (Array of strings)
* attr - a object of key/value pairs to filter on. These attributes are and'd together. (Object)
* allow_truncation - a boolean that must be passed when you wish to delete all your series. Mutually exclusive with the filter query parameters. (Boolean)

### Returns
A summary of the delete operation, the value deleted is the number of series deleted.

    { response: 200, body: { deleted: 7 } }

### Example

The following example deletes all series with "tag1" and "tag2" and attribute "attr1" equal to "value1".

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result); }

    var tags = ['tag1', 'tag2'];
    var attributes = { attr1: "value1" };

    var options = {
      tag: ['tag1', 'tag2'],
      attr: {
        attr1: "value1"
      }
    };

    tempodb.deleteSeries(options, cb);

## TempoDBClient#read(*series_key*, *start*, *end*, *options*, *callback*) *CURSORED ENDPOINT*
Gets one series and corresponding time series data between the specified start and end dates.  The optional interval parameter allows you to specify a rollup period. For example, "1hour" will roll the data up on the hour using the provided function. The function parameter specifies the folding function to use while rolling the data up. If no rollup parameters are supplied, raw data will be returned.

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
* first
* last
* percentile

You can also retrieve raw data by specifying "raw" as the interval. The series to query can be filtered using the remaining parameters.

### Parameters

* series_key - the key of the series to read
* start - start time for the query (Date)
* end - end time for the query (Date)

* options is an object containing any of the following
    * rollup.period - the rollup interval (string)
    * rollup.fold - the rollup folding function (string)
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)
    * limit - how many datapoints to read in a single page (Integer)
    * tz - desired output timezone (string).  [View valid timezones](http://tempo-db.com/docs/api/timezone/).



### Returns

An object containing the series information and the time series data for the specified time period.

    {
        series: {
            id: '6fefeba655504694b21235acf8cdae5f',
            key: 'your-custom-key',
            name: '',
            attributes: {},
            tags: []
        },
        data: [
            { t: '2012-01-01T00:00:00.000+0000', v: 23.559637793913357 },
            { t: '2012-01-01T01:00:00.000+0000', v: 24.887018265425514 },
            { t: '2012-01-01T02:00:00.000+0000', v: 24.103298434838965 },
            ...
            { t: '2012-01-01T23:00:00.000+0000', v: 23.1820437503413 }
        ],
        rollup: {
            interval: 1hour,
            'function': 'mean',
            'tz': 'America/Chicago'
        }
     }

### Example

The following example reads the list of series with key *your-custom-key* (should only be one) and returns the data rolled up to an hourly average.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var series_key = 'your-custom-key';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-02');

    var options = {
        interval: '1hour',
        'function': 'mean',
        tz: 'America/Chicago'
    }

    tempodb.read(series_key, series_start_date, series_end_date, options, function(err, result){
        var cursor = result.json.data;
        cursor.readAll(function(err, datapoints) {
            for (var i = 0; i < datapoints.length; i++) {
                var dp = datapoints[i];
                console.log(dp);
            }
        }
    });

## TempoDBClient#getSummary(*series_key*, *start*, *end*, *callback*)
Gets a summary a data for the given series over the desired time period.

### Returns

An object containing the series information, time series data, and a summary of statistics for the specified time period.

    {
        series: {
            id: '6fefeba655504694b21235acf8cdae5f',
            key: 'your-custom-key',
            name: '',
            attributes: {},
            tags: []
        },
          tz: 'UTC',
          end: '2012-01-02T00:00:00.000Z',
          start: '2012-01-01T00:00:00.000Z',
          summary: 
            { count: 1440,
              mean: 24.78802922652297,
              min: 0.03275709459558129,
              max: 49.95655614184216,
              stddev: 14.361505725497977,
              sum: 35694.76208619308 } 
     }

### Example

The following example gets the summary for one day of the series 'your-custom-key'

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');

    var series_key = 'your-custom-key';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-02');

    var options = {
        interval: '1hour',
        'function': 'mean',
        tz: 'America/Chicago'
    }

    tempodb.read(series_key, series_start_date, series_end_date, function(err, result){
      console.log(result.json);
    });

## TempoDBClient#readMulti(*start*, *end*, *options*, *callback*) *CURSORED ENDPOINT*
Gets multiple series and corresponding time series data between the specified start and end dates.  The optional interval parameter allows you to specify a rollup period. For example, "1hour" will roll the data up on the hour using the provided function. The function parameter specifies the folding function to use while rolling the data up. If no rollup parameters are provided, raw data will be returned.

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
* first
* last
* percentile

You can also retrieve raw data by specifying "raw" as the interval. The series to query can be filtered using the remaining parameters.

### Parameters

* start - start time for the query (Date)
* end - end time for the query (Date)

* options is an object containing any of the following
    * rollup.period - the rollup interval (string)
    * rollup.fold - the rollup folding function (string)
    * key - an array of keys to include (array of strings)
        * can also pass single string if only one key
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)
    * limit - how many datapoints to read in a single page (Integer)
    * tz - desired output timezone (string).  [View valid timezones](http://tempo-db.com/docs/api/timezone/).

### Returns

An object containing the series information, and the accumulated time series data for each point of each series. Any series not having data at a particular timestamp will be omitted from that timestamp.

    {
        "data":[
            {"t":"2012-03-27T03:00:00.000Z","v":{"foo":1.125, "bar":1.341}},
            {"t":"2012-03-28T03:00:00.000Z","v":{"foo":2.125, "bar":3.121}},
            {"t":"2012-03-28T03:00:00.000Z","v":{"bar":3.121}}
        ],
        "series":[
            {"id":"123efac6b543a2901","key":"foo","name":"","tags":[],"attributes":{}},
            {"id":"934cab33e8f1a472b","key":"bar","name":"","tags":[],"attributes":{}}
        ],
        "rollup":null,
        "tz":"UTC"
    }

### Example

The following example reads the list of series with keys *foo* and *bar* and returns the data rolled up to an hourly average.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var series_key = 'your-custom-key';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-02');

    var options = {
        key: ['foo', 'bar'],
        'rollup.period': '1hour',
        'rollup.fold': 'mean',
        tz: 'America/Chicago'
    }

    tempodb.readMulti(series_start_date, series_end_date, options, function(err, result){
        var cursor = result.json.data;
        cursor.readAll(function(err, datapoints) {
            for (var i = 0; i < datapoints.length; i++) {
                var dp = datapoints[i];
                console.log(dp);
            }
        }
    });


## TempoDBClient#aggregate(*start*, *end*, *aggregation*, *options*, *callback*) *CURSORED ENDPOINT*
Aggregates data from multiple series into a single series according to an aggregation function.  The returned series can be thought of as a "virtual" or "temporary"
series composed of data from a larger set of series.

### Parameters

* start - start time for the query (Date)
* end - end time for the query (Date)
* aggregation - the aggregation function (all valid rollup functions are valid aggregation functions)

* options is an object containing any of the following
    * rollup.period - the rollup interval (string)
    * rollup.fold - the rollup folding function (string)
    * key - an array of keys to include (array of strings)
        * can also pass single string if only one key
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)
    * limit - how many datapoints to read in a single page (Integer)
    * tz - desired output timezone (string).  [View valid timezones](http://tempo-db.com/docs/api/timezone/).

### Returns

An object containing the series information, and the accumulated time series data for each point of each series.

    {
        "data": [
            {"t":"2012-03-27T03:00:00.000Z","v":1.341},
            {"t":"2012-03-28T03:00:00.000Z","v":3.121},
            {"t":"2012-03-29T03:00:00.000Z","v":5.21}
        ],
        "rollup":null,
        "tz":"UTC"
    }

### Example

The following example reads the list of series with keys *foo* and *bar* and returns the data rolled up to an hourly average.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var series_key = 'your-custom-key';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-02');

    var options = {
        key: ['foo', 'bar'],
        tz: 'America/Chicago'
    }

    tempodb.aggregate(series_start_date, series_end_date, "sum", options, function(err, result){
        var cursor = result.json.data;
        cursor.readAll(function(err, datapoints) {
            for (var i = 0; i < datapoints.length; i++) {
                var dp = datapoints[i];
                console.log(dp);
            }
        }
    });
## TempoDBClient#getMultiRollups(*series_key*, *start*, *end*, *options*, *callback*) *CURSORED ENDPOINT*
Apply multiple rollup functions to a single series read.  The rollup functions used will all use the same period.

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
* first
* last
* percentile

You can also retrieve raw data by specifying "raw" as the interval. The series to query can be filtered using the remaining parameters.

### Parameters

* start - start time for the query (Date)
* end - end time for the query (Date)

* options is an object containing any of the following
    * rollup.period - the rollup interval (string)
    * rollup.fold - an array of rollup folding functions (string)
    * key - an array of keys to include (array of strings)
        * can also pass single string if only one key
    * tag - an array of tags to filter on. These tags are and'd together (array of strings)
    * attr - an object of attribute key/value pairs to filter on. These attributes are and'd together. (object)
        * limit - how many datapoints to read in a single page (Integer)
    * tz - desired output timezone (string).  [View valid timezones](http://tempo-db.com/docs/api/timezone/).

### Returns

An object containing the series information, and the accumulated time series data for each point of each series.

    {
        "data":[
            { t: '2012-01-01T04:00:00.000Z', v: { count: 60, max: 49.84126889814867, min: 1.1116998714582937, percentile: 8.407472817470296 } },
            { t: '2012-01-01T05:00:00.000Z', v: { count: 60, max: 49.84126889814867, min: 1.1116998714582937, percentile: 8.407472817470296 } },
            ...
        ],
        "series":[
            {"id":"934cab33e8f1a472b","key":"bar","name":"","tags":[],"attributes":{}}
        ],
        "rollup": { period: 'PT1H',
            folds: [ 'count', 'max', 'min', 'percentile(0.2)' ] },
        "tz":"UTC"
    }

### Example

The following example reads the list of series with keys *foo* and *bar* and returns the data rolled up to an hourly average.

    var TempoDBClient = require('../lib/tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('my-key, 'my-secret')

    var series_key = 'stuff',
        series_start_date = new Date('2012-01-01'),
        series_end_date = new Date('2012-01-02');

    // read a date range
    var options = {
        'rollup.period': '1hour',
        'rollup.fold': ['count', 'max', 'min', 'percentile,20'],
        limit: 1000
    }
    var count = 0

    var start_time = new Date();
    tempodb.getMultiRollups(series_key, series_start_date, series_end_date, options, function(err, result){
        if (err) {
            console.log(err);
            console.log('Status code: ' + err.status);
            console.log('Error: ' + err.json);
        } else {
            console.log(result.json)
            result.json.data.toArray(function(err, dps) {
                if (err) { 
                    console.log('There was an error')
                } else {
                    console.log(dps);
                    console.log('Total points: ' + dps.length);
                }
            });
        }
    });


## TempoDBClient#findByKey(*series_key*, *start*, *end*, *options*, *callback*) *CURSORED ENDPOINT*
Supports finding datapoints within a specified interval between the start and end point of the query.  Supported find functions are:

* max
* min
* first
* last

The find period can be any valid ISO period.  

### Parameters

* start - start time for the query (Date)
* end - end time for the query (Date)

* options is an object containing any of the following
    * predicate.period - the period to search within (string)
    * predicate.function - the finding function (string)
        * limit - how many datapoints to read in a single page (Integer)
    * tz - desired output timezone (string).  [View valid timezones](http://tempo-db.com/docs/api/timezone/).

### Returns

An object containing the information on the located datapoints, 

    {
        "data":[
            {
                "interval": {
                    "start": "2012-03-27T00:00:00.000Z",
                    "end": "2012-03-28T00:00:00.000Z"
                },
                "found": {
                    "t": "2012-03-27T04:14:22.000Z",
                    "v": 2.3
                }
            },
            {
                "interval": {
                    "start": "2012-03-28T00:00:00.000Z",
                    "end": "2012-03-29T00:00:00.000Z"
                },
                "found": {
                    "t": "2012-03-28T015:02:59.000Z",
                    "v": 8.1
                }
            }
        ],
        "predicate": {
            "function": "max",
            "period": "PT1H"
        },
        "tz":"UTC"
    }

### Example

The following example finds the maximum datapoint within each hour for a day.


    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    series_key = 'my-series'
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-02');

    var options = {
        key: ['foo', 'bar'],
        interval: '1hour',
        'predicate.function': 'max',
        'predicate.period': '1hour',
        tz: 'America/Chicago'
    }

    tempodb.findByKey(series_key, series_start_date, series_end_date, options, function(err, result){
        var cursor = result.json.data;
        cursor.readAll(function(err, datapoints) {
            for (var i = 0; i < datapoints.length; i++) {
                var dp = datapoints[i];
                console.log(dp);
            }
        }
    });

## TempoDBClient#singleValueByKey(*series_key*, *ts*, *options*, *callback*)
Requests a single value for the series specified by key. This will return a datapoint exactly determined by the supplied timestamp (ts) or this function can also search for datapoints.

### Parameters

* series_key - key for the series to retrieve single value (string)
* ts - the requested timestamp for a datapoint. (DateTime)
* options - An object containing the following
    * direction - the specified search direction (string). Options are:
        * exact - returns the datapoint exactly at the timestamp (Default)
        * before - returns the datapoint exactly at the timestamp or searches backwards in time for the next datapoint
        * after - returns the datapoint exactly at the timestamp or searches forwards in time for the next datapoint
        * nearest - returns the datapoint exactly at the timestamp or searches both backwards and forwards and returns the datapoint closest to the timestamp

### Returns

An Object containing the series object and the datapoint.

    {
        series: {
            id: '6fefeba655504694b21235acf8cdae5f',
            key: 'your-custom-key',
            name: '',
            attributes: {},
            tags: []
        },
        data: { t: '2012-01-01T00:00:00.000+0000', v: 23.559637793913357 }
    }

Note: the data field will be null if no datapoint was found.

## Example

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var series_key = 'your-custom-key';
    var ts = new Date('2012-01-01');

    var options = {
        direction: 'before'
    }

    tempodb.singleValueByKey(series_key, ts, options, cb);


## TempoDBClient#singleValue(*ts*, *options*, *callback*) *CURSORED ENDPOINT*
Requests a single value for all the series specified by the filter criteria. This will return a datapoint exactly determined by the supplied timestamp (ts) or this function can also search for datapoints.

### Parameters

* ts - the requested timestamp for a datapoint. (DateTime)
* options - An object containing the following
    * id - an array of ids to include (Array of strings)
    * key - an array of keys to include (Array of strings)
    * tag - an array of tags to filter on. These tags are and'd together (Array of strings)
    * attr - a object of key/value pairs to filter on. These attributes are and'd together. (Object)
    * direction - the specified search direction (string). Options are:
        * exact - returns the datapoint exactly at the timestamp (Default)
        * before - returns the datapoint exactly at the timestamp or searches backwards in time for the next datapoint
        * after - returns the datapoint exactly at the timestamp or searches forwards in time for the next datapoint
        * nearest - returns the datapoint exactly at the timestamp or searches both backwards and forwards and returns the datapoint closest to the timestamp

### Returns

A list of Objects containing the series object and the datapoint.

    [{
        series: {
            id: '38268c3b231f1266a392931e15e99231',
            key: 'my-other-series',
            name: '',
            attributes: {},
            tags: ['tag1', 'tag2']
        },
        data: { t: '2012-01-01T00:01:00.000+0000', v: 55.9613357 }
    },
    {
        series: {
            id: '6fefeba655504694b21235acf8cdae5f',
            key: 'your-custom-key',
            name: '',
            attributes: {},
            tags: ['tag1', 'tag2']
        },
        data: { t: '2012-01-01T00:00:00.000+0000', v: 23.559637793913357 }
    }]

Note: the data field will be null if no datapoint was found.

## Example

This example will return a list of single value responses for all series with both tags ("tag1", "tag2")

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var ts = new Date('2012-01-01');
    var options = {
        tag = ["tag1", "tag2"],
        direction: 'exactly'
    }

    tempodb.singleValue(ts, options, cb);


## TempoDBClient#writeKey(*series_key*, *data*, *callback*)
Write datapoints to the specified series key.

### Parameters

* series_key - key for the series to write to (string)
* data - the data to write (Array of {t, v} Objects)

### Returns

Nothing

### Example

The following example writes three datapoints to the series with key *your-custom-key*.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var series_key = 'your-custom-key';

    var data = [
        { t: new Date("2012-01-12 14:11:00"), v: 55.231 },
        { t: new Date("2012-01-12 14:12:00"), v: 47.143 },
        { t: new Date("2012-01-12 14:13:00"), v: 49.856 }
    ];

    tempodb.writeKey(series_key, data, cb);


## TempoDBClient#writeBulk(*ts*, *data*, *callback*)
Write datapoints to multiple series for a single timestamp.  This function takes a timestamp and a parameter called data which is an Array of Objects containing either the series id or series key and the value.  For example:

    data = [
        { id: "6fefeba655504694b21235acf8cdae5f", v: 14.3654 },
        { id: "01868c1a2aaf416ea6cd8edd65e7a4b8", v: 27.234 },
        { key: "your-custom-key", v: 1 },
        { key: "your-custom-key-2", v: 34.654 },
        { id: "38268c3b231f1266a392931e15e99231", v: 9912.75 },
    ];

### Parameters

* ts - the timestamp for the datapoints
* data - the data to write (Array of {id, v} or {key, v} Objects)

### Returns

Nothing

### Example

The following example writes 5 separate series at the same timestamp.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var ts = new Date("2012-01-12 14:13:09");

    data = [
        { id: "6fefeba655504694b21235acf8cdae5f", v: 14.3654 },
        { id: "01868c1a2aaf416ea6cd8edd65e7a4b8", v: 27.234 },
        { key: "your-custom-key", v: 1 },
        { key: "your-custom-key-2", v: 34.654 },
        { id: "38268c3b231f1266a392931e15e99231", v: 9912.75 },
    ];

    tempodb.writeBulk(ts, data, cb);


## TempoDBClient#writeMulti(*data*, *callback*)
Write datapoints to multiple series for multiple timestamps. This function takes an Array of Objects containing the timestamp, either the series id or series key, and the value.  For example:

    data = [
        { t: new Date("2012-01-12 14:11:00"), id: "6fefeba655504694b21235acf8cdae5f", v: 14.3654 },
        { t: new Date("2012-01-12 14:12:00"), id: "01868c1a2aaf416ea6cd8edd65e7a4b8", v: 27.234 },
        { t: new Date("2012-01-12 14:13:00"), key: "your-custom-key", v: 1 },
        { t: new Date("2012-01-12 14:13:00"), key: "your-custom-key-2", v: 34.654 },
        { t: new Date("2012-01-12 14:13:00"), id: "38268c3b231f1266a392931e15e99231", v: 9912.75 }
    ];

### Parameters

* data - the data to write (Array of {t, id, v} or {t, key, v} Objects)

### Returns

The return body is either empty on success (response code will be 200) or contains a JSON object with a list of response objects in event of a single or multi-point failure (response code will be 207). Each response object contains a status code and an Array of error messages. This Array has a one to one correspondence with the original Array. For example if you submitted this Array:

    data = [
        { t: new Date("2012-01-12 14:11:00"), v: 123.4},
        { t: new Date("2012-01-12 14:11:00"), key:'your- custom-key', v:531},
        {}
    ]

You would recieve a 207 in the response code and this Array in the response body:

    {
      multistatus: [
        { status: "422", messages: [ "Must provide a series ID or key" ] },
        { status: "200", messages: [] },
        { status: "422", messages: [
                                    "Must provide a numeric value",
                                    "Must provide a series ID or key"
                                   ]
        }
      ]
    }


### Example

The following example writes 5 separate series at the same timestamp.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    data = [
        { t: new Date("2012-01-12 14:11:00"), key: "your-custom-key", v: 14.3654 },
        { t: new Date("2012-01-12 14:12:00"), id: "01868c1a2aaf416ea6cd8edd65e7a4b8", v: 27.234 },
        { t: new Date("2012-01-12 14:13:00"), key: "your-custom-key", v: 1 },
        { t: new Date("2012-01-12 14:13:00"), key: "your-custom-key-2", v: 34.654 },
        { t: new Date("2012-01-12 14:13:00"), id: "38268c3b231f1266a392931e15e99231", v: 9912.75 }
    ];

    tempodb.writeMulti(data, cb);



## TempoDBClient#deleteKey(*series_key*, *start*, *end*, *callback*)
Deletes a range of data from a series referenced by key between the specified start and end dates. As with the read api, the start is inclusive and the end date is exclusive. \[start, end)

### Parameters

* series_key - key for the series to delete from (string)
* start - start time for the query (Date, inclusive)
* end - end time for the query (Date, exclusive)

### Returns

A 200 OK, if successful

### Example

The following example deletes data for the series with key *your-custom-key* between 2012-01-01 and 2012-01-14.

    var TempoDBClient = require('tempodb').TempoDBClient;
    var tempodb = new TempoDBClient('your-api-key', 'your-api-secret');
    var cb = function(err, result){ console.log(result.response+': '+ JSON.stringify(result.json)); }

    var series_key = 'your-custom-key';
    series_start_date = new Date('2012-01-01');
    series_end_date = new Date('2012-01-14');

    tempodb.deleteKey(series_key, series_start_date, series_end_date, cb);
