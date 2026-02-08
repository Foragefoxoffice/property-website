import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getListingProperties } from '@/Api/action';
import { Skeleton, Tooltip } from 'antd';
import { useLanguage } from '@/Language/LanguageContext';
import { translations } from '@/Language/translations';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/Context/FavoritesContext';
import { normalizeFancyText } from '@/utils/display';

export default function HomeFeaturedProperties({ homePageData }) {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language];
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const fetchFeaturedProperties = async () => {
            try {
                setLoading(true);
                // Fetch 6 featured properties
                const response = await getListingProperties({ page: 1, limit: 6, sortBy: 'newest' });
                if (response.data && response.data.data) {
                    setProperties(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching featured properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProperties();
    }, []);

    const handleToggleFavorite = async (e, property) => {
        e.stopPropagation(); // Prevent card click
        const propertyId = property._id || property.listingInformation?.listingInformationPropertyId;
        if (isFavorite(propertyId)) {
            await removeFavorite(propertyId);
        } else {
            await addFavorite(property);
        }
    };

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '');
    };

    const getCategoryBadgeClass = (category) => {
        const cat = getLocalizedValue(category).toLowerCase();
        if (cat.includes('lease') || cat.includes('rent')) return 'bg-[#058135]';
        if (cat.includes('sale') || cat.includes('sell')) return 'bg-[#eb4d4d]';
        if (cat.includes('home') || cat.includes('stay')) return 'bg-[#055381]';
        return 'bg-[#058135]';
    };

    const getCategoryLabel = (category) => {
        const cat = getLocalizedValue(category).toLowerCase();
        if (cat.includes('lease') || cat.includes('rent')) return t.forRent;
        if (cat.includes('sale') || cat.includes('sell')) return t.forSale;
        if (cat.includes('home') || cat.includes('stay')) return t.homestay;
        return getLocalizedValue(category);
    };

    // Get CMS content with fallbacks
    const title = language === 'en'
        ? (homePageData?.homeFeatureTitle_en || 'FEATURED PROPERTIES')
        : (homePageData?.homeFeatureTitle_vn || 'BẤT ĐỘNG SẢN NỔI BẬT');
    const description = language === 'en'
        ? (homePageData?.homeFeatureDescription_en || '')
        : (homePageData?.homeFeatureDescription_vn || '');
    const buttonText = language === 'en'
        ? (homePageData?.homeFeatureButtonText_en || 'View Properties')
        : (homePageData?.homeFeatureButtonText_vn || 'Xem Bất Động Sản');
    const buttonLink = homePageData?.homeFeatureButtonLink || '/listing';

    const handleButtonClick = () => {
        if (!buttonLink) return;

        if (buttonLink.startsWith('http://') || buttonLink.startsWith('https://')) {
            try {
                const url = new URL(buttonLink);
                if (url.origin === window.location.origin) {
                    router.push(url.pathname + url.search + url.hash);
                } else {
                    window.location.href = buttonLink;
                }
            } catch (e) {
                router.push(buttonLink);
            }
        } else {
            router.push(buttonLink);
        }
    };

    return (
        <section ref={sectionRef} className="py-10 px-6 md:py-16 bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff]">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8 md:mb-16">
                    <p
                        className={`text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                            }`}
                    >
                        {title}
                    </p>
                    {description && (
                        <h2
                            className={`text-4xl md:text-5xl font-semibold text-black transition-all duration-1000 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                }`}
                        >
                            {description}
                        </h2>
                    )}
                </div>

                {/* Properties Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="bg-white rounded-2xl overflow-hidden p-4">
                                <Skeleton.Image active className="!w-full !h-56 rounded-2xl mb-4" />
                                <Skeleton active paragraph={{ rows: 3 }} />
                            </div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl">
                        <svg className="w-24 h-24 text-purple-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">{t.noPropertiesFound}</h2>
                        <p className="text-gray-500">{t.checkBackSoon}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
                        {properties.map((property, index) => (
                            <div
                                key={property._id}
                                className={`card-house style-default hover-image group bg-white rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: `${200 + index * 100}ms` }}
                                onClick={() => {
                                    const id = property.listingInformation?.listingInformationPropertyId || property._id;
                                    const slug = getLocalizedValue(property.seoInformation?.slugUrl);
                                    // Navigate to ID/Slug or just ID
                                    const url = `/property-showcase/${id}${slug ? `/${slug}` : ''}`;
                                    window.open(url, '_blank');
                                }}
                            >
                                {/* Image */}
                                <div className="relative img-style article-thumb h-56 overflow-hidden rounded-2xl">
                                    <img style={{ width: "100%" }}
                                        src={property.imagesVideos?.propertyImages?.[0] || '/images/property/dummy-img.avif'}
                                        alt={getLocalizedValue(property.listingInformation?.listingInformationBlockName)}
                                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-96"
                                    />
                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className={`px-2 py-1.5 text-[11px] ${getCategoryBadgeClass(property.listingInformation?.listingInformationTransactionType)} text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg`}>
                                            {getCategoryLabel(property.listingInformation?.listingInformationTransactionType)}
                                        </span>
                                        {property.listingInformation?.listingInformationPropertyType && (
                                            <span className="px-2 py-1.5 text-[11px] bg-[#41398B]/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg">
                                                {getLocalizedValue(property.listingInformation.listingInformationPropertyType)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute top-3 right-3 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={(e) => handleToggleFavorite(e, property)}
                                            className="p-1 bg-white rounded-md shadow-sm text-[#000] hover:scale-105 transition-transform cursor-pointer"
                                        >
                                            <Tooltip title={isFavorite(property._id)
                                                ? (language === 'vi' ? 'Xóa khỏi Yêu thích' : 'Remove from Favorites')
                                                : (language === 'vi' ? 'Thêm vào Yêu thích' : 'Add to Favorites')}>
                                                <Heart
                                                    size={16}
                                                    className={`${isFavorite(property._id) ? 'fill-[#eb4d4d] text-[#eb4d4d]' : 'text-[#2a2a2a]'}`}
                                                />
                                            </Tooltip>
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-5 pb-5 px-4">
                                    {/* Price */}
                                    <div className="flex items-baseline gap-0 mb-2">
                                        {(() => {
                                            const type = getLocalizedValue(property.listingInformation?.listingInformationTransactionType);
                                            const priceSale = property.financialDetails?.financialDetailsPrice;
                                            const priceLease = property.financialDetails?.financialDetailsLeasePrice;
                                            const priceNight = property.financialDetails?.financialDetailsPricePerNight;
                                            const genericPrice = property.financialDetails?.financialDetailsPrice;

                                            // Handle currency safely (extract code)
                                            const currencyData = property.financialDetails?.financialDetailsCurrency;
                                            const currencyCode = (typeof currencyData === 'object' ? currencyData?.code : currencyData) || '';

                                            let displayPrice = t.contactForPrice;
                                            let displaySuffix = null;

                                            // Helper to format price with currency
                                            const formatP = (p) => `${Number(p).toLocaleString()} ${currencyCode}`;

                                            if (type === 'Sale' && priceSale) {
                                                displayPrice = formatP(priceSale);
                                            } else if (type === 'Lease' && priceLease) {
                                                displayPrice = formatP(priceLease);
                                                displaySuffix = ' / month';
                                            } else if (type === 'Home Stay' && priceNight) {
                                                displayPrice = formatP(priceNight);
                                                displaySuffix = ' / night';
                                            } else if (genericPrice) {
                                                displayPrice = formatP(genericPrice);
                                            }

                                            return (
                                                <>
                                                    <span className="text-2xl font-bold text-[#2a2a2a]">{displayPrice}</span>
                                                    {displaySuffix && <span className="text-sm text-gray-500 font-medium">{displaySuffix}</span>}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-[18px] font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#41398B] transition-colors">
                                        {normalizeFancyText(
                                            getLocalizedValue(property.listingInformation?.listingInformationPropertyTitle) ||
                                            getLocalizedValue(property.listingInformation?.listingInformationBlockName) ||
                                            getLocalizedValue(property.listingInformation?.listingInformationProjectCommunity) ||
                                            t.untitledProperty
                                        )}
                                    </h3>

                                    {/* Location / Nearby */}
                                    <div
                                        className="text-[16px] text-gray-500 mb-4 line-clamp-2 ql-editor-summary"
                                        dangerouslySetInnerHTML={{
                                            __html: getLocalizedValue(property.whatNearby?.whatNearbyDescription) ||
                                                getLocalizedValue(property.listingInformation?.listingInformationZoneSubArea) ||
                                                'Location not specified'
                                        }}
                                    />

                                    {/* Details */}
                                    <div className="flex items-center pt-3 border-t border-gray-200 justify-between beds">
                                        {property.propertyInformation?.informationBedrooms > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                                                <svg
                                                    className="w-6 h-6 text-[#41398B]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M3 7h18M5 7v10M19 7v10M3 17h18M7 10h4a2 2 0 012 2v5M7 10a2 2 0 00-2 2v5"
                                                    />
                                                </svg>
                                                <span className="font-medium text-lg">{property.propertyInformation.informationBedrooms} {t.beds}</span>
                                            </div>
                                        )}
                                        {property.propertyInformation?.informationBathrooms > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                                                <svg className="w-6 h-6 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 14h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM6 14V9a3 3 0 0 1 6 0" />
                                                </svg>
                                                <span className="font-medium text-lg">{property.propertyInformation.informationBathrooms} {t.baths}</span>
                                            </div>
                                        )}
                                        {property.propertyInformation?.informationUnitSize > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-[#2a2a2a]">
                                                <svg className="w-6 h-6 text-[#41398B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.4 4.6a2 2 0 0 1 0 2.8l-12 12a2 2 0 0 1-2.8 0l-2-2a2 2 0 0 1 0-2.8l12-12a2 2 0 0 1 2.8 0zM12 7l2 2M10 9l2 2M8 11l2 2" />
                                                </svg>
                                                <span className="font-medium text-lg">{property.propertyInformation.informationUnitSize.toLocaleString()} {t.sqft}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View All Button */}
                {!loading && properties.length > 0 && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleButtonClick}
                            className="mt-4 cursor-pointer px-8 py-3.5 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transform opacity-100 translate-y-0"
                        >
                            {buttonText}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}