export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  metadata?: {
    validationErrors?: Record<string, string>;
  };
  status: number;
}

/**
 * Extracts validation errors from backend response
 */
export const extractValidationErrors = (error: any): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  
  // Check if it's a backend API error with validation details
  if (error?.response?.data?.metadata?.validationErrors) {
    const errors = error.response.data.metadata.validationErrors;
    for (const [field, message] of Object.entries(errors)) {
      validationErrors.push({
        field,
        message: message as string
      });
    }
  }
  
  return validationErrors;
};

/**
 * Gets the main error message from backend response
 */
export const getErrorMessage = (error: any): string => {
  // Try to get the message from backend response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Fallback to error message
  if (error?.message) {
    return error.message;
  }
  
  // Default message
  return 'An unexpected error occurred';
};

/**
 * Formats validation errors for display
 */
export const formatValidationErrors = (validationErrors: ValidationError[]): string => {
  if (validationErrors.length === 0) return '';
  
  if (validationErrors.length === 1) {
    return validationErrors[0].message;
  }
  
  return validationErrors.map(error => `• ${error.message}`).join('\n');
};

/**
 * Gets detailed error information including validation errors
 */
export const getDetailedError = (error: any) => {
  const validationErrors = extractValidationErrors(error);
  const mainMessage = getErrorMessage(error);
  
  return {
    mainMessage,
    validationErrors,
    hasValidationErrors: validationErrors.length > 0,
    formattedValidationErrors: formatValidationErrors(validationErrors)
  };
};

/**
 * Displays error using toast with proper validation error handling
 */
export const displayError = (error: any, toast: any, title: string = 'Error') => {
  const { mainMessage, validationErrors, hasValidationErrors, formattedValidationErrors } = getDetailedError(error);
  
  if (hasValidationErrors) {
    // If we have validation errors, show them as the main message
    toast({
      title: title,
      description: formattedValidationErrors,
      variant: 'destructive',
    });
  } else {
    // Show the main error message
    toast({
      title: title,
      description: mainMessage,
      variant: 'destructive',
    });
  }
};

/**
 * Maps field names to user-friendly Vietnamese labels
 */
export const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      name: 'Group Name',
      description: 'Description',
      repositoryUrl: 'Repository URL',
      projectId: 'Project ID',
      username: 'Username',
      password: 'Password',
      email: 'Email',
      fullName: 'Full Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      confirmPassword: 'Confirm Password',
      title: 'Title',
      deadline: 'Deadline',
      difficulty: 'Difficulty',
      priority: 'Priority',
      assigneeId: 'Assignee',
      groupId: 'Group ID',
      content: 'Content',
      taskId: 'Task ID',
      maxMembers: 'Max Members',
      evaluationCriteria: 'Evaluation Criteria',
      // Project Create fields
      weightW1: 'Weight W1 (Task Completion)',
      weightW2: 'Weight W2 (Peer Review)',
      weightW3: 'Weight W3 (Commit Count)',
      weightW4: 'Weight W4 (Late Task Penalty)',
      freeriderThreshold: 'Free-rider Detection Threshold',
      pressureThreshold: 'Pressure Threshold',
    };
  
    return fieldLabels[fieldName] || fieldName;
  };

/**
 * Enhanced error display with Vietnamese field labels
 */
export const displayEnhancedError = (error: any, toast: any, title: string = 'Lỗi') => {
  const { mainMessage, validationErrors, hasValidationErrors } = getDetailedError(error);
  
  if (hasValidationErrors) {
    // Format validation errors with Vietnamese field labels
    const formattedErrors = validationErrors.map(err => {
      const fieldLabel = getFieldLabel(err.field);
      return `• ${fieldLabel}: ${err.message}`;
    }).join('\n');
    
    toast({
      title: title,
      description: formattedErrors,
      variant: 'destructive',
    });
  } else {
    toast({
      title: title,
      description: mainMessage,
      variant: 'destructive',
    });
  }
}; 