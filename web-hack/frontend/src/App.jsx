import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { ToastProvider } from "./context/ToastContext";

const App = () => {
  return (
    <div>
      <ToastProvider>
        <AppNavigator />
      </ToastProvider>
    </div>
  );
};

export default App;
