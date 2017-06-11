var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({ 
    slug: {type: String}, 
    blogTitle: {type: String},
    blogDescription: {type: String},
    blogOwner: String,
    blogTags: Array,
    blogLikes: Array,
    blogImage: String,
    created: { type: Date, default: Date.now }
});

blogSchema.index({'blogTitle': 'text', 'blogTags': 'text', 'blogDescription': 'text'});
var Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog


