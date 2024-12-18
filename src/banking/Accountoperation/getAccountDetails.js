import express from 'express';
import Database from '../Database file/DBfunction.js';

const router = express.Router();
const db = new Database();

router.get('/getAccountDetail', async (req, res) => {
  const uuid=req.user.id;
  console.log(uuid);
  try {

    if (!uuid) {
      return res.status(400).json({ error: 'uuid' });
    }

    const accountDetails = await db.getAccDetail(uuid);
    console.log(accountDetails)

    res.status(200).json(accountDetails);
  } catch (error) {
    console.error('Error in /getAccountDetails:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
