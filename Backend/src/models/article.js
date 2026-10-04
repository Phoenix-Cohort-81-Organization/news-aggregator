const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Article title is required"],
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        content: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            required: [true, "Article URL is required"],
            unique: true,
            trim: true      
        },
        imageUrl: {
            type: String,
            default: "" 
        },
        author: {
            type: String,
            default: "Anonymous",
            trim: true
        },
        source: {
            type: String,
            default: "null",
        },
        name: {
            type: String,
            required: [true, "Article name is required"],
            trim: true
        },
        category: {
            type: String,
            trim: true,
            lowercase: true,
            index: true
        },
        language: {
            type: String,
            trim: true,
            lowercase: true,
            default: "en"
        },
        publishedAt: {
            type: Date,
            required: [true, "Article published date is required"],
            index: true
        },
        externalId:{
            type: String,
            unique: true,
            trim: true
        },

    },
    {
        timestamps: true
    }
);

articleSchema.index({ publishedAt: -1 });

articleSchema.index({ category: 1, publishedAt: -1 });

articleSchema.index({ "source.name": 1, publishedAt: -1 });

articleSchema.index({
    title: "text",
    description: "text",
    content: "text",
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;