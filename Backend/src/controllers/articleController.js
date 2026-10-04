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
        const articles = await Article.find();
        res.status(200).json({
            success: true,
            data: { articles },
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
