const { getTopHeadlines, searchNews } = require('../services/newsService');

const GNEWS_CATEGORIES = new Set([
  'general',
  'world',
  'nation',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health',
]);

const GNEWS_COUNTRIES = [
  { code: 'au', name: 'Australia' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'cn', name: 'China' },
  { code: 'eg', name: 'Egypt' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'gr', name: 'Greece' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'in', name: 'India' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'no', name: 'Norway' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'pe', name: 'Peru' },
  { code: 'ph', name: 'Philippines' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ro', name: 'Romania' },
  { code: 'ru', name: 'Russia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'es', name: 'Spain' },
  { code: 'se', name: 'Sweden' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
];

const NEWS_SECTIONS = [
  { slug: 'news', label: 'News', mode: 'headlines', category: 'general' },
  { slug: 'sport', label: 'Sport', mode: 'headlines', category: 'sports' },
  { slug: 'business', label: 'Business', mode: 'headlines', category: 'business' },
  { slug: 'technology', label: 'Technology', mode: 'headlines', category: 'technology' },
  { slug: 'health', label: 'Health', mode: 'headlines', category: 'health' },
  { slug: 'culture', label: 'Culture', mode: 'headlines', category: 'entertainment' },
  { slug: 'art', label: 'Art', mode: 'search', query: 'art news' },
  { slug: 'travel', label: 'Travel', mode: 'search', query: 'travel news' },
  { slug: 'earth', label: 'Earth', mode: 'headlines', category: 'science' },
  { slug: 'audio', label: 'Audio', mode: 'search', query: 'audio news' },
  { slug: 'video', label: 'Video', mode: 'search', query: 'video news' },
  { slug: 'live', label: 'Live', mode: 'search', query: 'live news' },
];

const countryCodes = new Set(GNEWS_COUNTRIES.map(({ code }) => code));

exports.getNewsFilters = (req, res) => {
  res.json({
    success: true,
    data: {
      sections: NEWS_SECTIONS,
      countries: GNEWS_COUNTRIES,
      gnewsCategories: [...GNEWS_CATEGORIES],
    },
  });
};

exports.getSectionNews = async (req, res, next) => {
  try {
    const section = NEWS_SECTIONS.find((item) => item.slug === req.params.section);
    if (!section) {
      return res.status(404).json({ success: false, message: 'News section not found' });
    }

    const country = typeof req.query.country === 'string' ? req.query.country.toLowerCase() : undefined;
    if (country && !countryCodes.has(country)) {
      return res.status(400).json({ success: false, message: 'Unsupported GNews country code' });
    }

    const requestedPageSize = Number.parseInt(req.query.pageSize, 10) || 10;
    const pageSize = Math.min(Math.max(requestedPageSize, 1), 50);

    if (section.mode === 'headlines') {
      const requestedPage = Number.parseInt(req.query.page, 10) || 1;
      const maxPage = Math.ceil(1000 / pageSize);
      const page = Math.min(Math.max(requestedPage, 1), maxPage);
      const result = await getTopHeadlines({
        category: section.category,
        country,
        page,
        pageSize,
      });
      return res.json({ success: true, data: { ...result, section } });
    }

    const result = await searchNews({
      query: section.query,
      pageSize,
      country,
    });
    return res.json({ success: true, data: { ...result, section } });
  } catch (error) {
    return next(error);
  }
};

exports.getTopHeadlines = async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string'
      ? req.query.category.toLowerCase()
      : 'general';
    if (!GNEWS_CATEGORIES.has(category)) {
      return res.status(400).json({ success: false, message: 'Unsupported GNews top-headlines category' });
    }

    const country = typeof req.query.country === 'string' ? req.query.country.toLowerCase() : undefined;
    if (country && !countryCodes.has(country)) {
      return res.status(400).json({ success: false, message: 'Unsupported GNews country code' });
    }

    const requestedPage = Number.parseInt(req.query.page, 10) || 1;
    const requestedPageSize = Number.parseInt(req.query.pageSize, 10) || 10;
    const pageSize = Math.min(Math.max(requestedPageSize, 1), 50);
    const maxPage = Math.ceil(1000 / pageSize);
    const result = await getTopHeadlines({
      category,
      country,
      page: Math.min(Math.max(requestedPage, 1), maxPage),
      pageSize,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

exports.searchNews = async (req, res, next) => {
  try {
    const query = typeof req.query.q === 'string'
      ? req.query.q.trim()
      : '';

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const requestedPage = req.query.page !== undefined
  ? Number(req.query.page)
  : 1;

const requestedPageSize = req.query.pageSize !== undefined
  ? Number(req.query.pageSize)
  : 10;

if (!Number.isInteger(requestedPage) || requestedPage < 1) {
  return res.status(400).json({
    success: false,
    message: 'Page must be a positive integer',
  });
}

if (!Number.isInteger(requestedPageSize) || requestedPageSize < 1 || requestedPageSize > 50) {
  return res.status(400).json({
    success: false,
    message: 'Page size must be an integer between 1 and 50',
  });
}

    if (requestedPage < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be at least 1',
      });
    }

    if (requestedPageSize < 1 || requestedPageSize > 50) {
      return res.status(400).json({
        success: false,
        message: 'Page size must be between 1 and 50',
      });
    }

    const from = typeof req.query.from === 'string'
  ? req.query.from.trim()
  : undefined;

const to = typeof req.query.to === 'string'
  ? req.query.to.trim()
  : undefined;

if (from && Number.isNaN(Date.parse(from))) {
  return res.status(400).json({
    success: false,
    message: 'Invalid from date',
  });
}

if (to && Number.isNaN(Date.parse(to))) {
  return res.status(400).json({
    success: false,
    message: 'Invalid to date',
  });
}

if (from && to && new Date(from) > new Date(to)) {
  return res.status(400).json({
    success: false,
    message: 'From date cannot be later than to date',
  });
}

    const country = typeof req.query.country === 'string'
      ? req.query.country.toLowerCase()
      : undefined;

    if (country && !countryCodes.has(country)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported GNews country code',
      });
    }

    const result = await searchNews({
      query,
      pageSize: requestedPageSize,
      page: requestedPage,
      from,
      to,
      country,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
