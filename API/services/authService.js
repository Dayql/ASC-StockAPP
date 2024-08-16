const db = require('../config/database');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Fonction pour vérifier le format de l'email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction pour vérifier le format du mot de passe
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  return passwordRegex.test(password);
};

// Ajout d'un nouvel utilisateur
exports.addUser = async function(newUser) {
  try {
    const existingUser = await db.User.findOne({
      where: {
        [Op.or]: [{ email: newUser.email }, { username: newUser.username }]
      }
    });

    if (existingUser) {
      if (existingUser.username === newUser.username) {
        throw new Error('Le nom d\'utilisateur est déjà utilisé');
      } else if (existingUser.email === newUser.email) {
        throw new Error('L\'email est déjà utilisé');
      }
    }

    const hashedPassword = await bcrypt.hash(newUser.password, parseInt(process.env.BCRYPT_SALT_ROUND, 10));
    newUser.password = hashedPassword;
    const savedUser = await db.User.create(newUser);
    return savedUser;
  } catch (err) {
    throw err;
  }
};

// Récupération de tous les utilisateurs
exports.getAllUsers = async function() {
  try {
    const users = await db.User.findAll({ attributes: { exclude: ['password'] } });
    return users;
  } catch (err) {
    throw err;
  }
};

// Récupération d'un utilisateur par ID
exports.getUserById = async function(id) {
  try {
    const user = await db.User.findByPk(id);
    return user;
  } catch (err) {
    throw err;
  }
};

// Récupération d'un utilisateur par nom d'utilisateur
exports.getUserByUsername = async function(username) {
  try {
    const user = await db.User.findOne({ where: { username } });
    return user;
  } catch (err) {
    throw err;
  }
};

// Comparaison des mots de passe
exports.comparePassword = async function(candidatePassword, hash) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, hash);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

// Inscription
exports.register = async (data) => {
  try {
    const { username, email, password } = data;

    // Vérifie les champs obligatoires
    if (!username || !email || !password) {
      throw new Error('Tous les champs sont requis');
    }

    // Vérifie les longueurs minimales et les formats
    if (username.length < 3) {
      throw new Error('Le nom d\'utilisateur doit comporter au moins 3 caractères');
    }

    // Vérifie si l'email est déjà utilisé
    if (!isValidEmail(email)) {
      throw new Error('L\'email n\'est pas valide');
    }

    // Vérifie si le mot de passe est valide
    if (!isValidPassword(password)) {
      throw new Error('Le mot de passe doit comporter au moins une lettre minuscule, une lettre majuscule, un chiffre, un caractère spécial et doit comporter au moins 8 caractères.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { username, email, password: hashedPassword, role: 'user' };
    const user = await db.User.create(newUser);
    return user;
  } catch (err) {
    throw err;
  }
};

// Authentification
exports.login = async (data) => {
  const { username, password, rememberMe } = data;

  // Vérifie les champs obligatoires
  if (!username || !password) {
    throw new Error('Tous les champs sont requis');
  }

  const user = await db.User.findOne({ where: { username } });
  if (!user) {
    throw new Error('Nom d\'utilisateur incorrect');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Mot de passe incorrect');
  }

  const tokenExpiry = rememberMe ? '30d' : process.env.JWT_DURING; // Durée de validité du token
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: tokenExpiry
  });

  return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
};

// Mise à jour du profil
// Mise à jour du profil
exports.updateOwnProfile = async (userId, updatedFields) => {
  try {
    const { email, username, currentPassword, password } = updatedFields;

    // Vérifie qu'au moins un champ est fourni
    if (!username && !email && !password) {
      throw new Error('Au moins un champ (nom d\'utilisateur, email ou mot de passe) doit être fourni pour la mise à jour.');
    }

    // Récupère l'utilisateur actuel pour comparer les champs
    const currentUser = await db.User.findByPk(userId);

    if (!currentUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si l'utilisateur souhaite changer son mot de passe, vérifie d'abord le mot de passe actuel
    if (password) {
      if (!currentPassword) {
        throw new Error('Le mot de passe actuel est requis pour en définir un nouveau.');
      }

      const isMatch = await bcrypt.compare(currentPassword, currentUser.password);

      if (!isMatch) {
        throw new Error('Le mot de passe actuel est incorrect.');
      }

      // Hache le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    // Vérification des prérequis pour les champs
    if (username && username.length < 3) {
      throw new Error('Le nom d\'utilisateur doit comporter au moins 3 caractères');
    }

    if (email && !isValidEmail(email)) {
      throw new Error('L\'email n\'est pas valide');
    }

    // Vérifie si email ou username sont fournis et existent déjà pour d'autres utilisateurs
    const existingUser = await db.User.findOne({
      where: {
        [Op.or]: [
          email && email !== currentUser.email ? { email: email, id: { [Op.ne]: userId } } : null,
          username && username !== currentUser.username ? { username: username, id: { [Op.ne]: userId } } : null
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      const duplicateField = existingUser.email === email ? 'Email' : 'Username';
      throw new Error(`${duplicateField} existe déjà`);
    }

    // Supprime les champs inchangés pour éviter les mises à jour inutiles
    Object.keys(updatedFields).forEach(key => {
      if (updatedFields[key] === currentUser[key]) {
        delete updatedFields[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      throw new Error('Aucune modification détectée');
    }

    await db.User.update(updatedFields, { where: { id: userId } });
    const updatedUser = await db.User.findByPk(userId, { attributes: { exclude: ['password'] } });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};



exports.updateUserProfile = async (userId, updatedFields) => {
  try {
    // Vérifier si updatedFields est bien défini
    if (!updatedFields || typeof updatedFields !== 'object') {
      throw new Error('Les données de mise à jour sont manquantes ou incorrectes.');
    }

    const { email, username, role } = updatedFields;

    // Vérifie que l'admin fournit tous les champs nécessaires
    if (!username || !email || !role) {
      throw new Error('Le nom d\'utilisateur, l\'email et le rôle sont tous requis.');
    }

    // Vérification des prérequis pour les champs
    if (username.length < 3) {
      throw new Error('Le nom d\'utilisateur doit comporter au moins 3 caractères');
    }

    if (!isValidEmail(email)) {
      throw new Error('L\'email n\'est pas valide');
    }

    // Récupère l'utilisateur cible
    const currentUser = await db.User.findByPk(userId);

    if (!currentUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifie si email ou username existent déjà dans la bdd pour d'autres utilisateurs
    const existingUser = await db.User.findOne({
      where: {
        [Op.or]: [
          { email: email, id: { [Op.ne]: userId } },
          { username: username, id: { [Op.ne]: userId } }
        ]
      }
    });

    if (existingUser) {
      const duplicateField = existingUser.email === email ? 'Email' : 'Username';
      throw new Error(`${duplicateField} existe déjà`);
    }

    // Supprime les champs inchangés pour éviter les mises à jour inutiles
    Object.keys(updatedFields).forEach(key => {
      if (updatedFields[key] === currentUser[key]) {
        delete updatedFields[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      throw new Error('Aucune modification détectée');
    }

    await db.User.update(updatedFields, { where: { id: userId } });
    const updatedUser = await db.User.findByPk(userId, { attributes: { exclude: ['password'] } });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};







// Suppression du compte
exports.deleteAccount = async (userId) => {
  try {
    await db.User.destroy({ where: { id: userId } });
  } catch (error) {
    throw error;
  }
};



exports.getUsersPaginated = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await db.User.findAndCountAll({
      limit: limit,
      offset: offset
    });

    return {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users: rows
    };
  } catch (error) {
    throw error;
  }
};
