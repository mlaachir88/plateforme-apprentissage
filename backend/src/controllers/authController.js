import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import cloudinary from "../config/cloudinary.js";
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

const formatUserResponse = (user) => {
  return {
    id: user._id,
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    role: user.role,
    niveauScolaire: user.niveauScolaire,
    classe: user.classe,
    profile: {
      avatarUrl: user.profile?.avatarUrl || "",
      avatarPublicId: user.profile?.avatarPublicId || "",
    },
  };
};

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "plateforme-apprentissage/avatars",
        resource_type: "image",
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
          },
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const register = async (req, res) => {
  try {
    const { prenom, nom, email, motDePasse, niveauScolaire, classe } = req.body;

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
      profile: {
        avatarUrl: "",
        avatarPublicId: "",
      },
    });

    const token = genererToken(user);

    res.status(201).json({
      message: "Compte étudiant créé avec succès",
      token,
      user: formatUserResponse(user),
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
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la connexion",
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    user: formatUserResponse(req.user),
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { prenom, nom, niveauScolaire, classe } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    if (prenom !== undefined) {
      if (!prenom.trim()) {
        return res.status(400).json({
          message: "Le prénom ne peut pas être vide",
        });
      }

      user.prenom = prenom.trim();
    }

    if (nom !== undefined) {
      if (!nom.trim()) {
        return res.status(400).json({
          message: "Le nom ne peut pas être vide",
        });
      }

      user.nom = nom.trim();
    }

    if (user.role === "student") {
      if (niveauScolaire !== undefined) {
        user.niveauScolaire = niveauScolaire;
      }

      if (classe !== undefined) {
        user.classe = classe;
      }
    }

    await user.save();

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du profil",
    });
  }
};

export const updateProfileAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Veuillez envoyer une image valide",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    if (user.profile?.avatarPublicId) {
      await cloudinary.uploader.destroy(user.profile.avatarPublicId);
    }

    const uploadedImage = await uploadBufferToCloudinary(req.file.buffer);

    user.profile = {
      avatarUrl: uploadedImage.secure_url,
      avatarPublicId: uploadedImage.public_id,
    };

    await user.save();

    res.status(200).json({
      message: "Photo de profil mise à jour avec succès",
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la photo de profil",
    });
  }
};

export const deleteProfileAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    if (user.profile?.avatarPublicId) {
      await cloudinary.uploader.destroy(user.profile.avatarPublicId);
    }

    user.profile = {
      avatarUrl: "",
      avatarPublicId: "",
    };

    await user.save();

    res.status(200).json({
      message: "Photo de profil supprimée avec succès",
      user: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la photo de profil",
    });
  }
};