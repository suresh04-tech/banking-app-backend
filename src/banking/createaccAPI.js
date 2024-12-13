import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from './dbconnection.js';
import customerSchema from './validation.js';

const app = express();
app.use(express.json());
const client = await pool.connect();

//create account
app.post('/createacc', async (req, res) => {
  const { username, phonenum, password, ava_bal, deposit, withdraw } = req.body;


  const { error } = customerSchema.validate({ username, phonenum, password, ava_bal, deposit, withdraw });
  if (error) {
      return res.status(400).json({ error: error.details[0].message });
  }
  

  try {
    await client.query('BEGIN');

    const account_num = await generateAccountNumber();
    const currentDate = new Date();
    const timestamp = currentDate.toISOString();
    const uuid = uuidv4();

    // Insert into user_acc table
    const insertUserAccQuery = `
      INSERT INTO user_acc (uuid, account_num, data, ava_bal, deposit, withdraw)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING uuid;
    `;
    const userAccResult = await client.query(insertUserAccQuery, [
      uuid,
      account_num,
      timestamp,
      ava_bal ?? null,
      deposit ?? null,
      withdraw ?? null,
    ]);

    // Insert into customer table
    const insertCustomerQuery = `
      INSERT INTO customer (username, phonenum, password, uuid)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, phonenum, uuid;
    `;
    const customerResult = await client.query(insertCustomerQuery, [
      username,
      phonenum,
      password,
      userAccResult.rows[0].uuid,
    ]);

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Account created successfully',
      data: customerResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating account:', err);
    res.status(500).json({ error: 'Failed to create account' });
  } finally {
    client.release();
  }
});

// Generate unique account number
async function generateAccountNumber() {
  let isUnique = false;
  let accountNumber;

  while (!isUnique) {
    accountNumber = `${Date.now()}${Math.floor(Math.random() * 900) + 100}`.slice(-12);
    const result = await pool.query('SELECT COUNT(*) FROM user_acc WHERE account_num = $1', [accountNumber]);
    if (parseInt(result.rows[0].count, 10) === 0) {
      isUnique = true;
    }
  }

  return accountNumber;
}

//view details
app.get('/getdata/:id', async (req, res) => {
  const { id } = req.params; 
  const data_query = 'SELECT * FROM "customer" WHERE id = $1';

  try {
      const result = await client.query(data_query, [id]);

      if (result.rows.length > 0) {
          console.log('Data retrieved from DB', result.rows);
          res.status(200).json({ message: 'Successfully fetched data', data: result.rows });
      } else {
          res.status(404).json({ message: `No data found for id: ${id}` });
      }
  } catch (err) {
      console.error('Error fetching data', err);
      res.status(500).json({ message: 'Failed to fetch data' });
  }
});

//update 
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { phonenum, username, password } = req.body;

  if (!id) {
      return res.status(400).json({ error: 'ID is required.' });
  }

  if (!phonenum && !username && !password) {
      return res.status(400).json({ error: 'At least one field is required to update.' });
  }
          try {
              if (phonenum) {
                  const upd_query = 'UPDATE "customer" SET phonenum = $1 WHERE id = $2;';
                  await client.query(upd_query, [phonenum, id]);
                  console.log('Phonenum updated in DB:', phonenum);
              }
      
              if (username) {
                  const upd_query = 'UPDATE "customer" SET username = $1 WHERE id = $2;';
                  await client.query(upd_query, [username, id]);
                  console.log('Username updated in DB:', username);
              }
      
              if (password) {
                  const upd_query = 'UPDATE "customer" SET password = $1 WHERE id = $2;';
                  await client.query(upd_query, [password, id]);
                  console.log('Password updated in DB:', password);
              }
      
              res.status(200).json({ message: 'Update successful' });
          } catch (err) {
              console.error('Error updating in DB:', err);
              res.status(500).json({ message: 'Failed to update' });
          }
});


//Delete
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  const del_query = 'DELETE FROM "customer" WHERE id = $1';
  try {
      const result = await client.query(del_query, [id]);
      console.log('Delete successful:', result.rowCount);
      if (result.rowCount > 0) {
          res.status(200).json({ message: 'Deleted', data: result.rows });
      } else {
          res.status(404).json({ message: 'No record found' });
      }
  } catch (err) {
      console.error('Delete failed', err);
      res.status(500).json({ error: 'Failed to delete' });
  }
});


//transaction
app.put('/transaction', async (req, res) => {
  const { accountNumber, password, deposit, withdraw } = req.body;


  if (!accountNumber|| !password) {
      return res.status(400).json({ message: 'Account number and password are required.' });
  }

  const client = await pool.connect();

  try {
      await client.query('BEGIN');

      const acc_query = `SELECT ava_bal, password FROM "customer" c INNER JOIN "user_acc" ua ON c.uuid = ua.uuid WHERE ua.account_num = $1`;
      const accountResult = await client.query(acc_query, [accountNumber]);

      if (accountResult.rows.length === 0) {
          return res.status(404).json({ message: 'Account not found.' });
      }

      const { ava_bal, password: dbPassword } = accountResult.rows[0];

      if (password !== dbPassword) {
          return res.status(403).json({ message: 'Invalid password.' });
      }

      let newBalance = ava_bal;

      if (deposit) {
          const upd_query = `
              UPDATE "user_acc" 
              SET deposit = $1, ava_bal = ava_bal + $1 
              WHERE account_num = $2 
              RETURNING ava_bal;
          `;
          const result = await client.query(upd_query, [deposit, accountNumber]);
          newBalance = result.rows[0].ava_bal;
          console.log('Deposited amount is', deposit);
      }

      if (withdraw) {
          if (withdraw > newBalance) {
              await client.query('ROLLBACK');
              return res.status(400).json({ message: 'Insufficient balance.' });
          }

          const upd_query = `
              UPDATE "user_acc" 
              SET withdraw = $1, ava_bal = ava_bal - $1 
              WHERE account_num = $2 
              RETURNING ava_bal;
          `;
          const result = await client.query(upd_query, [withdraw, accountNumber]);
          newBalance = result.rows[0].ava_bal;
          console.log('Withdrawn amount is', withdraw);
      }

      await client.query('COMMIT'); 
      res.status(200).json({
          message: `Transaction successful.`,
          ava_bal: newBalance,
      });
  } catch (error) {
      await client.query('ROLLBACK'); 
      console.error('Error during transaction:', error);
      res.status(500).json({ message: 'Failed to complete transaction.' });
  } finally {
      client.release();
  }
});



//server port
const port = 7000;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
