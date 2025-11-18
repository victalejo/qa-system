import express from 'express';
import BugReport from '../models/BugReport';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Obtener todos los reportes de bugs
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const query = req.userRole === 'qa' 
      ? { reportedBy: req.userId }
      : {};

    const reports = await BugReport.find(query)
      .populate('application', 'name version')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error });
  }
});

// Crear reporte de bug
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      severity,
      application,
      environment,
      screenshots
    } = req.body;

    const bugReport = new BugReport({
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      severity,
      application,
      reportedBy: req.userId,
      environment,
      screenshots: screenshots || []
    });

    await bugReport.save();
    await bugReport.populate('application', 'name version');
    await bugReport.populate('reportedBy', 'name email');

    res.status(201).json(bugReport);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reporte', error });
  }
});

// Actualizar estado de reporte (solo admin)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const report = await BugReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('application', 'name version')
      .populate('reportedBy', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado', error });
  }
});

// Obtener reportes por aplicación
router.get('/application/:applicationId', authMiddleware, async (req, res) => {
  try {
    const reports = await BugReport.find({ application: req.params.applicationId })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error });
  }
});

export default router;
