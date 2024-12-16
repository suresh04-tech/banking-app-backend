import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Database from '../banking/queryDb.js';
import createAccountSchema from '../banking/validation.js';

const router = express.Router();
const db = new Database();

router.post('/', async (req, res, next) => {
  const { username, phonenum, password, deposit: rawDeposit } = req.body;
  const deposit = Number(rawDeposit);

  const { error } = createAccountSchema.validate({ username, phonenum, password, deposit });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  if (isNaN(deposit) || deposit < 1000) {
    return res.status(400).json({ error: 'Deposit must be a number greater than or equal to 1000.' });
  }

  try {
    await db.beginTransaction();

    const uuid = uuidv4();
    const accountNumber = await db.generateUniqueAccountNumber();
    const timestamp = new Date().toISOString();

    await db.insertCustomer({ username, phonenum, password, uuid });
    await db.insertUserAccount({ uuid, accountNumber, timestamp, ava_bal: deposit, deposit });

    await db.commitTransaction();

    res.status(201).json({ message: 'Account created successfully', accountNumber });
  } catch (err) {
    await db.rollbackTransaction();
    next(err);
  } finally {
    await db.release();
  }
});

export default router;
