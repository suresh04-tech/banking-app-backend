import Joi from 'joi';

const customerSchema = Joi.object({
    username: Joi.string().min(3).max(255).required().messages({
        'string.empty': 'Username is required.',
        'string.min': 'Username must be at least 3 characters.',
        'any.required': 'Username is required.',
    }),
    phonenum: Joi.string().pattern(/^\d{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be a 10-digit number.',
        'any.required': 'Phone number is required.',
    }),
    password: Joi.string().min(6).max(255).required().messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 6 characters.',
        'any.required': 'Password is required.'
    }),
    ava_bal: Joi.number().optional().allow(null),
    deposit: Joi.number().optional().allow(null),
    withdraw: Joi.number().optional().allow(null),
});

export default customerSchema;
