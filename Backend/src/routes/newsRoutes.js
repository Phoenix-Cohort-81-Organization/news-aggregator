const express = require('express');
const {
  getNewsFilters,
  getSectionNews,
  getTopHeadlines,
  searchNews,
} = require('../controllers/newsController');

const router = express.Router();
router.get('/filters', getNewsFilters);
router.get('/headlines', getTopHeadlines);
router.get('/sections/:section', getSectionNews);
router.get('/', searchNews);

module.exports = router;