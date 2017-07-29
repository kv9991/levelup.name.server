import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const campaignSchema = new Schema({ 
  title: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    default: 0
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dating: {
    start: {
      type: Date,
      default: Date.now
    },
    end: {
      type: Date,
      default: null
    }
  },
  targeting: {
    age: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 100
      }
    },
    gender: {
      type: String,
      default: null
    }
  },
  advertisements: [{
    type: Schema.Types.ObjectId,
    ref: 'Advertisement',
    default: []
  }],
  status: {
    type: String,
    default: 'published'
  },
  limits: {
    day: {
      clicks: {
        type: Number,
        default: null
      },
      budget: {
        type: Number,
        default: null
      },
      views: {
        type: Number,
        default: null
      }
    },
    week: {
      clicks: {
        type: Number,
        default: null
      },
      budget: {
        type: Number,
        default: null
      },
      views: {
        type: Number,
        default: null
      }
    }
  },
  handMode: {
    type: Boolean,
    default: false
  },
  placements: {
    blogs: [{
      type: Schema.Types.ObjectId,
      default: [],
      ref: 'Blog'
    }],
    users: [{
      type: Schema.Types.ObjectId,
      default: [],
      ref: 'User'
    }]
  },
  clicks: [{
    type: Schema.Types.ObjectId,
    ref: 'Click',
    default: []
  }],
  tags: [{
    type: String,
    default: []
  }],
  created: {
    type: Date,
    default: Date.now
  }
});


const clickSchema = new Schema({ 
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  advertisement: {
    type: Schema.Types.ObjectId,
    ref: 'advertisement'
  },
  cost: {
    type: Number,
    default: 0
  },
  ip: {
    type: String
  },
  country: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const Click = mongoose.model('Click', clickSchema)
const Campaign = mongoose.model('Campaign', campaignSchema)
export default Campaign


