import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  Phone,
  Mail,
  UserCog,
  X,
  MapPin,
  Calendar,
  ExternalLink,
  Bed,
  Bath,
  Ruler,
  Clover,
} from "lucide-react";
import { Select as AntdSelect, Spin } from "antd";
import { usePermissions } from "../../Context/PermissionContext";
import { getListingProperties } from "../../Api/action";
import { normalizeFancyText } from "../../utils/display";

/* 💜 Skeleton Loader Component */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-64 mb-10"></div>

    {[...Array(5)].map((_, idx) => (
      <div key={idx} className="mb-8">
        <div className="h-4 bg-[#41398b29] rounded w-48 mb-3"></div>
        <div className="grid grid-cols-3 gap-5">
          {[...Array(3)].map((__, i) => (
            <div key={i} className="h-12 bg-[#41398b29] rounded"></div>
          ))}
        </div>
      </div>
    ))}

    <div className="flex justify-between mt-10">
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
    </div>
  </div>
);

const formatDMY = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatNumber = (value) => {
  if (!value && value !== 0) return "—";
  const numeric = value.toString().replace(/,/g, "");
  if (isNaN(numeric)) return value;
  return Number(numeric).toLocaleString("en-US");
};

/* === Media Preview Modal === */
const MediaPreviewModal = ({ url, type, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="relative max-w-3xl w-full mx-4 bg-white rounded-2xl p-4 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 z-99 right-3 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow"
          aria-label="Close"
        >
          <X className="cursor-pointer" size={20} />
        </button>

        {/* Preview */}
        {type === "video" ? (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-[75vh] object-contain rounded-lg bg-black"
          />
        ) : (
          <img
            src={url}
            alt="Preview"
            className="w-full max-h-[80vh] object-contain rounded-lg bg-gray-50"
          />
        )}
      </div>
    </div>
  );
};

