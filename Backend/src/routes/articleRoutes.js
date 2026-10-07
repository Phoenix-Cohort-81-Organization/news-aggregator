const express = require('express');
const {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const {
  validateArticle,
  validateArticleUpdate,
  validateArticleId,
} = require('../middleware/articleValidation');

const router = express.Router();

router.get('/', getArticles);
router.get('/:id', validateArticleId, getArticleById);
router.post('/', authenticate, requireRole('editor', 'admin'), validateArticle, createArticle);
router.put('/:id', authenticate, requireRole('editor', 'admin'), validateArticleId, validateArticleUpdate, updateArticle);
router.delete('/:id', authenticate, requireRole('admin'), validateArticleId, deleteArticle);

module.exports = router;