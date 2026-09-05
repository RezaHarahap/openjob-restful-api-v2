const Joi = require('joi');

const user = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user', 'admin', 'recruiter').default('user'),
});
const userUpdate = Joi.object({
  name: Joi.string().trim().min(1),
  email: Joi.string().trim().email(),
  password: Joi.string().min(8),
  role: Joi.string().valid('user', 'admin', 'recruiter'),
}).min(1);
const company = Joi.object({
  name: Joi.string().trim().min(1).required(),
  location: Joi.string().trim().min(1).required(),
  description: Joi.string().allow('', null).optional(),
});
const category = Joi.object({ name: Joi.string().trim().min(1).required() });
const jobFields = {
  company_id: Joi.string().required(), category_id: Joi.string().required(), title: Joi.string().trim().min(1).required(),
  description: Joi.string().allow('', null).optional(), job_type: Joi.string().allow('', null).optional(),
  experience_level: Joi.string().allow('', null).optional(), location_type: Joi.string().allow('', null).optional(),
  location_city: Joi.string().allow('', null).optional(), salary_min: Joi.number().integer().min(0).allow(null).optional(),
  salary_max: Joi.number().integer().min(0).allow(null).optional(), is_salary_visible: Joi.boolean().default(false),
  status: Joi.string().valid('open', 'close', 'closed').default('open'),
};
const validateSalaryRange = (value, helpers) => (
  value.salary_min != null && value.salary_max != null && value.salary_min > value.salary_max
    ? helpers.error('any.invalid')
    : value
);
const createJob = Joi.object(jobFields).custom(validateSalaryRange);
const updateJob = Joi.object({
  company_id: Joi.string(),
  category_id: Joi.string(),
  title: Joi.string().trim().min(1),
  description: Joi.string().allow('', null),
  job_type: Joi.string().allow('', null),
  experience_level: Joi.string().allow('', null),
  location_type: Joi.string().allow('', null),
  location_city: Joi.string().allow('', null),
  salary_min: Joi.number().integer().min(0).allow(null),
  salary_max: Joi.number().integer().min(0).allow(null),
  is_salary_visible: Joi.boolean(),
  status: Joi.string().valid('open', 'close', 'closed'),
}).min(1).custom(validateSalaryRange);
const application = Joi.object({
  user_id: Joi.string().required(), job_id: Joi.string().required(), status: Joi.string().valid('pending','accepted','rejected').default('pending'),
});
const applicationStatus = Joi.object({ status: Joi.string().valid('pending','accepted','rejected').required() });
const login = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
const refresh = Joi.object({ refreshToken: Joi.string().required() });

module.exports = { user, userUpdate, company, category, createJob, updateJob, application, applicationStatus, login, refresh };
