var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({ 
    slug: String, 
    tagTitle: String,
    tagDescription: String,
    tagImage: String,
    tagSubscribersCount: { type: Number, default: 0 },
    created: { type: Date,default: Date.now }
});

tagSchema.index({
    'tagTitle': 'text', 
    'tagDescription': 'text', 
    'slug': 'text'
});

var Tag = mongoose.model('Tag', tagSchema)
module.exports = Tag
