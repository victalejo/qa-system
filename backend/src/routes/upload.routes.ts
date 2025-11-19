import { Router, Request, Response } from 'express';
import { uploadMultipleImages } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Endpoint para subir múltiples screenshots
router.post('/screenshots', authMiddleware, (req: Request, res: Response) => {
  uploadMultipleImages(req, res, (err: any) => {
    if (err) {
      if (err.message === 'Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, GIF, WEBP') {
        return res.status(400).json({ message: err.message });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'El archivo excede el tamaño máximo de 5MB' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Se excedió el límite de 10 imágenes' });
      }
      return res.status(500).json({ message: 'Error al subir archivos', error: err.message });
    }

    // Verificar si se subieron archivos
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No se subieron archivos' });
    }

    // Generar URLs de los archivos subidos
    const uploadedFiles = req.files.map((file: Express.Multer.File) => {
      return `/uploads/screenshots/${file.filename}`;
    });

    res.status(200).json({
      message: 'Archivos subidos exitosamente',
      files: uploadedFiles
    });
  });
});

export default router;
