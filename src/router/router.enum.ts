// router.enum.ts
export const ROUTE = {
    ROOT: '/',
    ERROR: '/error',
    ERROR_CODE: '/error/:code',
    RE_LOGIN: '/relogin',
} as const;

export type Route = (typeof ROUTE)[keyof typeof ROUTE];