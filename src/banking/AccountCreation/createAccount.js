import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'; 
import Database from '../Database file/DBfunction.js';
import {createAccountSchema} from '../validation files/validation.js'

const router = express.Router();
const db = new Database();

router.post('/createAccount', async (req, res) => {
  const { username, phonenum, password, deposit } = req.body;

  
  const { error } = createAccountSchema.validate({ username, phonenum, password, deposit });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    await db.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10); 

    const uuid = uuidv4();
    const accountNumber = await db.generateUniqueAccountNumber();
    const timestamp = new Date().toISOString();

    await db.insertCustomer({ username, phonenum, password: hashedPassword, uuid });
    await db.insertUserAccount({ uuid, accountNumber, timestamp, ava_bal: deposit, deposit });

    await db.commitTransaction();
    res.status(201).json({ message: 'Account created successfully', accountNumber });
  } catch (err) {
    await db.rollbackTransaction();
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await db.release();
  }
});

export default router;
