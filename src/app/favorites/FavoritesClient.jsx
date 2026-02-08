"use client";

import React, { useState } from 'react';
import { Heart, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from 'antd';
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';
import { useLanguage } from '@/Language/LanguageContext';
import { useFavorites } from '@/Context/FavoritesContext';
import { normalizeFancyText } from '@/utils/display';

export default function FavoritesClient({ isDashboard = false }) {
    const { language } = useLanguage();
    const { favorites, loading, removeFavorite, sendEnquiry } = useFavorites();
    const [deleteId, setDeleteId] = useState(null);
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendEnquiry = async () => {
        await sendEnquiry(message);
        setShowEnquiryModal(false);
        setMessage('');
    };

    const t = language === 'en' ? {
        pageTitle: "My Favorites",
        listing: "Listing",
        datePublished: "Date Published",
        action: "Action",
        noFavorites: "No favorites yet",
        noFavoritesDesc: "Start exploring and save properties you love to your favorites list.",
        browseProperties: "Browse Properties",
        postingDate: "Posting date:",
        contactForPrice: "Contact for Price",
        delete: "Delete",
        removeFromFavorites: "Remove from Favorites",
        deleteConfirmation: "Are you sure you want to remove this property from your favorites?",
        cancel: "Cancel",
        remove: "Remove",
        locationNA: "Location N/A",
        untitledProperty: "Untitled Property",
        removedSuccess: "Removed from favorites",
        removeFail: "Failed to remove favorite",
        removeProperty: "Remove Property",
        sendEnquiry: "Send Enquiry",
        message: "Message",
        optional: "Optional",
        enterMessage: "Enter your message",
        favoritesEnquiryDesc: "Send an enquiry to the property owner.",
        send: "Send"
    } : {
        pageTitle: "Mục Yêu Thích",
        listing: "Danh Sách",
        datePublished: "Ngày Đăng",
        action: "Hành Động",
        noFavorites: "Chưa có mục yêu thích",
        noFavoritesDesc: "Bắt đầu khám phá và lưu các bất động sản bạn yêu thích vào danh sách.",
        browseProperties: "Xem Bất Động Sản",
        postingDate: "Ngày đăng:",
        contactForPrice: "Liên hệ giá",
        delete: "Xóa",
        removeFromFavorites: "Xóa khỏi Yêu Thích",
        deleteConfirmation: "Bạn có chắc chắn muốn xóa bất động sản này khỏi danh sách yêu thích?",
        cancel: "Hủy",
        remove: "Xóa",
        locationNA: "Vị trí không xác định",
        untitledProperty: "Bất động sản chưa có tên",
        removedSuccess: "Đã xóa khỏi danh sách yêu thích",
        removeFail: "Xóa thất bại",
        removeProperty: "Xóa Bất Động Sản",
        sendEnquiry: "Gửi Yêu Cầu",
        message: "Tin nhắn",
        optional: "Tùy chọn",
        enterMessage: "Nhập tin nhắn của bạn",
        favoritesEnquiryDesc: "Gửi yêu cầu đến chủ sở hữu bất động sản.",
        send: "Gửi"
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const success = await removeFavorite(deleteId);
            if (success) {
                setDeleteId(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.en || value.vi || '';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const content = (
        <div className={isDashboard ? "w-full" : "min-h-screen bg-gray-50 flex flex-col"}>
            <main className={isDashboard ? "w-full" : "flex-grow max-w-7xl mx-auto w-full px-6 py-10"}>
                <div className="flex items-center gap-2 mb-8">
                    <Heart className="text-[#eb4d4d] fill-[#eb4d4d]" size={32} />
                    <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>
                    <span className="ml-3 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {favorites.length}
                    </span>
                    {favorites.length > 0 && (
                        <button
                            onClick={() => setShowEnquiryModal(true)}
                            className="ml-auto bg-[#41398B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#352e7a] transition-colors shadow-lg hover:shadow-xl"
                        >
                            {t.sendEnquiry}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton active key={i} avatar paragraph={{ rows: 2 }} className="bg-white p-6 rounded-xl shadow-sm" />
                        ))}
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="text-gray-300" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.noFavorites}</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">{t.noFavoritesDesc}</p>
                        <Link
                            href="/listing"
                            className="inline-block bg-[#41398B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#352e7a] transition-colors shadow-lg hover:shadow-xl"
                        >
                            {t.browseProperties}
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-5 bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-sm uppercase tracking-wider">
                            <div className="col-span-12 md:col-span-6">{t.listing}</div>
                            <div className="col-span-6 md:col-span-3">{t.datePublished}</div>
                            <div className="col-span-6 md:col-span-3 text-center">{t.action}</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {favorites.map((fav) => {
                                const prop = fav.property;
                                if (!prop) return null;

                                const priceSale = prop.financialDetails?.financialDetailsPrice;
                                const priceLease = prop.financialDetails?.financialDetailsLeasePrice;
                                const priceNight = prop.financialDetails?.financialDetailsPricePerNight;
                                const genericPrice = prop.financialDetails?.financialDetailsPrice;
                                const currencyData = prop.financialDetails?.financialDetailsCurrency;
                                const currencyCode = (typeof currencyData === 'object' ? currencyData?.code : currencyData) || '';
                                const type = getLocalizedValue(prop.listingInformation?.listingInformationTransactionType);

                                let displayPrice = t.contactForPrice;
                                const formatP = (p) => `${Number(p).toLocaleString()} ${currencyCode}`;

                                if (type === 'Sale' && priceSale) displayPrice = formatP(priceSale);
                                else if (type === 'Lease' && priceLease) displayPrice = `${formatP(priceLease)} / month`;
                                else if (type === 'Home Stay' && priceNight) displayPrice = `${formatP(priceNight)} / night`;
                                else if (genericPrice) displayPrice = formatP(genericPrice);

                                return (
                                    <div key={fav._id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-12 md:col-span-6 flex gap-4 cursor-pointer" onClick={() => window.open(`/property-showcase/${prop.listingInformation?.listingInformationPropertyId || prop._id}`, '_blank')}>
                                            <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                                                <img
                                                    src={prop.imagesVideos?.propertyImages?.[0] || '/images/property/dummy-img.avif'}
                                                    alt="Property"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                                                    {getLocalizedValue(prop.listingInformation?.listingInformationTransactionType) || 'Property'}
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-[#41398B] text-[20px] transition-colors">
                                                    {normalizeFancyText(getLocalizedValue(prop.listingInformation?.listingInformationPropertyTitle) || t.untitledProperty)}
                                                </h3>
                                                <div
                                                    className="text-sm text-gray-500 mb-1 line-clamp-2 ql-editor-summary"
                                                    dangerouslySetInnerHTML={{
                                                        __html: getLocalizedValue(prop.whatNearby?.whatNearbyDescription) ||
                                                            getLocalizedValue(prop.listingInformation?.listingInformationZoneSubArea) ||
                                                            t.locationNA
                                                    }}
                                                />
                                                <p className="text-[#41398B] font-bold text-lg">{displayPrice}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-6 md:col-span-3 text-sm text-gray-600 flex items-center">
                                            <Calendar size={14} className="mr-2 text-gray-400" />
                                            {formatDate(prop.listingInformation?.listingInformationDateListed || prop.createdAt || prop.updatedAt)}
                                        </div>

                                        <div className="col-span-6 md:col-span-3 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmDelete(prop._id);
                                                }}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-medium"
                                            >
                                                <Trash2 size={16} className="mr-2" />
                                                {t.removeFromFavorites}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t.removeProperty}</h3>
                            <p className="text-gray-500">{t.deleteConfirmation}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                {t.remove}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEnquiryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex flex-col mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t.sendEnquiry}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                                {t.favoritesEnquiryDesc}
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.message}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t.enterMessage}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] transition-all resize-none h-32 text-sm"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowEnquiryModal(false);
                                    setMessage('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSendEnquiry}
                                className="flex-1 px-4 py-2.5 bg-[#41398B] text-white font-semibold rounded-xl hover:bg-[#352e7a] transition-colors shadow-lg"
                            >
                                {t.send || "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    if (isDashboard) return content;

    return (
        <>
            <Header />
            {content}
            <Footer />
        </>
    );
}
