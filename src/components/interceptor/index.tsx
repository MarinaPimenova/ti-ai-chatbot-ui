import { useEffect, useState } from 'react';
import { setupInterceptors } from '../../services/axios.config';
import { notification } from 'antd';

export const Interceptor = () => {
    const [ran, setRan] = useState(false);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (!ran) {
            setupInterceptors(api);
            setRan(true);
        }
    }, [ran, api]);
    return <>{contextHolder}</>;
};
