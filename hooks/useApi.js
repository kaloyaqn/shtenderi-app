import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for API operations with loading states and error handling
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      showSuccess = true,
      showError = true,
      successMessage = 'Operation completed successfully',
      errorMessage = 'An error occurred',
      onSuccess,
      onError,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || errorMessage;
        
        if (showError) {
          toast.error(message);
        }
        
        setError(message);
        onError?.(message, errorData);
        return { success: false, error: message, data: errorData };
      }

      const data = await response.json().catch(() => null);
      
      if (showSuccess) {
        toast.success(successMessage);
      }
      
      onSuccess?.(data);
      return { success: true, data };
    } catch (err) {
      const message = err.message || errorMessage;
      
      if (showError) {
        toast.error(message);
      }
      
      setError(message);
      onError?.(message, err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Custom hook for CRUD operations
 */
export function useCrud(endpoint, options = {}) {
  const api = useApi();
  const { onSuccess, onError } = options;

  const create = useCallback(async (data) => {
    return api.execute(
      () => fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      {
        successMessage: 'Created successfully',
        errorMessage: 'Failed to create',
        onSuccess,
        onError,
      }
    );
  }, [endpoint, api, onSuccess, onError]);

  const update = useCallback(async (id, data) => {
    return api.execute(
      () => fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      {
        successMessage: 'Updated successfully',
        errorMessage: 'Failed to update',
        onSuccess,
        onError,
      }
    );
  }, [endpoint, api, onSuccess, onError]);

  const remove = useCallback(async (id) => {
    return api.execute(
      () => fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      }),
      {
        successMessage: 'Deleted successfully',
        errorMessage: 'Failed to delete',
        onSuccess,
        onError,
      }
    );
  }, [endpoint, api, onSuccess, onError]);

  const fetchOne = useCallback(async (id) => {
    return api.execute(
      () => fetch(`${endpoint}/${id}`),
      {
        showSuccess: false,
        errorMessage: 'Failed to fetch',
        onSuccess,
        onError,
      }
    );
  }, [endpoint, api, onSuccess, onError]);

  const fetchAll = useCallback(async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return api.execute(
      () => fetch(url),
      {
        showSuccess: false,
        errorMessage: 'Failed to fetch',
        onSuccess,
        onError,
      }
    );
  }, [endpoint, api, onSuccess, onError]);

  return {
    ...api,
    create,
    update,
    remove,
    fetchOne,
    fetchAll,
  };
}

