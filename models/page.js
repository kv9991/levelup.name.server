var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Page', new Schema({ 
    slug: String, 
    pageClassnames: String,
    pageTitle: String,
    pageDescription: String,
    pageShowTitle: Boolean,
    pageShowHeader: Boolean,
    pageShowSidebar: Boolean
}));
