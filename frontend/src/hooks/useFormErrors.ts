import { useState } from 'react';
import { ValidationError, getDetailedError, displayEnhancedError } from '@/utils/errorHandling';

interface UseFormErrorsOptions {
  toast: any;
  scrollToTop?: boolean;
}

export const useFormErrors = ({ toast, scrollToTop = true }: UseFormErrorsOptions) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const clearErrors = () => {
    setValidationErrors([]);
  };

  const handleError = (error: any, title: string = 'Lỗi') => {
    const { validationErrors: errors } = getDetailedError(error);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    
    displayEnhancedError(error, toast, title);
  };

  const hasFieldError = (fieldName: string): boolean => {
    return validationErrors.some(error => error.field === fieldName);
  };

  const getFieldError = (fieldName: string): ValidationError | undefined => {
    return validationErrors.find(error => error.field === fieldName);
  };

  const getFieldErrorClass = (fieldName: string, baseClass: string = '', errorClass: string = 'border-red-400 bg-red-50'): string => {
    return hasFieldError(fieldName) ? `${baseClass} ${errorClass}` : baseClass;
  };

  return {
    validationErrors,
    clearErrors,
    handleError,
    hasFieldError,
    getFieldError,
    getFieldErrorClass,
    hasErrors: validationErrors.length > 0
  };
}; 