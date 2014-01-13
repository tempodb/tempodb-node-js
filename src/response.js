var Response = function(resp, body) {
	this.headers = resp.headers;
	this.status = resp.statusCode;
	this.data = JSON.parse(body);
}
