"use client";

import React, { useState } from "react";
import { forgotPassword } from "@/Api/action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/Language/LanguageContext";
import { translations } from "@/Language/translations";
import { Mail, Loader2 } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const res = await forgotPassword({ email });
            setMessage(res.data.message);
            setTimeout(() => router.push("/reset-password"), 1000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send OTP.");
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
                    {t.forgotPasswordTitle}
                </h2>
                <p className="text-center text-[#000] text-md mb-8">
                    {t.enterEmailOtp}
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t.enterEmail}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-center text-red-500 text-sm bg-red-50 py-2 rounded-md border border-red-200">
                            {error}
                        </p>
                    )}
                    {message && (
                        <p className="text-center text-green-500 text-sm bg-green-50 py-2 rounded-md border border-green-200">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer py-3 bg-[#41398B] hover:bg-[#41398be1] text-white font-semibold rounded-4xl shadow-md transition-all flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={18} /> {t.sendingOtp}
                            </>
                        ) : (
                            t.sendOtp
                        )}
                    </button>
                </form>

                <div className="text-center mt-6 text-sm text-gray-600">
                    <Link
                        href="/login"
                        className="text-[#4A3AFF] hover:text-[#41398B] font-semibold transition"
                    >
                        {t.backToLogin}
                    </Link>
                </div>
            </div>
        </div>
    );
}
