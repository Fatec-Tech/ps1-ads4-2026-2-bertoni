require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool, types } = require('pg');

// Mantém as datas no formato AAAA-MM-DD
types.setTypeParser(1082, (valor) => valor);

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
