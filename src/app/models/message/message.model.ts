export interface Message {
    role: 'system' | 'user' | 'assistant' | 'image';
    content: string;
    isTyping?: boolean;
    timestamp?: number;
    safeContent?: string;
    imageUrl?: string;
    isProcessing?: boolean;
    error?: string
}