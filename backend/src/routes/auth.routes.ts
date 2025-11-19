import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, whatsappNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Validar whatsappNumber si el rol es 'qa'
    if ((role === 'qa' || !role) && !whatsappNumber) {
      return res.status(400).json({ message: 'El número de WhatsApp es obligatorio para usuarios QA' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'qa',
      whatsappNumber,
      notificationPreferences: {
        email: true,
        whatsapp: true
      }
    });

    await user.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
});

export default router;
