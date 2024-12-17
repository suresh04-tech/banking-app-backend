import express from 'express';
import Database from '../banking/DBfunction.js';

const router = express.Router();
const db = new Database();

router.get('/getAccountDetail', async (req, res) => {
  console.log(req.user);
  try {
    let { accountNumber } = req.body;

    if (!accountNumber || isNaN(accountNumber)) {
      return res.status(400).json({ error: 'Invalid accountNumber' });
    }

    accountNumber = BigInt(accountNumber);
    console.log(accountNumber);

    const accountDetails = await db.getAccDetail(accountNumber);
    console.log(accountDetails)

    res.status(200).json(accountDetails);
  } catch (error) {
    console.error('Error in /getAccountDetails:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
