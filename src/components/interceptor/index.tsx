import { useEffect, useRef, useState } from 'react';
import { setupInterceptors } from '../../services/axios.config';
import { notification } from 'antd';
import { useNotifyStore } from '../../store/notify/notify.store';
import { useNavigate } from 'react-router-dom';

export const Interceptor = () => {
    // Use useRef to prevent a re-render in the useEffect.
    // A ref, cannot be used as a useEffect dependency, hence,
    // your linters shouldn't complain about missing dependencies.
    const navRef = useRef(useNavigate())

    const [ran, setRan] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const updateNotifyApi = useNotifyStore((state) => state.updateNotifyApi);

    useEffect(() => {
        if (!ran) {
            setupInterceptors(navRef, api);
            setRan(true);
            updateNotifyApi(api);
        }
    }, [ran, api]);
    return <>{contextHolder}</>;
};