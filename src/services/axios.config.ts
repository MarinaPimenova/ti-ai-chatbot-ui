// src/services/axios.config.ts
import axios, { AxiosError } from 'axios';
import { type NotificationEnums, NotificationType } from './notifications.enum';
import { ROUTE } from '../router/router.enum';
import { useNetworkStore } from '../store/network/network.store';
import { getServerUrl } from './utils.service.ts';

const apiServerUrl = getServerUrl('ORIGINAL');

export const protectedApi = axios.create({
    withCredentials: true,
    baseURL: apiServerUrl,
    headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': crypto.randomUUID(),
    },
});

export const publicApi = axios.create({
    baseURL: apiServerUrl,
    headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': crypto.randomUUID(),
    },
});

export const openNotificationWithIcon = (
    api: any,
    type: NotificationEnums,
    title: string,
    desc: string,
    key: string
) => {
    if (!api || !api[type]) return;
    api[type]({
        key,
        message: title,
        description: desc,
    });
};

const requestInterceptor = (config: any) => config;

export const setupInterceptors = (navRef: any, notifyApi: any) => {
    protectedApi.interceptors.request.use(requestInterceptor);
    publicApi.interceptors.request.use(requestInterceptor);

    const apis = [protectedApi.interceptors, publicApi.interceptors];

    apis.forEach((api) => {
        api.response.use(
            (response) => response,
            (error: AxiosError<any>) => {
                if (error) {
                    // Check if request explicitly disabled automatic auth redirects
                    const shouldSkipAuthRedirect = (error.config as any)?.skipAuthRedirect;

                    // 1. Backend Service Unavailable / Network Connection Failed
                    if (error.code === 'ERR_NETWORK' || !error.response) {
                        useNetworkStore.getState().setNetworkError(true);
                        if (navRef.current && !shouldSkipAuthRedirect) {
                            console.log(`Interceptor: ERR_NETWORK was caught`);
                            return navRef.current(ROUTE.ERROR);
                        }
                        return Promise.reject(error);
                    }

                    // 2. Authentication Expiry / Unauthenticated (401 / 403)
                    if (error.response.status === 401 || error.response.status === 403) {
                        // Only redirect to /relogin if skipAuthRedirect is NOT set
                        if (navRef.current && !shouldSkipAuthRedirect) {
                            console.log(`Interceptor: 401 was caught`);
                            return navRef.current(ROUTE.RE_LOGIN);
                        }
                        return Promise.reject(error);
                    }

                    // 3. Bad Requests & General API Errors (e.g., 400 Bad Request)
                    const errorCode = error.code || `ERR_${error.response.status}`;
                    const errorMessage = error.response.data?.errorMessage;

                    if (errorMessage && !errorMessage.includes('Invalid pattern value')) {
                        openNotificationWithIcon(
                            notifyApi,
                            NotificationType.error,
                            'Error Occurred',
                            errorMessage,
                            NotificationType.error
                        );
                    }

                    if (navRef.current && !shouldSkipAuthRedirect) {
                        console.log(`Interceptor: ERROR was caught`);
                        return navRef.current(`${ROUTE.ERROR}/${errorCode}`);
                    }
                }
                return Promise.reject(error);
            }
        );
    });
};