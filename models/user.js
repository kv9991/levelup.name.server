var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({ 
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
    userBio: String,
    userSocials: { type : Array , "default" : [] }, // Добавить каждой соц сети уникальный id
    userSubscribersCount: { type: Number, default: 0 },
    userSubscriptions: { authors: Array, tags: Array, blogs: Array },
    created: { type: Date, default: Date.now }
});

userSchema.index({
    'userName': 'text', 
    'userDescription': 'text', 
    'slug': 'text',
    'userBio': 'text',
    'userDescription': 'text'
});

var User = mongoose.model('User', userSchema)
module.exports = User
