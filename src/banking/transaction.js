import express from 'express';
import Database from '../banking/DBfunction.js';

const router = express.Router();
const db = new Database();

router.post('/', async (req, res) => {
  const { accountNumber, password, deposit = 0, withdraw = 0 } = req.body;
  const Deposit = Number(deposit);

  if (!accountNumber || !password || (Deposit === 0 && withdraw === 0)) {
    return res.status(400).json({
      error: 'accountNumber, password, and deposit or withdraw are required.',
    });
  }

  let client;

  try {
    client = await db.createClient();
    await client.query('BEGIN');

    const accountResult = await db.getAccountDetails(client, accountNumber);
    if (accountResult.rows === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accountResult.rows[0];

    if (account.password !== password) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Invalid password' });
    }

    const userAccountResult = await db.userAccountDetail(client, accountNumber);
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

    await db.updateUserBalance(client, accountNumber, newBalance);

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
