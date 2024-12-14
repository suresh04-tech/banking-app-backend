import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from './dbconnection.js';
import customerSchema from '../banking/validation.js';
import Database from '../banking/queryDb.js';

const app = express();
app.use(express.json());

const db=new Database()



app.post('/createacc', async (req, res) => {
  const { username, phonenum, password, deposit: rawDeposit } = req.body;
  const deposit = Number(rawDeposit);

  const { error } = customerSchema.validate({ username, phonenum, password, deposit });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  if (isNaN(deposit) || deposit < 1000) {
    return res.status(400).json({ error: 'Deposit must be a number greater than or equal to 1000.' });
  }
  // const client = await pool.connect();
  
  try {
    await db.query('BEGIN');

    const uuid = uuidv4();
    const accountNumber = await db.generateUniqueAccountNumber(client);
    const timestamp = new Date().toISOString();
    console.log(accountNumber)

    await db.insertCustomer( { username, phonenum, password, uuid });
    await db.insertUserAccount({ uuid, accountNumber, timestamp, balance: deposit, deposit });

    await db.query('COMMIT');

    res.status(201).json({ message: 'Account created successfully', accountNumber });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating account:', err);
    res.status(500).json({ error: 'Failed to create account' });
  } finally {
    db.release();
  }
});

app.get('/getdata', async (req, res) => {
  const { accountNumber } = req.body;
  const client = await pool.connect();

  try {
    const result = await db.getAccountDetails(client, accountNumber);
    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Successfully fetched data', data: result.rows });
    } else {
      res.status(404).json({ message: 'No data found for the given account number' });
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Failed to fetch data' });
  } finally {
    client.release();
  }
});

app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { phonenum, username, password } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID is required.' });
  }

  if (!phonenum && !username && !password) {
    return res.status(400).json({ error: 'At least one field is required to update.' });
  }

  const client = await pool.connect();

  try {
    if (phonenum) await db.updateUserField(client, 'phonenum', phonenum, id);
    if (username) await db.updateUserField(client, 'username', username, id);
    if (password) await db.updateUserField(client, 'password', password, id);

    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    console.error('Error updating:', err);
    res.status(500).json({ message: 'Failed to update' });
  } finally {
    client.release();
  }
});

app.delete('/delete-user', async (req, res) => {
  const { accountNumber } = req.body;
  const client = await pool.connect();


  try {
    await client.query('BEGIN');

    const uuidResult = await db.getUuidById(client, accountNumber);
    if (uuidResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No user found with the given ID' });
    }

    const { uuid } = uuidResult.rows[0];
    await db.deleteUserAccount(client, uuid);
    await db.deleteCustomer(client, uuid);

    await client.query('COMMIT');
    res.status(200).json({ message: 'User and related records deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during deletion:', err);
    res.status(500).json({ error: 'Failed to delete user records' });
  } finally {
    client.release();
  }
});



//transaction
app.post('/transaction', async (req, res) => {
  const { accountNumber, password, deposit = 0, withdraw = 0 } = req.body;

  
  if (!accountNumber || !password || (deposit === 0 && withdraw === 0)) {
    return res.status(400).json({ error: 'accountNumber, password, and deposit or withdraw are required.' });
  }

  const client = await pool.connect();

  try {
    const result = await db.getAccountDetails(client, accountNumber);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = result.rows[0];
    if (account.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const user_acc = await db.user_accdetail(client,accountNumber);
    console.log(user_acc)
    const currentBalance = user_acc.rows[0].ava_bal;

    let newBalance;
    if (deposit > 0) {
      newBalance = currentBalance + deposit;
    } else if (withdraw > 0) {
      if (currentBalance < withdraw) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      newBalance = currentBalance - withdraw;
    }

    await db.updateUserBalance(client, accountNumber, newBalance);

  
    res.status(200).json({
      message: 'Transaction successful',
      transactionType: deposit > 0 ? 'Deposit' : 'Withdrawal',
      newBalance,
    });
  } catch (err) {
    console.error('Error during transaction:', err);
    res.status(500).json({ error: 'Transaction failed' });
  } finally {
    client.release();
  }
});

// Server Port
const port = 7000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
