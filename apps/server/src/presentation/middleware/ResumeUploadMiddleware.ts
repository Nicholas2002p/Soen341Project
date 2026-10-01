import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { MAX_RESUME_SIZE_BYTES } from '../../domain/validation/ResumeFile.js';

// Keep the upload in memory so the file content can be validated before anything is written to disk
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: MAX_RESUME_SIZE_BYTES, files: 1 },
});

// Read a single file from the "resume" form field and turn upload errors into clear responses
export function resumeUploadMiddleware(req: Request, res: Response, next: NextFunction): void {
	upload.single('resume')(req, res, (error: unknown) => {
		if (error instanceof multer.MulterError) {
			// The file is bigger than the allowed size, return a 413 Payload Too Large response
			if (error.code === 'LIMIT_FILE_SIZE') {
				res.status(413).json({ message: 'Resume files must be 5 MB or smaller.' });
				return;
			}

			// Any other upload problem (wrong field name, too many files) is a bad request
			res.status(400).json({ message: 'Upload a single file in the "resume" field.' });
			return;
		}

		if (error) {
			next(error);
			return;
		}

		next();
	});
}
