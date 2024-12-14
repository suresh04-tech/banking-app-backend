function getInsertUserAccountQuery({ uuid, accountNumber, timestamp, balance, deposit }) => {
  return { 
      query: `INSERT INTO user_acc (uuid, account_num, data_time, ava_bal, deposit, withdraw) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [uuid, accountNumber, timestamp, balance, deposit,0]
  } 
}

insertUserAccount: async (client, { uuid, accountNumber, timestamp, balance, deposit }) => {
  return client.query(getInsertUserAccountQuery());
}