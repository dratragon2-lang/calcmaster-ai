const db = require('../config/db');

const createOperation = async (usuario_id, tipo, funcion, resultado, pasos) => {
  const queryText = `
    INSERT INTO operaciones (usuario_id, tipo, funcion, resultado, pasos)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await db.query(queryText, [usuario_id, tipo, funcion, resultado, pasos]);
  return rows[0];
};

const getOperationsByUserId = async (usuario_id) => {
  const queryText = 'SELECT * FROM operaciones WHERE usuario_id = $1 ORDER BY fecha DESC';
  const { rows } = await db.query(queryText, [usuario_id]);
  return rows;
};

const deleteOperationById = async (id, usuario_id) => {
  const queryText = 'DELETE FROM operaciones WHERE id = $1 AND usuario_id = $2 RETURNING *';
  const { rows } = await db.query(queryText, [id, usuario_id]);
  return rows[0];
};

const clearOperationsByUserId = async (usuario_id) => {
  const queryText = 'DELETE FROM operaciones WHERE usuario_id = $1 RETURNING *';
  const { rows } = await db.query(queryText, [usuario_id]);
  return rows;
};

module.exports = {
  createOperation,
  getOperationsByUserId,
  deleteOperationById,
  clearOperationsByUserId
};
