import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { CommonToaster } from "../../Common/CommonToaster";
import { updatePassword } from "../../Api/action";
import { useLanguage } from "../../Language/LanguageContext";

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const labels = {
        title: { en: "Change Password", vi: "Đổi mật khẩu" },
        currentPassword: { en: "Current Password", vi: "Mật khẩu hiện tại" },
        newPassword: { en: "New Password", vi: "Mật khẩu mới" },
        confirmPassword: { en: "Confirm New Password", vi: "Xác nhận mật khẩu mới" },
        cancel: { en: "Cancel", vi: "Hủy" },
        button: { en: "Update Password", vi: "Cập nhật mật khẩu" },
        success: { en: "Password updated successfully!", vi: "Cập nhật mật khẩu thành công!" },
        errorMatch: { en: "New passwords do not match!", vi: "Mật khẩu mới không khớp!" },
        errorEmpty: { en: "Please fill in all fields!", vi: "Vui lòng điền tất cả các trường!" },
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = formData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            CommonToaster(labels.errorEmpty[language], "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            CommonToaster(labels.errorMatch[language], "error");
            return;
        }

        setLoading(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            CommonToaster(labels.success[language], "success");
            onClose();
            // Reset form
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Change password error:", error);
            const msg = error.response?.data?.error || "Failed to update password";
            CommonToaster(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {labels.title[language]}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5">
                                {/* Current Password */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        {labels.currentPassword[language]} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#41398B] focus:ring-1 focus:ring-[#41398B] outline-none transition-all bg-white"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowPassword("current")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#41398B] transition-colors p-1"
                                        >
                                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        {labels.newPassword[language]} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#41398B] focus:ring-1 focus:ring-[#41398B] outline-none transition-all bg-white"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowPassword("new")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#41398B] transition-colors p-1"
                                        >
                                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        {labels.confirmPassword[language]} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#41398B] focus:ring-1 focus:ring-[#41398B] outline-none transition-all bg-white"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowPassword("confirm")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#41398B] transition-colors p-1"
                                        >
                                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {labels.cancel[language]}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#41398B] hover:bg-[#352e7a] rounded-full shadow-lg shadow-[#41398B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            {labels.button[language]}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
