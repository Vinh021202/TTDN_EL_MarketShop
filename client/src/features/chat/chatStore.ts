import { create } from 'zustand';
import { sendChatMessage } from './services/chatApi';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

interface ChatState {
    isOpen: boolean;
    messages: ChatMessage[];
    isTyping: boolean;
    sessionId: string;
    setOpen: (open: boolean) => void;
    toggle: () => void;
    sendMessage: (text: string, cartItems?: any[]) => Promise<void>;
    clearHistory: () => void;
}

const SESSION_KEY = 'chat_session_id';

function getOrCreateSessionId(): string {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
}

export const useChatStore = create<ChatState>((set, get) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    sessionId: getOrCreateSessionId(),

    setOpen: (open) => set({ isOpen: open }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),

    sendMessage: async (text, cartItems = []) => {
        const { sessionId } = get();

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: text,
            createdAt: new Date(),
        };
        set((state) => ({ messages: [...state.messages, userMsg], isTyping: true }));

        try {
            const data = await sendChatMessage(text, sessionId, cartItems, window.location.pathname);
            const aiMsg: ChatMessage = {
                id: data.message._id || crypto.randomUUID(),
                role: 'assistant',
                content: data.message.content,
                createdAt: new Date(data.message.createdAt),
            };
            set((state) => ({ messages: [...state.messages, aiMsg], isTyping: false }));
        } catch (err: any) {
            const status: number | undefined = err?.response?.status;
            let content = 'Xin loi, AI dang tam thoi khong kha dung. Vui long thu lai sau!';

            if (status === 429) {
                content = 'AI dang ban, vui long thu lai sau vai giay!';
            } else if (status === 503) {
                content =
                    'Ket noi AI hien chua san sang. Hay kiem tra cau hinh DashScope va API key trong Model Studio.';
            } else if (status === 401 || status === 403) {
                content = 'Loi xac thuc. Vui long dang nhap lai va thu lai.';
            } else if (!navigator.onLine) {
                content = 'Khong co ket noi internet. Vui long kiem tra mang va thu lai.';
            }

            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content,
                createdAt: new Date(),
            };
            set((state) => ({ messages: [...state.messages, errorMsg], isTyping: false }));
        }
    },

    clearHistory: () => {
        const newId = crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, newId);
        set({ messages: [], sessionId: newId });
    },
}));
