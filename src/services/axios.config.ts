// src/services/axios.config.ts
import axios, { AxiosError } from 'axios';
import { type NotificationEnums, NotificationType } from './notifications.enum';
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

export const setupInterceptors = (notifyApi: any) => {
    protectedApi.interceptors.request.use(requestInterceptor);
    publicApi.interceptors.request.use(requestInterceptor);

    const apis = [protectedApi.interceptors, publicApi.interceptors];

    apis.forEach((api) => {
        api.response.use(
            (response) => response,
            (error: AxiosError<any>) => {
                if (error) {
                    // 1. Backend Service Unavailable / Network Connection Failed
                    if (error.code === 'ERR_NETWORK' || !error.response) {
                        useNetworkStore.getState().setNetworkError(true);
                        return Promise.reject(error);
                    }

                    useNetworkStore.getState().clearNetworkError();

                    // 2. Bad Requests & General API Errors
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
                }
                return Promise.reject(error);
            }
        );
    });
};
