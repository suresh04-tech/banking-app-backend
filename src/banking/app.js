import express from 'express';
import createAccountRouter from '../banking/createAccount.js';
import getAccountDetailsRouter from '../banking/getAccountDetails.js';
import updateAccountRouter from '../banking/updateAccount.js';
import deleteAccountRouter from '../banking/deleteAcccount.js';
import transactionRouter from '../banking/transaction.js';
import loginRouter from '../banking/login.js';
import verifyToken from './authentication.js';

const app = express();
app.use(express.json());

app.use(createAccountRouter);
app.use(loginRouter);
app.use(verifyToken, getAccountDetailsRouter);
app.use(verifyToken,updateAccountRouter);
app.use(verifyToken, deleteAccountRouter);
app.use(verifyToken, transactionRouter);


const port = 7000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
