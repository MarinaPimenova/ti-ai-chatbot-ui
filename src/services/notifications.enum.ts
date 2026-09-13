export const NotificationType = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
} as const;

export type NotificationEnums = typeof NotificationType[keyof typeof NotificationType];