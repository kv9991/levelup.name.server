var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({ 
  slug: { 
    type: String,
    default: null
  }, 
  title: {
    type: String,
    default: null
  },
  type: { 
    type: String, 
    default: 'post',
    required: true
  },
  description: { 
    type: String,
    default: null
  },
  content: { 
    type: String
  },
  author: { 
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      default: null
    }, 
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  tags: [{
    type: String, 
    default: []
  }],
  likes: [{
    type: String, 
    ref: 'User',
    default: []
  }],
  image: { 
    type: String,
    default: null
  },
  comments: [{
    type: String, 
    ref: 'Comment', 
    default: []
  }],
  video: {
    type: String, 
    default: null
  },
  link: {
    type: String, 
    default: null
  },
  status: {
    type: String, 
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  updated: { 
    type: Date, 
    default: Date.now 
  }
});

postSchema.index({
  'title': 'text', 
  'description': 'text', 
  'content': 'text',
  'tags': 'text'
});

var Post = mongoose.model('Post', postSchema)
module.exports = Post;