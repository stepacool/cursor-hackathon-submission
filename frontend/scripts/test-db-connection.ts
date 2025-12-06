
import dotenv from 'dotenv';
import mysqlPool from '../db/tibd';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const connection = await mysqlPool.getConnection();
    console.log('Successfully obtained connection from pool.');
    
    const [rows] = await connection.query('SELECT 1 as result');
    console.log('Query result:', rows);
    
    connection.release();
    console.log('Connection released.');
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();

