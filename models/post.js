var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Post', new Schema({ 
    slug: String, 
    postTitle: String,
    postDescription: String,
    postContent: String,
    postAuthor: String,
    postTags: Array,
    postLikes: Number,
    postFavorites: Array,
    postImage: String
}));

