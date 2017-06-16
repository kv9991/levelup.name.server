var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({ 
    slug: String, 
    storage: String,
    postTitle: String,
    postType: {type: String, default: 'post'},
    postDescription: String,
    postContent: String,
    postAuthor: {authorType: {type: String, default: 'user'}, authorID: String},
    postTags: Array,
    postLikes: Array,
    postFavorites: Array,
    postImage: String,
    postCommentsCount: {type: Number, default : 0},
    postVideo: {type: String, default: null},
    postLink: {type: String, default: null},
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