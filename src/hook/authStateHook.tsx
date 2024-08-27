import { Navigate} from 'react-router-dom';
import { showMessage } from '../utils/showMessage';
const AuthStateHook = ({children}) => {
    const canAccsess = localStorage.getItem('can_access')
    if (canAccsess !== '1') {
        const Run = async () => {
            await showMessage('error', 'Error!', 'Anda belum login')
        }
        Run()
        return <Navigate to={'/login'}/>
    }
    
    return <>{children}</>
}

export default AuthStateHook