import express from 'express';
import BugReport from '../models/BugReport';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService';

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
      .populate('statusHistory.changedBy', 'name email')
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
      screenshots,
      consoleErrors,
      queries
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
      screenshots: screenshots || [],
      consoleErrors: consoleErrors || undefined,
      queries: queries || undefined,
      comments: [],
      statusHistory: [{
        status: 'open',
        changedBy: req.userId,
        changedAt: new Date()
      }]
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
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    // Validar que solo los admins puedan cambiar el estado
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No autorizado. Solo los administradores pueden cambiar el estado.' });
    }

    const report = await BugReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Validar transición a 'pending-test' solo desde 'resolved'
    if (status === 'pending-test' && report.status !== 'resolved') {
      return res.status(400).json({
        message: 'Solo se puede pasar a "Por Testear" desde el estado "Resuelto"'
      });
    }

    const previousStatus = report.status;

    // Agregar al historial de cambios de estado
    report.status = status;
    report.statusHistory = report.statusHistory || [];
    report.statusHistory.push({
      status,
      changedBy: req.userId,
      changedAt: new Date()
    } as any);

    await report.save();
    await report.populate('application', 'name version');
    await report.populate('reportedBy', 'name email');
    await report.populate('statusHistory.changedBy', 'name email');

    // Enviar notificaciones si el bug pasó a 'pending-test'
    if (status === 'pending-test') {
      notificationService.notifyTesterBugPendingTest(report._id.toString());
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado', error });
  }
});

// Registrar decisión del tester sobre un bug en estado 'pending-test'
router.patch('/:id/tester-decision', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { decision, comment } = req.body;

    // Validar que exista la decisión y el comentario
    if (!decision || !comment || comment.trim() === '') {
      return res.status(400).json({
        message: 'La decisión y el comentario son obligatorios'
      });
    }

    // Validar que la decisión sea válida
    if (!['fixed', 'regression', 'not-fixed'].includes(decision)) {
      return res.status(400).json({
        message: 'Decisión inválida. Debe ser: fixed, regression o not-fixed'
      });
    }

    const report = await BugReport.findById(req.params.id).populate('reportedBy');

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Validar que el bug esté en estado 'pending-test'
    if (report.status !== 'pending-test') {
      return res.status(400).json({
        message: 'Solo se puede tomar una decisión sobre bugs en estado "Por Testear"'
      });
    }

    // Validar que el usuario actual sea el tester que reportó el bug
    if (report.reportedBy._id.toString() !== req.userId) {
      return res.status(403).json({
        message: 'No autorizado. Solo el tester que reportó este bug puede tomar la decisión.'
      });
    }

    // Guardar la decisión del tester
    report.testerDecision = {
      decision,
      comment: comment.trim(),
      decidedAt: new Date()
    };

    // Cambiar el estado según la decisión
    let newStatus: 'open' | 'closed' = 'open';
    if (decision === 'fixed') {
      newStatus = 'closed';
    } else {
      newStatus = 'open';
      // Marcar como regresión si aplica
      if (decision === 'regression') {
        report.isRegression = true;
      }
    }

    report.status = newStatus;
    report.statusHistory = report.statusHistory || [];
    report.statusHistory.push({
      status: newStatus,
      changedBy: req.userId,
      changedAt: new Date()
    } as any);

    await report.save();
    await report.populate('application', 'name version');
    await report.populate('reportedBy', 'name email');
    await report.populate('statusHistory.changedBy', 'name email');

    // Notificar a los admins sobre la decisión del tester
    notificationService.notifyAdminsTesterDecision(
      report._id.toString(),
      decision,
      comment.trim()
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar decisión del tester', error });
  }
});

// Obtener reportes por aplicación
router.get('/application/:applicationId', authMiddleware, async (req, res) => {
  try {
    const reports = await BugReport.find({ application: req.params.applicationId })
      .populate('reportedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error });
  }
});

// Obtener un reporte específico con todos sus detalles
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await BugReport.findById(req.params.id)
      .populate('application', 'name version')
      .populate('reportedBy', 'name email')
      .populate('comments.user', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reporte', error });
  }
});

// Agregar comentario a un reporte
router.post('/:id/comments', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    const report = await BugReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    const comment = {
      user: req.userId,
      text: text.trim(),
      createdAt: new Date()
    };

    report.comments = report.comments || [];
    report.comments.push(comment as any);
    await report.save();

    await report.populate('comments.user', 'name email');

    // Si el comentario es de un admin, notificar a los QAs asignados
    if (req.userRole === 'admin') {
      const admin = await User.findById(req.userId);
      if (admin) {
        notificationService.notifyQAsAdminComment(
          report._id.toString(),
          text.trim(),
          admin.name
        );
      }
    }

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar comentario', error });
  }
});

// Obtener estadísticas de reportes
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const totalReports = await BugReport.countDocuments();
    const openReports = await BugReport.countDocuments({ status: 'open' });
    const inProgressReports = await BugReport.countDocuments({ status: 'in-progress' });
    const resolvedReports = await BugReport.countDocuments({ status: 'resolved' });
    const closedReports = await BugReport.countDocuments({ status: 'closed' });
    const pendingTestReports = await BugReport.countDocuments({ status: 'pending-test' });

    const bySeverity = await BugReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const byApplication = await BugReport.aggregate([
      {
        $group: {
          _id: '$application',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: '_id',
          as: 'appInfo'
        }
      },
      {
        $unwind: '$appInfo'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$appInfo.name',
          version: '$appInfo.version'
        }
      }
    ]);

    res.json({
      total: totalReports,
      byStatus: {
        open: openReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        closed: closedReports,
        pendingTest: pendingTestReports
      },
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      topApplications: byApplication
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error });
  }
});

// Obtener tendencias de bugs por fecha (últimos 30 días)
router.get('/stats/trends', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await BugReport.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Rellenar días sin datos con 0
    const trendsMap = new Map(trends.map(t => [t._id, t.count]));
    const result = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateString = date.toISOString().split('T')[0];

      result.push({
        date: dateString,
        count: trendsMap.get(dateString) || 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tendencias', error });
  }
});

export default router;
