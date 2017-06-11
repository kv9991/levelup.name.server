var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({ 
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
    updated: { type: Date, default: Date.now }
});

postSchema.index({
    'postTitle': 'text', 
    'postDescription': 'text', 
    'postContent': 'text',
    'postTags': 'text'
});

var Post = mongoose.model('Post', postSchema)
module.exports = Post;