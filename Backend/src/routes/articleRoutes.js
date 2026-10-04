const express = require("express");

const {
    createArticle, 
    getArticles, 
    getArticleById 
} = require("../controllers/articleController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createArticle);
router.get("/", getArticles);
router.get("/:id", getArticleById);

module.exports = router;