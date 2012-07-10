# TempoDB Node.js API Client

The TempoDB Node.js API Client makes calls to the [TempoDB API](http://tempo-db.com/api/).  The module is available on npm as tempodb.

1. Install tempodb

``
npm install tempodb
``

1. After installing tempodb, download [tempodb-write-demo.js](https://github.com/tempodb/tempodb-node-js/blob/master/demo/tempodb-write-demo.js).

1. Edit *your-api-key* and *your-api-secret* in tempodb-write-demo.js.

1. Run tempodb-write-demo.js to insert 10 days worth of test data.

``
node tempodb-write-demo
``

1. Download [tempodb-read-demo.js](https://github.com/tempodb/tempodb-node-js/blob/master/examples/tempodb-read-demo.js)

1. Edit *your-api-key* and *your-api-secret* in tempodb-read-demo.js.

1. Run tempodb-read-demo.js to read back the data you just wrote in.

``
node tempodb-read-demo
``

# Classes

## Client(opts)
Stores the session information for authenticating and accessing TempoDB. The argument ``opts`` is an object which contains required and optional properties.  Your key and secret are required.  The Client allows you to specify hostname, port, protocol (http or https), and version. This is used if you are on a private cluster.
The default hostname and port should work for the standard cluster.

### Required opts
* key (String)
* secret (String)

### Optional opts
* *hostname* (String) default: 'api.tempo-db.com'
* *port* (Integer) default: 443
* *secure* (Boolean) default: true
* *version* (String) default: 'v1'
