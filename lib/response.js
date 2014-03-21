var cursor = require('./cursor.js')
var util = require('util');

const FAILURE = 0,
			SUCCESS = 1,
			PARTIAL = 2

exports.FAILURE = FAILURE
exports.SUCCESS = SUCCESS
exports.PARTIAL = PARTIAL

var Response = exports.Response = function(resp, body, session, cursored) {
	if (cursored === undefined) {
		cursored = false;
	}
	this.headers = resp.headers;
	this.status = resp.statusCode;
	this.session = session;
	var j;

	if (body) {
    try {
		  j = JSON.parse(body);
    } catch (e) {
      throw new Error(body);
    }
	} else {
		j = null;
	}
	this.json = j;
	this.session = session;

	if (this.status === 200) {
		this.successful = SUCCESS;
		this.error = null;
	} else if (this.status === 207) {
		this.successful = PARTIAL;
		this.error = this.data;
	} else {
		this.successful = FAILURE;
		this.error = this.data;
	}

	if (cursored === true && this.successful === SUCCESS) {
    var j2;
    if (j instanceof Array) {
      j2 = j.slice(0)
    } else {
		  j2 = util._extend({}, j);
    }
		var c = new cursor.Cursor(this.session, j2, this.headers['link']);
		this.json['data'] = c; 
	}
}