export default function CreatePropertyPreview({
  savedId,
  propertyData,     // 🔥 coming from previous steps
  dropdowns,
  onPublish,
  onPrev,
}) {
  const { isApprover } = usePermissions();
  const [property, setProperty] = useState(propertyData || {});

  // ✅ Auto-set status to "Published" for Approvers (User Request: automatically approved and publish)
  const [status, setStatus] = useState(() => {
    if (isApprover) return "Published";
    return propertyData?.status || "Draft";
  });

  const [publishing, setPublishing] = useState(false);

  console.log("💾 PREVIEW RECEIVED DATA:", propertyData);

  const [lang, setLang] = useState("vi");
  const [loading, setLoading] = useState(false);

  // owners & staffs for popup lookup
  const [owners, setOwners] = useState([]);
  const [staffs, setStaffs] = useState([]);

  // popup states
  const [showOwnerPopup, setShowOwnerPopup] = useState(false);
  const [showStaffPopup, setShowStaffPopup] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // media preview state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const getLocalizedValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return lang === "vi"
      ? value.vi || value.en || ""
      : value.en || value.vi || "";
  };

  const labels = {
    reviewTitle: {
      en: "Review & Publish Property",
      vi: "Xem lại & Đăng bất động sản",
    },
    noProperty: {
      en: "No property found.",
      vi: "Không tìm thấy bất động sản.",
    },
    listingInfo: { en: "Listing Information", vi: "Thông tin niêm yết" },
    propertyInfo: { en: "Property Information", vi: "Thông tin bất động sản" },
    description: { en: "Description", vi: "Mô tả" },
    propertyUtility: { en: "Property Utility", vi: "Tiện ích bất động sản" },
    propertyImages: { en: "Property Images", vi: "Hình ảnh bất động sản" },
    propertyVideos: { en: "Property Videos", vi: "Video bất động sản" },
    floorPlans: { en: "Floor Plans", vi: "Bản vẽ sàn" },
    financialDetails: { en: "Financial Details", vi: "Chi tiết tài chính" },
    contactManagement: {
      en: "Contact / Management Details",
      vi: "Liên hệ / Quản lý",
    },
    status: { en: "Publish the Website", vi: "Xuất bản trang web" },
    draft: { en: "Draft", vi: "Bản nháp" },
    published: { en: "Published", vi: "Đã đăng" },
    previous: { en: "Previous", vi: "Trước" },
    completed: { en: "Completed", vi: "Hoàn tất" },
    select: { en: "Select", vi: "Chọn" },
    noMedia: {
      en: "No media uploaded.",
      vi: "Chưa tải lên hình ảnh hoặc video.",
    },
    noUtilities: { en: "No utilities added.", vi: "Chưa thêm tiện ích nào." },
    noDescription: { en: "No description provided.", vi: "Không có mô tả." },

    // Listing Information
    propertyId: { en: "Property ID", vi: "Mã tài sản" },
    transactionType: { en: "Transaction Type", vi: "Loại giao dịch" },
    project: { en: "Project / Community", vi: "Dự án / Khu dân cư" },
    areaZone: { en: "Area / Zone", vi: "Khu vực / Vùng" },
    block: { en: "Block Name", vi: "Tên khối" },
    propertyTitle: { en: "Property Title", vi: "Tiêu đề bất động sản" },
    propertyType: { en: "Property Type", vi: "Loại bất động sản" },
    dateListed: { en: "Date Listed", vi: "Ngày niêm yết" },
    availableFrom: { en: "Available From", vi: "Có sẵn từ" },
    availabilityStatus: { en: "Availability Status", vi: "Trạng thái sẵn có" },

    // Property Info
    unit: { en: "Unit", vi: "Đơn vị" },
    unitSize: { en: "Unit Size", vi: "Diện tích" },
    bedrooms: { en: "Bedrooms", vi: "Phòng ngủ" },
    bathrooms: { en: "Bathrooms", vi: "Phòng tắm" },
    floors: { en: "Floors", vi: "Số tầng" },
    furnishing: { en: "Furnishing", vi: "Trang bị nội thất" },
    view: { en: "View", vi: "Hướng nhìn" },

    // Financial
    currency: { en: "Currency", vi: "Tiền tệ" },
    price: { en: "Price", vi: "Giá" },
    deposit: { en: "Deposit", vi: "Đặt cọc" },
    paymentTerms: { en: "Payment Terms", vi: "Điều khoản thanh toán" },
    leasePrice: { en: "Lease Price", vi: "Giá thuê" },
    contractLength: { en: "Contract Length", vi: "Thời hạn hợp đồng" },
    pricePerNight: { en: "Price per Night", vi: "Giá mỗi đêm" },
    checkIn: { en: "Check-in", vi: "Nhận phòng" },
    checkOut: { en: "Check-out", vi: "Trả phòng" },
    contractTerms: { en: "Contract Terms", vi: "Điều khoản hợp đồng" },

    // Contact / Management
    owner: { en: "Landlord", vi: "chủ nhà" },
    ownerNotes: { en: "Landlord Notes", vi: "Ghi chú của chủ nhà" },
    consultant: { en: "Created By", vi: "Được tạo bởi" },
    connectingPoint: { en: "Connecting Point", vi: "Điểm liên hệ" },
    connectingNotes: { en: "Connecting Notes", vi: "Ghi chú liên hệ" },
    internalNotes: { en: "Internal Notes", vi: "Ghi chú nội bộ" },
    publishing: { en: "Publishing", vi: "Đang xuất bản" },
    sendForApproval: { en: "Send for Approval", vi: "Gửi phê duyệt" },
    readyForApproval: { en: "Ready for Approval", vi: "Sẵn sàng phê duyệt" },
  };


  /* Loader */
  if (loading) return <SkeletonLoader />;

  if (!property)
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        {labels.noProperty[lang]}
      </div>
    );

  const li = property.listingInformation || {};
  const pi = property.propertyInformation || {};
  const fd = property.financialDetails || {};
  const cm = property.contactManagement || {};
  const iv = property.imagesVideos || {};
  const wn = property.whatNearby || {};

  const safe = (v) => (typeof v === "object" ? v[lang] || v.en || "" : v || "");

  const getTransType = () => {
    const raw = safe(li.listingInformationTransactionType).toLowerCase().trim();
    if (raw === "homestay" || raw === "home stay") return "home stay";
    if (raw === "bán" || raw === "sale") return "sale";
    if (raw === "cho thuê" || raw === "lease") return "lease";
    return raw;
  };
  const currentTransType = getTransType();

  /* helper to find owner/staff object by localized name */
  const findOwnerByForm = (ownerForm) => {
    if (!ownerForm) return null;
    return owners.find(
      (o) =>
        (o.ownerName?.en && o.ownerName.en === ownerForm.en) ||
        (o.ownerName?.vi && o.ownerName.vi === ownerForm.vi)
    );
  };
  const findStaffByForm = (staffForm) => {
    if (!staffForm) return null;
    return staffs.find(
      (s) =>
        (s.staffsName?.en && s.staffsName.en === staffForm.en) ||
        (s.staffsName?.vi && s.staffsName.vi === staffForm.vi)
    );
  };

  const ownerData = findOwnerByForm(cm.contactManagementOwner);
  const staffData = findStaffByForm(cm.contactManagementConnectingPoint);

  const openPreview = (url, type) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  return (
    <div className="bg-white min-h-screen p-6 rounded-2xl">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white px-10 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {labels.reviewTitle[lang]}
        </h1>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto py-6 px-3 sm:px-1">
        {/* 🌐 Language Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          {["vi", "en"].map((lng) => (
            <button
              key={lng}
              className={`px-6 py-2 text-sm font-medium ${lang === lng
                ? "border-b-2 border-[#41398B] text-black"
                : "text-gray-500 hover:text-black"
                }`}
              onClick={() => setLang(lng)}
            >
              {lng === "vi" ? "Tiếng Việt (VI)" : "English (EN)"}
            </button>
          ))}
        </div>

        {/* === Listing Information === */}
        <Section title={labels.listingInfo[lang]}>
          <Grid3>
            <Field
              label={labels.transactionType[lang]}
              value={safe(li.listingInformationTransactionType)}
            />
            <Field
              label={labels.propertyId[lang]}
              value={li.listingInformationPropertyId}
            />
            <Field
              label={labels.project[lang]}
              value={safe(li.listingInformationProjectCommunity)}
            />
            <Field
              label={labels.areaZone[lang]}
              value={safe(li.listingInformationZoneSubArea)}
            />
            <Field
              label={labels.block[lang]}
              value={safe(li.listingInformationBlockName)}
            />
            <Field
              label={lang === "en" ? "Property No" : "Số bất động sản"}
              value={safe(li.listingInformationPropertyNo)}
            />
            <Field
              label={labels.propertyType[lang]}
              value={safe(li.listingInformationPropertyType)}
            />
            <Field
              label={labels.dateListed[lang]}
              value={formatDMY(li.listingInformationDateListed)}
            />
            {currentTransType === "home stay" ? (
              ""
            ) : (
              <>
                <Field
                  label={labels.availableFrom[lang]}
                  value={formatDMY(li.listingInformationAvailableFrom)}
                />
                <Field
                  label={labels.availabilityStatus[lang]}
                  value={safe(li.listingInformationAvailabilityStatus)}
                />
              </>
            )}
          </Grid3>
        </Section>

        {/* === Property Information === */}
        <Section title={labels.propertyInfo[lang]}>
          <Grid3>
            <Field label={labels.unit[lang]} value={safe(pi.informationUnit)} />
            <Field
              label={labels.unitSize[lang]}
              value={pi.informationUnitSize}
            />
            <Field
              label={labels.bedrooms[lang]}
              value={pi.informationBedrooms}
            />
            <Field
              label={labels.bathrooms[lang]}
              value={pi.informationBathrooms}
            />
            <Field
              label={labels.floors[lang]}
              value={safe(pi.informationFloors)}
            />
            <Field
              label={labels.furnishing[lang]}
              value={safe(pi.informationFurnishing)}
            />
            <Field label={labels.view[lang]} value={safe(pi.informationView)} />
            <Field
              label={labels.propertyTitle[lang]}
              value={normalizeFancyText(safe(li.listingInformationPropertyTitle))}
            />
          </Grid3>
        </Section>

        {/* === Description === */}
        <Section title={labels.description[lang]}>
          <div
            className="text-gray-700 leading-relaxed overflow-hidden"
            dangerouslySetInnerHTML={{ __html: safe(wn.whatNearbyDescription) || labels.noDescription[lang] }}
          />
        </Section>

        {/* === Property Utility === */}
        <Section title={labels.propertyUtility[lang]}>
          {property.propertyUtility?.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {property.propertyUtility.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition"
                >
                  <span className="font-medium text-gray-800">
                    {safe(u.propertyUtilityUnitName)}
                  </span>
                  <img
                    src={u.propertyUtilityIcon}
                    alt={safe(u.propertyUtilityUnitName)}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{labels.noUtilities[lang]}</p>
          )}
        </Section>

        {/* === Media Sections === */}
        <Section title={labels.propertyImages[lang]}>
          <MediaGrid
            files={iv.propertyImages}
            type="image"
            onPreview={openPreview}
          />
        </Section>

        <Section title={labels.propertyVideos[lang]}>
          <MediaGrid
            files={iv.propertyVideo}
            type="video"
            onPreview={openPreview}
          />
        </Section>

        <Section title={labels.floorPlans[lang]}>
          <MediaGrid
            files={iv.floorPlan}
            type="image"
            onPreview={openPreview}
          />
        </Section>

        {/* === Financial Details === */}
        <Section title={labels.financialDetails[lang]}>
          <Grid3>
            {/* Always show Currency */}
            <Field
              label={labels.currency[lang]}
              value={fd.financialDetailsCurrency}
            />

            {/* ✅ SALE */}
            {currentTransType === "sale" && (
              <>
                <Field
                  label={labels.price[lang]}
                  value={formatNumber(fd.financialDetailsPrice)}
                />
                <Field
                  label={labels.deposit[lang]}
                  value={safe(fd.financialDetailsDeposit)}
                />
                <Field
                  label={labels.paymentTerms[lang]}
                  value={safe(fd.financialDetailsMainFee)}
                />
                <Field
                  label={labels.contractTerms[lang]}
                  value={safe(fd.financialDetailsContractTerms)}
                />
                <Field label="Agent Fee" value={formatNumber(fd.financialDetailsAgentFee)} />
                <Field
                  label="Fee / Tax"
                  value={safe(fd.financialDetailsFeeTax)}
                />
                <Field
                  label="Legal Documents"
                  value={safe(fd.financialDetailsLegalDoc)}
                />
              </>
            )}

            {/* ✅ LEASE */}
            {currentTransType === "lease" && (
              <>
                <Field
                  label={labels.leasePrice[lang]}
                  value={formatNumber(fd.financialDetailsLeasePrice)}
                />
                <Field
                  label={labels.contractLength[lang]}
                  value={fd.financialDetailsContractLength}
                />
                <Field
                  label={labels.deposit[lang]}
                  value={safe(fd.financialDetailsDeposit)}
                />
                <Field
                  label={labels.paymentTerms[lang]}
                  value={safe(fd.financialDetailsMainFee)}
                />
                <Field label="Agent Fee" value={formatNumber(fd.financialDetailsAgentFee)} />
                <Field
                  label="Agent Payment Agenda"
                  value={safe(fd.financialDetailsAgentPaymentAgenda)}
                />
              </>
            )}

            {/* ✅ HOME STAY */}
            {currentTransType === "home stay" && (
              <>
                <Field
                  label={labels.pricePerNight[lang]}
                  value={formatNumber(fd.financialDetailsPricePerNight)}
                />
                <Field
                  label={labels.checkIn[lang]}
                  value={fd.financialDetailsCheckIn}
                />
                <Field
                  label={labels.checkOut[lang]}
                  value={fd.financialDetailsCheckOut}
                />
                <Field
                  label={labels.deposit[lang]}
                  value={safe(fd.financialDetailsDeposit)}
                />
                <Field
                  label={labels.paymentTerms[lang]}
                  value={safe(fd.financialDetailsMainFee)}
                />
              </>
            )}
          </Grid3>
        </Section>

        {/* === Contact Management === */}
        <Section title={labels.contactManagement[lang]}>
          <Grid3>
            {/* Owner / Landlord with Eye */}
            <div className="relative">
              <Field
                label={labels.owner[lang]}
                value={safe(cm.contactManagementOwner)}
              />
              {ownerData && (
                <button
                  onClick={() => {
                    setSelectedOwner(ownerData);
                    setShowOwnerPopup(true);
                  }}
                  className="absolute top-9 right-3 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                  aria-label="View owner"
                >
                  <Eye size={16} className="text-gray-600 cursor-pointer" />
                </button>
              )}
            </div>

            <Field
              label={labels.ownerNotes[lang]}
              value={safe(cm.contactManagementOwnerNotes)}
            />
            <Field
              label={labels.consultant[lang]}
              value={safe(cm.contactManagementConsultant)}
            />

            {/* (Connecting Point UI kept commented as in your code) */}
            <Field
              label={labels.internalNotes[lang]}
              value={safe(cm.contactManagementInternalNotes)}
            />
          </Grid3>
        </Section>

        {/* === Status and Publish Buttons === */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-10">
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-[#131517] mb-2">
              {labels.status[lang]} <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              {!isApprover ? (
                <div className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-3 py-2.5 cursor-not-allowed">
                  {labels.readyForApproval[lang]}
                </div>
              ) : (
                <AntdSelect
                  showSearch
                  allowClear
                  placeholder={labels.select[lang]}
                  value={status || undefined}
                  onChange={(value) => setStatus(value || "")}
                  className="w-full custom-select"
                  popupClassName="custom-dropdown"
                  options={[
                    { label: labels.draft[lang], value: "Draft" },
                    { label: labels.published[lang], value: "Published" },
                  ]}
                />
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-10">
          <button
            onClick={onPrev}
            className="px-6 py-2 bg-white border border-gray-300 items-center text-gray-700 rounded-full hover:bg-gray-100 flex gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={18} /> {labels.previous[lang]}
          </button>

          <button
            onClick={async () => {
              setPublishing(true);
              const finalStatus = isApprover ? status : "Pending";
              await onPublish(finalStatus);
              setPublishing(false);
            }}
            className="px-6 py-3 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full font-medium transition flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
          >
            {isApprover ? labels.completed[lang] : labels.sendForApproval[lang]}
          </button>
        </div>
      </div>
      {/* Popups */}
      {
        showOwnerPopup && selectedOwner && (
          <OwnerPopupCard
            onClose={() => setShowOwnerPopup(false)}
            data={selectedOwner}
            lang={lang}
          />
        )
      }

      {
        showStaffPopup && selectedStaff && (
          <StaffPopupCard
            onClose={() => setShowStaffPopup(false)}
            data={selectedStaff}
            lang={lang}
            title={labels.connectingPoint[lang]}
          />
        )
      }

      {/* Media Preview Modal */}
      {
        previewUrl && (
          <MediaPreviewModal
            url={previewUrl}
            type={previewType}
            onClose={() => {
              setPreviewUrl(null);
              setPreviewType(null);
            }}
          />
        )
      }

      {
        publishing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-4 border-white border-t-[#41398B] rounded-full animate-spin"></div>
              <p className="text-white text-lg tracking-wide font-medium">
                {labels.publishing[lang]}
              </p>
            </div>
          </div>
        )
      }

    </div >
  );
}


/* === Reusable Components === */
const Section = ({ title, children }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="h-[2px] flex-1 ml-4 bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      {children}
    </div>
  </div>
);

const Grid3 = ({ children }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-sm text-[#131517] font-semibold mb-2 tracking-wide">
      {label}
    </p>
    <div className="border border-[#B2B2B3] h-12 overflow-auto rounded-lg px-3 py-2 flex items-center text-sm text-gray-700 bg-gray-50">
      {value || "—"}
    </div>
  </div>
);

/* UPDATED: MediaGrid with Eye icon + object-contain thumbnails */
const MediaGrid = ({ files = [], type, onPreview }) => {
  if (!files?.length) return <p className="text-gray-500">No media uploaded</p>;

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
      {files.map((url, i) => (
        <div
          key={i}
          className="relative group rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition"
        >
          {/* Thumbnail (object-contain as requested) */}
          {type === "video" ? (
            <video
              src={url}
              muted
              playsInline
              className="w-full h-full object-contain bg-black/5"
            />
          ) : (
            <img
              src={url}
              alt=""
              className="w-full h-full object-contain bg-gray-50"
            />
          )}

          {/* Overlay + Eye */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onPreview(url, type)}
              className="p-3 bg-white rounded-full shadow hover:scale-110 transition"
              aria-label="Preview"
            >
              <Eye className="text-gray-700 cursor-pointer" size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* === Popups === */
const OwnerPopupCard = ({ onClose, data, lang }) => {
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      const ownerNameEn = data.ownerName?.en || (typeof data.ownerName === "string" ? data.ownerName : "");
      if (!ownerNameEn) return;
      try {
        setLoadingProps(true);
        const res = await getListingProperties({ owner: ownerNameEn });
        setProperties(res.data.data || []);
      } catch (error) {
        console.error("Error fetching owner properties:", error);
      } finally {
        setLoadingProps(false);
      }
    };
    fetchOwnerProperties();
  }, [data]);

  const safeText = (obj) =>
    typeof obj === "object" ? obj?.[lang] || obj?.en || "" : obj || "";

  const social = data.socialMedia_iconName?.map((icon, i) => ({
    icon,
    link:
      lang === "vi"
        ? data.socialMedia_link_vi?.[i]
        : data.socialMedia_link_en?.[i],
  }));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 relative animate-fade-in border border-gray-100">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="cursor-pointer" size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="w-25 h-25 mx-auto rounded-full bg-[#E5E7EB] flex items-center justify-center shadow-md select-none">
            <span className="text-4xl font-semibold text-gray-700">
              {safeText(data.ownerName)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-semibold mt-4">
            {safeText(data.ownerName)}
          </h2>
        </div>

        {/* Details Sections */}
        <div className="space-y-6 text-center">
          {/* Phone */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              {lang === "vi" ? "Số điện thoại" : "Phone Numbers"}
            </h4>
            {data.phoneNumbers?.length ? (
              <div className="space-y-1">
                {data.phoneNumbers.map((num, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-md text-gray-700 justify-center"
                  >
                    <Phone size={16} className="text-gray-500" />
                    {num}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">—</p>
            )}
          </div>



          {/* Social Media */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              {lang === "vi" ? "Mạng xã hội" : "Social Media"}
            </h4>

            {social?.length ? (
              <div className="space-y-2">
                {social.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm justify-center"
                  >
                    <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium">
                      {s.icon || "—"}
                    </span>
                    {s.link ? (
                      <a
                        href={
                          s.link.startsWith("http")
                            ? s.link
                            : `https://${s.link}`
                        }
                        target="_blank"
                        className="text-[#41398B] font-medium hover:underline"
                      >
                        {s.link}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">—</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              {lang === "vi" ? "Ghi chú" : "Notes"}
            </h4>
            <p className="text-gray-700 text-md whitespace-pre-wrap">
              {safeText(data.ownerNotes) ||
                (lang === "vi" ? "Không có ghi chú" : "No notes")}
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">
              {lang === "vi" ? "Danh sách bất động sản" : "Properties List"}
            </h4>
            {loadingProps ? (
              <div className="flex justify-center py-4">
                <Spin size="small" />
              </div>
            ) : properties.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-4 text-left p-1">
                {properties.map((prop) => {
                  const type = prop.listingInformation?.listingInformationTransactionType?.en || "";
                  const title = lang === 'vi'
                    ? prop.listingInformation?.listingInformationPropertyTitle?.vi || prop.listingInformation?.listingInformationPropertyTitle?.en
                    : prop.listingInformation?.listingInformationPropertyTitle?.en || prop.listingInformation?.listingInformationPropertyTitle?.vi;

                  const location = lang === 'vi'
                    ? prop.listingInformation?.listingInformationProjectCommunity?.vi || prop.listingInformation?.listingInformationProjectCommunity?.en
                    : prop.listingInformation?.listingInformationProjectCommunity?.en || prop.listingInformation?.listingInformationProjectCommunity?.vi;

                  const view = lang === 'vi'
                    ? prop.propertyInformation?.informationView?.vi || prop.propertyInformation?.informationView?.en
                    : prop.propertyInformation?.informationView?.en || prop.propertyInformation?.informationView?.vi;

                  const unit = lang === 'vi'
                    ? prop.propertyInformation?.informationUnit?.vi || prop.propertyInformation?.informationUnit?.en
                    : prop.propertyInformation?.informationUnit?.en || prop.propertyInformation?.informationUnit?.vi;

                  const priceSale = prop.financialDetails?.financialDetailsPrice;
                  const priceLease = prop.financialDetails?.financialDetailsLeasePrice;
                  const priceNight = prop.financialDetails?.financialDetailsPricePerNight;
                  const currency = prop.financialDetails?.financialDetailsCurrency?.code || "₫";

                  let displayPrice = "";
                  let suffix = "";
                  if (type === "Sale") displayPrice = priceSale;
                  else if (type === "Lease") { displayPrice = priceLease; suffix = lang === 'vi' ? "/ tháng" : "/ month"; }
                  else if (type === "Home Stay") { displayPrice = priceNight; suffix = lang === 'vi' ? "/ đêm" : "/ night"; }

                  const formattedPrice = displayPrice ? `${Number(displayPrice).toLocaleString()} ${currency}` : (lang === 'vi' ? "Liên hệ" : "Contact");

                  const postedDate = prop.createdAt ? new Date(prop.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : "-";

                  return (
                    <div
                      key={prop._id}
                      className="flex flex-col sm:flex-row bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                    >
                      {/* Image Area */}
                      <div className="relative w-full sm:w-1/3 h-40 sm:h-auto overflow-hidden">
                        <img
                          src={prop.imagesVideos?.propertyImages?.[0] || "/dummy-img.jpg"}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-gray-800 shadow-sm border border-gray-100">
                            {lang === 'vi' ? prop.listingInformation?.listingInformationTransactionType?.vi : prop.listingInformation?.listingInformationTransactionType?.en}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm">🏡</span>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                              {title}
                            </h4>
                          </div>

                          <div className="space-y-1 mb-3">
                            {view && (
                              <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                <Clover size={12} className="text-green-500" />
                                <span>{view}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <MapPin size={12} className="text-red-500" />
                              <span>{lang === 'vi' ? "Vị trí: " : "Location: "}{location}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 text-[10px] text-gray-600">
                              <Bed size={12} />
                              <span>{prop.propertyInformation?.informationBedrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 text-[10px] text-gray-600">
                              <Bath size={12} />
                              <span>{prop.propertyInformation?.informationBathrooms || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 text-[10px] text-gray-600">
                              <Ruler size={12} />
                              <span>{prop.propertyInformation?.informationUnitSize || 0} {unit || "m²"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'vi' ? "GIÁ" : "PRICE"}</p>
                            <p className="text-sm font-bold text-[#41398B]">
                              {formattedPrice} <span className="text-[10px] font-medium text-gray-500">{suffix}</span>
                            </p>
                          </div>

                          <a
                            href={`/property-showcase/${prop.listingInformation?.listingInformationPropertyId || prop._id}${prop.seoInformation?.slugUrl ? `/${getLocalizedValue(prop.seoInformation.slugUrl)}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#41398B] hover:bg-[#352e7a] text-white p-2 rounded-lg transition-all shadow-sm"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center">
                {lang === "vi" ? "Chưa có bất động sản nào." : "No properties found."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffPopupCard = ({ onClose, data, lang, title }) => {
  const safeText = (val) =>
    typeof val === "object" ? val?.[lang] || val?.en || "" : val || "";
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {safeText(data.staffsName) || title}
        </h2>

        <div className="relative bg-white rounded-2xl border border-gray-300 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            <div>
              <div className="w-44 h-44 rounded-xl overflow-hidden bg-[#e7e4fb] flex items-center justify-center">
                <img
                  src={data.staffsImage || "/dummy-img.jpg"}
                  alt={safeText(data.staffsName)}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-800 mt-4">
                <span className="font-medium">Staff ID:</span>{" "}
                <span className="text-gray-700">
                  {safeText(data.staffsId) || "N/A"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex-1 text-gray-800">
            <h2 className="text-lg font-semibold mb-1">
              {safeText(data.staffsName)}
            </h2>

            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <UserCog size={16} />
              <span className="text-sm">
                {safeText(data.staffsRole) || "-"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Phone size={16} />
              <span className="text-sm">
                {safeText(data.staffsNumber) || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Mail size={16} />
              <span className="text-sm">
                {safeText(data.staffsEmail) || "N/A"}
              </span>
            </div>

            <h3 className="font-medium text-gray-800 mb-1">Notes</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {safeText(data.staffsNotes) ||
                "No notes available for this staff."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
