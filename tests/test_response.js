var cursor = require('../lib/cursor')
var q = require('q')
var response = require('../lib/response')
var mocks = require('./mocks/testmocks')
var sinon = require('sinon');
var Fiber = require('fibers');

exports.testResponseConstuctor = function(test) {
	var resp = new mocks.MockHTTPResponse(200, {}, null);
	var session = new mocks.MockSession();
	var respObj = new response.Response(resp, '', session, false);
	test.equal(respObj.status, 200);
	test.equal(respObj.json, null);
	test.equal(respObj.successful, response.SUCCESS);
	test.done();
}

exports.testResponseConstuctor2 = function(test) {
	var resp = new mocks.MockHTTPResponse(207, {}, null);
	var session = new mocks.MockSession();
	var respObj = new response.Response(resp, '', session, false);
	test.equal(respObj.status, 207);
	test.equal(respObj.json, null);
	test.equal(respObj.successful, response.PARTIAL);
	test.done();
}

exports.testResponseConstuctor3 = function(test) {
	var resp = new mocks.MockHTTPResponse(404, {}, null);
	var session = new mocks.MockSession();
	var respObj = new response.Response(resp, '', session, false);
	test.equal(respObj.status, 404);
	test.equal(respObj.json, null);
	test.equal(respObj.successful, response.FAILURE);
	test.done();
}

exports.testResponseConstuctor4 = function(test) {
	var resp = new mocks.MockHTTPResponse(404, {'foo': 'bar'}, null);
	var session = new mocks.MockSession();
	var respObj = new response.Response(resp, '', session, false);
	test.equal(respObj.status, 404);
	test.equal(respObj.headers['foo'], 'bar');
	test.equal(respObj.json, null);
	test.equal(respObj.successful, response.FAILURE);
	test.done();
}

exports.testResponseConstuctorWithCursor = function(test) {
	var data =  '{"data": [{"foo": "bar"}]}'
	var resp = new mocks.MockHTTPResponse(200, {'link': 'bar'}, data);
	var session = new mocks.MockSession();
	var respObj = new response.Response(resp, resp.body, session, true);
	test.equal(respObj.status, 200);
	test.equal(respObj.headers['link'], 'bar');
	test.equal(respObj.json['data'].linkHeader, 'bar');
	test.equal(respObj.successful, response.SUCCESS);
	test.done();
}

exports.testResponseConstuctorFailureWithCursor = function(test) {
	var data =  '{"data": [{"foo": "bar"}]}'
	var resp = new mocks.MockHTTPResponse(404, {'link': 'bar'}, data);
	var session = new mocks.MockSession();
	var respObj = new response.Response(resp, resp.body, session, true);
	test.equal(respObj.status, 404);
	test.equal(respObj.headers['link'], 'bar');
	test.equal(respObj.json['data'][0].foo, 'bar');
	test.equal(respObj.successful, response.FAILURE);
	test.done();
}
