import { useState, useCallback } from 'react';
import { message } from 'antd';

export function useApi(apiFunc) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunc(...args);
            setData(result.data.data);
            return result.data.data;
        } catch(err) {
            const errorMsg = err.response?.data?.message
                || 'Something went wrong';
            setError(errorMsg);
            message.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunc]);

    return { data, loading, error, execute };
}