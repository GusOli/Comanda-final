
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { session } = useAuth();

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
