import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const genererToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const register = async (req, res) => {
  try {
    const {
      prenom,
      nom,
      email,
      motDePasse,
      niveauScolaire,
      classe,
    } = req.body;

    if (
      !prenom ||
      !nom ||
      !email ||
      !motDePasse ||
      !niveauScolaire ||
      !classe
    ) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    const utilisateurExiste = await User.findOne({ email });

    if (utilisateurExiste) {
      return res.status(400).json({
        message: "Un compte existe déjà avec cet email",
      });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const user = await User.create({
      prenom,
      nom,
      email,
      motDePasse: hashedPassword,
      role: "student",
      niveauScolaire,
      classe,
    });

    const token = genererToken(user);

    res.status(201).json({
      message: "Compte étudiant créé avec succès",
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
        niveauScolaire: user.niveauScolaire,
        classe: user.classe,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du compte",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        message: "Email et mot de passe obligatoires",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    const motDePasseValide = await bcrypt.compare(
      motDePasse,
      user.motDePasse
    );

    if (!motDePasseValide) {
      return res.status(400).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    const token = genererToken(user);

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la connexion",
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};