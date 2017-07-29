var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({ 
  slug: {
    type: String,
    required: true
  },  
  description: {
    type: String,
    default: null
  }, 
  fullName: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true
  }, 
  gender: {
    type: String
  }, 
  role: { 
    type: String,
    default: 'user'
  },
  image: {
    type: String,
    default: null
  }, 
  password: {
    type: String, 
    required: true
  },
  company: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  }, 
  score: {
    type: Number, 
    default: 0
  },
  rate: {
    type: Number,
    default: 0
  },
  socials: [{ 
    type: Schema.Types.ObjectId,
    ref: 'Social',
    default : [] 
  }],
  subscriptions: {
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [] 
    }],
    blogs: [{
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      default: [] 
    }],
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      default: [] 
    }]
  },
  pocket: {
    type: Number,
    default: 0
  },
  updated: { 
    type: Date, 
    default: Date.now 
  },
  subscribers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
});

userSchema.index({
  'fullName': 'text', 
  'description': 'text', 
  'slug': 'text',
  'bio': 'text',
  'description': 'text'
});

var User = mongoose.model('User', userSchema)
module.exports = User
