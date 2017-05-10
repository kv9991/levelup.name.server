var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({ 
    slug: String, 
    userName: String,
    userEmail: String,
    userGender: String,
    userRole: String,
    userPassword: String
}));

