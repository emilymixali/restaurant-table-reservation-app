const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5,
});

module.exports = {
  query: async (...args) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const res = await conn.query(...args);
      return res;
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }
};
