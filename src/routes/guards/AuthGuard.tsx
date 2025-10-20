import { ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'store';
import { getUserInfo } from 'store/slice/userReducer';

// ==============================|| AUTH GUARD ||============================== //
type GuardProps = {
  children: ReactElement | null;
};

/**
 * Authentication guard for routes
 * @param {PropTypes.node} children children element/node
 */
const AuthGuard = ({ children }: GuardProps) => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    if (!token) {
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } else {
      getUserInfo();
    }
  }, [token]);

  return children;
};

export default AuthGuard;
