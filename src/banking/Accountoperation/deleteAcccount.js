import express from 'express';
import Database from '../Database file/DBfunction.js';

const router = express.Router();
const db = new Database();

router.delete('/delete-user', async (req, res) => {
   const uuid = req.user.id;
   console.log(uuid)
  try {
    await db.beginTransaction();
    if (!uuid) {
      await db.rollbackTransaction();
      return res.status(404).json({ message: 'No user found with the given account number' });
    }

    await db.deleteUserAccount(uuid);
    await db.deleteCustomer(uuid);

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
