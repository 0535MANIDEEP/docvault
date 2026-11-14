import { z } from 'zod';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_MB = 10;

export const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'text/plain',
] as const;

export const ALLOWED_UPLOAD_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.txt'] as const;

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
});

export const documentStatusSchema = z.enum(['draft', 'in_review', 'approved']);

export const documentCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title needs at least 3 characters')
    .max(120, 'Title must be 120 characters or fewer'),
  status: documentStatusSchema.optional(),
});

export const documentPatchSchema = z.object({
  title: documentCreateSchema.shape.title.optional(),
  status: documentStatusSchema.optional(),
  fileName: z.string().trim().min(1, 'A file name is required').optional(),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_BYTES, `File must be under ${MAX_UPLOAD_MB} MB`)
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;
export type DocumentPatchInput = z.infer<typeof documentPatchSchema>;

export interface FieldErrors {
  [field: string]: string;
}

/**
 * Turns a Zod failure into a `{ field: message }` map so a form can show the
 * error next to the input that caused it.
 */
export const toFieldErrors = (error: z.ZodError): FieldErrors => {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      errors[field] = issue.message;
    }
  }
  return errors;
};

export const hasAllowedExtension = (fileName: string): boolean => {
  const lower = fileName.toLowerCase();
  return ALLOWED_UPLOAD_EXTENSIONS.some((extension) => lower.endsWith(extension));
};
