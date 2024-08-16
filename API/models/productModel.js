const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    produit_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reference: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.STRING,
    },
    stock: {  
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    localisation_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Localisations',
        key: 'localisation_id',
      },
      allowNull: false,
    },    
  }, {
    timestamps: false,
  });

  return Product;
};
