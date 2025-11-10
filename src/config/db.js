// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * IMPORTANT for Lambda:
 *  - This module is loaded once per container. Keep connections/pools here.
 *  - Keep pool small to avoid connection storms.
 *  - Enable keepAlive to survive NAT/VPC idle timeouts.
 */

const DB_CACHE = new Map(); // cache per dbName

// helper to coerce boolean envs like "true"/"false"/1/0
const asBool = (v, def = false) =>
  v === true || v === 'true' || v === '1' ? true
  : v === false || v === 'false' || v === '0' ? false
  : def;

const ENV = process.env.ENVIRONMENT || 'local';
const USE_SSL = asBool(process.env.DB_SSL, ENV !== 'local'); // default SSL on non-local

function getHostForEnv() {
  if (ENV === 'prod') return process.env.PROD_RDS_PROXY_ENDPOINT || process.env.RDS_DB_HOST;
  if (ENV === 'test') return process.env.RDS_DB_HOST;
  if (ENV === 'local') return process.env.RDS_DB_HOST || '127.0.0.1';
  throw new Error(`Invalid ENVIRONMENT value: ${ENV}`);
}

function makeSequelize(dbName) {
  const host = getHostForEnv();
  const port = Number(process.env.DB_PORT || 5432);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  // DANGER: do NOT log secrets. Keep debug info minimal.
  console.log('🔐 DB Config (sanitized):', {
    env: ENV,
    host,
    port,
    userPresent: !!user,
    sslEnabled: USE_SSL,
    hasPassword: !!password,
  });

  const dialectOptions = {
    // Passed through to node-postgres:
    // keepAlive helps with NAT/VPC idle socket drops
    keepAlive: true,
    application_name: process.env.APP_NAME || 'lambda-api',
    // Timeouts (ms). Keep these sane for Lambda.
    statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 20000), // server cancels long queries
    query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS || 25000), // client-side
    // Optional: cancel idle in xaction sessions on server side (ms)
    idle_in_transaction_session_timeout: Number(process.env.DB_IDLE_XACT_TIMEOUT_MS || 60000),
    // SSL
    ...(USE_SSL
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}),
    // You can also pass `options: '-c search_path=public'` if needed
  };

  const pool = {
    // Lambda: keep this small; RDS Proxy multiplexes for you
    max: Number(process.env.DB_POOL_MAX || (ENV === 'prod' ? 4 : 5)),
    min: 0,
    // time (ms) a connection can be idle before being released back to pool
    idle: Number(process.env.DB_POOL_IDLE_MS || 10000),
    // max time (ms) Sequelize tries to get a connection before throwing
    acquire: Number(process.env.DB_POOL_ACQUIRE_MS || 30000),
    // how often (ms) pool removes idle clients
    evict: Number(process.env.DB_POOL_EVICT_MS || 1000),
  };

  const sequelize = new Sequelize(dbName, user, password, {
    host,
    port,
    dialect: 'postgres',
    logging: asBool(process.env.DB_DEBUG_SQL, false) ? console.log : false,
    dialectOptions,
    pool,
    retry: {
      max: Number(process.env.DB_RETRY_MAX || 3),
    },
  });

  // Optionally validate on cold start (outside handler)
  // You may comment this out if it slows cold starts too much.
  sequelize.authenticate()
    .then(() => console.log(`Connected to ${dbName}`))
    .catch((e) => console.error(`Auth failed for ${dbName}:`, e.message));

  return sequelize;
}

function getDb(dbName) {
  // Reuse same Sequelize per DB name
  if (!DB_CACHE.has(dbName)) {
    DB_CACHE.set(dbName, makeSequelize(dbName));
  }
  return DB_CACHE.get(dbName);
}

module.exports = getDb;
