module.exports = new function() {
	var config = this;
	this.dev = true;
	this.protocol = "http://"
	this.port = 3001;
	this.host = this.dev ? "127.0.0.1" : "Your Host Ip"; 
	this.secret = "Your Secret Key"
	this.root = this.protocol + this.host + ":" + this.port;
	this.storage = this.root + "/storage/"
	this.db = new function() {
		this.name = "Database Name";
		this.port = "27017"
		this.host = "mongodb://" + this.host + ":" + this.port + "/" + this.name
	}
};