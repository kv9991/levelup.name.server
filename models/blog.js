var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({ 
    slug: { type: String }, 
    blogTitle: { type: String },
    blogDescription: { type: String },
    blogOwner: { type: String },
    blogStaff: { type: Array, default: [] },
    blogTags: Array,
    blogLikes: Array,
    blogImage: String,
    blogSubscribersCount: {type: Number, default: 0 },
    created: { type: Date, default: Date.now }
});

blogSchema.index({'blogTitle': 'text', 'blogTags': 'text', 'blogDescription': 'text'});
var Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog


