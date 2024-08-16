const db = require('../config/database');
const { Op } = require('sequelize');
const Product = db.Product;
const MouvementStock = db.MouvementStock;
const Localisation = db.Localisation;

// Fonction pour vérifier le format du nom
const isValidName = (name) => {
  return typeof name === 'string' && name.length >= 3;
};

// Fonction pour vérifier le format de la référence
const isValidReference = (reference) => {
  return typeof reference === 'string' && reference.length >= 3;
};

// Fonction pour vérifier le format du prix
const isValidPrice = (price) => {
  return !isNaN(price) && parseFloat(price) > 0;
};

// Ajout de la fonction pour vérifier si le stock est un entier positif
const isValidStock = (stock) => {
  return Number.isInteger(stock) && stock >= 0;
};

exports.addProduct = async (productData) => {
  try {
    const { nom, reference, prix, localisation_description, stock } = productData;

    if (!isValidName(nom)) {
      throw new Error('Le nom doit comporter au moins 3 caractères.');
    }

    if (!isValidReference(reference)) {
      throw new Error('La référence doit comporter au moins 3 caractères.');
    }

    if (!isValidPrice(prix)) {
      throw new Error('Le prix doit être un nombre positif.');
    }

    if (!isValidStock(stock)) {
      throw new Error('Le stock doit être un nombre entier positif.');
    }

    if (!localisation_description) {
      throw new Error('La description de la localisation est requise.');
    }

    const localisation = await Localisation.findOne({
      where: { description: localisation_description }
    });

    if (!localisation) {
      throw new Error('Localisation non trouvée.');
    }

    const existingProduct = await Product.findOne({
      where: {
        [Op.or]: [
          { reference: reference },
          { nom: nom }
        ]
      }
    });

    if (existingProduct) {
      const duplicateField = existingProduct.reference === reference ? 'Référence' : 'Nom';
      throw new Error(`${duplicateField} existe déjà.`);
    }

    const newProduct = await Product.create({
      nom,
      reference,
      prix,
      stock,
      localisation_id: localisation.localisation_id
    });

    return newProduct;
  } catch (error) {
    throw error;
  }
};


exports.getProductById = async (productId) => {
  try {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Localisation,
          attributes: ['description']
        },
        {
          model: MouvementStock
        }
      ]
    });
    return product;
  } catch (error) {
    throw error;
  }
};


exports.updateProduct = async (productId, updateData) => {
  try {
    const { nom, reference, prix, localisation_id, photo_url, stock } = updateData;

    // Si aucun champ n'est fourni pour la mise à jour
    if (!nom && !reference && !prix && !photo_url && !localisation_id && !stock) {
      throw new Error('Aucun champ de mise à jour fourni.');
    }

    // Validation des champs individuels
    if (nom && !isValidName(nom)) {
      throw new Error('Le nom doit comporter au moins 3 caractères.');
    }
    if (reference && !isValidReference(reference)) {
      throw new Error('La référence doit comporter au moins 3 caractères.');
    }
    if (prix && !isValidPrice(prix)) {
      throw new Error('Le prix doit être un nombre positif.');
    }
    if (stock && !isValidStock(stock)) {
      throw new Error('Le stock doit être un nombre entier positif.');
    }

    const currentProduct = await Product.findByPk(productId);

    if (!currentProduct) {
      throw new Error('Produit non trouvé.');
    }

    const noChanges =
      (!nom || nom === currentProduct.nom) &&
      (!reference || reference === currentProduct.reference) &&
      (!prix || prix === currentProduct.prix) &&
      (!photo_url || photo_url === currentProduct.photo_url) &&
      (!localisation_id || localisation_id === currentProduct.localisation_id);

    if (noChanges) {
      throw new Error('Aucune modification détectée.');
    }

    // Vérification de la duplication
    if (nom || reference) {
      const existingProduct = await Product.findOne({
        where: {
          [Op.or]: [
            nom && nom !== currentProduct.nom ? { nom: nom, produit_id: { [Op.ne]: productId } } : null,
            reference && reference !== currentProduct.reference ? { reference: reference, produit_id: { [Op.ne]: productId } } : null,
          ].filter(Boolean),
        },
      });

      if (existingProduct) {
        const duplicateField = existingProduct.reference === reference ? 'Référence' : 'Nom';
        throw new Error(`${duplicateField} existe déjà.`);
      }
    }

    // Gestion de la localisation via localisation_id
    if (localisation_id && localisation_id !== currentProduct.localisation_id) {
      const localisation = await Localisation.findByPk(localisation_id);

      if (!localisation) {
        throw new Error('Localisation non trouvée.');
      }

      updateData.localisation_id = localisation.localisation_id;
    }

    // Mise à jour du produit
    await Product.update(updateData, {
      where: { produit_id: productId },
      returning: true,
      plain: true,
    });

    const updatedProduct = await Product.findByPk(productId);
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};




exports.deleteProduct = async (productId) => {
  try {
    await Product.destroy({ where: { produit_id: productId } }); // Correction de l'utilisation de l'identifiant
  } catch (error) {
    throw error;
  }
};

exports.getAllProducts = async () => {
  try {
    const products = await Product.findAll();
    return products;
  } catch (error) {
    throw error;
  }
};

exports.searchProducts = async (query) => {
  try {
    if (!query || query.trim() === '') {
      throw new Error('La requête de recherche ne peut pas être vide.');
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { reference: { [Op.eq]: query } },  
          { nom: { [Op.eq]: query } }         
        ]
      },
      include: [
        { model: MouvementStock },
        { 
          model: Localisation, 
          attributes: ['description']  
        }
      ]
    });
    return products;
  } catch (error) {
    throw error;
  }
};


exports.getProductByReference = async (reference) => {
  try {
    if (!reference || typeof reference !== 'string') {
      throw new Error('La référence est invalide');
    }

    const product = await Product.findOne({ where: { reference } });
    
    if (!product) {
      throw new Error('Produit non trouvé avec la référence fournie');
    }

    return product;
  } catch (error) {
    console.error('Error in getProductByReference:', error.message);
    throw error;
  }
};
