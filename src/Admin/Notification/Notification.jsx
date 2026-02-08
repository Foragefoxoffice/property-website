import React, { useState, useEffect } from "react";
import { Mail, Save, BellRing, ShieldCheck } from "lucide-react";
import { getNotificationSettings, updateNotificationSettings } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import CommonSkeleton from "../../Common/CommonSkeleton";

export default function Notification() {
    const { language } = useLanguage();
    const t = translations[language];
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        contactEnquiryEmail: "",
        favoritesEnquiryEmail: "",
        propertyEnquiryEmail: ""
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await getNotificationSettings();
            if (res.data?.success) {
                setSettings({
                    contactEnquiryEmail: res.data.data.contactEnquiryEmail || "",
                    favoritesEnquiryEmail: res.data.data.favoritesEnquiryEmail || "",
                    propertyEnquiryEmail: res.data.data.propertyEnquiryEmail || ""
                });
            }
        } catch (error) {
            console.error("Error fetching notification settings:", error);
            CommonToaster(t.failedToFetchSettings, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await updateNotificationSettings(settings);
            if (res.data?.success) {
                CommonToaster(t.settingsUpdated, "success");
            }
        } catch (error) {
            console.error("Error updating notification settings:", error);
            CommonToaster(error.response?.data?.message || t.failedToUpdate || "Failed to update settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">{t.notification || "Notification Settings"}</h1>
                </div>
                <CommonSkeleton rows={6} />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-6 bg-transparent pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BellRing className="w-6 h-6 text-[#41398B]" />
                        {t.notification}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.notificationDesc}</p>
                </div>
            </div>

            <div className="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Enquiry Setting Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-[#41398B]" />
                            <h2 className="font-bold text-gray-800">{t.emailNotifications}</h2>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Contact Enquiry */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t.contactEnquiryRecipientEmail}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#41398B] transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder={t.enterEmailAddress || "Enter email address"}
                                        value={settings.contactEnquiryEmail}
                                        onChange={(e) => setSettings({ ...settings, contactEnquiryEmail: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition shadow-sm text-gray-900"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    {t.enquiryEmailHelp}
                                </p>
                            </div>

                            {/* Favorites Enquiry */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t.favoritesEnquiryRecipientEmail}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#41398B] transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder={t.enterEmailAddress || "Enter email address"}
                                        value={settings.favoritesEnquiryEmail}
                                        onChange={(e) => setSettings({ ...settings, favoritesEnquiryEmail: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition shadow-sm text-gray-900"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    {t.favoritesEmailHelp}
                                </p>
                            </div>

                            {/* Property Showcase Enquiry */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t.propertyEnquiryRecipientEmail}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#41398B] transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder={t.enterEmailAddress || "Enter email address"}
                                        value={settings.propertyEnquiryEmail}
                                        onChange={(e) => setSettings({ ...settings, propertyEnquiryEmail: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition shadow-sm text-gray-900"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 italic">
                                    {t.propertyEmailHelp}
                                </p>
                            </div>

                            <div className="pt-4 flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900">{t.notificationInfoTitle}</h4>
                                    <p className="text-xs text-blue-800 leading-relaxed mt-1">
                                        {t.notificationInfoDesc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e72] text-white rounded-xl font-medium transition shadow-md ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t.sending || "Saving..."}
                                    </span>
                                ) : (
                                    <>
                                        <Save size={18} /> {t.saveSettings}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}