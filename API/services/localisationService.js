const db = require('../config/database');
const Localisation = db.Localisation;

exports.getAllLocalisations = async () => {
  try {
    const localisations = await Localisation.findAll();
    return localisations;
  } catch (error) {
    throw error;
  }
};

exports.getLocalisationById = async (localisationId) => {
  try {
    const localisation = await Localisation.findByPk(localisationId);
    if (!localisation) {
      throw new Error('Localisation non trouvée.');
    }
    return localisation;
  } catch (error) {
    throw error;
  }
};

exports.createLocalisation = async (localisationData) => {
  try {
    const localisation = await Localisation.create(localisationData);
    return localisation;
  } catch (error) {
    throw error;
  }
};

exports.updateLocalisation = async (localisationId, localisationData) => {
  try {
    const localisation = await Localisation.findByPk(localisationId);
    if (!localisation) {
      throw new Error('Localisation non trouvée.');
    }
    await localisation.update(localisationData);
    return localisation;
  } catch (error) {
    throw error;
  }
};

exports.deleteLocalisation = async (localisationId) => {
  try {
    const localisation = await Localisation.findByPk(localisationId);
    if (!localisation) {
      throw new Error('Localisation non trouvée.');
    }
    await localisation.destroy();
  } catch (error) {
    throw error;
  }
};

exports.getAisleDetails = async (localisationId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { rows: products, count: totalProducts } = await db.Product.findAndCountAll({
      where: { localisation_id: localisationId },
      include: [
        {
          model: db.Localisation,
          attributes: ['description']
        }
      ],
      offset,
      limit
    });

    const totalValue = products.reduce((total, product) => total + (product.prix * product.stock), 0);

    return {
      localisationId,
      products,
      totalValue,
      totalProducts
    };
  } catch (error) {
    throw error;
  }
};



