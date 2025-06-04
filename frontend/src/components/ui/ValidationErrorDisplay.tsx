import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ValidationError, getFieldLabel } from '@/utils/errorHandling';

interface ValidationErrorDisplayProps {
  validationErrors: ValidationError[];
  className?: string;
}

export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  validationErrors,
  className = ''
}) => {
  if (validationErrors.length === 0) return null;

  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          {validationErrors.length === 1 ? (
            <span>{validationErrors[0].message}</span>
          ) : (
            <div>
              <div className="font-medium mb-2">Vui lòng kiểm tra các trường sau:</div>
              <ul className="list-none space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>
                      <strong>{getFieldLabel(error.field)}:</strong> {error.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface ValidationErrorInlineProps {
  fieldName: string;
  validationErrors: ValidationError[];
  className?: string;
}

export const ValidationErrorInline: React.FC<ValidationErrorInlineProps> = ({
  fieldName,
  validationErrors,
  className = ''
}) => {
  const fieldError = validationErrors.find(error => error.field === fieldName);
  
  if (!fieldError) return null;

  return (
    <div className={`text-red-500 text-sm mt-1 flex items-center gap-1 ${className}`}>
      <AlertCircle className="h-3 w-3" />
      <span>{fieldError.message}</span>
    </div>
  );
}; 