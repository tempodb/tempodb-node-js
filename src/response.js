var cursor = require('./cursor.js')

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
	this.data = JSON.parse(body);
	this.session = session;

	if (cursored === true) {
		this.data['data'] = new Cursor(
	}

	if (this.status === 200) {
		this.successful = SUCCESS;
		this.error = null;
	else if (this.status === 207) {
		this.successful = PARTIAL;
		this.error = this.data;
	} else {
		this.successful = FAILURE;
		this.error = this.data;
	}
}

