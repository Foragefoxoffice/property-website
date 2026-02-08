"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Phone,
    Bed,
    Bath,
    Ruler,
    Layers,
    Eye,
    House,
    SlidersHorizontal,
    Armchair,
    ArrowLeft,
    ArrowRight,
    X,
    PlayIcon,
    Mail,
    Send,
    Heart
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SiMessenger, SiZalo } from "react-icons/si";
import { translations } from "@/Language/translations";
import { safeVal, safeArray } from "@/utils/display";
import { getAgent, addFavorite, getListingProperties } from "@/Api/action";
import { CommonToaster } from "@/Common/CommonToaster";
import { useLanguage } from "@/Language/LanguageContext";
import { useRouter } from 'next/navigation';
import { Skeleton, Tooltip } from 'antd';
import { useFavorites } from '@/Context/FavoritesContext';

/* -------------------------------------------------------
   MEDIA PREVIEW MODAL
------------------------------------------------------- */
const MediaPreviewModal = ({ url, type, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="relative max-w-3xl w-full mx-4 rounded-2xl shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 z-10 right-3 bg-[#41398B]/90 hover:bg-[#41398B] text-white p-2 rounded-full shadow"
                >
                    <X className="cursor-pointer" size={20} />
                </button>
                {type === "video" ? (
                    <video
                        src={url}
                        controls
                        autoPlay
                        className="w-full h-[70vh] object-contain rounded-lg bg-black"
                    />
                ) : (
                    <img
                        src={url}
                        alt="Preview"
                        className="w-full max-h-[80vh] object-contain rounded-lg bg-[#F8F7FC]"
                    />
                )}
            </div>
        </div>
    );
};

/* -------------------------------------------------------
   OVERVIEW CARD
------------------------------------------------------- */
const OverviewCard = ({ icon, label, value }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-500">
            {React.cloneElement(icon, { size: 20, className: "text-[#41398B]" })}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-base font-semibold text-gray-900">{value || "-"}</span>
    </div>
);

const EcoparkItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="font-semibold text-gray-900">{value || "-"}</span>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">{value || "-"}</span>
    </div>
);

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
export default function PropertyDetailsSection({ property }) {
    const { language } = useLanguage();
    const router = useRouter();
    const t = translations[language];
    const { isFavorite, addFavorite: addFavoriteContext, removeFavorite } = useFavorites();

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '');
    };

    const p = property || {};
    const info = p.propertyInformation || {};
    const list = p.listingInformation || {};
    const fin = p.financialDetails || {};
    const what = p.whatNearby || {};

    const type = safeVal(list?.listingInformationTransactionType);
    const videos = safeArray(p?.imagesVideos?.propertyVideo);
    const utilities = safeArray(p?.propertyUtility);

    const visList = p.listingInformationVisibility || {};
    const visProp = p.propertyInformationVisibility || {};
    const visFin = p.financialVisibility || {};
    const visVideo = p.videoVisibility || {};
    const visWhatNearby = p.whatNearbyVisibility || false;

    const [recentProperties, setRecentProperties] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [agentData, setAgentData] = useState(null);
    const [agentLoading, setAgentLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isVisibleRecent, setIsVisibleRecent] = useState(false);
    const recentSectionRef = useRef(null);

    const sectionRefs = {
        Overview: useRef(null),
        "Property Utility": useRef(null),
        "Payment Overview": useRef(null),
        Video: useRef(null),
        "Map": useRef(null),
    };

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisibleRecent(true);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );

        if (recentSectionRef.current) {
            observer.observe(recentSectionRef.current);
        }

        return () => {
            if (recentSectionRef.current) {
                observer.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const fetchRecentProperties = async () => {
            try {
                setLoadingRecent(true);
                const res = await getListingProperties({ page: 1, limit: 4, sortBy: 'newest' });
                let props = res.data?.data || [];
                const currentId = p._id || list.listingInformationPropertyId;
                if (currentId) {
                    props = props.filter(item => (item._id !== currentId && item.listingInformation?.listingInformationPropertyId !== currentId));
                }
                setRecentProperties(props.slice(0, 3));
            } catch (error) {
                console.error('Error fetching recent properties:', error);
            } finally {
                setLoadingRecent(false);
            }
        };
        fetchRecentProperties();
    }, [p._id, list.listingInformationPropertyId]);

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                setAgentLoading(true);
                const response = await getAgent();
                setAgentData(response.data.data);
            } catch (error) {
                console.error('Error fetching agent data:', error);
            } finally {
                setAgentLoading(false);
            }
        };
        fetchAgentData();
    }, []);

    const handleSendRequest = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            CommonToaster("Please login to send request", 'error');
            return;
        }

        try {
            setSending(true);
            const propId = p._id || list.listingInformationPropertyId;
            if (!propId) {
                CommonToaster('Invalid property data', 'error');
                return;
            }

            const res = await addFavorite(propId, message);
            if (res.data.success) {
                CommonToaster('Request sent successfully', 'success');
                setMessage('');
            } else {
                CommonToaster('Failed to send request', 'error');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            CommonToaster('Error sending request', 'error');
        } finally {
            setSending(false);
        }
    };

    const scrollTo = (name) => {
        sectionRefs[name]?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const show = (flag) => flag === false || flag === undefined;

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', options).replace(/ /g, "-");
    }

    const TABS = [
        { key: "Overview", label: t.overview },
        { key: "Property Utility", label: t.propertyUtility },
        { key: "Payment Overview", label: t.paymentOverview },
        { key: "Video", label: t.video },
        { key: "Map", label: t.map || "Map" },
    ];

    const baseURL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || "https://dev.placetest.in/api/v1";
    const serverURL = baseURL.replace('/api/v1', '');

    return (
        <div className="bg-[#F8F7FC] pb-30 px-4">
            <div className="sticky top-0 bg-[#F8F7FC] pt-4 z-10 flex md:justify-center border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => scrollTo(tab.key)}
                        className="relative md:px-5 px-2 py-3 md:text-lg text-sm font-medium cursor-pointer"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1320px] mx-auto">
                <div id="scrollContainer" className="lg:col-span-2 pr-2">
                    <section ref={sectionRefs["Overview"]} className="bg-white p-6 mt-4 rounded-2xl mb-6 md:mb-10">
                        <h2 className="text-xl font-semibold mb-5">{t.overview}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {show(visList.projectCommunity) && (
                                <EcoparkItem label={`${t.projectCommunity}:`} value={getLocalizedValue(list?.listingInformationProjectCommunity)} />
                            )}
                            {show(visList.areaZone) && (
                                <EcoparkItem label={`${t.areaZone}:`} value={getLocalizedValue(list?.listingInformationZoneSubArea)} />
                            )}
                            {show(visList.blockName) && (
                                <EcoparkItem label={`${t.block}:`} value={getLocalizedValue(list?.listingInformationBlockName)} />
                            )}
                            {(type === "Sale" || type === "Lease") && show(visList.availableFrom) && (
                                <EcoparkItem label={`${t.availableFrom}:`} value={formatDate(list?.listingInformationAvailableFrom)} />
                            )}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl mb-6 md:mb-12">
                        <div className="grid grid-cols-2 ml-3 md:grid-cols-4 gap-8">
                            {show(p.listingInformationVisibility?.propertyId) && (
                                <OverviewCard icon={<House />} label={`${t.propertyId}:`} value={safeVal(list?.listingInformationPropertyId)} />
                            )}
                            {show(visList.transactionType) && (
                                <OverviewCard icon={<SlidersHorizontal />} label={`${t.propertyType}:`} value={getLocalizedValue(list?.listingInformationPropertyType)} />
                            )}
                            {show(visProp.bedrooms) && (
                                <OverviewCard icon={<Bed />} label={`${t.bedrooms}:`} value={`${safeVal(info?.informationBedrooms)} ${t.rooms}`} />
                            )}
                            {show(visProp.bathrooms) && (
                                <OverviewCard icon={<Bath />} label={`${t.bathrooms}:`} value={`${safeVal(info?.informationBathrooms)} ${t.rooms}`} />
                            )}
                            {show(visProp.furnishing) && (
                                <OverviewCard icon={<Armchair />} label={`${t.furnishing}:`} value={getLocalizedValue(info?.informationFurnishing)} />
                            )}
                            {show(visProp.unit) && (
                                <OverviewCard icon={<Ruler />} label={`${t.size}:`} value={`${safeVal(info?.informationUnitSize)} ${safeVal(info?.informationUnit) || '-'}`} />
                            )}
                            {show(visProp.floorRange) && (
                                <OverviewCard icon={<Layers />} label={`${t.floorRange}:`} value={getLocalizedValue(info?.informationFloors)} />
                            )}
                            {show(visProp.view) && (
                                <OverviewCard icon={<Eye />} label={`${t.view}:`} value={getLocalizedValue(info?.informationView)} />
                            )}
                        </div>
                    </section>

                    {type === "Home Stay" && (
                        <section className="bg-white p-6 rounded-2xl mb-6 md:mb-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {show(visFin.checkIn) && <InfoItem label={`${t.checkIn}:`} value={safeVal(fin?.financialDetailsCheckIn)} />}
                                {show(visFin.checkOut) && <InfoItem label={`${t.checkOutLabel}:`} value={safeVal(fin?.financialDetailsCheckOut)} />}
                            </div>
                        </section>
                    )}

                    {show(visWhatNearby) && (
                        <section className="bg-white p-6 rounded-2xl mb-6 md:mb-12">
                            <h2 className="text-xl font-semibold mb-5">{t.description}</h2>
                            <div
                                className="text-gray-700 leading-6 ql-editor-summary"
                                dangerouslySetInnerHTML={{ __html: getLocalizedValue(what?.whatNearbyDescription) || t.noDescription }}
                            />
                        </section>
                    )}

                    <section ref={sectionRefs["Property Utility"]} className="bg-white p-6 rounded-2xl mb-6 md:mb-12">
                        <h2 className="text-xl font-semibold mb-5">{t.propertyUtility}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                            {utilities.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 border-b py-3 last:border-b-0">
                                    <img src={item?.propertyUtilityIcon} className="w-6 h-6 object-contain" alt="" />
                                    <span className="font-medium">{safeVal(item?.propertyUtilityUnitName)}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section ref={sectionRefs["Payment Overview"]} className="bg-white p-6 rounded-2xl mb-6 md:mb-12">
                        <h2 className="text-xl font-semibold mb-4">{t.paymentOverview}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {show(visFin.deposit) && <InfoItem label={`${t.deposit}:`} value={safeVal(fin?.financialDetailsDeposit)} />}
                            {show(visFin.paymentTerm) && <InfoItem label={`${t.paymentTerms}:`} value={safeVal(fin?.financialDetailsMainFee)} />}
                        </div>
                    </section>

                    {show(visVideo.videoVisibility) && videos.length > 0 && (
                        <section ref={sectionRefs["Video"]} className="bg-white p-6 rounded-2xl mb-16">
                            <h2 className="text-xl font-semibold mb-5">{t.video}</h2>
                            <div className="grid sm:grid-cols-2 gap-5">
                                {videos.map((url, i) => (
                                    <div key={i} className="relative group rounded-2xl overflow-hidden bg-white transition h-64">
                                        <video src={url} muted playsInline className="w-full h-full object-contain bg-black/5" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/0 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button onClick={() => setPreviewUrl(url)} className="p-3 bg-[#41398B] rounded-full shadow hover:scale-110 transition cursor-pointer">
                                                <PlayIcon className="text-white" size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {show(visList.googleMap) && (
                        <section ref={sectionRefs["Map"]} className="bg-white p-6 rounded-2xl">
                            <h2 className="text-xl font-semibold mb-5">{t.map || "Map"}</h2>
                            {list.listingInformationGoogleMapsIframe && getLocalizedValue(list.listingInformationGoogleMapsIframe) ? (
                                <div className="w-full h-[450px] rounded-lg overflow-hidden border border-gray-200">
                                    <div
                                        className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full"
                                        dangerouslySetInnerHTML={{
                                            __html: (() => {
                                                const raw = getLocalizedValue(list.listingInformationGoogleMapsIframe);
                                                if (!raw) return "";
                                                if (typeof DOMParser === 'undefined') return raw;
                                                const parser = new DOMParser();
                                                const doc = parser.parseFromString(raw, "text/html");
                                                return doc.documentElement.textContent;
                                            })()
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-500 italic">{t.noMap || "No map available"}</div>
                            )}
                        </section>
                    )}
                </div>

                <div className="lg:col-span-1 sticky top-26 h-fit">
                    <div className="bg-white rounded-xl border p-6 shadow-md">
                        <h3 className="text-2xl text-[#41398B] font-semibold mb-4">{t.contact}</h3>
                        {agentLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41398B]"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <img
                                        src={agentData?.agentImage ? (agentData.agentImage.startsWith('/') ? `${serverURL}${agentData.agentImage}` : agentData.agentImage) : "/placeholder.jpg"}
                                        className="w-[250px] h-full object-cover pb-0"
                                        alt="Agent"
                                    />
                                </div>
                                <div><h3 className="text-xl text-[#41398B] font-semibold mb-4">{t.agent}</h3></div>
                                {agentData?.agentNumber && Array.isArray(agentData.agentNumber) && (
                                    <div className="mb-4">
                                        {agentData.agentNumber.map((phone, index) => (
                                            <div key={index} className="flex items-center gap-2 text-gray-700 mb-2">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${phone}`} className="hover:text-[#41398B] transition">{phone}</a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {agentData?.agentEmail && Array.isArray(agentData.agentEmail) && (
                                    <div className="mb-4">
                                        {agentData.agentEmail.map((email, index) => (
                                            <div key={index} className="flex items-center gap-2 text-gray-700 mb-2">
                                                <Mail className="w-4 h-4" />
                                                <a href={`mailto:${email}`} className="hover:text-[#41398B] transition text-sm">{email}</a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="border-t pt-4">
                                    <div className="flex gap-3 justify-center">
                                        {agentData?.agentZaloLink && <a href={agentData.agentZaloLink} target="_blank" className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><SiZalo size={20} /></a>}
                                        {agentData?.agentMessengerLink && <a href={agentData.agentMessengerLink} target="_blank" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white"><SiMessenger size={20} /></a>}
                                        {agentData?.agentWhatsappLink && <a href={agentData.agentWhatsappLink} target="_blank" className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"><FaWhatsapp size={20} /></a>}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div style={{ backgroundColor: "#e8e2ff73" }} className="mt-6 p-6 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.message}</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.enterMessage} className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 h-32 text-sm" />
                        <button onClick={handleSendRequest} disabled={sending} className="w-full mt-4 text-white py-3 rounded-xl font-bold bg-[#41398B] flex items-center justify-center gap-2 cursor-pointer shadow-md">
                            {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={18} />{t.sendRequest}</>}
                        </button>
                    </div>
                </div>
            </div>

            <section ref={recentSectionRef} className="py-16 md:py-24 bg-gradient-to-br from-[#f8f7ff] via-white to-[#f0eeff] mt-20">
                <div className="max-w-[1320px] mx-auto px-4 md:px-0">
                    <div className="text-center mb-12 md:mb-20">
                        <p className="text-sm font-semibold text-[#a4aeb5] uppercase tracking-wider mb-3">{t.recentProperties}</p>
                        <h2 className="text-4xl md:text-5xl font-semibold text-black">
                            {language === 'vi' ? 'Bất động sản mới được cập nhật' : 'Recently Updated Properties'}
                        </h2>
                    </div>

                    {loadingRecent ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
                            {[1, 2, 3].map(i => <Skeleton key={i} active />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
                            {recentProperties.map((prop, index) => (
                                <div key={prop._id} className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all" onClick={() => {
                                    const id = prop.listingInformation?.listingInformationPropertyId || prop._id;
                                    const slug = getLocalizedValue(prop.seoInformation?.slugUrl);
                                    router.push(`/property-showcase/${id}${slug ? `/${slug}` : ''}`);
                                }}>
                                    <div className="relative h-56">
                                        <img src={prop.imagesVideos?.propertyImages?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-lg line-clamp-1">{getLocalizedValue(prop.listingInformation?.listingInformationPropertyTitle)}</h4>
                                        <p className="text-gray-500 text-sm">{getLocalizedValue(prop.listingInformation?.listingInformationCity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {previewUrl && <MediaPreviewModal url={previewUrl} type="video" onClose={() => setPreviewUrl(null)} />}
        </div>
    );
}
