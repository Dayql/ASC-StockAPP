const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
    alert_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    produit_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Products',
        key: 'produit_id',
      },
      allowNull: false,
    },
    seuil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    timestamps: false,
  });

  return Alert;
};
