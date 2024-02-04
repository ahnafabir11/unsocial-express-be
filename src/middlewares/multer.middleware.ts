import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const validFileTypes = ['image/png', 'image/jpeg'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/temp');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.userId}.${file.mimetype.split('/')[1]}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const isValidType = validFileTypes.some((type) => file.mimetype === type);

  if (!isValidType) return cb(new Error(`INVALID_FILE_TYPE.${file.fieldname}`));

  return cb(null, true);
};

const limits: multer.Options['limits'] = {
  fileSize: 1024 * 1024, // MAX 1MB
};

const upload = multer({ storage, fileFilter, limits });

export const multerMiddleware = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (e: any) => {
      if (!e) return next();

      if (e.message === 'INVALID_FILE_TYPE')
        return res.status(400).json({
          message: 'VALIDATION_ERROR',
          data: { root: `File type must be any of ${validFileTypes.join(' | ')}.` },
        });

      if (e.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({
          message: 'VALIDATION_ERROR',
          data: { root: 'Maximum file size can be 1MB.' },
        });

      return res.status(400).json({
        message: 'VALIDATION_ERROR',
        data: { root: 'Invalid file!' },
      });
    });
  };
};
