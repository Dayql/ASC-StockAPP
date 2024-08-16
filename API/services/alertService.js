const db = require('../config/database');
const { Op, Sequelize } = require('sequelize');
const Alert = db.Alert;
const Product = db.Product;


exports.createAlert = async (alertData) => {
  try {
    const { reference, seuil, produit_id } = alertData;

    if (produit_id) {
      // Si produit_id est fourni, cela signifie que nous avons déjà validé la référence.
      const existingAlert = await Alert.findOne({ where: { produit_id } });
      if (existingAlert) {
        throw new Error('Une alerte existe déjà pour ce produit.');
      }

      if (seuil < 0) {
        throw new Error('Le seuil ne peut pas être négatif.');
      }

      const newAlert = await Alert.create({
        produit_id,
        seuil
      });
      return newAlert;
    }

    // Vérification des champs obligatoires
    if (!reference || reference.trim().length === 0) {
      throw new Error('La référence est invalide');
    }
    if (seuil === undefined || seuil === null) {
      throw new Error('Le seuil est requis');
    }
    if (seuil < 0) {
      throw new Error('Le seuil ne peut pas être négatif.');
    }

    // Récupérer le produit par référence
    const product = await productService.getProductByReference(reference.trim());
    if (!product) {
      throw new Error('Produit non trouvé avec la référence fournie');
    }

    // Vérification si une alerte existe déjà pour ce produit
    const existingAlert = await Alert.findOne({ where: { produit_id: product.produit_id } });
    if (existingAlert) {
      throw new Error('Une alerte existe déjà pour ce produit.');
    }

    const newAlert = await Alert.create({
      produit_id: product.produit_id,
      seuil
    });

    return newAlert;
  } catch (error) {
    console.error('Error in createAlert service:', error.message);
    throw error;
  }
};

exports.getAlerts = async (page = 1, limit = 5) => {
  try {
    const offset = (page - 1) * limit;
    const { count, rows: alerts } = await Alert.findAndCountAll({
      include: [{ model: Product, attributes: ['reference', 'nom', 'prix', 'photo_url', 'stock'] }],
      offset,
      limit
    });

    const totalPages = Math.ceil(count / limit);

    const formattedAlerts = alerts.map(alert => ({
      alert_id: alert.alert_id,
      produit_id: alert.produit_id,
      seuil: alert.seuil,
      reference: alert.Product.reference
    }));

    return { alerts: formattedAlerts, totalPages };
  } catch (error) {
    throw error;
  }
};

exports.updateAlert = async (alertId, updateData) => {
  try {
    const { seuil } = updateData;

    // Vérifie uniquement si le seuil est fourni
    if (seuil === undefined || seuil === null) {
      throw new Error('Le seuil est requis.');
    }

    // Vérifie si le seuil est un nombre positif
    if (seuil < 0) {
      throw new Error('Le seuil ne peut pas être négatif.');
    }

    // Récupère l'alerte actuelle pour comparer les valeurs
    const currentAlert = await Alert.findOne({ where: { alert_id: alertId }, include: [{ model: Product, attributes: ['reference'] }] });

    if (!currentAlert) {
      throw new Error('Alerte non trouvée.');
    }

    // Vérifie si le seuil est identique au précédent
    if (seuil === currentAlert.seuil) {
      throw new Error('Le seuil est identique au précédent.');
    }

    // Met à jour uniquement le champ seuil
    const [updated] = await Alert.update({ seuil }, { where: { alert_id: alertId } });

    if (!updated) {
      throw new Error('Alerte non trouvée ou mise à jour échouée.');
    }

    const updatedAlert = await Alert.findOne({ where: { alert_id: alertId }, include: [{ model: Product, attributes: ['reference'] }] });

    // Retourne l'alerte mise à jour avec les informations de produit
    return {
      alert_id: updatedAlert.alert_id,
      produit_id: updatedAlert.produit_id,
      seuil: updatedAlert.seuil,
      reference: updatedAlert.Product.reference
    };
  } catch (error) {
    throw error;
  }
};


exports.deleteAlert = async (alertId) => {
  try {
    await Alert.destroy({ where: { alert_id: alertId } });
  } catch (error) {
    throw error;
  }
};

exports.checkAlerts = async (page = 1, limit = 4) => {
  try {
    const offset = (page - 1) * limit;
    const alerts = await Alert.findAll({
      include: [{ model: Product }],
      offset: offset,
      limit: limit
    });

    const alertProducts = alerts.filter(alert => alert.Product.stock < alert.seuil);

    // Calculer le nombre total de pages
    const totalCount = await Alert.count({
      include: [{ model: Product }],
      where: {
        '$Product.stock$': { [Op.lt]: Sequelize.col('Alert.seuil') }
      }
    });
    const totalPages = Math.ceil(totalCount / limit);

    return {
      alerts: alertProducts,
      totalPages: totalPages
    };
  } catch (error) {
    console.error('Error in checkAlerts service:', error);
    throw new Error('Erreur du serveur');
  }
};
