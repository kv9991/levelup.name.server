module.exports = new function() {
  this.database = 'mongodb://localhost:27017/app';
	this.secret = 'mySecretKey';
	this.port = 3001;
	this.root = 'http://localhost:' + this.port + '/';
  this.storage = this.root + 'storage/';
};