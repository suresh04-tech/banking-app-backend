import pool from '../banking/dbconnection.js'

const dbPool = { pool }; 

class Database {
    client = null;
    constructor() {
        if(this.client == null) {
            this.client =  dbPool
        }
    }
  
    async insertCustomer({ username, phonenum, password, uuid }) {
      const query = `INSERT INTO customer (username, phonenum, password, uuid) 
                     VALUES ($1, $2, $3, $4) RETURNING id, username, phonenum, uuid`;
      return  await this.client.query(query, [username, phonenum, password, uuid]);
    }
  
    async getAccountDetails(accountNumber) {
      const uuidQuery = `SELECT uuid FROM user_acc WHERE account_num = $1`;
      const uuidResult = await this.client.query(uuidQuery, [accountNumber]);
  
      if (uuidResult.rows.length === 0) {
        throw new Error('Account number not found');
      }
  
      const { uuid } = uuidResult.rows[0];
  
      const detailsQuery = `SELECT * FROM customer WHERE uuid = $1`;
      const detailsResult = await this.client.query(detailsQuery, [uuid]);
      return await detailsResult;
    }
  
    async updateUserField(field, value, id) {
      const query = `UPDATE customer SET ${field} = $1 WHERE id = $2`;
      return await this.client.query(query, [value, id]);
    }
  
    async deleteCustomer(uuid) {
      const query = `DELETE FROM customer WHERE uuid = $1`;
      return await this.client.query(query, [uuid]);
    }
  
    async deleteUserAccount(uuid) {
      const query = `DELETE FROM user_acc WHERE uuid = $1`;
      return await this.client.query(query, [uuid]);
    }
  
    async getUuidById(accountNumber) {
      const query = `SELECT uuid FROM user_acc WHERE account_num = $1`;
      return await this.client.query(query, [accountNumber]);
    }
  
    async generateUniqueAccountNumber() {
      let isUnique = false;
      let accountNumber;
  
      while (!isUnique) {
        accountNumber = `${Date.now()}${Math.floor(Math.random() * 900) + 100}`.slice(-12);
        const result = await this.client.query('SELECT COUNT(*) FROM user_acc WHERE account_num = $1', [accountNumber]);
        if (parseInt(result.rows[0].count, 10) === 0) {
          isUnique = true;
        }
      }
  
      return await accountNumber;
    }
  
    async updateUserBalance(accountNumber, newBalance) {
      const uuidQuery = `SELECT uuid FROM user_acc WHERE account_num = $1`;
      const uuidResult = await this.client.query(uuidQuery, [accountNumber]);
  
      if (uuidResult.rows.length === 0) {
        throw new Error('Account number not found');
      }
  
      const { uuid } = uuidResult.rows[0];
  
      const updateQuery = `UPDATE user_acc SET ava_bal = $1 WHERE uuid = $2`;
      return await this.client.query(updateQuery, [newBalance, uuid]);
    }
  
    async userAccountDetail(accountNumber) {
      const query = `SELECT * FROM user_acc WHERE account_num = $1`;
      return await this.client.query(query, [accountNumber]);
    }
  }
  
  
  export default Database;
  