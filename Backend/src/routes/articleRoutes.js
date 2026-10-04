const express = require("express");

const {
    createArticle, 
    getArticles, 
    getArticleById 
} = require("../controllers/articleController");

const { authenticate } = require("../middleware/authMiddleware");
const { validateArticle, validateArticleId } = require("../middleware/articleValidation");

const router = express.Router();

router.post("/", authenticate, validateArticle, createArticle);
router.get("/", getArticles);
router.get("/:id", validateArticleId, getArticleById);

module.exports = router;
