import axios from 'axios';
import { API_BASE_URL } from '@/features/shared/api/apiBaseUrl';

function getAuthHeaders(): Record<string, string> {
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw);
        const token: string | undefined = parsed?.state?.token;

        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
    } catch {
        return {};
    }

    return {};
}

export const sendChatMessage = async (
    message: string,
    sessionId: string,
    cartItems?: { name: string; quantity: number }[],
    currentPage?: string
) => {
    const { data } = await axios.post(
        `${API_BASE_URL}/chat/message`,
        { message, sessionId, cartItems, currentPage },
        { headers: getAuthHeaders() }
    );

    return data;
};

export const getChatHistory = async (sessionId: string) => {
    const { data } = await axios.get(`${API_BASE_URL}/chat/history/${sessionId}`, {
        headers: getAuthHeaders(),
    });

    return data;
};
