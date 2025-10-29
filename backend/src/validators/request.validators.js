import Joi from 'joi';

export const createRequestSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  reason: Joi.string().allow('', null)
}).custom((value, helpers) => {
  const start = new Date(value.start_date);
  const end = new Date(value.end_date);
  if (end < start) {
    return helpers.error('any.invalid', 'end_date must be after start_date');
  }
  return value;
}, 'date order validation');

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Rejected').required(),
  comments: Joi.string().allow('', null)
});
