const db = require('../config/database');
const MouvementStock = db.MouvementStock;
const Product = db.Product; // Assuming your product model is named 'Product'

exports.addMouvementStock = async (data) => {
  try {
    const { produit_id, type, quantite, raison, date } = data;

    // Vérifiez que tous les champs sont fournis
    if (!produit_id || !type || !quantite || !raison || !date) {
      throw new Error('Tous les champs sont requis');
    }

    // Vérifiez que la quantité est un nombre positif
    if (isNaN(quantite) || parseFloat(quantite) <= 0) {
      throw new Error('La quantité doit être un nombre positif.');
    }

    // Récupération du produit
    const product = await Product.findByPk(produit_id);
    if (!product) {
      throw new Error('Produit non trouvé');
    }

    // Mise à jour du stock
    if (type === 'entrée') {
      product.stock += parseInt(quantite, 10);
    } else if (type === 'sortie') {
      if (product.stock < quantite) {
        throw new Error('Stock insuffisant pour cette sortie');
      }
      product.stock -= parseInt(quantite, 10);
    } else if (type === 'retour') {
      product.stock += parseInt(quantite, 10);
    } else {
      throw new Error('Type de mouvement invalide');
    }

    // Sauvegarde du produit avec le stock mis à jour
    await product.save();

    // Création du mouvement de stock
    const newMouvement = await MouvementStock.create({ 
      produit_id, 
      type, 
      quantite, 
      raison, 
      date 
    });

    return newMouvement;
  } catch (error) {
    throw error;
  }
};

exports.getMouvementStockById = async (id) => {
  try {
    const mouvement = await MouvementStock.findByPk(id);
    return mouvement;
  } catch (error) {
    throw error;
  }
};

exports.getAllMouvementStock = async (page, pageSize) => {
  try {
    const offset = (page - 1) * pageSize;

    const { count, rows } = await MouvementStock.findAndCountAll({
      include: [
        {
          model: Product,
          attributes: ['nom', 'reference'],
          include: [{
            model: db.Localisation,  
            attributes: ['description']
          }]
        }
      ],
      limit: pageSize,
      offset: offset,
      order: [['date', 'DESC']]
    });

    return {
      movements: rows,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page
    };
  } catch (error) {
    throw error;
  }
};

exports.updateMouvementStock = async (id, updateData) => {
  try {
    const updatedMouvement = await MouvementStock.update(updateData, {
      where: { mouvement_id: id },
      returning: true,
      plain: true,
    });
    return updatedMouvement[1];
  } catch (error) {
    throw error;
  }
};

exports.deleteMouvementStock = async (id) => {
  try {
    await MouvementStock.destroy({ where: { mouvement_id: id } });
  } catch (error) {
    throw error;
  }
};

exports.getMovementsByProduct = async (productId, page, limit) => {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await MouvementStock.findAndCountAll({
        where: { produit_id: productId },
        limit: limit,
        offset: offset,
        order: [['date', 'DESC']]
      });
  
      return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        movements: rows
      };
    } catch (error) {
      throw error;
    }
  };

// Fonction pour vérifier le format de l'email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};  


exports.deleteMovement = async (movementId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Récupérer le mouvement de stock à supprimer
    const movement = await MouvementStock.findOne({ where: { mouvement_id: movementId } });
    if (!movement) {
      throw new Error('Mouvement non trouvé.');
    }

    console.log('Mouvement trouvé:', movement);

    // Récupérer le produit associé
    const product = await Product.findOne({ where: { produit_id: movement.produit_id } });
    if (!product) {
      throw new Error('Produit non trouvé.');
    }

    console.log('Produit trouvé:', product);

    // Annuler l'opération sur le stock
    if (movement.type === 'entrée') {
      product.stock -= movement.quantite;
    } else if (movement.type === 'sortie' || movement.type === 'retour') {
      product.stock += movement.quantite;
    }

    console.log('Stock après annulation:', product.stock);

    // Sauvegarder le produit mis à jour
    await product.save({ transaction });

    // Supprimer le mouvement de stock
    await movement.destroy({ transaction });

    await transaction.commit();

    console.log('Produit mis à jour et mouvement supprimé:', product);
    return product; // Retourner le produit mis à jour
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la suppression du mouvement de stock:', error.message);
    throw error;
  }
};

