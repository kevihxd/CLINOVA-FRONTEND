import { useState, useEffect, useCallback } from 'react';
import http from '../services/httpClient';

export const useApi = (endpoint, options = {}) => {
    const { immediate = true, deps = [] } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await http.get(endpoint);
            setData(result);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [endpoint, ...deps]);

    useEffect(() => {
        if (immediate) fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
};

export const useApiMutation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = useCallback(async (method, endpoint, body) => {
        setLoading(true);
        setError(null);
        try {
            const result = await http[method](endpoint, body);
            return { data: result, error: null };
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Error en operación';
            setError(message);
            return { data: null, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    return { mutate, loading, error };
};
