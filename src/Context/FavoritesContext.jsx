
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from '@/Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { useLanguage } from '@/Language/LanguageContext';
import { translations } from '@/Language/translations';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { language } = useLanguage();
    const t = translations[language];
    // Initialize from localStorage
    const [favorites, setFavorites] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem('localFavorites');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                console.error("Error parsing favorites from localStorage", e);
                return [];
            }
        }
        return [];
    });

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const labels = {
        adding: { en: "Adding to favorites...", vi: "Thêm vào mục yêu thích..." },
        removing: { en: "Removing from favorites...", vi: "Xóa khỏi mục yêu thích..." },
        sending: { en: "Sending Enquiry...", vi: "Đang gửi yêu cầu..." }
    };

    // Sync to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem('localFavorites', JSON.stringify(favorites));
        }
    }, [favorites]);

    const fetchFavorites = async () => {
        // No-op for API sync as we are local-first
        setLoading(false);
    };

    const addFavorite = async (property) => {
        const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
        if (!token) {
            CommonToaster(t.loginToAddFavorite, 'error');
            return false;
        }

        if (!property) return false;
        if (typeof property === 'string') {
            console.error("addFavorite requires a property object, not an ID");
            CommonToaster(t.errorAddingFavorite, 'error');
            return false;
        }

        const propId = property._id || property.listingInformation?.listingInformationPropertyId;

        if (isFavorite(propId)) {
            CommonToaster(t.alreadyInFavorites, 'warning');
            return false;
        }

        const newFav = {
            _id: Date.now().toString(),
            property: property,
            createdAt: new Date().toISOString()
        };

        setFavorites(prev => [...prev, newFav]);
        CommonToaster(t.addedToFavorites, 'success');
        return true;
    };

    const removeFavorite = async (propertyId) => {
        if (!propertyId) return false;

        setFavorites(prev => prev.filter(f => {
            const fPropId = f.property._id || f.property.listingInformation?.listingInformationPropertyId;
            return f._id !== propertyId && fPropId !== propertyId;
        }));

        CommonToaster(t.removedFromFavorites, 'success');
        return true;
    };

    // New function to send enquiry (Sync to Backend)
    const sendEnquiry = async (messageProp = "") => {
        const message = typeof messageProp === 'string' ? messageProp : "";

        if (favorites.length === 0) {
            CommonToaster(t.noFavoritesToSend, 'warning');
            return;
        }

        const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
        if (!token) {
            CommonToaster(t.loginToSendEnquiry, 'error');
            return;
        }

        try {
            setActionLoading('sending');

            // Extract IDs
            const propertyIds = favorites.map(fav =>
                fav.property._id
                || fav.property.listingInformation?.listingInformationPropertyId
            ).filter(Boolean);

            if (propertyIds.length === 0) {
                CommonToaster(t.invalidFavorites, 'error');
                return;
            }

            await apiAddFavorite(propertyIds, message); // Pass message to API
            CommonToaster(t.enquirySent, 'success');

        } catch (error) {
            console.error('Error sending enquiry:', error);
            CommonToaster(t.errorSendingEnquiry, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Helper to check if a property is favorited
    const isFavorite = (propertyId) => {
        return favorites.some(fav => {
            const fPropId = fav.property._id || fav.property.listingInformation?.listingInformationPropertyId;
            return fPropId === propertyId;
        });
    };

    const clearFavorites = () => {
        setFavorites([]);
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem('localFavorites');
            } catch (e) {
                console.error("Error clearing favorites from localStorage", e);
            }
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite, fetchFavorites, sendEnquiry, clearFavorites }}>
            {children}
            {actionLoading && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 border-4 border-white border-t-[#41398B] rounded-full animate-spin"></div>
                        <p className="text-white text-lg tracking-wide font-medium">
                            {actionLoading === 'sending' ? labels.sending[language] : (actionLoading === 'add' ? labels.adding[language] : labels.removing[language])}
                        </p>
                    </div>
                </div>
            )}
        </FavoritesContext.Provider>
    );
};
