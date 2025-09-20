import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { Logger } from '@/utils';

const logger = new Logger();

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validar query params
      if (schema) {
        const validatedData = schema.parse({
          ...req.query,
          ...req.params,
          ...req.body,
        });
        
        // Atualizar request com dados validados
        req.query = validatedData;
        req.params = validatedData;
        req.body = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        logger.warn('Validation error', { errors });
        
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid input data',
          details: errors,
        });
        return;
      }
      
      logger.error('Unexpected validation error', error as Error);
      next(error);
    }
  };
};
