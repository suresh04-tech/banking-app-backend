import pool from '../banking/dbconnection.js';

class Database {
  client = null;
  constructor() {
    this.pool = pool;
  }

  async createClient() {
    return await this.pool.connect();
  }

  async getClient() {
    if(!this.client) {
      this.client = this.createClient();
    }
    return this.client
  }

  async beginTransaction() {
    const client = await this.createClient();
    await client.query('BEGIN');
    return client; 
  }

  async commitTransaction(client) {
    if (client) {
      await client.query('COMMIT');
    }
  }

  async rollbackTransaction(client) {
    if (client) {
      await client.query('ROLLBACK');
    }
  }

  async release(client) {
    if (client) {
      client.release();
    }
  }

  // Query Functions

  getInsertCustomerQuery( username, phonenum, password, uuid ) {
    return {
        query: `
          INSERT INTO customer (username, phonenum, password, uuid)
          VALUES ($1, $2, $3, $4)`,
        values: [username, phonenum, password, uuid],
      };
    };
  

  getInsertUserAccountQuery( uuid, accountNumber, timestamp, ava_bal, deposit) {
      return {
        query: `
          INSERT INTO user_acc (uuid, account_num, data_time, ava_bal, deposit, withdraw) 
          VALUES ($1, $2, $3, $4, $5, $6)`,
        values: [uuid, accountNumber, timestamp, ava_bal, deposit, 0],
      };
    };
  

  getAccountDetailsQuery(accountNumber) {
      return {
        query: `SELECT uuid FROM user_acc WHERE account_num = $1`,
        values: [accountNumber],
      };
    };
  

  getCustomerDetailsQuery(uuid) {
      return {
        query: `SELECT * FROM customer WHERE uuid = $1`,
        values: [uuid],
      };
    };


  getUpdateUserFieldQuery(field, value, id) {
      return {
        query: `UPDATE customer SET ${field} = $1 WHERE id = $2`,
        values: [value, id],
      };
    };

  getDeleteCustomerQuery(uuid) {
    return {
        query: `DELETE FROM customer WHERE uuid = $1`,
        values: [uuid],
      };
    };
  

  getDeleteUserAccountQuery(uuid) {
      return {
        query: `DELETE FROM user_acc WHERE uuid = $1`,
        values: [uuid],
      };
    };
  

  getGenerateUniqueAccountNumberQuery(accountNumber) {
      return {
        query: 'SELECT COUNT(*) FROM user_acc WHERE account_num = $1',
        values: [accountNumber],
      };
    };
  

  getUpdateUserBalanceQuery(newBalance,uuid) {
      return {
        query: `UPDATE user_acc SET ava_bal = $1 WHERE uuid = $2`,
        values: [newBalance, uuid],
      };
    }
  

  getUserAccountDetailQuery(accountNumber) {
      return {
        query: `SELECT * FROM user_acc WHERE account_num = $1`,
        values: [accountNumber],
      };
    }

  getUuidUsingAccountNumber(accountNumber){
    return{
      query:'SELECT uuid FROM user_acc WHERE account_num = $1',
       values: [accountNumber]
    }
  }
  

  // Database Operations

  async insertCustomer({ username, phonenum, password, uuid }) {
    const client = await this.createClient();
  
    try {
      console.log('inserting customer:',{username,phonenum,password,uuid})
      const { query, values } = this.getInsertCustomerQuery(username, phonenum, password, uuid);
      const customerResult = await client.query(query, values);

      if (customerResult.rows === 0) {
        throw new Error('Customer insertion failed');
      }

      return customerResult.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async insertUserAccount({ uuid, accountNumber, timestamp, ava_bal, deposit }) {
    const client = await this.createClient();
console.log('user_acc values',{uuid,accountNumber,timestamp,ava_bal,deposit})
    try {
      const { query, values } = this.getInsertUserAccountQuery(uuid, accountNumber, timestamp, ava_bal, deposit );
      const userAccResult = await client.query(query, values);

      if (userAccResult.rows === 0) {
        throw new Error('User account insertion failed');
      }

      return userAccResult.rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }



  async updateUserField(field, value, id) {
    const client = await this.getClient();

    try {
      const { query, values } = this.getUpdateUserFieldQuery(field, value, id);
      return await client.query(query, values);
    } finally {
      client.release();
    }
  }

  async deleteCustomer(uuid) {
    const client = await this.getClient();

    try {
      const { query, values } = this.getDeleteCustomerQuery(uuid);
      return await client.query(query, values);
    } finally {
      client.release();
    }
  }

  async deleteUserAccount(uuid) {
    if(!uuid){
      console.error('UUID is undefined');
      throw new Error('UUID is required to delete user')
    }
    console.log('this is from db',uuid)
    const client = await this.getClient();

    try {
      const { query, values } = this.getDeleteUserAccountQuery(uuid);
      console.log('executing query',query,'with values',values)
      return await client.query(query, values);
    }catch(err){
      console.log('deteleuser error')
    }
  }

  async generateUniqueAccountNumber() {
    let isUnique = false;
    let accountNumber;
    const client = await this.createClient();

    try {
      while (!isUnique) {
        accountNumber = `${Date.now()}${Math.floor(Math.random() * 900) + 100}`.slice(-12);
        const { query, values } = this.getGenerateUniqueAccountNumberQuery(accountNumber);
        const result = await client.query(query, values);
        if (parseInt(result.rows[0].count, 10) === 0) {
          isUnique = true;
        }
      }
      return accountNumber;
    } finally {
      client.release();
    }
  }



async getUuidAccountNumber(accountNumber) {
  const client = await this.createClient(); 
  try {
   const {query,values}=this.getUuidUsingAccountNumber(accountNumber)
   const result=await client.query(query,values);

   if (!result || !result.rows || result.rows.length === 0) {
    console.error(`No UUID found for account number: ${accountNumber}`);
    throw new Error('Account number not found');
  }

    return result.rows[0].uuid;
  } catch (error) {
    console.error('Error in getUUIDByAccountNumber:', error);
    throw error;
  } finally {
    client.release(); 
  }
}
//with client
async updateUserBalance(client,accountNumber, newBalance) {

  try {
    const { query: uuidQuery, values: uuidValues } = this.getAccountDetailsQuery(accountNumber);
    const uuidResult = await client.query(uuidQuery, uuidValues);

    if (uuidResult.rows === 0) {
      throw new Error('Account number not found');
    }

    const { uuid } = uuidResult.rows[0];
    const { query: updateQuery, values: updateValues } = this.getUpdateUserBalanceQuery(newBalance, uuid);
    return await client.query(updateQuery, updateValues);
  } finally {
    client.release();
  }
}

async userAccountDetail(client,accountNumber) {
if(!client){
}
  try {
    const { query, values } = this.getUserAccountDetailQuery(accountNumber);
    return await client.query(query, values);
  }catch{
    console.log("getuserAccountDetail error")
  }
}

async getAccountDetails(client,accountNumber) {

  try {
    const { query, values } = this.getAccountDetailsQuery(accountNumber);
    const uuidResult = await client.query(query, values);

    if (uuidResult.rows.length === 0) {
      throw new Error('Account number not found');
    }

    const { uuid } = uuidResult.rows[0];
    const { query: detailsQuery, values: detailsValues } = this.getCustomerDetailsQuery(uuid);
    return await client.query(detailsQuery, detailsValues);
  }catch(err){
    console.log("getaccountdetail error")
  }
}

}

export default Database;
