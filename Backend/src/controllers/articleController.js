const Article = require('../models/article');

exports.createArticle = async (req, res, next) => {
  try {
    const article = await Article.create({
      ...req.body,
      author_user: req.user?.userId || null,
    });
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

exports.getArticles = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Article.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
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

exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
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
      data: null,
    });
  } catch (error) {
    next(error);
  }
};