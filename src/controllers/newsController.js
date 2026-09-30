const { searchNews } = require('../services/newsService');

exports.searchNews = async (req, res, next) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const requestedPageSize = Number.parseInt(req.query.pageSize, 10) || 10;
    const pageSize = Math.min(Math.max(requestedPageSize, 1), 50);
    const result = await searchNews({
      query,
      pageSize,
      from: req.query.from,
      to: req.query.to,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};