var sinon = require('sinon')

exports.MockHTTPResponse = function(code, headers, body) {
	this.statusCode = code;
	this.headers = headers;
	this.body = body
}

exports.MockSession = function() {
}

exports.MockSession.prototype.get = sinon.stub()
exports.MockSession.prototype.post = sinon.stub()
exports.MockSession.prototype.put = sinon.stub()
exports.MockSession.prototype.delete = sinon.stub()
