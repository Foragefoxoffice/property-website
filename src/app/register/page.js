"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone } from "lucide-react";
import { userRegisterApi } from "@/Api/action";
import { CommonToaster } from "@/Common/CommonToaster";
import { usePermissions } from "@/Context/PermissionContext";
import { useFavorites } from "@/Context/FavoritesContext";
import { useLanguage } from "@/Language/LanguageContext";
import { translations } from "@/Language/translations";

export default function Register() {
    const router = useRouter();
    const { refreshPermissions } = usePermissions();
    const { fetchFavorites } = useFavorites();
    const { language } = useLanguage();
    const t = translations[language];

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError(t.passwordsDoNotMatch);
            return;
        }

        setLoading(true);
        try {
            const res = await userRegisterApi(formData);
            if (res.data.success) {
                const user = res.data.user;
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("userName", user?.name || "");
                    localStorage.setItem("userRole", user?.role || "user");
                }
                await refreshPermissions();
                await fetchFavorites();
                CommonToaster(t.registerSuccess, "success");
                router.push("/login");
            }
        } catch (err) {
            setError(
                err.response?.data?.error || t.registerFailed
            );
        } finally {
            setLoading(false);
        }
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
                    {t.register}
                </h2>
                <p className="text-center text-[#000] text-md mb-8">
                    {t.registerSubtitle}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                            {t.fullName}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={t.enterFullName}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                            {t.mobileNumber}
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="tel"
                                name="mobile"
                                required
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder={t.enterMobileNumber}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                            />
                        </div>
                    </div>

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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                            {t.confirmPassword}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder={t.enterConfirmPassword}
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
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
                                <Loader2 className="animate-spin mr-2" size={18} /> {t.registering}
                            </>
                        ) : (
                            t.registerButton
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            {t.alreadyHaveAccount}{" "}
                            <Link
                                href="/login"
                                className="text-[#4A3AFF] hover:text-[#41398B] font-semibold transition"
                            >
                                {t.loginHere}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
