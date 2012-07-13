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
* *hostname* (String) default: 'api.tempo-db.com'
* *port* (Integer) default: 443
* *secure* (Boolean) default: true
* *version* (String) default: 'v1'


# API

## TempoDBClient#create_series(*key*)
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
    var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

    var series1 = tempodb.create_series('my-custom-key'), cb);
    var series2 = tempodb.create_series(null, cb);


## TempoDBClient#get_series(*options*)
Gets a list of series objects, optionally filtered by the provided parameters. Series can be filtered by id, key, tag and
attribute.

### Parameters

* options is an object containing any of the following
    * ids - an array of ids to include (array of strings)
    * keys - an array of keys to include (array of strings)
    * tags - an array of tags to filter on. These tags are and'd together (array of strings)
    * attributes - an object of key/value pairs to filter on. These attributes are and'd together. (object)

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

    var series = tempodb.get_series(options, cb);

