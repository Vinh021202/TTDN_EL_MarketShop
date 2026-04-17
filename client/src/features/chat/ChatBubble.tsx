import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Trash2, ChevronDown, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';
import { useChatStore } from './chatStore';
import { useCartStore } from '@/store/cartStore';

function MessageContent({ content }: { content: string }) {
    const lines = content.split('\n');

    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={i} className="text-sm leading-relaxed">
                        {parts.map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
                    </p>
                );
            })}
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gray-400"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ChatBubble() {
    const location = useLocation();
    const language = useThemeStore((state) => state.language);
    const { isOpen, messages, isTyping, toggle, sendMessage, clearHistory } = useChatStore();
    const cartItems = useCartStore((state) => state.items);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const copy = useMemo(
        () => ({
            assistantName: translate({ vi: 'Trợ lý TTDN', en: 'TTDN Assistant' }, language),
            online: translate({ vi: 'AI đang hoạt động', en: 'AI is online' }, language),
            clearHistory: translate({ vi: 'Xóa lịch sử', en: 'Clear history' }, language),
            welcome: translate(
                {
                    vi: 'Xin chào! Tôi là trợ lý mua sắm của TTDN Food Market. Tôi có thể giúp bạn:',
                    en: 'Hello! I am the shopping assistant for TTDN Food Market. I can help you with:',
                },
                language
            ),
            hintOne: translate({ vi: 'Gợi ý nguyên liệu tươi ngon', en: 'Suggest fresh ingredients' }, language),
            hintTwo: translate({ vi: 'Tư vấn công thức nấu ăn', en: 'Recommend recipes' }, language),
            hintThree: translate({ vi: 'Lên kế hoạch thực đơn', en: 'Plan a simple meal menu' }, language),
            suggested: translate({ vi: 'Gợi ý câu hỏi:', en: 'Suggested prompts:' }, language),
            inputPlaceholder: translate({ vi: 'Hỏi tôi về thực phẩm...', en: 'Ask me about food...' }, language),
            poweredBy: translate({ vi: 'Trợ lý mua sắm thông minh', en: 'Smart shopping assistant' }, language),
            openChat: translate({ vi: 'Mở chatbot', en: 'Open chatbot' }, language),
            suggestedQuestions: [
                translate({ vi: 'Tôi nên mua gì cho bữa cơm gia đình?', en: 'What should I buy for a family meal?' }, language),
                translate({ vi: 'Với thịt bò nên nấu món gì?', en: 'What can I cook with beef?' }, language),
                translate({ vi: 'Gợi ý thực đơn 3 ngày lành mạnh', en: 'Suggest a healthy 3-day meal plan' }, language),
            ],
        }),
        [language]
    );

    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || isTyping) return;
        setInput('');
        const cartContext = cartItems.map((item) => ({ name: item.name, quantity: item.quantity }));
        sendMessage(text, cartContext);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-20 right-5 z-50 w-[370px] max-h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/15"
                        style={{
                            background: 'linear-gradient(135deg, rgba(10,20,30,0.97) 0%, rgba(5,20,15,0.97) 100%)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-green-900/40 to-emerald-900/20">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white text-sm font-semibold">{copy.assistantName}</p>
                                <p className="text-green-400 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    {copy.online}
                                </p>
                            </div>
                            <button onClick={clearHistory} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title={copy.clearHistory}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={toggle} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[420px]">
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-end gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
                                            <p className="text-sm text-gray-200">{copy.welcome}</p>
                                            <ul className="mt-2 space-y-1 text-xs text-gray-300">
                                                <li>{copy.hintOne}</li>
                                                <li>{copy.hintTwo}</li>
                                                <li>{copy.hintThree}</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 pl-9">{copy.suggested}</p>
                                        {copy.suggestedQuestions.map((question) => (
                                            <button
                                                key={question}
                                                onClick={() => {
                                                    setInput(question);
                                                    inputRef.current?.focus();
                                                }}
                                                className="block ml-9 text-left text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 hover:bg-green-500/20 transition-colors w-[calc(100%-2.25rem)]"
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-end gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                                            message.role === 'user'
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-none'
                                                : 'bg-white/10 border border-white/10 text-gray-200 rounded-bl-none'
                                        }`}
                                    >
                                        <MessageContent content={message.content} />
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 border-t border-white/10 bg-black/20">
                            <div className="flex gap-2 items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && !event.shiftKey && handleSend()}
                                    placeholder={copy.inputPlaceholder}
                                    disabled={isTyping}
                                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/50 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-600 mt-2">{copy.poweredBy}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/40 flex items-center justify-center"
                aria-label={copy.openChat}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X className="w-6 h-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isOpen && messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                        {Math.min(messages.filter((message) => message.role === 'assistant').length, 9)}
                    </span>
                )}
            </motion.button>
        </>
    );
}
