import express from 'express';
import Database from '../banking/DBfunction.js';

const router = express.Router();
const db = new Database();

router.delete('/', async (req, res) => {
  let { accountNumber } = req.body;
  accountNumber = BigInt(accountNumber);

  try {
    await db.beginTransaction();

    const uuidResult = await db.getUuidAccountNumber(accountNumber);
    if (uuidResult.row === 0) {
      await db.rollbackTransaction();
      return res.status(404).json({ message: 'No user found with the given account number' });
    }

    await db.deleteUserAccount(uuidResult);
    await db.deleteCustomer(uuidResult);

    await db.commitTransaction();
    res.status(200).json({ message: 'User and related records deleted successfully' });
  } catch (err) {
    await db.rollbackTransaction();
    console.log('error from deleting',err)
  } finally {
    await db.release();
  }
});

export default router;
