var cursor = require('../lib/cursor')
var q = require('q')
var response = require('../lib/response')
var mocks = require('./mocks/testmocks')
var sinon = require('sinon');
var Fiber = require('fibers');

var sleep = function(ms) {
    var fiber = Fiber.current;
    setTimeout(function() {
        fiber.run();
    }, ms);
    Fiber.yield();
}

exports.testCursorConstructor = function(test) {
    var data =  '{"data": [{"foo": "bar"}]}'
    var resp = new mocks.MockHTTPResponse(200, {}, data);
    var session = new mocks.MockSession();
    var myResponse = new response.Response(resp, resp.body, session, true)
    test.deepEqual(myResponse.json['data'].session, myResponse.session, 'cursor preserves session');
    test.equal(myResponse.json['data'].isDone, false, 'cursor does not start out exhausted');
    test.done();
}

exports.testCursorNext = function(test) {
    test.expect(4);
    var data1 = '{"data": [{"foo": "bar"}]}'
    var deta2 = '{"data": [{"baz": "boz"}]}'
    cb1 = function(p) {
        test.strictEqual(p.foo, 'bar');
    }
    cb2 = function(p) {
        test.strictEqual(p.baz, 'boz');
    }
    var session = new mocks.MockSession();
    var resp1 = new mocks.MockHTTPResponse(200, {"link": '<next.html>; rel=next'}, data1);
    var resp2 = new mocks.MockHTTPResponse(200, {}, deta2);
    var myResponse1 = new response.Response(resp1, resp1.body, session, true);
    var myResponse2 = new response.Response(resp2, resp2.body, session, false);
    var def2 = q.defer();
    def2.resolve(myResponse2);
    session.get.returns(def2.promise)
    //BR00TAL HACKZ
    Fiber(function() {
        myResponse1.json['data'].next(cb1);
        myResponse1.json['data'].next(cb2);
        myResponse1.json['data'].next();
        cursor.waitUntilDone(myResponse1.json['data'])
        //myResponse1.json['data'].next(cb1);
    }).run();
    //this is only necessary to delay the end of the test because nodeunit tries
    //to end the test before the fiber is done running due to how fibers are 
    //scheduled into the event loop.  this sleep is unecessary in application code
    Fiber(function() {
        sleep(1000)
        test.ok(myResponse1.json['data'].isDone);
        test.ok(session.get.calledOnce);
        test.done();
    }).run()
}

exports.testCursorPreservesOrder = function(test) {
    test.expect(5);
    var data1 = '{"data": [{"foo": "bar"}, {"foo2": "bar2"}]}'
    var deta2 = '{"data": [{"baz": "boz"}, {"baz2": "boz2"}]}'
    var arr = new Array();

    cb = function(p) {
        arr.push(p)
    }

    var session = new mocks.MockSession();
    var resp1 = new mocks.MockHTTPResponse(200, {"link": '<next.html>; rel=next'}, data1);
    var resp2 = new mocks.MockHTTPResponse(200, {}, deta2);
    var myResponse1 = new response.Response(resp1, resp1.body, session, true);
    var myResponse2 = new response.Response(resp2, resp2.body, session, false);
    var def2 = q.defer();
    def2.resolve(myResponse2);
    session.get.returns(def2.promise)
    Fiber(function() {
        myResponse1.json['data'].next(cb);
        myResponse1.json['data'].next(cb);
        myResponse1.json['data'].next(cb);
        myResponse1.json['data'].next(cb);
        cursor.waitUntilDone(myResponse1.json['data'])
        //myResponse1.json['data'].next(cb1);
    }).run();

    Fiber(function() {
        sleep(1000)
        test.equal(arr.length, 4);
        test.equal(arr[0].foo, 'bar');
        test.equal(arr[1]['foo2'], 'bar2');
        test.equal(arr[2].baz, 'boz');
        test.equal(arr[3]['baz2'], 'boz2');
        test.done();
    }).run()
}

exports.testCursorReadAll = function(test) {
    var data1 = '{"data": [{"foo": 1}, {"foo": 2}]}'
    var deta2 = '{"data": [{"foo": 3}, {"foo": 4}]}'
    var arr = new Array();

    var session = new mocks.MockSession();
    var resp1 = new mocks.MockHTTPResponse(200, {"link": '<next.html>; rel=next'}, data1);
    var resp2 = new mocks.MockHTTPResponse(200, {}, deta2);
    var myResponse1 = new response.Response(resp1, resp1.body, session, true);
    var myResponse2 = new response.Response(resp2, resp2.body, session, false);
    var def2 = q.defer();
    def2.resolve(myResponse2);
    session.get.returns(def2.promise);

    cb = function(err, p) {
        return p[0].foo + 2;
    }

    var r = myResponse1.json['data'].readAll(cb);
    test.done()
}

exports.testCursorMap = function(test) {
    var data1 = '{"data": [{"foo": 1}, {"foo": 2}]}'
    var deta2 = '{"data": [{"foo": 3}, {"foo": 4}]}'
    var arr = new Array();

    var session = new mocks.MockSession();
    var resp1 = new mocks.MockHTTPResponse(200, {"link": '<next.html>; rel=next'}, data1);
    var resp2 = new mocks.MockHTTPResponse(200, {}, deta2);
    var myResponse1 = new response.Response(resp1, resp1.body, session, true);
    var myResponse2 = new response.Response(resp2, resp2.body, session, false);
    var def2 = q.defer();
    def2.resolve(myResponse2);
    session.get.returns(def2.promise);

    cb = function(err, p) {
        console.log(p)
        return p.foo + 2;
    }

    finalcb = function(err, data) {
        console.log(data);
    }

    var r = myResponse1.json['data'].map(cb, finalcb);
    test.done()
}
