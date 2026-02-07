import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser, logout } from "../redux/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🛰️ Hit the verify endpoint
        const { data } = await axios.get("http://localhost:5000/api/v1/auth/me", {
          withCredentials: true, // MUST HAVE to send cookies
        });

        if (data.status === "success") {
          dispatch(setUser(data.data.user));
        } else {
          dispatch(logout());
        }
      } catch (err) {
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };

    // Only check if we don't already have a user in Redux
    if (!user) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, user]);

  return { isAuthenticated: !!user, isLoading, user };
};