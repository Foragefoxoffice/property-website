import React, { useState } from "react";
import { X, CirclePlus } from "lucide-react";
import { useLanguage } from "../../Language/LanguageContext";
import { createOwner } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { translations } from "../../Language/translations";
import { Select } from "antd";

import { translateError } from "../../utils/translateError";

/* ======================================================
   UI TEXT
====================================================== */
const uiText = {
  EN: {
    modalTitle: "New Landlord",
    ownerName: "Landlord Name",
    placeholderOwnerName: "Type Landlord Name",
    gender: "Gender",
    phone: "Phone Number",
    placeholderPhone: "Enter phone number",
    email: "Email Address",
    placeholderEmail: "Enter email address",
    social: "Social Media",
    iconPlaceholder: "Icon name",
    linkPlaceholder: "Social link (EN)",
    notes: "Notes",
    placeholderNotes: "Write notes...",
    submit: "Add Landlord",
  },
  VI: {
    modalTitle: "Chủ nhà mới",
    ownerName: "Tên chủ nhà",
    placeholderOwnerName: "Nhập tên chủ nhà",
    gender: "Giới tính",
    phone: "Số điện thoại",
    placeholderPhone: "Nhập số điện thoại",
    email: "Địa chỉ Email",
    placeholderEmail: "Nhập Email",
    social: "Mạng xã hội",
    iconPlaceholder: "Tên biểu tượng",
    linkPlaceholder: "Liên kết MXH (VI)",
    notes: "Ghi chú",
    placeholderNotes: "Nhập ghi chú...",
    submit: "Thêm chủ nhà",
  },
};

