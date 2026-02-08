import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Search,
  X,
  CirclePlus,
  AlertTriangle,
} from "lucide-react";
import {
  getAllOwners,
  createOwner,
  deleteOwner,
  updateOwner,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { translateError } from "../../utils/translateError";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../Context/PermissionContext";

/* ==========================================================
   ✅ Custom Select Component
========================================================== */
const CustomSelect = ({ label, name, value, onChange, options = [], lang }) => {
  const { Option } = Select;
  return (
    <div className="flex flex-col w-full mb-3">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label}
      </label>

      <Select
        showSearch
        allowClear
        placeholder={lang === "vi" ? "Chọn" : "Select"}
        value={value || undefined}
        onChange={(val) => onChange(val)}
        className="w-full h-11 custom-select"
        popupClassName="custom-dropdown"
      >
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

/* ==========================================================
   ✅ MAIN PAGE
========================================================== */
const OwnersLandlords = ({ openOwnerView }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const { can } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeLang, setActiveLang] = useState("EN");

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [editMode, setEditMode] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const [formData, setFormData] = useState({
    ownerName_en: "",
    ownerName_vi: "",
    ownerNotes_en: "",
    ownerNotes_vi: "",
    gender: "",
  });

  const navigate = useNavigate();

  const [phoneRows, setPhoneRows] = useState([{ number: "" }]);
  const [emailRows, setEmailRows] = useState([{ email: "" }]);

  const [socialMedia, setSocialMedia] = useState([
    { iconName: "", link_en: "", link_vi: "" },
  ]);

  /* ==========================================================
     ✅ Fetch Owners
  ========================================================== */
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await getAllOwners();
      setOwners(res.data.data || []);
    } catch {
      CommonToaster(t.failedToLoadOwners, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  /* ==========================================================
     ✅ Open Add Modal
  ========================================================== */
  const openAddModal = () => {
    setEditMode(false);
    setEditingOwner(null);

    setFormData({
      ownerName_en: "",
      ownerName_vi: "",
      ownerNotes_en: "",
      ownerNotes_vi: "",
      gender: "",
    });

    setPhoneRows([{ number: "" }]);
    setEmailRows([{ email: "" }]);

    setSocialMedia([{ iconName: "", link_en: "", link_vi: "" }]);

    setShowModal(true);
  };

  /* ==========================================================
     ✅ Open Edit Modal
  ========================================================== */
  const openEditModal = (owner) => {
    setEditMode(true);
    setEditingOwner(owner);

    // Phone numbers
    setPhoneRows(
      owner.phoneNumbers?.length
        ? owner.phoneNumbers.map((p) => ({ number: p }))
        : [{ number: "" }]
    );

    // Emails
    setEmailRows(
      owner.emailAddresses?.length
        ? owner.emailAddresses.map((e) => ({ email: e }))
        : [{ email: "" }]
    );

    // Social media
    const sm = owner.socialMedia_iconName?.map((_, i) => ({
      iconName: owner.socialMedia_iconName[i] || "",
      link_en: owner.socialMedia_link_en[i] || "",
      link_vi: owner.socialMedia_link_vi[i] || "",
    })) || [
        { iconName: "", link_en: "", link_vi: "" },
      ];

    setSocialMedia(sm);

    // Form Data
    setFormData({
      ownerName_en: owner.ownerName?.en || "",
      ownerName_vi: owner.ownerName?.vi || "",
      ownerNotes_en: owner.ownerNotes?.en || "",
      ownerNotes_vi: owner.ownerNotes?.vi || "",
      gender: owner.gender || "",
    });

    setShowModal(true);
  };

  /* ==========================================================
     ✅ Submit Owner
  ========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      phoneNumbers: phoneRows.map((p) => p.number.trim()),
      emailAddresses: emailRows.map((e) => e.email.trim()),
      socialMedia_iconName: socialMedia.map((s) => s.iconName.trim()),
      socialMedia_link_en: socialMedia.map((s) => s.link_en.trim()),
      socialMedia_link_vi: socialMedia.map((s) => s.link_vi.trim()),
    };

    try {
      if (editMode) {
        await updateOwner(editingOwner._id, payload);
        CommonToaster(t.ownerUpdated, "success");
      } else {
        await createOwner(payload);
        CommonToaster(t.ownerCreated, "success");
      }
      setShowModal(false);
      fetchOwners();
    } catch (error) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || t.errorSavingOwner;
      CommonToaster(translateError(msg, t), "error");
    }
  };

  /* ==========================================================
     ✅ Delete Owner
  ========================================================== */
  const handleDelete = async () => {
    try {
      await deleteOwner(deleteConfirm.id);
      CommonToaster(t.ownerDeleted, "success");
      setDeleteConfirm({ show: false, id: null });
      fetchOwners();
    } catch (error) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || t.deleteFailed;
      CommonToaster(translateError(msg, t), "error");
    }
  };

  /* ==========================================================
     ✅ Filter Table
  ========================================================== */
  const filteredOwners = owners
    .filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = (item.ownerName?.[language] || "").toLowerCase().includes(searchLower);
      const matchesPhone = item.phoneNumbers?.some(phone => phone.toLowerCase().includes(searchLower));
      return matchesName || matchesPhone;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return (a.ownerName?.[language] || "").localeCompare(b.ownerName?.[language] || "");
      if (sortBy === "name-desc") return (b.ownerName?.[language] || "").localeCompare(a.ownerName?.[language] || "");
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const displayPhones = (item) =>
    item.phoneNumbers?.length ? item.phoneNumbers.join(", ") : "-";

  const firstEmail = (item) =>
    item.emailAddresses?.length ? item.emailAddresses[0] : "-";

  /* ==========================================================
     ✅ RETURN UI
  ========================================================== */
  return (
    <div className="min-h-screen p-2">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">{t.owners}</h1>
        {can("landlords", "add") && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-white bg-[#41398B] rounded-full shadow"
          >
            <Plus size={18} />
            {language === "vi" ? "Chủ sở hữu mới" : "New Owner"}
          </button>
        )}
      </div>

      {/* SEARCH & SORT */}
      <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
        <div className="flex items-center bg-white border rounded-full px-4 py-2.5 w-full md:max-w-md shadow-sm">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder={language === "vi" ? "Tìm kiếm..." : "Search owners..."}
            className="flex-1 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value)}
          className="w-full md:w-48 custom-selects"
          popupClassName="custom-dropdown"
          placeholder={language === "vi" ? "Sắp xếp" : "Sort by"}
        >
          <Select.Option value="newest">{language === "vi" ? "Mới nhất" : "Newest First"}</Select.Option>
          <Select.Option value="oldest">{language === "vi" ? "Cũ nhất" : "Oldest First"}</Select.Option>
          <Select.Option value="name-asc">{language === "vi" ? "Tên (A-Z)" : "Name (A-Z)"}</Select.Option>
          <Select.Option value="name-desc">{language === "vi" ? "Tên (Z-A)" : "Name (Z-A)"}</Select.Option>
        </Select>
      </div>

      {/* TABLE */}
      {loading ? (
        <OwnersSkeleton />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredOwners.map((item) => (
                <tr key={item._id} className="hover:bg-gray-100 transition">
                  <td className="px-6 py-4">{item.ownerName?.[language]}</td>
                  <td className="px-6 py-4">{displayPhones(item)}</td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {can("landlords", "view") && (
                        <button
                          onClick={() => navigate(`/dashboard/landlords/${item._id}`)}
                          className="p-2 border rounded-full hover:bg-gray-200"
                        >
                          <Eye size={18} />
                        </button>
                      )}

                      {can("landlords", "edit") && (
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 border rounded-full hover:bg-gray-200"
                        >
                          <Edit2 size={18} className="text-blue-500" />
                        </button>
                      )}

                      {can("landlords", "delete") && (
                        <button
                          onClick={() =>
                            setDeleteConfirm({ show: true, id: item._id })
                          }
                          className="p-2 border rounded-full hover:bg-gray-200"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredOwners.length && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirm.show && (
        <DeleteModal
          language={language}
          onCancel={() => setDeleteConfirm({ show: false, id: null })}
          onDelete={handleDelete}
        />
      )}

      {/* ADD / EDIT OWNER MODAL */}
      {showModal && (
        <AddEditOwnerModal
          activeLang={activeLang}
          setActiveLang={setActiveLang}
          formData={formData}
          setFormData={setFormData}
          handleChange={(lang, name, val) =>
            setFormData((p) => ({ ...p, [`${name}_${lang.toLowerCase()}`]: val }))
          }
          handleSubmit={handleSubmit}
          setShowModal={setShowModal}
          editMode={editMode}
          language={language}
          socialMedia={socialMedia}
          setSocialMedia={setSocialMedia}
          phoneRows={phoneRows}
          setPhoneRows={setPhoneRows}
          emailRows={emailRows}
          setEmailRows={setEmailRows}
        />
      )}
    </div>
  );
};

/* ==========================================================
   ✅ SKELETON LOADER FOR OWNERS TABLE
========================================================== */
const OwnersSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      <table className="w-full">
        <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
          <tr>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Phone</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 6 }).map((_, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-6 py-4 flex justify-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


/* ==========================================================
   ✅ DELETE MODAL
========================================================== */
const DeleteModal = ({ language, onCancel, onDelete }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="text-red-500" />
        {language === "vi" ? "Xác nhận xóa" : "Confirm Delete"}
      </h3>

      <p className="mt-4 text-sm text-gray-600">
        {language === "vi"
          ? "Bạn có chắc muốn xóa?"
          : "Are you sure you want to delete this owner?"}
      </p>

      <div className="flex justify-end mt-6 gap-3">
        <button
          className="px-4 py-2 border rounded-full hover:bg-gray-100"
          onClick={onCancel}
        >
          {language === "vi" ? "Hủy" : "Cancel"}
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          onClick={onDelete}
        >
          {language === "vi" ? "Xóa" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

/* ==========================================================
   ✅ ADD / EDIT OWNER MODAL (EN/VI Dynamic UI)
========================================================== */
const AddEditOwnerModal = ({
  activeLang,
  setActiveLang,
  formData,
  setFormData,
  handleChange,
  handleSubmit,
  setShowModal,
  editMode,
  language,
  socialMedia,
  setSocialMedia,
  phoneRows,
  setPhoneRows,
  emailRows,
  setEmailRows,
}) => {

  /* ✅ UI LABELS + PLACEHOLDERS for EN/VI */
  const uiText = {
    EN: {
      modalTitleAdd: "New Owner",
      modalTitleEdit: "Edit Owner",
      name: "Owner Name",
      namePlaceholder: "Enter owner name",
      gender: "Gender",
      phone: "Phone Number",
      phonePlaceholder: "Enter phone number",
      email: "Email",
      emailPlaceholder: "Enter email address",
      social: "Social Media",
      socialIcon: "Icon Name",
      socialLink: "Social Link (EN)",
      notes: "Notes",
      notesPlaceholder: "Enter notes...",
      cancel: "Cancel",
      submitAdd: "Add",
      submitEdit: "Update",
    },
    VI: {
      modalTitleAdd: "Chủ sở hữu mới",
      modalTitleEdit: "Chỉnh sửa chủ sở hữu",
      name: "Tên chủ sở hữu",
      namePlaceholder: "Nhập tên chủ sở hữu",
      gender: "Giới tính",
      phone: "Số điện thoại",
      phonePlaceholder: "Nhập số điện thoại",
      email: "Email",
      emailPlaceholder: "Nhập email",
      social: "Mạng xã hội",
      socialIcon: "Tên icon",
      socialLink: "Liên kết MXH (VI)",
      notes: "Ghi chú",
      notesPlaceholder: "Nhập ghi chú...",
      cancel: "Hủy",
      submitAdd: "Thêm",
      submitEdit: "Cập nhật",
    },
  };

  const text = uiText[activeLang];

  const addSocialRow = () =>
    setSocialMedia([
      ...socialMedia,
      { iconName: "", link_en: "", link_vi: "" },
    ]);

  const updateSocialRow = (i, key, val) => {
    const next = [...socialMedia];
    next[i][key] = val;
    setSocialMedia(next);
  };

  const removeSocialRow = (i) =>
    setSocialMedia(
      socialMedia.length === 1
        ? [{ iconName: "", link_en: "", link_vi: "" }]
        : socialMedia.filter((_, x) => x !== i)
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex py-12 items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {editMode ? text.modalTitleEdit : text.modalTitleAdd}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="bg-[#41398B] text-white p-1 rounded-full cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* LANGUAGE TABS */}
        <div className="flex bg-gray-50 px-6">
          {["EN", "VI"].map((lng) => (
            <button
              key={lng}
              onClick={() => setActiveLang(lng)}
              className={`px-5 py-3 text-sm font-medium cursor-pointer ${activeLang === lng
                ? "border-b-2 border-[#41398B]"
                : "text-gray-500"
                }`}
            >
              {lng === "EN" ? "English (EN)" : "Tiếng Việt (VI)"}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* NAME */}
          <div className="mb-3">
            <label className="font-medium text-sm">{text.name}</label>
            <input
              type="text"
              placeholder={text.namePlaceholder}
              value={formData[`ownerName_${activeLang.toLowerCase()}`]}
              onChange={(e) =>
                handleChange(activeLang, "ownerName", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm mt-1"
            />
          </div>

          {/* GENDER */}
          <div className="mb-3">
            <label className="font-medium text-sm">{text.gender}</label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm mt-1 bg-white"
            >
              <option value="" disabled>
                {activeLang === "VI" ? "Chọn giới tính" : "Select Gender"}
              </option>
              <option value="Male">{activeLang === "VI" ? "Nam" : "Male"}</option>
              <option value="Female">{activeLang === "VI" ? "Nữ" : "Female"}</option>
              <option value="Other">{activeLang === "VI" ? "Khác" : "Other"}</option>
            </select>
          </div>



          {/* PHONE */}
          <div className="mb-3">
            <label className="font-medium text-sm">{text.phone}</label>

            {phoneRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-3">
                <input
                  type="text"
                  placeholder={text.phonePlaceholder}
                  value={row.number}
                  onChange={(e) => {
                    const next = [...phoneRows];
                    next[idx].number = e.target.value;
                    setPhoneRows(next);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-3 text-sm w-full"
                />

                {idx === phoneRows.length - 1 ? (
                  <CirclePlus
                    className="cursor-pointer"
                    size={22}
                    onClick={() =>
                      setPhoneRows([...phoneRows, { number: "" }])
                    }
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

          {/* SOCIAL */}
          <div className="mb-3">
            <label className="font-medium text-sm">{text.social}</label>

            {socialMedia.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-3">

                {/* Icon Name */}
                <input
                  type="text"
                  placeholder={text.socialIcon}
                  value={row.iconName}
                  onChange={(e) =>
                    updateSocialRow(idx, "iconName", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-3 text-sm w-1/2"
                />

                {/* Link */}
                <input
                  type="text"
                  placeholder={text.socialLink}
                  value={activeLang === "EN" ? row.link_en : row.link_vi}
                  onChange={(e) =>
                    updateSocialRow(
                      idx,
                      activeLang === "EN" ? "link_en" : "link_vi",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-3 text-sm w-1/2"
                />

                {idx === socialMedia.length - 1 ? (
                  <CirclePlus
                    size={22}
                    className="cursor-pointer"
                    onClick={addSocialRow}
                  />
                ) : (
                  <X
                    size={20}
                    className="cursor-pointer"
                    onClick={() => removeSocialRow(idx)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* NOTES */}
          <div className="mb-3">
            <label className="font-medium text-sm">{text.notes}</label>
            <textarea
              rows="3"
              placeholder={text.notesPlaceholder}
              value={formData[`ownerNotes_${activeLang.toLowerCase()}`]}
              onChange={(e) =>
                handleChange(activeLang, "ownerNotes", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm w-full mt-1"
            ></textarea>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-full hover:bg-gray-100 cursor-pointer"
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#41398B] text-white rounded-full cursor-pointer"
            >
              {editMode ? text.submitEdit : text.submitAdd}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnersLandlords;
