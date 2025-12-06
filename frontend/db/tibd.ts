import mysql from 'mysql2/promise';

// Extend the global type to include our singleton
declare global {
  // eslint-disable-next-line no-var
  var __globalMysql: mysql.Pool | undefined;
}

const mysqlPool =
  globalThis.__globalMysql ??
  mysql.createPool({
    uri: process.env.ASYNC_DB_DSN as string || 'mysql://2qBnpKDWw7AZ2Pd.root:sRyFA9oMAb5UCSaI@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test',
    waitForConnections: true,
    connectionLimit: 1, // CRITICAL for serverless
    queueLimit: 0,
    idleTimeout: 10000,
    connectTimeout: 10000,
    ssl: {
      rejectUnauthorized: true,
    },
    // Optional: Add these if needed
    // enableKeepAlive: true,
    // keepAliveInitialDelay: 0,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__globalMysql = mysqlPool;
}

export default mysqlPool;
