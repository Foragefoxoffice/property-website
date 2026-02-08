import React, { useState, useEffect } from "react";
import {
    Search,
    Trash2,
    Mail,
    Calendar,
    CloudDownload
} from "lucide-react";
import {
    getSubscriptions,
    deleteSubscription
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { usePermissions } from "../../Context/PermissionContext"; // If needed later for stricter permissions

export default function Subscription() {
    const { language } = useLanguage();
    const t = translations[language];
    const [subscriptions, setSubscriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const res = await getSubscriptions();
            setSubscriptions(res.data.data || []);
        } catch {
            CommonToaster(t.failedToFetchSubscriptions, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteSubscription(deleteConfirm.id);
            CommonToaster(t.subscriptionDeleted, "success");
            setDeleteConfirm({ show: false, id: null });
            fetchSubscriptions();
        } catch {
            CommonToaster(t.errorDeletingSubscription, "error");
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ["Email", "Subscribed At"];
        const rows = filteredSubscriptions.map(sub => [
            sub.email,
            new Date(sub.createdAt).toLocaleDateString() + ' ' + new Date(sub.createdAt).toLocaleTimeString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscriptions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="min-h-screen px-6 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{t.subscription || "Subscription"}</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t.searchEmail}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
                        />
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#41398B] rounded-full font-medium transition shadow-sm text-sm"
                    >
                        <CloudDownload size={16} /> {t.exportCSV}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className={`transform transition-all duration-300 ${loading ? "opacity-70" : "opacity-100"}`}>
                {loading ? (
                    <CommonSkeleton rows={5} />
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">S.NO</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">{t.email}</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">{t.subscribedAt}</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">{t.action}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSubscriptions.map((sub, index) => (
                                    <tr key={sub._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}.</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2">
                                            <Mail size={16} className="text-[#41398B]" /> {sub.email}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                                <span className="text-xs text-gray-400 ml-1">
                                                    {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            <button
                                                onClick={() => setDeleteConfirm({ show: true, id: sub._id })}
                                                className="p-2 bg-white border border-gray-200 hover:bg-red-600 hover:text-white rounded-full transition text-gray-600 shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSubscriptions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-gray-500">
                                            {t.noSubscriptionsFound}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirm */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{t.deleteSubscriptionQuestion}</h3>
                        <p className="text-gray-500 text-sm mb-6 text-center leading-relaxed">
                            {t.deleteSubscriptionConfirm}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">{t.cancel}</button>
                            <button onClick={handleDelete} className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm">{t.delete}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}