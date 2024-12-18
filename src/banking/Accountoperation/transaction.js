import express from 'express';
import Database from '../Database file/DBfunction.js';

const router = express.Router();
const db = new Database();

router.post('/transaction', async (req, res) => {
  const uuid = req.user.id;
  console.log(uuid)
  const { deposit = 0, withdraw = 0 } = req.body;
  const Deposit = Number(deposit);

  if ((Deposit === 0 && withdraw === 0)) {
    return res.status(400).json({
      error: 'Deposit or withdraw are required.',
    });
  }

  let client;

  try {
    client = await db.createClient();
    await client.query('BEGIN');

    const accountResult = await db.getAccountDetails(client, uuid);
    if (accountResult.rows === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accountResult.rows[0];
    console.log('ACCOUNT Detial',account)

    if (account.id !== uuid) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Invalid Account Transaction' });
    }

    const userAccountResult = await db.userAccountDetail(client, uuid);
    const currentBalance = userAccountResult.rows[0].ava_bal;

    let newBalance;

    if (Deposit > 0) {
      newBalance = Number(currentBalance) + Deposit;
    } else if (withdraw > 0) {
    
      if (currentBalance <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds, cannot withdraw from a zero balance' });
      }
    
      if (currentBalance < withdraw) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds' });
      }
    
      newBalance = currentBalance - withdraw;
    }

    await db.updateUserBalance(client, uuid, newBalance);

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Transaction successful',
      transactionType: Deposit > 0 ? 'Deposit' : 'Withdrawal',
      newBalance,
    });
  } catch (err) {
    console.error('Transaction Error:', err);

    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback Error:', rollbackError);
      }
    }

    res.status(500).json({ error: 'Transaction failed' });
  }
});

export default router;
