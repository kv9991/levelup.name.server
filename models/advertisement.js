import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const advertisementSchema = new Schema({ 
  title: {
    type: String,
    required: true
  },
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: [{
    type: Schema.Types.ObjectId,
    ref: 'Click',
    default: []
  }],
  link: {
    type: String,
    required: true
  },
  displayLink: {
    type: String,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema)
export default Advertisement


