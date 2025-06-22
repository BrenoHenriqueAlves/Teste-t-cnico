import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const uploadPath = path.resolve(__dirname, '..', '..', 'uploads', 'originals');

export const multerConfig = {
  dest: uploadPath,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const hash = crypto.randomBytes(16).toString('hex');
      const fileName = `${hash}-${file.originalname.replace(/\s/g, '_')}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
    }
  },
};