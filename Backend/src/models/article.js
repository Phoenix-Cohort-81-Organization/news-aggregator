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
    name: {
      type: String,
      required: [true, 'Article name is required'],
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
    externalId: {
      type: String,
      unique: true,
      trim: true,
    },
    publishedAt: {
      type: Date,
      required: [true, 'Article published date is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.index({ publishedAt: -1 });
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ 'source.name': 1, publishedAt: -1 });

articleSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.updateArticle = async ...
exports.deleteArticle = async ...
