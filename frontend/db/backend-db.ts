import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Enable WebSocket for local development with Neon
neonConfig.webSocketConstructor = ws;

// Extend the global type to include our singleton
declare global {
  // eslint-disable-next-line no-var
  var __globalBackendPgPool: Pool | undefined;
}

const backendPool =
  globalThis.__globalBackendPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL_BACKEND as string,
    max: 1, // CRITICAL for serverless
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__globalBackendPgPool = backendPool;
}

// Result type for INSERT operations
export interface ResultSetHeader {
  insertId: number;
  affectedRows: number;
}

/**
 * PostgreSQL pool wrapper with convenience methods
 * Provides getConnection() that returns a connection with a familiar interface
 */
export async function getConnection() {
  const client = await backendPool.connect();

  return {
    /**
     * Query with ? placeholders - converts to PostgreSQL $1, $2, etc.
     * Returns [rows, fields] tuple
     * For INSERT queries, automatically adds RETURNING id to get insertId
     */
    async query(sql: string, params?: any[]): Promise<[any[], any]> {
      // Convert ? placeholders to PostgreSQL $1, $2, etc.
      let paramIndex = 0;
      let pgSql = sql.replace(/\?/g, () => {
        paramIndex++;
        return `$${paramIndex}`;
      });

      // For INSERT statements, add RETURNING id if not already present
      const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
      const hasReturning = /\s+RETURNING\s+/i.test(pgSql);
      if (isInsert && !hasReturning) {
        pgSql = pgSql.replace(/\)\s*$/, ") RETURNING id");
      }

      const result = await client.query(pgSql, params);

      // For INSERT statements, return a result with insertId
      if (isInsert) {
        const resultHeader: ResultSetHeader = {
          insertId: result.rows[0]?.id ?? 0,
          affectedRows: result.rowCount ?? 0,
        };
        return [resultHeader as any, result.fields];
      }

      return [result.rows, result.fields];
    },

    async beginTransaction() {
      await client.query("BEGIN");
    },

    async commit() {
      await client.query("COMMIT");
    },

    async rollback() {
      await client.query("ROLLBACK");
    },

    release() {
      client.release();
    },
  };
}

// Export pool for direct access if needed
export { backendPool };

// Default export for easy import
export default { getConnection };
