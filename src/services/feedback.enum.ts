export const FeedbackType = {
    helpful: 'helpful',
    notHelpful: 'not_helpful',
} as const;

export type FeedbackEnums = typeof FeedbackType[keyof typeof FeedbackType];
