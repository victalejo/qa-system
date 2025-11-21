import express from 'express';
import User from '../models/User';
import Application from '../models/Application';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import emailService from '../services/emailService';
import whatsappService from '../services/whatsappService';

const router = express.Router();

// Obtener todos los usuarios QA (solo admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const qaUsers = await User.find({ role: 'qa' }).select('-password');
    res.json(qaUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios QA', error });
  }
});

// Obtener aplicaciones asignadas al QA actual
router.get('/my-applications', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const applications = await Application.find({
      assignedQAs: req.userId
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aplicaciones asignadas', error });
  }
});

// Obtener perfil del usuario actual
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error });
  }
});

// Actualizar preferencias de notificación
router.patch('/preferences', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { email, whatsapp, whatsappNumber } = req.body;

    const updateData: any = {
      notificationPreferences: {
        email: email !== undefined ? email : true,
        whatsapp: whatsapp !== undefined ? whatsapp : true
      }
    };

    if (whatsappNumber !== undefined) {
      updateData.whatsappNumber = whatsappNumber;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Preferencias actualizadas', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar preferencias', error });
  }
});

// Enviar notificación de prueba por email
router.post('/test-email', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'No tienes un email configurado' });
    }

    const success = await emailService.sendEmail({
      to: user.email,
      subject: '🔔 Notificación de Prueba - Sistema QA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Notificación de Prueba</h2>
          <p>Hola <strong>${user.name}</strong>,</p>
          <p>Esta es una notificación de prueba del Sistema de Gestión de QA.</p>
          <p>Si estás recibiendo este mensaje, tu configuración de email está funcionando correctamente.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Sistema de Gestión de QA
          </p>
        </div>
      `
    });

    if (success) {
      res.json({ message: 'Email de prueba enviado correctamente', email: user.email });
    } else {
      res.status(500).json({ message: 'Error al enviar email de prueba' });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Error al enviar email de prueba', error });
  }
});

// Enviar notificación de prueba por WhatsApp
router.post('/test-whatsapp', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.whatsappNumber) {
      return res.status(400).json({ message: 'No tienes un número de WhatsApp configurado' });
    }

    const message = `
🔔 *Notificación de Prueba*

Hola *${user.name}*,

Esta es una notificación de prueba del Sistema de Gestión de QA.

Si estás recibiendo este mensaje, tu configuración de WhatsApp está funcionando correctamente. ✅

_Sistema de Gestión de QA_
    `.trim();

    const success = await whatsappService.sendMessage(user.whatsappNumber, message);

    if (success) {
      res.json({ message: 'WhatsApp de prueba enviado correctamente', whatsappNumber: user.whatsappNumber });
    } else {
      res.status(500).json({ message: 'Error al enviar WhatsApp de prueba' });
    }
  } catch (error) {
    console.error('Error sending test WhatsApp:', error);
    res.status(500).json({ message: 'Error al enviar WhatsApp de prueba', error });
  }
});

// Eliminar un usuario QA (solo admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe y es QA
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'qa') {
      return res.status(400).json({ message: 'Solo se pueden eliminar usuarios QA' });
    }

    // Eliminar el QA de las aplicaciones asignadas
    await Application.updateMany(
      { assignedQAs: id },
      { $pull: { assignedQAs: id } }
    );

    // Eliminar el usuario
    await User.findByIdAndDelete(id);

    res.json({ message: 'Usuario QA eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario QA', error });
  }
});

export default router;
