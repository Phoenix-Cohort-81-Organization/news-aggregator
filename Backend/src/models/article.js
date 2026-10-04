const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
  type: String,
  required: true,
  trim: true,
},
  description: {
  type: String,
  default: null,
  trim: true,
},
  url: {
  type: String,
  required: true,
  trim: true,
},
  imageUrl: {
  type: String,
  default: null,
  trim: true,
}, 
  publishedAt: {
  type: Date,
  required: true,
},
  author: {
  type: String,
  default: null,
  trim: true,
},
  section: {
  type: String,
  default: null,
  trim: true,
},
     provider: {
      type: String,
      required: true,
      enum: ['gnews', 'guardian'],
    },
  }
);

module.exports = mongoose.model('Article', articleSchema);