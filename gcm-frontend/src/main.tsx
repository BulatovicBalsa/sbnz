import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css'
import { AuthProvider, useAuth } from './auth';
import { LoginPage } from './pages/LoginPage';
import {Toaster} from "@/components/ui/sonner";
import {initClockFromServer} from "@/utils/time.ts";


// eslint-disable-next-line react-refresh/only-export-components
function Root() {
    const { user } = useAuth();
    return user ? <App /> : <LoginPage />;
}

(async () => {
    await initClockFromServer();

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <AuthProvider>
            <Root />
            <Toaster />
        </AuthProvider>
    );
})();
