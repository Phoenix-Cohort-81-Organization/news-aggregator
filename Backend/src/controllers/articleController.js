const Article = require('../models/article');

exports.createArticle = async (req, res, next) => {
    try {
        const article = await Article.create(req.body);
        res.status(201).json({
            success: true,
            data: { article },
        });
    } catch (error) {
        next(error);
    }
};

exports.getArticles = async (req, res, next) => {
  try {
    // Search
    const search = typeof req.query.search === 'string'
      ? req.query.search.trim()
      : '';

    // Category filter
    const category = typeof req.query.category === 'string'
      ? req.query.category.trim().toLowerCase()
      : '';

    // Pagination
    const requestedPage = Number.parseInt(req.query.page, 10) || 1;
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;

    const page = Math.max(requestedPage, 1);
    const limit = Math.min(Math.max(requestedLimit, 1), 50);
    const skip = (page - 1) * limit;

    // Build database query
    const query = {};

    if (search) {
      query.$text = {
        $search: search,
      };
    }

    if (category) {
      query.category = category;
    }

    // Get total number of matching articles
    const total = await Article.countDocuments(query);

    // Get articles
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
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
