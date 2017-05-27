var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Post', new Schema({ 
    slug: String, 
    storage: String,
    postTitle: String,
    postDescription: String,
    postContent: String,
    postAuthor: String,
    postTags: Array,
    postLikes: Array,
    postFavorites: Array,
    postImage: String,
    updated: {
    	type: Date,
    	default: Date.now
    }
}));

