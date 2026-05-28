const Operation = require('../models/operationModel');

const saveOperation = async (req, res) => {
  try {
    const { tipo, funcion, resultado, pasos } = req.body;
    const usuario_id = req.user.id; // From authMiddleware

    if (!tipo || !funcion) {
      return res.status(400).json({ error: 'Type (tipo) and function (funcion) are required' });
    }

    const newOperation = await Operation.createOperation(
      usuario_id,
      tipo,
      funcion,
      resultado || '',
      typeof pasos === 'object' ? JSON.stringify(pasos) : pasos || ''
    );

    res.status(201).json({
      message: 'Operation saved to history successfully',
      operation: newOperation
    });
  } catch (error) {
    console.error('Save operation error:', error);
    res.status(500).json({ error: 'Server error while saving operation' });
  }
};

const getHistory = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const history = await Operation.getOperationsByUserId(usuario_id);
    
    // Parse steps if they are stored as JSON strings
    const formattedHistory = history.map(item => {
      let parsedPasos = item.pasos;
      try {
        parsedPasos = JSON.parse(item.pasos);
      } catch (e) {
        // Keep as string if it wasn't valid JSON
      }
      return {
        ...item,
        pasos: parsedPasos
      };
    });

    res.status(200).json({ history: formattedHistory });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Server error while fetching history' });
  }
};

const deleteOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    const deleted = await Operation.deleteOperationById(id, usuario_id);
    if (!deleted) {
      return res.status(404).json({ error: 'Operation not found or unauthorized' });
    }

    res.status(200).json({ message: 'Operation deleted from history', operation: deleted });
  } catch (error) {
    console.error('Delete operation error:', error);
    res.status(500).json({ error: 'Server error while deleting operation' });
  }
};

const clearHistory = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    await Operation.clearOperationsByUserId(usuario_id);
    res.status(200).json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Server error while clearing history' });
  }
};

module.exports = {
  saveOperation,
  getHistory,
  deleteOperation,
  clearHistory
};
