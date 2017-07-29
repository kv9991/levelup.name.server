var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({ 
  slug: { 
    type: String,
    required: true
  }, 
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  owner: {
    type: String,
    required: true
  },
  staff: {
    type: Array, 
    default: []
  },
  tags: { 
    type: Array,
    default: []
  },
  posts: [{
    type: Schema.Types.ObjectId,
    default: [],
    ref: 'Post'
  }],
  image: {
    type: String,
    default: null
  },
  subscribers: {
    type: Number, 
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  }
});

blogSchema.index({
  'title': 'text', 
  'tags': 'text', 
  'description': 'text'
});

var Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog


