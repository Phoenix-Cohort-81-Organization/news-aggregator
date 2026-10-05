const express = require("express");


   const {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');;

const { authenticate } = require("../middleware/authMiddleware");
const { validateArticle, validateArticleId } = require("../middleware/articleValidation");

const router = express.Router();

router.post("/", authenticate, validateArticle, createArticle);
router.get("/", getArticles);
router.get("/:id", validateArticleId, getArticleById);

router.put('/:id', authenticate, updateArticle);
router.delete('/:id', authenticate, deleteArticle);

module.exports = router;
