import React, { useState, useEffect } from "react";
// import { Reorder } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, X, ArrowRight, ArrowLeft, Eye } from "lucide-react";
import { Select as AntdSelect, Switch, Input } from "antd";
const { TextArea } = Input;
import { CommonToaster } from "@/Common/CommonToaster";


/* =========================================================
   💜 SKELETON LOADER (with bg-[#41398b29])
========================================================= */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-40 mb-6"></div>
    {[...Array(3)].map((_, sectionIndex) => (
      <div key={sectionIndex} className="mb-8">
        <div className="h-5 bg-[#41398b29] rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 bg-[#41398b29] rounded w-24"></div>
              <div className="h-12 bg-[#41398b29] rounded"></div>
            </div>
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

export default function CreatePropertyListStep2({
  onNext,
  onPrev,
  onChange,
  initialData = {},
  dropdownLoading,
  dropdowns = {},
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts (allows clicks on buttons)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  useEffect(() => {
    console.log("initialData:", initialData);
  }, [initialData]);
  const [lang, setLang] = useState("vi");
  const {
    currencies = [],
    deposits = [],
    payments = [],
    feeTaxes = [],
    legalDocs = [],
  } = dropdowns || {};
  // alias the loading flag used by AntdSelect to your prop
  const loadingCurrencies = !!dropdownLoading;

  /* =========================================================
     🏷️ Translations
  ========================================================== */
  const t = {
    en: {
      propertyImages: "Property Images",
      propertyVideo: "Property Video",
      floorPlan: "Floor Plan",
      recommendedImg: "Recommended: (jpg, jpeg, png, webp, svg) - (h-700px)",
      recommendedVid: "Recommended: (mp4, webm, mov, avi, mkv)",
      clickUpload: "Click here to upload",
      financialDetails: "Financial Details",
      currency: "Currency",
      price: "Price",
      contractTerms: "Contract Terms",
      depositPaymentTerms: "Deposit",
      maintenanceFeeMonthly: "Payment Terms",
      leasePrice: "Lease Price",
      contractLength: "Contract Length",
      pricePerNight: "Price Per Night",
      checkIn: "Standard check in time",
      typehere: "Type here",
      checkOut: "Standard check out time",
      agentFee: "Agent Fee",
      agentFeeAgenda: "Agent Payment Agenda",
      feeTax: "Fees & taxes",
      legalDoc: "Legal Documents",
      googleMapsIframe: "Google Maps Iframe Code", // ✅ Added
      pasteIframe: "Paste the complete iframe code from Google Maps", // ✅ Added
    },
    vi: {
      propertyImages: "Hình Ảnh Bất Động Sản",
      propertyVideo: "Video Bất Động Sản",
      floorPlan: "Sơ Đồ Mặt Bằng",
      recommendedImg: "Đề xuất: (jpg, jpeg, png, webp, svg)",
      recommendedVid: "Đề xuất: (mp4, webm, mov, avi, mkv)",
      clickUpload: "Nhấn để tải lên",
      financialDetails: "Chi Tiết Tài Chính",
      currency: "Tiền Tệ",
      price: "Giá",
      contractTerms: "Điều Khoản Hợp Đồng",
      depositPaymentTerms: "Tiền gửi",
      maintenanceFeeMonthly: "Điều khoản thanh toán",
      leasePrice: "Giá Thuê",
      contractLength: "Thời Hạn Hợp Đồng",
      pricePerNight: "Giá Mỗi Đêm",
      typehere: "Nhập tại đây",
      checkIn: "Thời gian nhận phòng tiêu chuẩn",
      checkOut: "Giờ trả phòng tiêu chuẩn",
      agentFee: "Phí đại lý",
      agentFeeAgenda: "Chương trình thanh toán đại lý",
      feeTax: "Phí và thuế",
      legalDoc: "Văn bản pháp luật",
      googleMapsIframe: "Mã nhúng bản đồ Google", // ✅ Added
      pasteIframe: "Dán mã iframe hoàn chỉnh từ Google Maps", // ✅ Added
    },
  }[lang];

  const [form, setForm] = useState({
    currency: initialData.currency || { symbol: "", code: "", name: "" },
    price: initialData.price || "",
    leasePrice: initialData.leasePrice || "",
    contractLength: initialData.contractLength || "",
    pricePerNight: initialData.pricePerNight || "",
    checkIn: initialData.checkIn || "2:00 PM",
    checkOut: initialData.checkOut || "11:00 AM",
    contractTerms: initialData.contractTerms || { en: "", vi: "" },
    depositPaymentTerms: initialData.depositPaymentTerms || { en: "", vi: "" },
    maintenanceFeeMonthly: initialData.maintenanceFeeMonthly || {
      en: "",
      vi: "",
    },
    financialDetailsAgentFee: initialData.financialDetailsAgentFee || "",
    financialDetailsAgentPaymentAgenda:
      initialData.financialDetailsAgentPaymentAgenda || { en: "", vi: "" },
    financialDetailsFeeTax: initialData.financialDetailsFeeTax || {
      en: "",
      vi: "",
      id: "",
    },
    financialDetailsLegalDoc: initialData.financialDetailsLegalDoc || {
      en: "",
      vi: "",
      id: "",
    },
    videoVisibility: initialData.videoVisibility || false,
    // floorImageVisibility: initialData.floorImageVisibility || false, // ❌ Removed
    googleMapVisibility: initialData.googleMapVisibility || false, // ✅ Added
    googleMapsIframe: initialData.googleMapsIframe || { en: "", vi: "" }, // ✅ Added
    financialVisibility: initialData.financialVisibility || {
      contractLength: false,
      deposit: false,
      paymentTerm: false,
      feeTaxes: false,
      legalDocs: false,
      agentFee: false,
      checkIn: false,
      checkOut: false,
    },
  });

  /* 
   * ✅ Robust Transaction Type Resolver 
   * Handles {en, vi} objects, strings, and localized variants (e.g. "Homestay", "Bán")
   */
  const getNormalizedTransactionType = () => {
    // 1. Try to get explicit English value
    let val = form.transactionType?.en || initialData.transactionType?.en;

    // 2. If no English, try fallback to string or Vietnamese
    if (!val) {
      if (typeof form.transactionType === "string") {
        val = form.transactionType;
      } else if (form.transactionType?.vi) {
        val = form.transactionType.vi;
      } else if (typeof initialData.transactionType === "string") {
        val = initialData.transactionType;
      } else if (initialData.transactionType?.vi) {
        val = initialData.transactionType.vi;
      }
    }

    // Default
    if (!val) return "Sale";

    // 3. Normalize known localized strings to Standard English Keys
    const lower = val.toLowerCase().trim();
    if (lower === "homestay" || lower === "home stay") return "Home Stay";
    if (lower === "bán" || lower === "sale") return "Sale";
    if (lower === "cho thuê" || lower === "lease") return "Lease";

    return val;
  };

  const transactionType = getNormalizedTransactionType();


  const [images, setImages] = useState(initialData.propertyImages || []);
  const [videos, setVideos] = useState(initialData.propertyVideos || []);
  const [floorPlans, setFloorPlans] = useState(initialData.floorPlans || []);

  /* ✅ Sync when editing an existing property */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        currency: initialData.currency || prev.currency,
        price: initialData.price || prev.price,
        leasePrice: initialData.leasePrice || prev.leasePrice,
        contractLength: initialData.contractLength || prev.contractLength,
        pricePerNight: initialData.pricePerNight || prev.pricePerNight,
        checkIn: initialData.checkIn || prev.checkIn,
        checkOut: initialData.checkOut || prev.checkOut,
        contractTerms: initialData.contractTerms || prev.contractTerms,
        depositPaymentTerms:
          initialData.depositPaymentTerms || prev.depositPaymentTerms,
        maintenanceFeeMonthly:
          initialData.maintenanceFeeMonthly || prev.maintenanceFeeMonthly,
        googleMapsIframe: initialData.googleMapsIframe || prev.googleMapsIframe, // ✅ Added
        googleMapVisibility: initialData.googleMapVisibility !== undefined ? initialData.googleMapVisibility : prev.googleMapVisibility, // ✅ Added
      }));

      // ✅ Also update media fields
      setImages(initialData.propertyImages || []);
      setVideos(initialData.propertyVideos || []);
      setFloorPlans(initialData.floorPlans || []);
    }
  }, [initialData]);

  // ✅ Auto-select default currency once dropdowns arrive
  useEffect(() => {
    if (!currencies?.length) return;

    // Skip if user already has a currency (edit mode)
    if (form.currency?.symbol) return;

    const def = currencies.find((c) => c.isDefault);

    if (def) {
      setForm((prev) => ({
        ...prev,
        currency: {
          symbol: def.currencySymbol?.en || def.currencySymbol?.vi || "",
          code: def.currencyCode?.en || def.currencyCode?.vi || "",
          name: def.currencyName?.en || def.currencyName?.vi || "",
        },
      }));
    }
  }, [currencies]);

  const formatNumber = (value) => {
    if (!value) return "";
    const numeric = value.toString().replace(/,/g, "");
    if (isNaN(numeric)) return "";
    return Number(numeric).toLocaleString("en-US");
  };


  /* =========================================================
   ✅ File Size Limits
   Images & floorplan: 5 MB (compressed to base64 if small, uploaded if large)
   Videos: 50 MB (always uploaded to server)
========================================================= */
  function validateFileSize(file, type) {
    const imageLimit = 5 * 1024 * 1024; // 5MB
    const videoLimit = 50 * 1024 * 1024; // 50MB

    if (type === "video" && file.size > videoLimit) {
      CommonToaster("Video size must be under 50MB", "error");
      return false;
    }

    if ((type === "image" || type === "floor") && file.size > imageLimit) {
      CommonToaster("Image must be under 5MB", "error");
      return false;
    }

    return true;
  }
  /* =========================================================
     📁 Upload Helpers
  ========================================================== */
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Process all files
    const processedFiles = [];

    for (const file of files) {
      // ✅ Check size for each file
      if (!validateFileSize(file, type)) {
        continue; // Skip files that don't meet size requirements
      }

      let url;
      let isServerFile = false;

      // ✅ ALL MEDIA TYPES: Always upload to server
      try {
        CommonToaster(`Uploading ${type === "floor" ? "floor plan" : type}...`, "info");
        const { uploadPropertyMedia } = await import("@/Api/action");
        const response = await uploadPropertyMedia(file, type);
        url = response.data.url;
        isServerFile = true;
        CommonToaster(`${type === "floor" ? "Floor plan" : type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`, "success");
        console.log(`✅ ${type} uploaded: ${response.data.fileName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } catch (error) {
        console.error(`${type} upload error:`, error);
        CommonToaster(`Failed to upload ${type}. Please try again.`, "error");
        continue;
      }

      processedFiles.push({ file, url, isServerFile });
    }

    // If no files passed validation, return early
    if (processedFiles.length === 0) return;

    let newImages = images;
    let newVideos = videos;
    let newFloorPlans = floorPlans;

    if (type === "image") {
      newImages = [...images, ...processedFiles];
      setImages(newImages);
    }
    if (type === "video") {
      newVideos = [...videos, ...processedFiles];
      setVideos(newVideos);
    }
    if (type === "floor") {
      newFloorPlans = [...floorPlans, ...processedFiles];
      setFloorPlans(newFloorPlans);
    }

    onChange &&
      onChange({
        ...form,
        propertyImages: newImages,
        propertyVideos: newVideos,
        floorPlans: newFloorPlans,
      });

    // Reset the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const handleRemove = (type, i) => {
    let newImages = images;
    let newVideos = videos;
    let newFloorPlans = floorPlans;

    if (type === "image") {
      newImages = images.filter((_, x) => x !== i);
      setImages(newImages);
    }
    if (type === "video") {
      newVideos = videos.filter((_, x) => x !== i);
      setVideos(newVideos);
    }
    if (type === "floor") {
      newFloorPlans = floorPlans.filter((_, x) => x !== i);
      setFloorPlans(newFloorPlans);
    }

    onChange &&
      onChange({
        ...form,
        propertyImages: newImages,
        propertyVideos: newVideos,
        floorPlans: newFloorPlans,
      });
  };

  /* =========================================================
     🔧 Form Handlers
  ========================================================== */
  const handleChange = (f, v) => {
    const updated = { ...form, [f]: v };
    setForm(updated);
    onChange && onChange(updated);
  };

  const handleLocalizedChange = (lng, f, v) => {
    const updated = {
      ...form,
      [f]: { ...(form[f] || { en: "", vi: "" }), [lng]: v },
    };
    setForm(updated);
    onChange && onChange(updated);
  };

  /* =========================================================
   📦 Sortable Item Component
========================================================== */
  const SortableItem = ({ f, i, type, setPreview, handleRemove }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: f.url });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 20 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative w-56 h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""
          }`}
        {...attributes}
        {...listeners}
      >
        {type === "video" ? (
          <video
            src={f.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={f.url}
            className="w-full h-full object-contain"
            alt=""
          />
        )}

        {/* ✅ Thumbnail Badge for first image */}
        {type === "image" && i === 0 && (
          <div className="absolute top-2 left-2 bg-[#41398B] text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10">
            Thumbnail
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setPreview(f.url);
            }}
            className="bg-white rounded-full p-2 shadow hover:scale-105 transition"
          >
            <Eye className="w-4 h-4 cursor-pointer text-gray-700" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(type, i);
            }}
            className="bg-white rounded-full p-2 shadow hover:scale-105 transition"
          >
            <X className="w-4 h-4 text-gray-700 cursor-pointer" />
          </button>
        </div>
      </div>
    );
  };

  /* =========================================================
     📦 Upload Box Component
  ========================================================== */
  const UploadBox = ({
    label,
    recommended,
    files,
    type,
    accept,
    handleFileUpload,
    handleRemove,
    onReorder,
    sensors, // Pass sensors down
  }) => {
    const [preview, setPreview] = useState(null);

    return (
      <div className="mb-8">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-xs text-gray-500 mb-3">{recommended}</p>

        <div className="flex flex-wrap gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (active && over && active.id !== over.id) {
                const oldIndex = files.findIndex((f) => f.url === active.id);
                const newIndex = files.findIndex((f) => f.url === over.id);
                const newOrder = arrayMove(files, oldIndex, newIndex);
                onReorder(newOrder);
              }
            }}
          >
            <SortableContext
              items={files.map((f) => f.url)}
              strategy={rectSortingStrategy}
            >
              {files.map((f, i) => (
                <SortableItem
                  key={f.url}
                  f={f}
                  i={i}
                  type={type}
                  setPreview={setPreview}
                  handleRemove={handleRemove}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Upload Button */}
          <label className="w-60 h-50 border border-dashed border-[#646466] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition-all">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 border border-dashed border-[#646466] rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-sm text-[#646466] mt-2">
                {t.clickUpload}
              </span>
            </div>
            <input
              type="file"
              accept={accept}
              multiple
              onChange={(e) => handleFileUpload(e, type)}
              className="hidden"
            />
          </label>
        </div>

        {/* Popup Preview */}
        {preview && (
          <div
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full max-h-[100vh] rounded-xl overflow-hidden flex justify-center p-10"
            >
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 z-9 right-3 cursor-pointer text-white bg-[#41398B] hover:bg-[#41398be6] rounded-full p-1 shadow"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              {type === "video" ? (
                <video
                  src={preview}
                  className="w-full h-full object-contain rounded-lg"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={preview}
                  className="w-full h-full object-contain rounded-lg"
                  alt="Preview"
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (dropdownLoading) return <SkeletonLoader />;

  const handleReorder = (type, newOrder) => {
    if (type === "image") {
      setImages(newOrder);
    } else if (type === "video") {
      setVideos(newOrder);
    } else if (type === "floor") {
      setFloorPlans(newOrder);
    }

    onChange &&
      onChange({
        ...form,
        propertyImages: type === "image" ? newOrder : images,
        propertyVideos: type === "video" ? newOrder : videos,
        floorPlans: type === "floor" ? newOrder : floorPlans,
      });
  };

  /* =========================================================
     🧱 RENDER
  ========================================================== */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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

      {/* Upload Sections */}
      <UploadBox
        label={t.propertyImages}
        recommended={t.recommendedImg}
        files={images}
        type="image"
        accept="image/*"
        handleFileUpload={handleFileUpload}
        handleRemove={handleRemove}
        onReorder={(newOrder) => handleReorder("image", newOrder)}
        sensors={sensors}
      />

      <div className="flex flex-col w-full gap-1">
        {/* ✅ Top Row: Label + Hide + Switch */}
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-[#131517] font-semibold"></label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {lang === "en" ? "Hide" : "Trốn"}
            </span>
            <Switch
              checked={form.videoVisibility}
              style={{
                backgroundColor: form.videoVisibility
                  ? "#41398B"
                  : "#d9d9d9",
              }}
              onChange={(val) => {
                const updated = { ...form, videoVisibility: val };
                setForm(updated);
                onChange && onChange(updated);
              }}
            />
          </div>
        </div>
        <UploadBox
          label={t.propertyVideo}
          recommended={t.recommendedVid}
          files={videos}
          type="video"
          accept="video/*"
          handleFileUpload={handleFileUpload}
          handleRemove={handleRemove}
          onReorder={(newOrder) => handleReorder("video", newOrder)}
          sensors={sensors}
        />
      </div>

      {/* <UploadBox
        label={t.floorPlan}
        recommended={t.recommendedImg}
        files={floorPlans}
        type="floor"
        accept="image/*"
        handleFileUpload={handleFileUpload}
        handleRemove={handleRemove}
        onReorder={(newOrder) => handleReorder("floor", newOrder)}
        sensors={sensors}
      /> */}

      {/* 🗺️ GOOGLE MAPS IFRAME */}
      <div className="flex flex-col w-full gap-1 mb-6">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-[#131517] font-semibold">
            {t.googleMapsIframe}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {lang === "en" ? "Hide" : "Trốn"}
            </span>
            <Switch
              checked={form.googleMapVisibility}
              style={{
                backgroundColor: form.googleMapVisibility
                  ? "#41398B"
                  : "#d9d9d9",
              }}
              onChange={(val) => {
                const updated = { ...form, googleMapVisibility: val };
                setForm(updated);
                onChange && onChange(updated);
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-3">
            {t.pasteIframe}
          </p>
          <textarea
            rows={5}
            placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" ...></iframe>'
            value={form.googleMapsIframe?.[lang] || ""}
            onChange={(e) => {
              let val = e.target.value;
              // Auto-decode if user pastes escaped HTML
              if (val.includes("&lt;") || val.includes("&gt;")) {
                const doc = new DOMParser().parseFromString(val, "text/html");
                val = doc.documentElement.textContent;
              }
              handleLocalizedChange(lang, "googleMapsIframe", val);
            }}
            className="w-full border border-[#B2B2B3] rounded-lg px-3 py-3 focus:ring-2 focus:ring-[#41398B]/20 outline-none transition-all resize-none text-sm placeholder-gray-400"
          />
          {/* Simple Preview */}
          {form.googleMapsIframe?.[lang] && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 h-[300px] shadow-sm bg-gray-50 flex items-center justify-center">
              <div
                className="w-full h-full flex items-center justify-center [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    let html = form.googleMapsIframe[lang] || "";
                    // If it contains encoded entities, decode them first
                    if (html.includes("&lt;") || html.includes("&gt;")) {
                      const doc = new DOMParser().parseFromString(html, "text/html");
                      html = doc.documentElement.textContent || "";
                    }
                    return html.trim().toLowerCase().startsWith("<iframe")
                      ? html
                      : `<p class="text-gray-400 text-xs px-10 text-center">Invalid iframe code. Please copy the "Embed a map" HTML from Google Maps.</p>`;
                  })()
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 💰 FINANCIAL DETAILS */}
      <h2 className="text-lg font-semibold mt-8 mb-4">{t.financialDetails}</h2>

      {/* ✅ SALE UI */}
      {transactionType === "Sale" && (
        <div className="grid grid-cols-3 gap-5">
          {/** 👉 KEEP YOUR EXACT SALE UI FIELDS HERE **/}

          {/* Currency */}
          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.currency}
            </label>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en" ? "Select Currency" : "Chọn loại tiền tệ"
              }
              value={form.currency?.symbol || undefined}
              onChange={(symbol) => {
                const selected = currencies.find(
                  (c) => c.currencySymbol?.en === symbol
                );
                if (selected) {
                  setForm((p) => ({
                    ...p,
                    currency: {
                      symbol:
                        selected.currencySymbol?.en ||
                        selected.currencySymbol?.vi ||
                        "$",
                      code:
                        selected.currencyCode?.en ||
                        selected.currencyCode?.vi ||
                        "USD",
                      name:
                        selected.currencyName?.en ||
                        selected.currencyName?.vi ||
                        "US Dollar",
                    },
                  }));
                } else {
                  setForm((p) => ({
                    ...p,
                    currency: { symbol: "", code: "", name: "" },
                  }));
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              loading={loadingCurrencies}
              notFoundContent={loadingCurrencies ? "Loading..." : null}
              className="w-full h-12 custom-select focus:ring-2 focus:ring-gray-300"
              popupClassName="custom-dropdown"
              options={currencies.map((c) => ({
                label: `${c.currencyName?.[lang] || c.currencyName?.en}`,
                value: c.currencySymbol?.en,
              }))}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.price}
            </label>
            <input
              type="text"
              value={formatNumber(form.price)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(raw)) {
                  handleChange("price", raw);
                }
              }}
              placeholder={t.typehere}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>

          {/* Deposit */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.depositPaymentTerms}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>

                <Switch
                  checked={form.financialVisibility?.deposit}
                  style={{
                    backgroundColor: form.financialVisibility?.deposit
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        deposit: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Deposit"
                  : "Nhập hoặc chọn khoản đặt cọc"
              }
              value={form.depositPaymentTerms?.[lang] || undefined}
              onChange={(value) => {
                const selected = deposits.find((d) => d.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    depositPaymentTerms: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      depositPaymentTerms: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "depositPaymentTerms", value);
                }
              }}
              onSearch={(val) => {
                if (val && val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "depositPaymentTerms",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={deposits.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>

          {/* Payment Terms */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.maintenanceFeeMonthly}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.paymentTerm}
                  style={{
                    backgroundColor: form.financialVisibility?.paymentTerm
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        paymentTerm: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Payment Term"
                  : "Nhập hoặc chọn điều khoản thanh toán"
              }
              value={form.maintenanceFeeMonthly?.[lang] || undefined}
              onChange={(value) => {
                const selected = payments.find((p) => p.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    maintenanceFeeMonthly: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      maintenanceFeeMonthly: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "maintenanceFeeMonthly", value);
                }
              }}
              onSearch={(val) => {
                if (val && val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "maintenanceFeeMonthly",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={payments.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>

          {/* Fees & Taxes */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.feeTax}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.feeTaxes}
                  style={{
                    backgroundColor: form.financialVisibility?.feeTaxes
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        feeTaxes: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Fee / Tax"
                  : "Nhập hoặc chọn phí / thuế"
              }
              value={form.financialDetailsFeeTax?.[lang] || undefined}
              onChange={(value) => {
                const selected = feeTaxes.find((f) => f.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    financialDetailsFeeTax: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      financialDetailsFeeTax: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "financialDetailsFeeTax", value);
                }
              }}
              onSearch={(val) => {
                if (val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "financialDetailsFeeTax",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={feeTaxes.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>

          {/* Legal Documents */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.legalDoc}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.legalDocs}
                  style={{
                    backgroundColor: form.financialVisibility?.legalDocs
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        legalDocs: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Legal Document"
                  : "Nhập hoặc chọn tài liệu pháp lý"
              }
              value={form.financialDetailsLegalDoc?.[lang] || undefined}
              onChange={(value) => {
                const selected = legalDocs.find((l) => l.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    financialDetailsLegalDoc: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      financialDetailsLegalDoc: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "financialDetailsLegalDoc", value);
                }
              }}
              onSearch={(val) => {
                if (val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "financialDetailsLegalDoc",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={legalDocs.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>

          {/* Agent Fee */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.agentFee}
              </label>
            </div>
            <input
              type="text"
              placeholder={t.typehere}
              value={formatNumber(form.financialDetailsAgentFee)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(raw)) {
                  handleChange("financialDetailsAgentFee", raw);
                }
              }}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>
        </div>
      )}

      {/* ✅ LEASE UI */}
      {transactionType === "Lease" && (
        <div className="grid grid-cols-3 gap-5">
          {/** 👉 KEEP YOUR EXACT LEASE UI FIELDS HERE **/}

          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.currency}
            </label>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en" ? "Select Currency" : "Chọn loại tiền tệ"
              }
              value={form.currency?.symbol || undefined}
              onChange={(symbol) => {
                const selected = currencies.find(
                  (c) => c.currencySymbol?.en === symbol
                );
                if (selected) {
                  setForm((p) => ({
                    ...p,
                    currency: {
                      symbol:
                        selected.currencySymbol?.en ||
                        selected.currencySymbol?.vi ||
                        "$",
                      code:
                        selected.currencyCode?.en ||
                        selected.currencyCode?.vi ||
                        "USD",
                      name:
                        selected.currencyName?.en ||
                        selected.currencyName?.vi ||
                        "US Dollar",
                    },
                  }));
                } else {
                  setForm((p) => ({
                    ...p,
                    currency: { symbol: "", code: "", name: "" },
                  }));
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              loading={loadingCurrencies}
              notFoundContent={loadingCurrencies ? "Loading..." : null}
              className="w-full h-12 custom-select focus:ring-2 focus:ring-gray-300"
              popupClassName="custom-dropdown"
              options={currencies.map((c) => ({
                label: `${c.currencyName?.[lang] || c.currencyName?.en}`,
                value: c.currencySymbol?.en,
              }))}
            />
          </div>

          {/* Lease Price */}
          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.leasePrice}
            </label>
            <input
              type="text"
              value={formatNumber(form.leasePrice)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(raw)) {
                  handleChange("leasePrice", raw);
                }
              }}
              placeholder={t.typehere}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>

          {/* Contract Length */}
          <div className="flex flex-col w-full gap-1">
            {/* ✅ Top Row: Label + Hide + Switch */}
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.contractLength}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.contractLength}
                  style={{
                    backgroundColor: form.financialVisibility?.contractLength
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        contractLength: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>

            {/* ✅ Input Below */}
            <input
              type="text"
              value={form.contractLength}
              placeholder={t.typehere}
              onChange={(e) => handleChange("contractLength", e.target.value)}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>

          {/* Deposit */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.depositPaymentTerms}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.deposit}
                  style={{
                    backgroundColor: form.financialVisibility?.deposit
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        deposit: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Deposit"
                  : "Nhập hoặc chọn khoản đặt cọc"
              }
              value={form.depositPaymentTerms?.[lang] || undefined}
              onChange={(value) => {
                const selected = deposits.find((d) => d.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    depositPaymentTerms: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      depositPaymentTerms: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "depositPaymentTerms", value);
                }
              }}
              onSearch={(val) => {
                if (val && val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "depositPaymentTerms",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={deposits.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>

          {/* Payment Terms */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.maintenanceFeeMonthly}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.paymentTerm}
                  style={{
                    backgroundColor: form.financialVisibility?.paymentTerm
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        paymentTerm: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Payment Term"
                  : "Nhập hoặc chọn điều khoản thanh toán"
              }
              value={form.maintenanceFeeMonthly?.[lang] || undefined}
              onChange={(value) => {
                const selected = payments.find((p) => p.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    maintenanceFeeMonthly: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      maintenanceFeeMonthly: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "maintenanceFeeMonthly", value);
                }
              }}
              onSearch={(val) => {
                if (val && val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "maintenanceFeeMonthly",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={payments.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>

          {/* Agent Fee */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.agentFee}
              </label>
            </div>
            <input
              type="text"
              placeholder={t.typehere}
              value={formatNumber(form.financialDetailsAgentFee)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(raw)) {
                  handleChange("financialDetailsAgentFee", raw);
                }
              }}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>

          {/* Agent Payment Agenda */}
          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.agentFeeAgenda}
            </label>
            <input
              value={form.financialDetailsAgentPaymentAgenda?.[lang] || ""}
              onChange={(e) =>
                handleLocalizedChange(
                  lang,
                  "financialDetailsAgentPaymentAgenda",
                  e.target.value
                )
              }
              className="border border-[#B2B2B3] rounded-lg px-3 py-2 h-12 focus:ring-2 focus:ring-gray-300 outline-none"
              placeholder={t.typehere}
            />
          </div>
        </div>
      )}

      {/* ✅ HOME STAY UI */}
      {transactionType === "Home Stay" && (
        <div className="grid grid-cols-3 gap-5">
          {/** 👉 KEEP YOUR EXACT HOME STAY UI FIELDS HERE **/}

          {/* Currency */}
          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.currency}
            </label>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en" ? "Select Currency" : "Chọn loại tiền tệ"
              }
              value={form.currency?.symbol || undefined}
              onChange={(symbol) => {
                const selected = currencies.find(
                  (c) => c.currencySymbol?.en === symbol
                );
                if (selected) {
                  setForm((p) => ({
                    ...p,
                    currency: {
                      symbol:
                        selected.currencySymbol?.en ||
                        selected.currencySymbol?.vi ||
                        "$",
                      code:
                        selected.currencyCode?.en ||
                        selected.currencyCode?.vi ||
                        "USD",
                      name:
                        selected.currencyName?.en ||
                        selected.currencyName?.vi ||
                        "US Dollar",
                    },
                  }));
                } else {
                  setForm((p) => ({
                    ...p,
                    currency: { symbol: "", code: "", name: "" },
                  }));
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              loading={loadingCurrencies}
              notFoundContent={loadingCurrencies ? "Loading..." : null}
              className="w-full h-12 custom-select focus:ring-2 focus:ring-gray-300"
              popupClassName="custom-dropdown"
              options={currencies.map((c) => ({
                label: `${c.currencyName?.[lang] || c.currencyName?.en}`,
                value: c.currencySymbol?.en,
              }))}
            />
          </div>

          {/* Price Per Night */}
          <div className="flex flex-col">
            <label className="text-sm text-[#131517] font-semibold mb-2">
              {t.pricePerNight}
            </label>
            <input
              type="text"
              value={formatNumber(form.pricePerNight)}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(raw)) {
                  handleChange("pricePerNight", raw);
                }
              }}
              placeholder={t.typehere}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>

          {/* Check In */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.checkIn}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.checkIn}
                  style={{
                    backgroundColor: form.financialVisibility?.checkIn
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        checkIn: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <input
              type="text"
              value={form.checkIn}
              placeholder={t.typehere}
              onChange={(e) => handleChange("checkIn", e.target.value)}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>

          {/* Check Out */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.checkOut}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.checkOut}
                  style={{
                    backgroundColor: form.financialVisibility?.checkOut
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        checkOut: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <input
              type="text"
              value={form.checkOut}
              placeholder={t.typehere}
              onChange={(e) => handleChange("checkOut", e.target.value)}
              className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
            />
          </div>

          {/* Deposit */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.depositPaymentTerms}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>

                <Switch
                  checked={form.financialVisibility?.deposit}
                  style={{
                    backgroundColor: form.financialVisibility?.deposit
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        deposit: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Deposit"
                  : "Nhập hoặc chọn khoản đặt cọc"
              }
              value={form.depositPaymentTerms?.[lang] || undefined}
              onChange={(value) => {
                const selected = deposits.find((d) => d.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    depositPaymentTerms: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      depositPaymentTerms: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "depositPaymentTerms", value);
                }
              }}
              onSearch={(val) => {
                if (val && val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "depositPaymentTerms",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={deposits.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>

          {/* Payment Terms */}
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {t.maintenanceFeeMonthly}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.financialVisibility?.paymentTerm}
                  style={{
                    backgroundColor: form.financialVisibility?.paymentTerm
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) => {
                    const updated = {
                      ...form,
                      financialVisibility: {
                        ...form.financialVisibility,
                        paymentTerm: val,
                      },
                    };
                    setForm(updated);
                    onChange && onChange(updated);
                  }}
                />
              </div>
            </div>
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en"
                  ? "Type or Select Payment Term"
                  : "Nhập hoặc chọn điều khoản thanh toán"
              }
              value={form.maintenanceFeeMonthly?.[lang] || undefined}
              onChange={(value) => {
                const selected = payments.find((p) => p.name?.[lang] === value);
                if (selected) {
                  setForm((prev) => ({
                    ...prev,
                    maintenanceFeeMonthly: {
                      en: selected.name?.en || "",
                      vi: selected.name?.vi || "",
                    },
                  }));
                  onChange &&
                    onChange({
                      ...form,
                      maintenanceFeeMonthly: {
                        en: selected.name?.en || "",
                        vi: selected.name?.vi || "",
                      },
                    });
                } else {
                  handleLocalizedChange(lang, "maintenanceFeeMonthly", value);
                }
              }}
              onSearch={(val) => {
                if (val && val.trim() !== "") {
                  handleLocalizedChange(
                    lang,
                    "maintenanceFeeMonthly",
                    val.trim()
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={null}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              options={payments.map((opt) => ({
                label: opt.name?.[lang] || "",
                value: opt.name?.[lang] || "",
              }))}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white border border-gray-300 items-center text-gray-700 rounded-full hover:bg-gray-100 flex gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={18} />
          {lang === "en" ? "Previous" : "Trước"}
        </button>

        <button
          onClick={() => {
            const fullForm = {
              ...form,
              price: form.price,                        // <== ENSURE PRICE INCLUDED
              currency: form.currency,                 // <== ENSURE currency INCLUDED
              propertyImages: images,
              propertyVideos: videos,
              floorPlans: floorPlans,
            };

            onChange && onChange(fullForm);
            onNext(fullForm);
          }}


          className="px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full cursor-pointer flex gap-1.5 items-center"
        >
          {lang === "en" ? "Next" : "Tiếp theo"} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
