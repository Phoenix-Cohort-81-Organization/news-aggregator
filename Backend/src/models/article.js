const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    content: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: [true, 'Article URL is required'],
      unique: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    author: {
      type: String,
      default: null,
      trim: true,
    },
    source: {
      type: String,
      default: null,
    },
    section: {
      type: String,
      default: null,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
      enum: [
        'politics',
        'business',
        'entertainment',
        'general',
        'health',
        'science',
        'sports',
        'technology',
        'world',
        'lifestyle',
        'fashion',
        'travel',
        'food',
        'culture',
        'education',
        'environment',
        'opinion',
        'other',
      ],
      index: true,
    },
    language: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'en',
    },
    publishedAt: {
      type: Date,
      required: [true, 'Article published date is required'],
      index: true,
    },
    author_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.index({ publishedAt: -1 });
articleSchema.index({ category: 1, publishedAt: -1 });

articleSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
});

module.exports = mongoose.model('Article', articleSchema);