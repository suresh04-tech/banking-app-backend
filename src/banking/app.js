import express from 'express';
import createAccountRouter from '../banking/createAccount.js';
import getAccountDetailsRouter from '../banking/getAccountDetails.js';
import updateAccountRouter from '../banking/updateAccount.js';
import deleteAccountRouter from '../banking/deleteAcccount.js';
import transactionRouter from '../banking/transaction.js';

const app = express();
app.use(express.json());

app.use('/createAccount', createAccountRouter);
app.use('/getAccountDetails', getAccountDetailsRouter);
app.use('/updateAccount', updateAccountRouter);
app.use('/deleteAccount', deleteAccountRouter);
app.use('/transaction', transactionRouter);

const port = 7000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
