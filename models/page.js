var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageSchema = new Schema({ 
    slug: {type: String}, 
    pageTitle: {type: String},
    pageClassnames: String,
    pageDescription: {type: String},
    pageShowTitle: Boolean,
    pageShowHeader: Boolean,
    pageShowSidebar: Boolean,
    userMustBeLoggedIn: { type: Boolean, default: false },
    passLevel: { type: Number,  default: 0 }
});

pageSchema.index({'pageTitle': 'text', 'slug': 'text'});
var Page = mongoose.model('Page', pageSchema)

module.exports = Page


