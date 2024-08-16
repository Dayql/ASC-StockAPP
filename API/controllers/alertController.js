const alertService = require('../services/alertService');

exports.createAlert = async (req, res) => {
  try {
    const alertData = req.body;
    const newAlert = await alertService.createAlert(alertData);
    res.status(201).json(newAlert);
  } catch (error) {
    console.error('Error in createAlert controller:', error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const { alerts, totalPages } = await alertService.getAlerts(page, limit);
    res.json({ alerts, totalPages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const updatedAlert = await alertService.updateAlert(req.params.id, req.body);
    res.json(updatedAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    await alertService.deleteAlert(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const result = await alertService.checkAlerts(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error in checkAlerts controller:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};
