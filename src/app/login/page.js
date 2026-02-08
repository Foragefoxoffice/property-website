"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, X } from "lucide-react";
import { loginUser } from "@/Api/action";
import { CommonToaster } from "@/Common/CommonToaster";
import { usePermissions } from "@/Context/PermissionContext";
import { useFavorites } from "@/Context/FavoritesContext";
import { useLanguage } from "@/Language/LanguageContext";
import { translations } from "@/Language/translations";

export default function Login() {
    const router = useRouter();
    const { refreshPermissions } = usePermissions();
    const { fetchFavorites } = useFavorites();
    const { language } = useLanguage();
    const t = translations[language];

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [staffFormData, setStaffFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleStaffChange = (e) =>
        setStaffFormData({ ...staffFormData, [e.target.name]: e.target.value });

    const handleLogin = async (data) => {
        setError("");
        setLoading(true);
        try {
            const res = await loginUser(data);
            if (res.data.success) {
                const user = res.data.user;
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("userName", user?.name || "");
                    localStorage.setItem("userRole", user?.role || "user");
                }
                await refreshPermissions();
                await fetchFavorites();
                CommonToaster(t.loginSuccess, "success");

                if (user?.role === "user") {
                    router.push("/");
                } else {
                    router.push("/dashboard/lease");
                }
            }
        } catch (err) {
            setError(
                err.response?.data?.error || t.loginFailed
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin(formData);
    };

    const handleStaffSubmit = (e) => {
        e.preventDefault();
        handleLogin(staffFormData);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f6f4ff] to-[#e5defc] relative overflow-hidden">
            <div
                className="absolute bottom-0 left-0 w-full bg-contain bg-bottom bg-no-repeat h-120"
                style={{
                    backgroundImage: "url('/images/login/bg.png')",
                }}
            />

            <div className="mb-16 text-center z-10">
                <img className="h-16" src="/images/login/logo.png" alt="" />
            </div>

            <div className="relative z-10 w-full max-w-lg bg-white shadow-xl rounded-2xl px-8 py-10 border border-gray-100">
                <h2
                    style={{ fontWeight: 800, fontSize: 36 }}
                    className="text-center text-gray-800 mb-3"
                >
                    {t.login}
                </h2>
                <p className="text-center text-[#000] text-md mb-8">
                    {t.loginSubtitle}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                            {t.emailAddress}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t.enterEmail}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                            {t.password}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t.enterPassword}
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-[#4A3AFF] hover:underline"
                            >
                                {t.forgotPassword}
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <p className="text-center text-red-500 text-sm bg-red-50 py-2 rounded-md border border-red-200">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer py-3 bg-[#41398B] hover:bg-[#41398be1] text-white font-semibold rounded-4xl shadow-md transition-all flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={18} /> {t.loggingIn}
                            </>
                        ) : (
                            t.loginButton
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {t.dontHaveAccount}{" "}
                            <Link
                                href="/register"
                                className="text-[#4A3AFF] hover:text-[#41398B] font-semibold transition"
                            >
                                {t.registerHere}
                            </Link>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setStaffFormData({ email: "", password: "" });
                                    setError("");
                                    setIsStaffModalOpen(true);
                                }}
                                className="text-gray-500 hover:text-[#41398B] font-medium transition cursor-pointer underline hover:no-underline"
                            >
                                {t.staffLogin}
                            </button>
                        </p>
                    </div>
                </form>
            </div>

            {isStaffModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                        <button
                            onClick={() => setIsStaffModalOpen(false)}
                            className="absolute cursor-pointer top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8 text-center">
                            <img className="h-10 mx-auto mb-4" src="/images/login/logo.png" alt="" />
                            <h2
                                style={{ fontWeight: 800, fontSize: 28 }}
                                className="text-gray-800 mb-2"
                            >
                                {t.staffLogin}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {t.staffLoginSubtitle}
                            </p>
                        </div>

                        <form onSubmit={handleStaffSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                                    {t.emailAddress}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={staffFormData.email}
                                        onChange={handleStaffChange}
                                        placeholder={t.enterEmail}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                                    {t.password}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={staffFormData.password}
                                        onChange={handleStaffChange}
                                        placeholder={t.enterPassword}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-[#4A3AFF] hover:underline"
                                    >
                                        {t.forgotPassword}
                                    </Link>
                                </div>
                            </div>

                            {error && (
                                <p className="text-center text-red-500 text-sm bg-red-50 py-2 rounded-md border border-red-200">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full cursor-pointer py-3 bg-[#41398B] hover:bg-[#41398be1] text-white font-semibold rounded-4xl shadow-md transition-all flex justify-center items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} /> {t.loggingIn}
                                    </>
                                ) : (
                                    t.loginButton
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
