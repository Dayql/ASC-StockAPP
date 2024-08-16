const localisationService = require('../services/localisationService');

exports.getAllLocalisations = async (req, res) => {
  try {
    const localisations = await localisationService.getAllLocalisations();
    res.json(localisations);
  } catch (error) {
    console.error('Erreur lors de la récupération des localisations:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des localisations.' });
  }
};

exports.getLocalisationById = async (req, res) => {
  try {
    const localisationId = req.params.id;
    const localisation = await localisationService.getLocalisationById(localisationId);
    res.json(localisation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la localisation:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération de la localisation.' });
  }
};

exports.createLocalisation = async (req, res) => {
  try {
    const localisationData = req.body;
    const localisation = await localisationService.createLocalisation(localisationData);
    res.status(201).json(localisation);
  } catch (error) {
    console.error('Erreur lors de la création de la localisation:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création de la localisation.' });
  }
};

exports.updateLocalisation = async (req, res) => {
  try {
    const localisationId = req.params.id;
    const localisationData = req.body;
    const localisation = await localisationService.updateLocalisation(localisationId, localisationData);
    res.json(localisation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la localisation:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la localisation.' });
  }
};

exports.deleteLocalisation = async (req, res) => {
  try {
    const localisationId = req.params.id;
    await localisationService.deleteLocalisation(localisationId);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de la localisation:', error.message);
    res.status(500).json({ message: 'Erreur lors de la suppression de la localisation.' });
  }
};

exports.getAisleDetails = async (req, res) => {
  try {
    const { aisleId } = req.params;
    const page = parseInt(req.query.page, 10) || 1; // Page par défaut = 1
    const limit = parseInt(req.query.limit, 10) || 10; // Limite par défaut = 10

    const aisleDetails = await localisationService.getAisleDetails(aisleId, page, limit);

    res.json(aisleDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


