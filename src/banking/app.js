import express from 'express';
import createAccountRouter from './AccountCreation/createAccount.js';
import getAccountDetailsRouter from './Accountoperation/getAccountDetails.js';
import updateAccountRouter from './Accountoperation/updateAccount.js';
import deleteAccountRouter from './Accountoperation/deleteAcccount.js';
import transactionRouter from './Accountoperation/transaction.js';
import loginRouter from './AccountCreation/login.js';
import verifyToken from './validation files/authentication.js';

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
