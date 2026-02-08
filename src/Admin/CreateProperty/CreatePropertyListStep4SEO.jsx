import React, { useState, useEffect } from "react";
import { Eye, X, Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { Select as AntdSelect, Switch } from "antd";
import { uploadPropertyMedia } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";

const KeywordTagsInput = ({ value = [], onChange, placeholder, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newKeyword = e.target.value.trim();
      const currentKeywords = Array.isArray(value) ? value : [];
      onChange([...currentKeywords, newKeyword]);
      setInputValue('');
    }
  };

  const removeKeyword = (index) => {
    const currentKeywords = Array.isArray(value) ? value : [];
    const newKeywords = currentKeywords.filter((_, i) => i !== index);
    onChange(newKeywords);
  };

  return (
    <div className="border border-[#B2B2B3] rounded-lg px-3 py-2 min-h-[100px] bg-white">
      <div className="flex flex-wrap gap-2 mb-2">
        {(Array.isArray(value) ? value : []).map((kw, i) => (
          <div
            key={i}
            className="bg-[#41398B] px-3 py-1 text-white rounded-md flex items-center gap-2"
          >
            <span className="text-sm">{kw}</span>
            <button
              type="button"
              className="text-red-300 hover:text-red-100 font-bold"
              onClick={() => removeKeyword(i)}
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="outline-none w-full text-[15px] font-['Manrope']"
        disabled={disabled}
      />
    </div>
  );
};

export default function CreatePropertyListStep4SEO({
  onNext,
  onPrev,
  onChange,
  initialData,
}) {
  const labels = {
    metaTitle: { en: "Meta Title", vi: "Tiêu đề Meta" },
    metaDescription: { en: "Meta Description", vi: "Mô tả Meta" },
    metaKeywords: { en: "Meta Keywords", vi: "Từ khóa Meta" },
    slugUrl: { en: "Slug URL", vi: "Đường dẫn Slug" },
    canonicalUrl: { en: "Canonical URL", vi: "Đường dẫn Canonical" },
    schemaType: { en: "Schema Type", vi: "Loại Schema" },
    allowIndexing: {
      en: "Allow search engines to index this page",
      vi: "Cho phép công cụ tìm kiếm lập chỉ mục",
    },
    next: {
      en: "Next",
      vi: "Kế tiếp",
    },
    back: {
      en: "Back",
      vi: "Mặt sau",
    },
    upload: {
      en: "Click here to upload",
      vi: "Bấm vào đây để tải lên",
    },
    social: {
      en: "Social Sharing (Open Graph)",
      vi: "Chia sẻ xã hội (Open Graph)",
    },
    ogTitle: { en: "OG Title", vi: "Tiêu đề OG" },
    ogDescription: { en: "OG Description", vi: "Mô tả OG" },
    ogImages: { en: "OG Images", vi: "Hình ảnh OG" },
  };

  /* ---------------------------------------------
       ✅ SEO DATA MODEL
    --------------------------------------------- */
  const defaultSEO = {
    metaTitle: { en: "", vi: "" },
    metaDescription: { en: "", vi: "" },
    metaKeywords: { en: [], vi: [] },
    slugUrl: { en: "", vi: "" },
    canonicalUrl: { en: "", vi: "" },
    schemaType: { en: "", vi: "" },
    ogTitle: { en: "", vi: "" },
    ogDescription: { en: "", vi: "" },
    allowIndexing: true,
    ogImages: [],
  };

  const [activeLang, setActiveLang] = useState("vi");

  const [seo, setSeo] = useState(
    initialData.seoInformation
      ? { ...defaultSEO, ...initialData.seoInformation }
      : defaultSEO
  );

  /* ✅ Sync with initialData when it changes (Edit Mode) */
  React.useEffect(() => {
    if (initialData?.seoInformation) {
      setSeo((prev) => ({
        ...prev,
        ...initialData.seoInformation,
      }));
    }
  }, [initialData]);

  /* ✅ Sync Slug with Title (Auto-fill) */
  useEffect(() => {
    // Check nested title from CreateProperty schema or fallback to 'name'
    const listingInfo = initialData?.listingInformation;
    const titleObj = listingInfo?.listingInformationPropertyTitle || initialData?.name;

    if (!titleObj) return;

    const titleToSlug = titleObj.en || titleObj.vi;
    if (!titleToSlug) return;

    const currentSlugEn = seo.slugUrl.en;
    const currentSlugVi = seo.slugUrl.vi;

    // Only auto-fill if both slugs are empty to avoid overwriting user manual edits
    if (!currentSlugEn && !currentSlugVi) {
      const slug = titleToSlug
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const updated = {
        ...seo,
        slugUrl: { en: slug, vi: slug },
        // Also auto-fill meta title if empty
        metaTitle: {
          en: seo.metaTitle.en || titleObj.en || titleToSlug,
          vi: seo.metaTitle.vi || titleObj.vi || titleToSlug
        }
      };
      setSeo(updated);
      onChange({ seoInformation: updated });
    }
  }, [initialData]); // Re-run when initialData (which contains title) changes

  /* ---------------------------------------------
       ✅ UPDATE HANDLER (multilingual)
    --------------------------------------------- */
  const handleChange = (field, lang, value) => {
    const updated = {
      ...seo,
      [field]: { ...seo[field], [lang]: value },
    };
    setSeo(updated);
    onChange({ seoInformation: updated });
  };

  /* ---------------------------------------------
       ✅ OG IMAGE UPLOAD + DELETE
    --------------------------------------------- */
  const handleOgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      CommonToaster("Uploading OG image...", "info");
      const response = await uploadPropertyMedia(file, "image");
      const url = response.data.url;

      const updated = {
        ...seo,
        ogImages: [...seo.ogImages, url],
      };
      setSeo(updated);
      onChange({ seoInformation: updated });
      CommonToaster("OG Image uploaded successfully!", "success");
    } catch (error) {
      console.error("OG Image upload error:", error);
      CommonToaster("Failed to upload OG Image", "error");
    }

    // Reset input
    e.target.value = '';
  };

  const removeOgImage = (index) => {
    const updated = {
      ...seo,
      ogImages: seo.ogImages.filter((_, i) => i !== index),
    };
    setSeo(updated);
    onChange({ seoInformation: updated });
  };

  const [preview, setPreview] = useState(null);

  /* ---------------------------------------------
       ✅ RENDER
    --------------------------------------------- */
  // ✅ INPUT STYLE (Identical to Step-2)
  const inputClass =
    "border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";

  const textareaClass =
    "border border-[#B2B2B3] rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
      {/* 🌐 LANGUAGE TABS (Same UI as Step-2) */}
      <div className="flex mb-6 border-b border-gray-200">
        {["vi", "en"].map((lng) => (
          <button
            key={lng}
            onClick={() => setActiveLang(lng)}
            className={`px-6 py-2 text-sm cursor-pointer font-medium ${activeLang === lng
              ? "border-b-2 border-[#41398B] text-black"
              : "text-gray-500 hover:text-black"
              }`}
          >
            {lng === "vi" ? "Tiếng Việt (VI)" : "English (EN)"}
          </button>
        ))}
      </div>

      {/* ✅ SHARED SLUG URL (Outside Tabs logic mostly, but we sync it) */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          Slug URL (Shared / Dùng chung) <span className="font-normal text-gray-500 text-xs ml-2">(Auto-synced for both languages)</span>
        </label>
        <input
          placeholder="my-property-slug"
          className={inputClass}
          value={seo.slugUrl.en} // Always show EN as the master value
          onChange={(e) => {
            const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const updated = {
              ...seo,
              slugUrl: { en: val, vi: val } // Sync both
            };
            setSeo(updated);
            onChange({ seoInformation: updated });
          }}
        />
      </div>

      {/* ✅ META TITLE */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.metaTitle[activeLang]}
        </label>
        <input
          placeholder="Type Here"
          className={inputClass}
          value={seo.metaTitle[activeLang]}
          onChange={(e) =>
            handleChange("metaTitle", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ META DESCRIPTION */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.metaDescription[activeLang]}
        </label>
        <textarea
          placeholder="Type here"
          rows={4}
          className={textareaClass}
          value={seo.metaDescription[activeLang]}
          onChange={(e) =>
            handleChange("metaDescription", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ META KEYWORDS (Using New Component) */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.metaKeywords[activeLang]}
        </label>
        <KeywordTagsInput
          value={seo.metaKeywords[activeLang]}
          onChange={(newKeywords) => handleChange("metaKeywords", activeLang, newKeywords)}
          placeholder="Type keyword & press Enter"
        />
      </div>

      {/* ✅ CANONICAL */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.canonicalUrl[activeLang]}
        </label>
        <input
          placeholder="Type Here and Edit"
          className={inputClass}
          value={seo.canonicalUrl[activeLang]}
          onChange={(e) =>
            handleChange("canonicalUrl", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ SCHEMA TYPE (Antd Select SAME UI as Step-2) */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.schemaType[activeLang]}
        </label>
        <AntdSelect
          showSearch
          allowClear
          placeholder="Select Schema Type"
          value={seo.schemaType[activeLang] || undefined}
          onChange={(value) => handleChange("schemaType", activeLang, value)}
          className="w-full custom-select"
          popupClassName="custom-dropdown"
          options={[
            { label: "Product", value: "Product" },
            { label: "RealEstateAgent", value: "RealEstateAgent" },
            { label: "Residence", value: "Residence" },
            { label: "Apartment", value: "Apartment" },
            { label: "SingleFamilyResidence", value: "SingleFamilyResidence" },
            { label: "House", value: "House" },
            { label: "Hotel", value: "Hotel" },
            { label: "Place", value: "Place" },
            { label: "LocalBusiness", value: "LocalBusiness" },
          ]}
        />
      </div>

      {/* ✅ ALLOW INDEXING */}
      <div className="flex items-center gap-3 mt-2">
        <label className="text-md font-md mb-2 block">
          {labels.allowIndexing[activeLang]}
        </label>
        <Switch
          checked={seo.allowIndexing}
          onChange={(checked) => {
            const updated = { ...seo, allowIndexing: checked };
            setSeo(updated);
            onChange({ seoInformation: updated });
          }}
          style={{
            backgroundColor: seo.allowIndexing ? "#41398B" : "#d9d9d9",
          }}
        />
      </div>
      <div>
        <h2 className="text-black text-lg font-semibold">
          {labels.social[activeLang]}
        </h2>
      </div>

      {/* ✅ OG TITLE */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.ogTitle[activeLang]}
        </label>
        <input
          placeholder="Type Here"
          className={inputClass}
          value={seo.ogTitle[activeLang]}
          onChange={(e) => handleChange("ogTitle", activeLang, e.target.value)}
        />
      </div>

      {/* ✅ OG DESCRIPTION */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.ogDescription[activeLang]}
        </label>
        <textarea
          placeholder="Type here"
          rows={4}
          className={textareaClass}
          value={seo.ogDescription[activeLang]}
          onChange={(e) =>
            handleChange("ogDescription", activeLang, e.target.value)
          }
        />
      </div>

      {/* ✅ ✔ OG IMAGES — EXACT Step-2 Upload UI */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          {labels.ogImages[activeLang]}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          (jpg, jpeg, png, webp, svg)
        </p>

        <div className="flex gap-4 flex-wrap">
          {/* ✅ EXISTING IMAGES */}
          {seo.ogImages.map((img, i) => (
            <div
              key={i}
              className="relative w-70 h-60 rounded-xl overflow-hidden border bg-gray-50 group"
            >
              <img src={img} className="w-full h-full object-cover" />

              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
              transition-all flex justify-center items-center gap-3 opacity-0 group-hover:opacity-100"
              >
                <button
                  onClick={() => setPreview(img)}
                  className="bg-white cursor-pointer rounded-full p-2 shadow"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeOgImage(i)}
                  className="bg-white cursor-pointer rounded-full p-2 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* ✅ UPLOAD BOX */}
          <label
            className="w-70 h-60 border border-dashed border-[#646466] rounded-xl 
            flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50"
          >
            <div className="w-18 h-18 border border-dashed border-[#646466] rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-500" />
            </div>
            <span className="text-xs mt-2 text-[#646466]">
              {labels.upload[activeLang]}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleOgUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ✅ POPUP PREVIEW (Matches Step-2) */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        >
          <div
            className="relative max-w-md w-full rounded-xl overflow-hidden bg-black/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 bg-[#41398B] hover:bg-[#2f2775] text-white rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={preview}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ✅ FOOTER BUTTONS */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-white cursor-pointer border border-gray-300 rounded-full hover:bg-gray-50 flex gap-2 items-center"
        >
          <ArrowLeft size={18} /> {labels.back[activeLang]}
        </button>

        <button
          onClick={() => {
            onChange({ seoInformation: seo });  // keep SEO data
            onNext();  // go to preview
          }}
          className="px-6 py-2 bg-[#41398B] cursor-pointer hover:bg-[#322e7e] text-white rounded-full flex items-center gap-2"
        >
          {labels.next[activeLang]} <ArrowRight size={18} />
        </button>

      </div>
    </div>
  );
}
