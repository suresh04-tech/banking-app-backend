import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import Database from '../Database file/DBfunction.js';
import dotenv from 'dotenv';
import { createLoginSchema } from '../validation files/validation.js';


dotenv.config();
console.log("secret Key",process.env.SECRET_KEY)
const router = express.Router();
const db = new Database();


router.post('/login', async (req, res) => {
  const { phonenum, password } = req.body;

  const { error } = createLoginSchema.validate({ phonenum, password});
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {

    const user = await db.getCustomerByPhone(phonenum);
     console.log('from Login API',user.rows[0])
    if (!user || user.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    const userPassword = userData.password;

    const isMatch = await bcrypt.compare(password, userPassword);

    if (isMatch) {
    
      const token = jwt.sign(
        { id: userData.id, phonenum: userData.phonenum }, process.env.SECRET_KEY
      );


      res.status(200).json({ message: 'Login successful', token });
    } else {
      return res.status(400).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
