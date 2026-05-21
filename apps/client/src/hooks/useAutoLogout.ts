import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RootState } from '../store';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function useAutoLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.auth);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = () => {
    if (isAuth) {
      dispatch(logout());
      navigate('/login');
      toast('You have been logged out due to inactivity.', {
        icon: '🔒',
        duration: 5000,
      });
    }
  };

  const resetTimeout = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    if (isAuth) {
      timeoutId.current = setTimeout(handleLogout, TIMEOUT_MS);
    }
  };

  useEffect(() => {
    if (!isAuth) {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      return;
    }

    // Initialize the timeout when authenticated
    resetTimeout();

    // Events that count as 'activity'
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    
    // Use a throttle or just rely on clearing the timeout
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuth]);
}
