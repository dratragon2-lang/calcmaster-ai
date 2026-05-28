const db = require('../config/db');

const findByEmail = async (correo) => {
  const queryText = 'SELECT * FROM usuarios WHERE correo = $1';
  const { rows } = await db.query(queryText, [correo]);
  return rows[0];
};

const findById = async (id) => {
  const queryText = 'SELECT id, nombre, correo FROM usuarios WHERE id = $1';
  const { rows } = await db.query(queryText, [id]);
  return rows[0];
};

const createUser = async (nombre, correo, passwordHash) => {
  const queryText = 'INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING id, nombre, correo';
  const { rows } = await db.query(queryText, [nombre, correo, passwordHash]);
  return rows[0];
};

module.exports = {
  findByEmail,
  findById,
  createUser
};