/* ======================================================
   SIMPLE SELECT COMPONENT
====================================================== */
const SimpleSelect = ({ label, value, onChange, options, lang }) => (
  <div className="flex flex-col">
    <label className="block text-sm font-medium mb-1 text-gray-700">
      {label}
    </label>

    <Select
      placeholder={lang === "VI" ? "Chọn" : "Select"}
      className="w-full h-11"
      value={value || undefined}
      onChange={onChange}
      options={options}
    />
  </div>
);

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function OwnerModal({ onClose, onSuccess }) {
  const { language } = useLanguage();
  const t = translations[language];

  const [activeLang, setActiveLang] = useState("EN");
  const text = uiText[activeLang];

  const [form, setForm] = useState({
    ownerName_en: "",
    ownerName_vi: "",
    ownerNotes_en: "",
    ownerNotes_vi: "",
    gender: "",
  });

  const [phoneRows, setPhoneRows] = useState([{ number: "" }]);
  const [emailRows, setEmailRows] = useState([{ email: "" }]);
  const [socialMedia, setSocialMedia] = useState([
    { iconName: "", link_en: "", link_vi: "" },
  ]);

  /* ======================================================
     SUBMIT
  ======================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ownerName_en: form.ownerName_en,
      ownerName_vi: form.ownerName_vi,
      ownerNotes_en: form.ownerNotes_en,
      ownerNotes_vi: form.ownerNotes_vi,
      gender: form.gender,

      phoneNumbers: phoneRows.map((p) => p.number.trim()).filter(Boolean),
      emailAddresses: emailRows.map((e) => e.email.trim()).filter(Boolean),

      socialMedia_iconName: socialMedia.map((s) => s.iconName.trim()),
      socialMedia_link_en: socialMedia.map((s) => s.link_en.trim()),
      socialMedia_link_vi: socialMedia.map((s) => s.link_vi.trim()),
    };

    try {
      await createOwner(payload);
      CommonToaster(t.ownerCreated, "success");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || t.errorSavingOwner;
      CommonToaster(translateError(msg, t), "error");
    }
  };

  const updateSocialRow = (i, key, val) => {
    const next = [...socialMedia];
    next[i][key] = val;
    setSocialMedia(next);
  };

  /* ======================================================
     UI
  ======================================================= */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-999 overflow-y-auto py-12 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-[#41398B] p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6">{text.modalTitle}</h2>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {["EN", "VI"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-5 py-2 text-sm font-semibold ${activeLang === lang
                ? "border-b-2 border-[#41398B] text-black"
                : "text-gray-500"
                }`}
            >
              {lang === "EN" ? "English (EN)" : "Tiếng Việt (VI)"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Owner Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {text.ownerName}
            </label>
            <input
              type="text"
              placeholder={text.placeholderOwnerName}
              className="border border-gray-300 rounded-lg px-3 py-3 w-full"
              value={form[`ownerName_${activeLang.toLowerCase()}`]}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  [`ownerName_${activeLang.toLowerCase()}`]: e.target.value,
                }))
              }
            />
          </div>



          {/* Gender */}
          <SimpleSelect
            label={text.gender}
            value={form.gender}
            onChange={(val) => setForm((p) => ({ ...p, gender: val }))}
            options={[
              { value: "Male", label: activeLang === "VI" ? "Nam" : "Male" },
              { value: "Female", label: activeLang === "VI" ? "Nữ" : "Female" },
              { value: "Other", label: activeLang === "VI" ? "Khác" : "Other" },
            ]}
            lang={activeLang}
          />

          {/* Phone Numbers */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {text.phone}
            </label>

            {phoneRows.map((row, idx) => (
              <div key={idx} className="flex gap-3 mt-2">
                <input
                  type="text"
                  placeholder={text.placeholderPhone}
                  className="border border-gray-300 rounded-lg px-3 py-3 flex-1"
                  value={row.number}
                  onChange={(e) => {
                    const next = [...phoneRows];
                    next[idx].number = e.target.value;
                    setPhoneRows(next);
                  }}
                />

                {idx === phoneRows.length - 1 ? (
                  <CirclePlus
                    className="cursor-pointer"
                    size={22}
                    onClick={() => setPhoneRows([...phoneRows, { number: "" }])}
                  />
                ) : (
                  <X
                    className="cursor-pointer"
                    size={20}
                    onClick={() =>
                      setPhoneRows(phoneRows.filter((_, i) => i !== idx))
                    }
                  />
                )}
              </div>
            ))}
          </div>


          {/* Social Media */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {text.social}
            </label>

            {socialMedia.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-3">
                <input
                  type="text"
                  placeholder={text.iconPlaceholder}
                  className="border border-gray-300 rounded-lg px-3 py-3 w-1/2"
                  value={row.iconName}
                  onChange={(e) =>
                    updateSocialRow(idx, "iconName", e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder={text.linkPlaceholder}
                  className="border border-gray-300 rounded-lg px-3 py-3 w-1/2"
                  value={activeLang === "EN" ? row.link_en : row.link_vi}
                  onChange={(e) =>
                    updateSocialRow(
                      idx,
                      activeLang === "EN" ? "link_en" : "link_vi",
                      e.target.value
                    )
                  }
                />

                {idx === socialMedia.length - 1 ? (
                  <CirclePlus
                    className="cursor-pointer"
                    size={20}
                    onClick={() =>
                      setSocialMedia([
                        ...socialMedia,
                        { iconName: "", link_en: "", link_vi: "" },
                      ])
                    }
                  />
                ) : (
                  <X
                    className="cursor-pointer"
                    size={18}
                    onClick={() =>
                      setSocialMedia(socialMedia.filter((_, i) => i !== idx))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {text.notes}
            </label>
            <textarea
              rows={2}
              className="border border-gray-300 rounded-lg px-3 py-3 w-full resize-none"
              placeholder={text.placeholderNotes}
              value={form[`ownerNotes_${activeLang.toLowerCase()}`]}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  [`ownerNotes_${activeLang.toLowerCase()}`]: e.target.value,
                }))
              }
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 bg-[#41398B] hover:bg-[#41398be3] text-white py-3 rounded-full text-sm"
          >
            {text.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
