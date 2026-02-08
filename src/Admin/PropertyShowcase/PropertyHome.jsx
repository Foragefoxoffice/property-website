import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, Heart, LayoutGrid, ChevronLeft, ChevronRight, Image as ImageIcon, X, Star, Gem, MapPin, Printer } from "lucide-react";
import { safeVal, safeArray, formatNumber, normalizeFancyText } from "@/utils/display";
import { CommonToaster } from "@/Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { useFavorites } from "../../Context/FavoritesContext";
import { useNavigate } from "react-router-dom";

export default function PropertyHome({ property }) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupIndex, setPopupIndex] = useState(0);
    const { language } = useLanguage();
    const t = translations[language];
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const navigate = useNavigate();

    const pId = property?._id || property?.listingInformation?.listingInformationPropertyId;
    const favorite = isFavorite(pId);

    // Safe extraction
    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '');
    };

    const images = safeArray(property?.imagesVideos?.propertyImages).filter(Boolean);
    const propertyType = getLocalizedValue(property?.listingInformation?.listingInformationPropertyType) || "";
    const title = getLocalizedValue(property?.listingInformation?.listingInformationPropertyTitle) || "";
    const project = getLocalizedValue(property?.listingInformation?.listingInformationProjectCommunity) || "";
    const bedrooms = safeVal(property?.propertyInformation?.informationBedrooms);
    const bathrooms = safeVal(property?.propertyInformation?.informationBathrooms);
    const transactionType = getLocalizedValue(property?.listingInformation?.listingInformationTransactionType) || "";
    const location = getLocalizedValue(property?.listingInformation?.listingInformationCity) || "";

    // Price calculation
    const financialDetails = property?.financialDetails || {};
    const currency = financialDetails?.financialDetailsCurrency;
    const currencyCode = (typeof currency === 'object' ? currency?.code : currency) || '';

    const getPrice = () => {
        const trType = safeVal(property?.listingInformation?.listingInformationTransactionType);
        const pSale = financialDetails?.financialDetailsPrice;
        const pLease = financialDetails?.financialDetailsLeasePrice;
        const pNight = financialDetails?.financialDetailsPricePerNight;

        let price = t.contactForPrice || "Contact for Price";
        let suffix = "";

        const formatPrice = (val) => `${Number(val).toLocaleString()} ${currencyCode}`;

        if (trType === "Sale" && pSale) {
            price = formatPrice(pSale);
        } else if (trType === "Lease" && pLease) {
            price = formatPrice(pLease);
            suffix = ` / ${language === 'vi' ? 'tháng' : 'month'}`;
        } else if (trType === "Home Stay" && pNight) {
            price = formatPrice(pNight);
            suffix = ` / ${language === 'vi' ? 'đêm' : 'night'}`;
        } else if (pSale) {
            price = formatPrice(pSale);
        }

        return { price, suffix };
    };

    const { price, suffix } = getPrice();

    const handleShare = async () => {
        const shareData = {
            title: title || t.property,
            text: `${t.checkOutProperty} ${title}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                CommonToaster(t.linkCopied, "success");
            } catch (err) {
                console.error("Failed to copy:", err);
                CommonToaster(t.failedCopy, "error");
            }
        }
    };

    const handleFavoriteToggle = () => {
        if (favorite) {
            removeFavorite(pId);
            CommonToaster(language === 'vi' ? "Đã xóa khỏi mục yêu thích" : "Removed from favorites", "success");
        } else {
            addFavorite(property);
            CommonToaster(language === 'vi' ? "Đã thêm vào mục yêu thích" : "Added to favorites", "success");
        }
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrent((p) => (p - 1 + images.length) % images.length);
    };

    const handleNext = () => {
        setDirection(1);
        setCurrent((p) => (p + 1) % images.length);
    };

    const handlePopupPrev = () => {
        setPopupIndex((p) => (p - 1 + images.length) % images.length);
    };

    const handlePopupNext = () => {
        setPopupIndex((p) => (p + 1) % images.length);
    };

    const openPopup = (index) => {
        setPopupIndex(index);
        setIsPopupOpen(true);
    };

    // Drag handler for swipe gestures (Mobile slider)
    const handleDragEnd = (event, info) => {
        const swipeThreshold = 50;
        if (info.offset.x > swipeThreshold) {
            handlePrev();
        } else if (info.offset.x < -swipeThreshold) {
            handleNext();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getBadgeColor = () => {
        const trType = safeVal(property?.listingInformation?.listingInformationTransactionType);
        if (trType === "Sale") return "bg-[#eb4d4d]";
        if (trType === "Lease") return "bg-[#058135]";
        if (trType === "Home Stay") return "bg-[#055381]";
        return "bg-[#41398B]";
    };

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 bg-[#F8F7FC]">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-[#41398B] transition-colors cursor-pointer"
                >
                    {t.home || 'Home'}
                </button>
                <span className="text-gray-400">›</span>
                {transactionType && (
                    <>
                        <span className="text-gray-600 hover:text-[#41398B] transition-colors">{transactionType}</span>
                        <span className="text-gray-400">›</span>
                    </>
                )}
                <span className="text-[#41398B] font-semibold">{normalizeFancyText(title || t.untitledProperty)}</span>
            </div>

            {/* Category Badge */}
            <div className="flex items-center gap-2">
                {transactionType && (
                    <div className="mb-4">
                        <span className={`inline-block px-3 py-1.5 ${getBadgeColor()} text-white text-xs font-bold uppercase tracking-wide rounded`}>
                            {transactionType}
                        </span>
                    </div>
                )}
                {propertyType && (
                    <div className="mb-4">
                        <span className={`inline-block px-3 py-1.5 bg-[#6B46C1] text-white text-xs font-bold uppercase tracking-wide rounded`}>
                            {propertyType}
                        </span>
                    </div>
                )}
            </div>


            {/* Title Row with Location, Price and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between md:gap-6 gap-2 mb-6">
                {/* Left: Title and Location */}
                <div className="flex-1">
                    <h1 className="text-2xl md:text-[32px] font-bold text-[#222222] md:mb-3 mb-0 leading-tight">
                        {normalizeFancyText(title || t.untitledProperty)}
                    </h1>
                    {location && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-[#41398B]" />
                            <span className="text-base">{location}</span>
                        </div>
                    )}
                </div>

                {/* Right: Price and Action Buttons */}
                <div className="">
                    {/* Price */}
                    <div className="text-right">
                        <div className="flex items-baseline gap-1 md:mb-3 mb-2">
                            <span className="text-2xl md:text-4xl font-bold text-[#41398B]">{price}</span>
                            {suffix && <span className="text-lg text-gray-600 font-medium">{suffix}</span>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center cursor-pointer gap-1 px-3 py-2 rounded-lg transition-all"
                            title={t.share}
                        >
                            <Share2 className="w-5 h-5 text-[#41398B]" />
                            <span className="hidden md:inline text-sm font-medium text-[#41398B] underline">{t.share}</span>
                        </button>
                        <button
                            onClick={handleFavoriteToggle}
                            className={`flex items-center cursor-pointer gap-1 px-3 py-2 rounded-lg transition-all`}
                            title={t.favorite}
                        >
                            <Heart className={`w-5 h-5 ${favorite ? 'fill-[#eb4d4d] text-[#eb4d4d]' : 'text-[#41398B]'}`} />
                            <span className={`hidden md:inline text-sm font-medium underline ${favorite ? 'text-[#eb4d4d]' : 'text-[#41398B]'}`}>{t.favorite || t.save}</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center cursor-pointer gap-1 px-3 py-2 rounded-lg transition-all"
                            title={t.print || 'Print'}
                        >
                            <Printer className="w-5 h-5 text-[#41398B]" />
                            <span className="hidden md:inline text-sm font-medium text-[#41398B] underline">{t.print || 'Print'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Photo Grid (Desktop) / Slider (Mobile) */}
            <div className="relative rounded-xl overflow-hidden group">
                {/* Desktop Grid Layout (hidden on mobile) */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[350px] lg:h-[480px]">
                    {/* Main Image */}
                    <div
                        className="col-span-2 row-span-2 cursor-pointer relative overflow-hidden"
                        onClick={() => openPopup(0)}
                    >
                        <img
                            src={images[0]}
                            className="w-full h-full object-cover hover:brightness-90 transition-all duration-300"
                            alt="Property main"
                        />
                    </div>

                    {/* Small Images */}
                    {images.slice(1, 5).map((img, i) => (
                        <div
                            key={i}
                            className="col-span-1 row-span-1 cursor-pointer relative overflow-hidden"
                            onClick={() => openPopup(i + 1)}
                        >
                            <img
                                src={img}
                                className="w-full h-full object-cover hover:brightness-90 transition-all duration-300"
                                alt={`Property ${i + 1}`}
                            />
                        </div>
                    ))}

                    {/* Fallback for empty slots if < 5 images */}
                    {[...Array(Math.max(0, 4 - (images.length - 1)))].map((_, i) => (
                        <div key={`empty-${i}`} className="col-span-1 row-span-1 bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                    ))}
                </div>

                {/* Mobile Slider Layout (visible on mobile) */}
                <div className="md:hidden relative h-[250px] overflow-hidden bg-black">
                    {images.length > 0 ? (
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.img
                                key={current}
                                src={images[current]}
                                alt={`property-img-${current}`}
                                className="w-full h-full absolute inset-0 object-cover cursor-grab active:cursor-grabbing"
                                custom={direction}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                                variants={{
                                    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%' }),
                                    center: { x: 0 },
                                    exit: (direction) => ({ x: direction > 0 ? '-100%' : '100%' }),
                                }}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "tween", duration: 0.5, ease: "easeInOut" } }}
                            />
                        </AnimatePresence>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-600 font-medium">{t.noImages}</span>
                        </div>
                    )}

                    {/* Image counter for mobile */}
                    {images.length > 0 && (
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm z-10">
                            {current + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Show All Photos Button (Desktop only) */}
                {images.length > 0 && (
                    <button
                        onClick={() => openPopup(0)}
                        className="absolute flex md:block bottom-6 right-6 cursor-pointer md:flex bg-white hover:bg-[#41398B] hover:text-white px-4 py-2 rounded-lg items-center gap-2 transition-all duration-300 z-10 font-semibold text-sm shadow-sm"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span>{t.viewAllPhoto}</span>
                    </button>
                )}
            </div>

            {/* 4. Fullscreen Image Popup Modal */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black z-[100] flex flex-col">
                    {/* Header with Close Button */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110]">
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="hover:bg-white/10 text-white p-2 rounded-full transition-all cursor-pointer flex items-center gap-2"
                        >
                            <ChevronLeft className="w-6 h-6" />
                            <span className="text-sm font-medium">Close</span>
                        </button>
                        <div className="text-white text-sm font-medium">
                            {popupIndex + 1} / {images.length}
                        </div>
                        <div className="w-10" /> {/* Spacer */}
                    </div>

                    {/* Main Image Display */}
                    <div className="flex-1 relative flex items-center justify-center p-4">
                        <motion.img
                            key={popupIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={images[popupIndex]}
                            alt={`Full view ${popupIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain shadow-2xl"
                        />

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePopupPrev}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>

                                <button
                                    onClick={handlePopupNext}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Strip at Bottom */}
                    <div className="p-6 bg-black">
                        <div className="flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-hide">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPopupIndex(i)}
                                    className={`w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 flex-shrink-0 opacity-50 hover:opacity-100 ${popupIndex === i ? "opacity-100 scale-110 ring-2 ring-white" : ""}`}
                                >
                                    <img src={img} alt={`thumb-${i}`} className="object-cover w-full h-full" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
