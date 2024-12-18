import express from 'express';
import Database from '../Database file/DBfunction.js';
import { updateUserSchema } from '../validation files/validation.js';

const router = express.Router();
const db = new Database();

router.put('/updateAccount', async (req, res) => {
  const uuid=req.user.id;
  console.log('from updateAPI',uuid);

  const { phonenum, username, password } = req.body; 

  const{error}=updateUserSchema.validate({phonenum,username,password});
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  if (!uuid) {
    return res.status(400).json({ error: 'UUID is required.' });
  }

  if (!phonenum && !username && !password) {
    return res.status(400).json({ error: 'At least one field is required to update.' });
  }

  try {

    if (phonenum) await db.updateUserFieldByAccountNumber('phonenum', phonenum, uuid);
    if (username) await db.updateUserFieldByAccountNumber('username', username, uuid);
    if (password) await db.updateUserFieldByAccountNumber('password', password, uuid);

    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    console.error("Error updating user details:", err.message);
    res.status(500).json({ error: 'Failed to update user details.' });
  }
});

export default router;
