
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const certificado = path.join(__dirname, 'prod-ca-2021.crt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true'
    ? {
        ca: fs.readFileSync(certificado, 'utf8'),
        rejectUnauthorized: true
      }
    : false
});

module.exports = pool;
