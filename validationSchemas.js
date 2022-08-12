const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
      'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
      escapeHTML: {
          validate(value, helpers) {
              const clean = sanitizeHtml(value, {
                  allowedTags: [],
                  allowedAttributes: {},
              });
              if (clean !== value) return helpers.error('string.escapeHTML', { value })
              return clean;
          }
      }
  }
});

const JOI = BaseJoi.extend(extension);

module.exports.locationSchema = JOI.object({
  location: JOI.object({
    title: JOI.string().required().escapeHTML(),
    price: JOI.number().required().min(0),
    location: JOI.string().required().escapeHTML(),
    description: JOI.string().required().escapeHTML(),
  }).required(),
  deleteImages: JOI.array()
});

module.exports.reviewSchema = JOI.object({
  review: JOI.object({
    rating: JOI.number().required().min(0).max(5),
    body: JOI.string().required().escapeHTML()
  }).required()
});