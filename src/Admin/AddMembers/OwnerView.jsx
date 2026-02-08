import React, { useEffect, useState } from "react";
import { ArrowLeft, PhoneCall, Facebook, MapPin, Calendar, ExternalLink, Bed, Bath, Ruler, Clover } from "lucide-react";
import { getAllOwners, getListingProperties } from "../../Api/action";
import { Spin } from "antd";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { useParams, useNavigate } from "react-router-dom";
import { normalizeFancyText } from "../../utils/display";

export default function OwnerView() {
  const { language } = useLanguage();
  const t = translations[language];
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const { id } = useParams();

  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  const getLocalizedValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return language === "vi"
      ? value.vi || value.en || ""
      : value.en || value.vi || "";
  };

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await getAllOwners();
        const foundOwner = res.data.data.find((o) => o._id === id);
        if (!foundOwner) {
          CommonToaster(language === "vi" ? "Không tìm thấy chủ sở hữu" : "Owner not found", "error");
          navigate(-1);
          return;
        }
        setOwner(foundOwner);
      } catch {
        CommonToaster(language === "vi" ? "Không thể tải chi tiết chủ sở hữu" : "Failed to fetch owner details", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOwner();
  }, [id, language]);

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      if (!owner || !owner.ownerName?.en) return;
      try {
        setLoadingProps(true);
        const res = await getListingProperties({
          owner: owner.ownerName.en,
          status: "all"
        });
        setProperties(res.data.data || []);
      } catch (error) {
        console.error("Error fetching owner properties:", error);
      } finally {
        setLoadingProps(false);
      }
    };
    fetchOwnerProperties();
  }, [owner]);


  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
        <div className="w-full max-w-3xl animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-gray-200"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>

          {/* Card Skeleton */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col sm:flex-row gap-8 border border-gray-100">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex-shrink-0 flex justify-center sm:justify-start">
              <div>
                <div className="w-44 h-44 rounded-xl bg-gray-200"></div>
                <div className="h-3 w-20 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="h-3 w-28 bg-gray-200 rounded"></div>
              </div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-11/12 bg-gray-200 rounded"></div>
                <div className="h-3 w-10/12 bg-gray-200 rounded"></div>
                <div className="h-3 w-9/12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (!owner)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        {language === "vi" ? "Không tìm thấy chủ sở hữu." : "Owner not found."}
      </div>
    );

  const {
    ownerName,
    ownerNumber,
    ownerNotes,
    ownerType,
    ownerFacebook,
    photo,
  } = owner;

  const defaultImage = "/dummy-img.jpg";

  // Build Facebook link properly
  let facebookLink = "";
  const fbUsername = ownerFacebook?.[language]?.trim();
  if (fbUsername) {
    facebookLink = fbUsername.startsWith("http")
      ? fbUsername
      : `https://facebook.com/${fbUsername}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white cursor-pointer transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {language === "vi"
              ? ownerName?.vi || "Chi tiết chủ sở hữu"
              : ownerName?.en || "Owner Details"}
          </h1>
        </div>

        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-md px-6 py-8 border border-gray-100 flex gap-6">

          {/* LEFT SIDE – Owner Info */}
          <div className="flex-1">

            {/* ✅ NAME */}
            <h2 className="text-lg font-semibold text-gray-800">
              {owner.ownerName?.[language] || owner.ownerName?.en || "Unnamed Owner"}
            </h2>

            {/* ✅ ALL PHONE NUMBERS */}
            {owner.phoneNumbers?.length > 0 &&
              owner.phoneNumbers.map((num, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 mt-3">
                  <PhoneCall size={16} />
                  <span className="text-sm">{num || "-"} </span>
                </div>
              ))}



            {/* ✅ NOTES */}
            <h3 className="font-medium text-gray-800 mt-5">
              {language === "vi" ? "Ghi chú" : "Notes"}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-line">
              {owner.ownerNotes?.[language] ||
                owner.ownerNotes?.en ||
                (language === "vi"
                  ? "Không có ghi chú nào cho chủ sở hữu này."
                  : "No notes available for this owner.")}
            </p>
          </div>

          {/* RIGHT SIDE – ALL SOCIAL ICONS */}
          <div className="flex flex-col items-end gap-3">

            {owner.socialMedia_iconName?.length > 0 &&
              owner.socialMedia_iconName.map((icon, i) => {
                const link =
                  owner.socialMedia_link_en?.[i] ||
                  owner.socialMedia_link_vi?.[i] ||
                  "";

                const finalLink = link.startsWith("http") ? link : `https://${link}`;

                return (
                  <a
                    key={i}
                    href={finalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition"
                  >
                    <Facebook size={20} className="text-gray-700" />
                  </a>
                );
              })}
          </div>
        </div>

        {/* ✅ OWNER PROPERTIES LIST */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100 mt-6 overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            {language === "vi" ? "Danh sách bất động sản" : "Properties List"}
          </h3>

          {loadingProps ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {properties.map((prop) => {
                const type = prop.listingInformation?.listingInformationTransactionType?.en || "";
                const title = language === 'vi'
                  ? prop.listingInformation?.listingInformationPropertyTitle?.vi || prop.listingInformation?.listingInformationPropertyTitle?.en
                  : prop.listingInformation?.listingInformationPropertyTitle?.en || prop.listingInformation?.listingInformationPropertyTitle?.vi;

                const location = language === 'vi'
                  ? prop.listingInformation?.listingInformationProjectCommunity?.vi || prop.listingInformation?.listingInformationProjectCommunity?.en
                  : prop.listingInformation?.listingInformationProjectCommunity?.en || prop.listingInformation?.listingInformationProjectCommunity?.vi;

                const view = language === 'vi'
                  ? prop.propertyInformation?.informationView?.vi || prop.propertyInformation?.informationView?.en
                  : prop.propertyInformation?.informationView?.en || prop.propertyInformation?.informationView?.vi;

                const unit = language === 'vi'
                  ? prop.propertyInformation?.informationUnit?.vi || prop.propertyInformation?.informationUnit?.en
                  : prop.propertyInformation?.informationUnit?.en || prop.propertyInformation?.informationUnit?.vi;

                const priceSale = prop.financialDetails?.financialDetailsPrice;
                const priceLease = prop.financialDetails?.financialDetailsLeasePrice;
                const priceNight = prop.financialDetails?.financialDetailsPricePerNight;
                const currency = prop.financialDetails?.financialDetailsCurrency?.code || "₫";

                let displayPrice = "";
                let suffix = "";
                if (type === "Sale") displayPrice = priceSale;
                else if (type === "Lease") { displayPrice = priceLease; suffix = language === 'vi' ? "/ tháng" : "/ month"; }
                else if (type === "Home Stay") { displayPrice = priceNight; suffix = language === 'vi' ? "/ đêm" : "/ night"; }

                const formattedPrice = displayPrice ? `${Number(displayPrice).toLocaleString()} ${currency}` : (language === 'vi' ? "Liên hệ" : "Contact");

                const postedDate = prop.createdAt ? new Date(prop.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : "-";

                return (
                  <div
                    key={prop._id}
                    className="flex flex-col sm:flex-row bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Image Area */}
                    <div className="relative w-full sm:w-1/3 h-48 sm:h-auto overflow-hidden">
                      <img
                        src={prop.imagesVideos?.propertyImages?.[0] || "/dummy-img.jpg"}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <span className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-gray-800 shadow-sm border border-gray-100 w-fit">
                          {language === 'vi' ? prop.listingInformation?.listingInformationTransactionType?.vi : prop.listingInformation?.listingInformationTransactionType?.en}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white shadow-sm w-fit ${prop.status === 'Published' ? 'bg-green-500' :
                            prop.status === 'Draft' ? 'bg-gray-500' :
                              prop.status === 'Pending' ? 'bg-orange-500' :
                                'bg-red-500'
                          }`}>
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-sm">🏡</span>
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                            {normalizeFancyText(title)}
                          </h4>
                        </div>

                        <div className="space-y-1 mb-3">
                          {view && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-[13px]">
                              <Clover size={12} className="text-green-500" />
                              <span>{view}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-500 text-[13px]">
                            <MapPin size={12} className="text-red-500" />
                            <span className="line-clamp-1">{language === 'vi' ? "Vị trí: " : "Location: "}{location}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-0">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 text-[13px] text-gray-600">
                            <Bed size={12} />
                            <span>{prop.propertyInformation?.informationBedrooms || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 text-[13px] text-gray-600">
                            <Bath size={12} />
                            <span>{prop.propertyInformation?.informationBathrooms || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 text-[13px] text-gray-600">
                            <Ruler size={12} />
                            <span>{prop.propertyInformation?.informationUnitSize || 0} {unit || "m²"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-0 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{language === 'vi' ? "GIÁ" : "PRICE"}</p>
                          <p className="text-md font-bold text-[#41398B] whitespace-nowrap">
                            {formattedPrice} <span className="text-[12px] font-medium text-gray-500">{suffix}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="hidden xs:flex items-center gap-1 text-[10px] text-gray-400">
                            <Calendar size={12} />
                            <span>{postedDate}</span>
                          </div>

                          <a
                            href={`/property-showcase/${prop.listingInformation?.listingInformationPropertyId || prop._id}${getLocalizedValue(prop.seoInformation?.slugUrl) ? `/${getLocalizedValue(prop.seoInformation?.slugUrl)}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#41398B] hover:bg-[#352e7a] text-white p-2 rounded-lg transition-all shadow-sm"
                            title={language === 'vi' ? "Xem chi tiết" : "View Full Details"}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-sm font-medium">{language === "vi" ? "Chưa có bất động sản nào được gán cho chủ sở hữu này." : "No properties found for this owner."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
