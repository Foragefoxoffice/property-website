import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CirclePlus,
  Eye,
  Mail,
  Phone,
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
import OwnerModal from "../Property/OwnerModal";
import { CommonToaster } from "../../Common/CommonToaster";
import { getListingProperties } from "../../Api/action";

/* 🔹 Helper: Find matching ID by localized name */
function findIdByName(arr, valueObj) {
  if (!valueObj || typeof valueObj !== "object") return "";
  const valEn = valueObj.en || "";
  const valVi = valueObj.vi || "";
  const match = arr.find(
    (item) =>
      item.ownerName?.en === valEn ||
      item.ownerName?.vi === valVi ||
      item.staffsName?.en === valEn ||
      item.staffsName?.vi === valVi
  );
  return match ? match._id : "";
}

/* 💜 Skeleton Loader */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-64 mb-8"></div>
    {[...Array(4)].map((_, idx) => (
      <div key={idx} className="mb-8">
        <div className="h-4 bg-[#41398b29] rounded w-48 mb-3"></div>
        <div className="h-12 bg-[#41398b29] rounded w-full"></div>
      </div>
    ))}
    <div className="flex justify-between mt-10">
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
    </div>
  </div>
);

export default function CreatePropertyListStep3({
  onNext,
  onPrev,
  onChange,
  onSave,
  initialData = {},
  owners = [],
  staffs = [],
  me = null,
  loading = false,
  refreshOwners,
}) {
  const [lang, setLang] = useState("vi");
  const initialized = useRef(false);

  const getLocalizedValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return lang === "vi"
      ? value.vi || value.en || ""
      : value.en || value.vi || "";
  };
  useEffect(() => {
    console.log("📌 Owners list:", owners);
  }, [owners]);

  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedConnect, setSelectedConnect] = useState(null);

  const [showOwnerView, setShowOwnerView] = useState(false);
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);

  const [form, setForm] = useState({
    owner: initialData.owner || "",
    ownerNotes: initialData.ownerNotes || { en: "", vi: "" },
    consultant: initialData.consultant ||
      initialData.contactManagement?.contactManagementConsultant || {
      en: "",
      vi: "",
    },
    connectingPoint: initialData.connectingPoint || "",
    connectingPointNotes: initialData.connectingPointNotes || {
      en: "",
      vi: "",
    },
    internalNotes: initialData.internalNotes || { en: "", vi: "" },
    ownerPhone: initialData.contactManagement?.contactManagementOwnerPhone || [],
  });

  /* ✅ Sync existing edit data once dropdowns (owners/staffs) arrive */
  useEffect(() => {
    // Wait until owners OR staffs arrive
    if (!owners.length && !staffs.length) return;

    // Prevent looping
    if (initialized.current) return;

    initialized.current = true;

    const cm = initialData.contactManagement || {};

    const updatedForm = {
      owner: cm.contactManagementOwner || { en: "", vi: "" },
      ownerNotes: cm.contactManagementOwnerNotes || { en: "", vi: "" },
      consultant: cm.contactManagementConsultant || { en: "", vi: "" },
      connectingPoint: cm.contactManagementConnectingPoint || { en: "", vi: "" },
      connectingPointNotes: cm.contactManagementConnectingPointNotes || {
        en: "",
        vi: "",
      },
      internalNotes: cm.contactManagementInternalNotes || { en: "", vi: "" },
      source: cm.contactManagementSource || { en: "", vi: "" },
      ownerPhone: cm.contactManagementOwnerPhone || [],
    };

    // Pre-select owner & sync phone if missing
    if (updatedForm.owner?.en) {
      const matchOwner = owners.find(
        (o) =>
          o.ownerName?.en === updatedForm.owner.en ||
          o.ownerName?.vi === updatedForm.owner.vi
      );
      setSelectedOwner(matchOwner || null);

      if (matchOwner && (!updatedForm.ownerPhone || updatedForm.ownerPhone.length === 0)) {
        updatedForm.ownerPhone = matchOwner.phoneNumbers || [];
      }
    }

    setForm((prev) => ({ ...prev, ...updatedForm }));

    // Pre-select connecting point 
    if (updatedForm.connectingPoint?.en) {
      const matchStaff = staffs.find(
        (s) =>
          s.staffsName?.en === updatedForm.connectingPoint.en ||
          s.staffsName?.vi === updatedForm.connectingPoint.vi
      );
      setSelectedConnect(matchStaff || null);
    }
  }, [owners, staffs, initialData]);

  /* ✅ Localized setter */
  const handleLocalizedChange = (lng, field, value) => {
    const updated = {
      ...form,
      [field]: { ...(form[field] || { en: "", vi: "" }), [lng]: value },
    };
    setForm(updated);
    onChange &&
      onChange({
        contactManagement: {
          contactManagementOwner: updated.owner || { en: "", vi: "" },
          contactManagementOwnerNotes: updated.ownerNotes || {
            en: "",
            vi: "",
          },
          contactManagementConsultant: updated.consultant || {
            en: "",
            vi: "",
          },
          contactManagementConnectingPoint: updated.connectingPoint || {
            en: "",
            vi: "",
          },
          contactManagementConnectingPointNotes:
            updated.connectingPointNotes || { en: "", vi: "" },
          contactManagementInternalNotes: updated.internalNotes || {
            en: "",
            vi: "",
          },
          contactManagementSource: updated.source || { en: "", vi: "" },
        },
      });
  };

  /* 🌐 Translations */
  const t = {
    en: {
      title: "Landlord Information",
      landlord: "Landlord",
      ownerNotes: "Landlord Notes",
      consultant: "Created By",
      connectingPoint: "Connecting Point",
      connectingPointNotes: "Connecting Point Notes",
      internalNotes: "Internal Notes",
      selectOwner: "Select landlord",
      selectConnect: "Select Connecting Point",
      next: "Next",
      typehere: "Type here",
      prev: "Previous",
    },
    vi: {
      title: "Thông tin chủ nhà",
      landlord: "chủ nhà",
      ownerNotes: "Ghi chú của chủ nhà",
      consultant: "Được tạo bởi",
      connectingPoint: "Điểm Liên Hệ",
      connectingPointNotes: "Ghi chú về Điểm Liên Hệ",
      internalNotes: "Ghi chú nội bộ",
      selectOwner: "Chọn chủ nhà",
      selectConnect: "Chọn Điểm Liên Hệ",
      typehere: "Nhập tại đây",
      next: "Tiếp",
      prev: "Trước",
    },
  }[lang];

  /* ✅ SHOW SKELETON WHILE LOADING */
  if (loading) return <SkeletonLoader />;

  /* ✅ UI (NO CHANGES) */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* Language Tabs */}
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

      {/* Add Owner Modal */}
      {showAddOwnerModal && (
        <div style={{ zIndex: 999 }}>
          <OwnerModal
            onClose={() => {
              setShowAddOwnerModal(false);
            }}
            onSuccess={refreshOwners}
          />
        </div>
      )}

      <h2 className="text-lg font-semibold mb-6">{t.title}</h2>

      <div className="grid grid-cols-1 gap-6">
        {/* ----- OWNER SELECT ----- */}
        <div>
          <div className="flex flex-wrap gap-4 items-baseline">
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm text-[#131517] font-semibold">
                {t.landlord}
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 mt-2">
                  <AntdSelect
                    showSearch
                    allowClear
                    placeholder={t.selectOwner}
                    value={findIdByName(owners, form.owner) || undefined}
                    onChange={(ownerId) => {
                      const selected = owners.find((o) => o._id === ownerId);
                      setSelectedOwner(selected);
                      const updatedOwner = selected
                        ? {
                          en: selected.ownerName?.en || "",
                          vi: selected.ownerName?.vi || "",
                        }
                        : { en: "", vi: "" };

                      const updatedOwnerPhone = selected?.phoneNumbers || [];

                      const updated = {
                        ...form,
                        owner: updatedOwner,
                      };
                      setForm(updated);

                      onChange &&
                        onChange({
                          contactManagement: {
                            contactManagementOwner: updated.owner,
                            contactManagementOwnerPhone: updatedOwnerPhone,
                            contactManagementOwnerNotes: form.ownerNotes,
                            contactManagementConsultant: form.consultant,
                            contactManagementConnectingPoint:
                              form.connectingPoint,
                            contactManagementConnectingPointNotes:
                              form.connectingPointNotes,
                            contactManagementInternalNotes: form.internalNotes,
                            contactManagementSource: form.source,
                          },
                        });
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    className="w-full custom-select"
                    popupClassName="custom-dropdown"
                    options={owners.map((opt) => {
                      const phone = opt.phoneNumbers?.join(", ") || "";
                      const name = opt.ownerName?.[lang] || opt.ownerName?.en;
                      return {
                        label: phone ? `${name} (${phone})` : name,
                        value: opt._id,
                      };
                    })}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <div
                          className="mt-2 p-3 bg-[#41398B] text-white text-center rounded-lg cursor-pointer flex gap-2 justify-center items-center"
                          onClick={() => setShowAddOwnerModal(true)}
                        >
                          <CirclePlus size={18} /> New Landlords
                        </div>
                      </>
                    )}
                  />
                  {form.ownerPhone && form.ownerPhone.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 px-1">
                      <Phone size={12} className="text-[#41398B]" />
                      <span className="font-medium tracking-wide">
                        {form.ownerPhone.join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {selectedOwner && (
                  <button
                    onClick={() => setShowOwnerView(true)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                )}
              </div>
            </div>

            {/* ----- SOURCE TEXT ----- */}
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm text-[#131517] font-semibold mb-2 block">
                {lang === "en" ? "Source" : "Nguồn"}
              </label>
              <input
                type="text"
                value={form.source?.[lang] || ""}
                placeholder={t.typehere}
                onChange={(e) =>
                  handleLocalizedChange(lang, "source", e.target.value)
                }
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ----- OWNER NOTES ----- */}
        <div>
          <label className="text-sm text-[#131517] font-semibold mb-3">
            {t.ownerNotes}
          </label>
          <textarea
            value={form.ownerNotes?.[lang] || ""}
            placeholder={t.typehere}
            onChange={(e) =>
              handleLocalizedChange(lang, "ownerNotes", e.target.value)
            }
            rows={3}
            className="border mt-2 border-[#B2B2B3] rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>

        {/* ----- CONSULTANT (getMe()) ----- */}
        <div className="flex gap-4 items-baseline">
          <div className="w-full">
            <label className="text-sm text-[#131517] font-semibold mb-3">
              {t.consultant}
            </label>

            <div className="flex items-center gap-2">
              {me ? (
                <input
                  type="text"
                  value={me.name}
                  disabled
                  className="border mt-2 border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
                />
              ) : (
                <div className="text-gray-400">Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* ----- INTERNAL NOTES ----- */}
        <div>
          <label className="text-sm text-[#131517] font-semibold mb-3">
            {t.internalNotes}
          </label>

          <textarea
            value={form.internalNotes?.[lang] || ""}
            placeholder={t.typehere}
            onChange={(e) =>
              handleLocalizedChange(lang, "internalNotes", e.target.value)
            }
            rows={3}
            className="border mt-2 border-[#B2B2B3] rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
          />
        </div>
      </div>

      {/* ----- NAVIGATION BUTTONS ----- */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 gap-1.5 rounded-full hover:bg-gray-100 flex items-center cursor-pointer"
        >
          <ArrowLeft size={18} /> {t.prev}
        </button>

        <button
          onClick={() => {
            const payload = {
              contactManagement: {
                contactManagementOwner: form.owner || { en: "", vi: "" },
                contactManagementOwnerNotes: form.ownerNotes || {
                  en: "",
                  vi: "",
                },
                contactManagementConsultant: {
                  en: me?.name || "",
                  vi: me?.name || "",
                },
                contactManagementConnectingPoint: form.connectingPoint || {
                  en: "",
                  vi: "",
                },
                contactManagementConnectingPointNotes:
                  form.connectingPointNotes || { en: "", vi: "" },
                contactManagementInternalNotes: form.internalNotes || {
                  en: "",
                  vi: "",
                },
                contactManagementSource: form.source || { en: "", vi: "" },
                contactManagementOwnerPhone: form.ownerPhone || [],
              },
            };

            onChange && onChange(payload);
            onNext && onNext();   // <-- THIS WILL MOVE THE USER TO STEP 4

          }}
          className="px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full items-center flex gap-1 cursor-pointer"
        >
          {t.next} <ArrowRight size={18} />
        </button>
      </div>

      {/* ----- OWNER POPUP ----- */}
      {showOwnerView && selectedOwner && (
        <OwnerPopupCard
          onClose={() => setShowOwnerView(false)}
          data={selectedOwner}
          lang={lang}
        />
      )}
    </div>
  );
}

/* ✅ POPUP CARDS (UNCHANGED UI) */
const StaffPopupCard = ({ onClose, data, lang, title }) => {
  const safeText = (val) =>
    typeof val === "object" ? val?.[lang] || val?.en || "" : val || "";

  const { image, name, id, role, number, email, notes } = {
    image: data.staffsImage || data.image,
    name: data.staffsName || data.name,
    id: data.staffsId || data.id,
    role: data.staffsRole || data.role,
    number: data.staffsNumber || data.number,
    email: data.staffsEmail || data.email,
    notes: data.staffsNotes || data.notes,
  };

  const defaultImage = "/dummy-img.jpg";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {safeText(name) || title || "Staff Details"}
        </h2>

        <div className="relative bg-white rounded-2xl border border-gray-300 shadow-sm p-6 flex gap-8">
          <div>
            <div className="w-44 h-44 rounded-xl overflow-hidden bg-[#e7e4fb] flex items-center justify-center">
              <img
                src={image || defaultImage}
                alt={safeText(name)}
                className="w-full h-full object-cover"
              />
            </div>
            {id && (
              <p className="text-sm text-gray-800 mt-4">
                <span className="font-medium">Staff ID:</span>{" "}
                <span className="text-gray-700">{safeText(id)}</span>
              </p>
            )}
          </div>

          <div className="flex-1 text-gray-800">
            <h2 className="text-lg font-semibold mb-1">
              {safeText(name) || "Unnamed Staff"}
            </h2>

            {role && (
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <UserCog size={16} />
                <span className="text-sm">{safeText(role)}</span>
              </div>
            )}

            {number && (
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Phone size={16} />
                <span className="text-sm">{safeText(number)}</span>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Mail size={16} />
                <span className="text-sm">{safeText(email)}</span>
              </div>
            )}

            {notes && (
              <>
                <h3 className="font-medium text-gray-800 mb-1">Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {safeText(notes)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerPopupCard = ({ onClose, data, lang }) => {
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);

  useEffect(() => {
    const fetchOwnerProperties = async () => {
      const ownerNameEn = data.ownerName?.en || (typeof data.ownerName === "string" ? data.ownerName : "");
      if (!ownerNameEn) return;
      try {
        setLoadingProps(true);
        const res = await getListingProperties({ owner: ownerNameEn, status: "all" });
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        <div className="text-center mb-3">
          <div className="w-25 h-25 mx-auto rounded-full bg-[#E5E7EB] flex items-center justify-center shadow-md">
            <span className="text-4xl font-semibold text-gray-700">
              {safeText(data.ownerName)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-semibold mt-4">
            {safeText(data.ownerName)}
          </h2>
        </div>

        <div className="space-y-6 text-center">
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              {lang === "vi" ? "Số điện thoại" : "Phone Numbers"}
            </h4>

            {data.phoneNumbers?.length ? (
              data.phoneNumbers.map((num, i) => (
                <div key={i} className="flex items-center gap-2 justify-center">
                  <Phone size={16} />
                  <span className="text-md">{num}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">—</p>
            )}
          </div>



          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              {lang === "vi" ? "Mạng xã hội" : "Social Media"}
            </h4>

            {social?.length ? (
              social.map((s, i) => (
                <div key={i} className="flex items-center gap-3 justify-center">
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                    {s.icon}
                  </span>
                  {s.link ? (
                    <a
                      href={
                        s.link.startsWith("http") ? s.link : `https://${s.link}`
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
              ))
            ) : (
              <p className="text-gray-400 text-sm">—</p>
            )}
          </div>

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
            <h4 className="text-md font-semibold text-gray-700 mb-3">
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
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-gray-800 shadow-sm border border-gray-100 w-fit">
                            {lang === 'vi' ? prop.listingInformation?.listingInformationTransactionType?.vi : prop.listingInformation?.listingInformationTransactionType?.en}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-white shadow-sm w-fit ${prop.status === 'Published' ? 'bg-green-500' :
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
              <p className="text-gray-400 text-sm">
                {lang === "vi" ? "Chưa có bất động sản nào." : "No properties found."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
