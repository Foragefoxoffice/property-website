"use client";

import React from "react";
import { LanguageProvider } from "@/Language/LanguageContext";
import { FavoritesProvider } from "@/Context/FavoritesContext";
import { SocketProvider } from "@/Context/SocketContext";
import { PermissionProvider } from "@/Context/PermissionContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }) {
    return (
        <LanguageProvider>
            <SocketProvider>
                <PermissionProvider>
                    <FavoritesProvider>
                        {children}
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                        />
                    </FavoritesProvider>
                </PermissionProvider>
            </SocketProvider>
        </LanguageProvider>
    );
}
