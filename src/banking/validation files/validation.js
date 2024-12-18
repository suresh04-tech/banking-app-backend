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
  
    phonenum: Joi.number()
  .integer()
  .min(1000000000)
  .max(9999999999)
  .required()
  .messages({
    'number.base': 'Phone number must be a valid number.',
    'number.min': 'Phone number must be a 10-digit number.',
    'number.max': 'Phone number must be a 10-digit number.',
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

//createLoginSchema
const createLoginSchema=Joi.object({
  phonenum: Joi.number()
  .integer()
  .min(1000000000)
  .max(9999999999)
  .required()
  .messages({
    'number.base': 'Phone number must be a valid number.',
    'number.min': 'Phone number must be a 10-digit number.',
    'number.max': 'Phone number must be a 10-digit number.',
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
})

//updateUserSchema
const updateUserSchema = Joi.object({
   phonenum: Joi.number()
  .integer()
  .min(1000000000)
  .max(9999999999)
  .messages({
    'number.base': 'Phone number must be a valid number.',
    'number.min': 'Phone number must be a 10-digit number.',
    'number.max': 'Phone number must be a 10-digit number.',
    'any.required': 'Phone number is required.'
  }),

  username: Joi.string()
    .min(3)
    .max(30)
    .messages({
      'string.min': 'Username must be at least 3 characters.',
      'string.max': 'Username cannot exceed 30 characters.',
      'string.empty': 'Username cannot be empty.',
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.',
      'string.empty': 'Password cannot be empty.',
    }),
})

//transaction validation schema
const transactionSchema=Joi.object({
  withdraw:Joi.number()
  .integer() 
  .messages({
    'number.base': 'deposit must be a valid number.',
    'any.required': 'Phone number is required.'
})
})

export {createAccountSchema,createLoginSchema,updateUserSchema,transactionSchema};
