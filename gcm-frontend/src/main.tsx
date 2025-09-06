import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css'
import { AuthProvider, useAuth } from './auth';
import { LoginPage } from './pages/LoginPage';
import {Toaster} from "@/components/ui/sonner";


function Root() {
    const { user } = useAuth();
    return user ? <App /> : <LoginPage />;
}


ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <Root />
        <Toaster />
    </AuthProvider>
);