import Joi from 'joi';

const createAccountSchema = Joi.object({
  username: Joi.string().min(3).max(30).required()
    .messages({
      'string.base': 'Username must be a string.',
      'string.empty': 'Username cannot be empty.',
      'string.min': 'Username must be at least 3 characters long.',
      'string.max': 'Username cannot exceed 30 characters.',
      'any.required': 'Username is required.'
    }),
  
  phonenum: Joi.string().pattern(/^[0-9]{10}$/).required()
    .messages({
      'string.pattern.base': 'Phone number must be a 10-digit number.',
      'string.empty': 'Phone number cannot be empty.',
      'any.required': 'Phone number is required.'
    }),

  password: Joi.string().min(6).required()
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}|;:'",<>\.?/-]).*$/) // Regex for at least one uppercase letter, one number, and one special character
    .messages({
      'string.base': 'Password must be a string.',
      'string.empty': 'Password cannot be empty.',
      'string.min': 'Password must be at least 6 characters long.',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one number, and one special character.',
      'any.required': 'Password is required.'
    }),

  deposit: Joi.number().empty('').required().min(1000)
    .messages({
      'number.base': 'Deposit must be a number.',
      'number.min': 'Deposit must be at least 1000.',
      'any.required': 'Deposit is required.'
    }),
});

export default createAccountSchema;
