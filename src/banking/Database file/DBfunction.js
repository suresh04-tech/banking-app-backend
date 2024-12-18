import pool from './dbconnection.js';

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
          INSERT INTO customer (username, phonenum, password, id)
          VALUES ($1, $2, $3, $4)`,
        values: [username, phonenum, password, uuid],
      };
    };
  

  getInsertUserAccountQuery( uuid, accountNumber, timestamp, ava_bal, deposit) {
      return {
        query: `
          INSERT INTO user_acc (uuid, account_num, account_created, ava_bal, deposit, withdraw) 
          VALUES ($1, $2, $3, $4, $5, $6)`,
        values: [uuid, accountNumber, timestamp, ava_bal, deposit, 0],
      };
    };
  

  getAccountDetailsQuery(accountNumber) {
    console.log('from query ',accountNumber)
      return {
        query: `SELECT uuid FROM user_acc WHERE account_num = $1`,
        values: [accountNumber],
      };
    };
  

  getCustomerDetailsQuery(uuid) {
      return {
        query: `SELECT * FROM customer WHERE id = $1`,
        values: [uuid],
      };
    };

    getCustomerDetailsUsingPhonenum(phonenum) {
        console.log('from query',phonenum)
        return {
          query: `SELECT * FROM customer WHERE phonenum = $1`,
          values: [phonenum],
        };
      };


  getUpdateUserFieldQuery(field, value, uuid) {
      return {
        query: `UPDATE customer SET ${field} = $1 WHERE id = $2`,
        values: [value, uuid],
      };
    };

  getDeleteCustomerQuery(uuid) {
    return {
        query: `DELETE FROM customer WHERE id = $1`,
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
  

  getUserAccountDetailQuery(uuid) {
      return {
        query: `SELECT * FROM user_acc WHERE uuid= $1`,
        values: [uuid],
      };
    }

  getUuidUsingAccountNumber(accountNumber){
    return{
      query:'SELECT uuid FROM user_acc WHERE account_num = $1',
       values: [accountNumber]
    }
  }
  

  // Database Operations
 
//CreateAccount
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

//login function
async getCustomerByPhone(phonenum){
  console.log(phonenum)
  const client = await this.getClient();

  try {
      const { query, values } = this.getCustomerDetailsUsingPhonenum(phonenum);
     
      const LoginResult=await client.query(query, values);
      console.log('from dbfunction',LoginResult.rows[0])
      return await LoginResult
     
    }catch{
      console.log("getCustomerAcountDetails error")
    }
}

//GetAccountDetails
async getAccDetail(uuid){
  const client=await this.createClient();
  console.log('from db ',uuid)
  try{
     const{query,values}=this.getCustomerDetailsQuery(uuid);
     const {rows}=await client.query(query,values);
     const { password, ...getAccDetailResult } = rows[0];


     console.log('this from dbfun result',getAccDetailResult);
     return getAccDetailResult;
     
  }catch(error){
    console.log('Account NO Founded:',error.message)
  }finally{
    client.release();
  }
}
// updating function
async updateUserFieldByAccountNumber(field, value, uuid){

        const client = await this.getClient();
    
        try {
          const { query, values } = this.getUpdateUserFieldQuery(field, value, uuid);
          return await client.query(query, values);
        } finally {
          client.release();
        }
      }

//Transaction
async getAccountDetails(client,uuid) {

  try {
    const { query, values } = this.getCustomerDetailsQuery(uuid);
    return await client.query(query,values);
  }catch(err){
    console.log("ERROR in  getCustomerDetails")
  }
}

async userAccountDetail(client,uuid) {
  try {
    const { query, values } = this.getUserAccountDetailQuery(uuid);
    return await client.query(query, values);
  }catch{
    console.log("getuserAccountDetail error")
  }
}

async updateUserBalance(client,uuid, newBalance) {

  try {
       const { query, values } = this.getUpdateUserBalanceQuery(newBalance, uuid);
    return await client.query(query,values);
  } finally {
    client.release();
  }
}

 //DeteleUserAccount
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

async deleteCustomer(uuid) {
  const client = await this.getClient();

  try {
    const { query, values } = this.getDeleteCustomerQuery(uuid);
    return await client.query(query, values);
  } finally {
    client.release();
  }
}
}
export default Database;
