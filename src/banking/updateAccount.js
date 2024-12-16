import express from 'express';
import Database from '../banking/queryDb.js';

const router = express.Router();
const db = new Database();

router.put('/update/:id', async (req, res, next) => {
  const { id } = req.params;
  const { phonenum, username, password } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID is required.' });
  }

  if (!phonenum && !username && !password) {
    return res.status(400).json({ error: 'At least one field is required to update.' });
  }

  try {
    if (phonenum) await db.updateUserField('phonenum', phonenum, id);
    if (username) await db.updateUserField('username', username, id);
    if (password) await db.updateUserField('password', password, id);

    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    next(err);
  }
});

export default router;
