import express from 'express';
import Database from '../banking/DBfunction.js';

const router = express.Router();
const db = new Database();

router.put('/updateAccount', async (req, res) => {
  console.log('from updateAPI',req.user);
  const { accountNumber, phonenum, username, password } = req.body; 


  if (!accountNumber) {
    return res.status(400).json({ error: 'Account number is required.' });
  }

  if (!phonenum && !username && !password) {
    return res.status(400).json({ error: 'At least one field is required to update.' });
  }

  try {

    if (phonenum) await db.updateUserFieldByAccountNumber('phonenum', phonenum, accountNumber);
    if (username) await db.updateUserFieldByAccountNumber('username', username, accountNumber);
    if (password) await db.updateUserFieldByAccountNumber('password', password, accountNumber);

    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    console.error("Error updating user details:", err.message);
    res.status(500).json({ error: 'Failed to update user details.' });
  }
});

export default router;
