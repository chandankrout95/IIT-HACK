import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// pages
import HomePage from "../features/home/pages/HomePage";
import NotFound from "../common/pages/NotFound";

const AppNavigator = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
    

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppNavigator;
