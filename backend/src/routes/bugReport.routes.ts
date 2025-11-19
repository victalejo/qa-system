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

    const report = await BugReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

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
        closed: closedReports
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
