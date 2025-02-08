"use client";
import Sidebar from "@/app/components/Sidebar";
import { persistor, store } from "@/app/store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardLayout({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="dashboard-container flex h-screen">
          <Sidebar />

          <main className="flex-grow bg-gray-100 overflow-auto">
            {children}
          </main>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </PersistGate>
    </Provider>
  );
}
