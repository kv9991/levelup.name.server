var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({ 
    slug: String, 
    userDescription: String,
    userName: String,
    userEmail: String,
    userGender: String,
    userRole: String,
    userImage: String,
    userPassword: String,
    userCompany: String,
    userDescription: String,
    userBio: String
}));

