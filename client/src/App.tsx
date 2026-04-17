import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from '@/components/ui';
import { ChatBubble } from '@/features/chat/ChatBubble';
import { AppRoutes } from '@/routes';
import './App.css';

function App() {
    return (
        <div className="app-shell">
            <BrowserRouter>
                <ToastContainer />
                <ChatBubble />
                <AppRoutes />
            </BrowserRouter>
        </div>
    );
}

export default App;
