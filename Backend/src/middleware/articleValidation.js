const mongoose = require('mongoose');

const ARTICLE_FIELDS = new Set([
  'title',
  'description',
  'content',
  'url',
  'imageUrl',
  'author',
  'source',
  'name',
  'category',
  'language',
  'publishedAt',
  'externalId',
]);

const REQUIRED_FIELDS = ['title', 'url', 'name', 'publishedAt'];
const STRING_FIELDS = [
  'title',
  'description',
  'content',
  'url',
  'imageUrl',
  'author',
  'source',
  'name',
  'category',
  'language',
  'externalId',
];

const sendValidationError = (res, errors) => res.status(400).json({
  success: false,
  message: 'Invalid article data',
  errors,
});

exports.validateArticle = (req, res, next) => {
  const { body } = req;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return sendValidationError(res, ['Request body must be a JSON object']);
  }

  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      errors.push(`${field} is required`);
    }
  }

  for (const field of STRING_FIELDS) {
    const value = body[field];
    if (value !== undefined && value !== null && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
  }

  if (body.publishedAt !== undefined && body.publishedAt !== null) {
    const isValidDateType = typeof body.publishedAt === 'string' || typeof body.publishedAt === 'number';
    if (!isValidDateType || (typeof body.publishedAt === 'string' && !body.publishedAt.trim())
      || Number.isNaN(new Date(body.publishedAt).getTime())) {
      errors.push('publishedAt must be a valid date');
    }
  }

  const unknownFields = Object.keys(body).filter((field) => !ARTICLE_FIELDS.has(field));
  if (unknownFields.length > 0) {
    errors.push(`Unknown article field${unknownFields.length > 1 ? 's' : ''}: ${unknownFields.join(', ')}`);
  }

  if (errors.length > 0) return sendValidationError(res, errors);
  return next();
};

exports.validateArticleId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid article ID' });
  }
  return next();
};
