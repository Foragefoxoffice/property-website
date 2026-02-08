import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  X,
  Pencil,
  Eye,
  Trash2,
  AlertTriangle,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Star,
} from "lucide-react";
import {
  getAllCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  markCurrencyAsDefault,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { useLanguage } from "../../Language/LanguageContext";

export default function Currency({ goBack }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isVI = language === "vi";

  // Use provided goBack or navigate to masters page
  const handleGoBack = () => {
    if (goBack && typeof goBack === "function") {
      goBack();
    } else {
      navigate("/dashboard/masters");
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [currencyOptions, setCurrencyOptions] = useState([]);

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    code_en: "",
    code_vi: "",
    name_en: "",
    name_vi: "",
    symbol_en: "",
    symbol_vi: "",
    status: "Active",
  });

  // Fetch currencies
  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const res = await getAllCurrencies();
      setCurrencies(res.data.data || []);
    } catch {
      CommonToaster(
        isVI
          ? "Không thể tải danh sách tiền tệ."
          : "Failed to load currencies.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch currency list from API
  const fetchCurrencyList = async () => {
    try {
      const res = await fetch(
        "https://v6.exchangerate-api.com/v6/49143fe10e6464ddc9170966/codes"
      );
      const data = await res.json();
      if (data.supported_codes) setCurrencyOptions(data.supported_codes);
    } catch {
      CommonToaster(
        isVI
          ? "Không thể tải danh sách mã tiền tệ."
          : "Failed to fetch currency codes.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchCurrencies();
    fetchCurrencyList();
  }, []);

  // Pagination
  const totalRows = currencies.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = currencies.slice(startIndex, endIndex);

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-sync code and symbol fields between EN and VI
    if (name === 'code_en') {
      setForm({ ...form, code_en: value, code_vi: value });
    } else if (name === 'code_vi') {
      setForm({ ...form, code_vi: value, code_en: value });
    } else if (name === 'symbol_en') {
      setForm({ ...form, symbol_en: value, symbol_vi: value });
    } else if (name === 'symbol_vi') {
      setForm({ ...form, symbol_vi: value, symbol_en: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Save
  const handleSubmit = async () => {
    const { code_en, code_vi, name_en, name_vi, symbol_en, symbol_vi } = form;
    if (
      !code_en ||
      !code_vi ||
      !name_en ||
      !name_vi ||
      !symbol_en ||
      !symbol_vi
    ) {
      CommonToaster(
        isVI
          ? "Vui lòng điền đầy đủ tất cả các trường tiếng Anh và tiếng Việt."
          : "Please fill all English and Vietnamese fields.",
        "error"
      );
      return;
    }

    try {
      if (editingCurrency) {
        await updateCurrency(editingCurrency._id, form);
        CommonToaster(
          isVI
            ? "Cập nhật tiền tệ thành công!"
            : "Currency updated successfully!",
          "success"
        );
      } else {
        await createCurrency(form);
        CommonToaster(
          isVI ? "Thêm tiền tệ thành công!" : "Currency added successfully!",
          "success"
        );
      }
      setShowModal(false);
      setEditingCurrency(null);
      setForm({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        symbol_en: "",
        symbol_vi: "",
        status: "Active",
      });
      fetchCurrencies();
      setCurrentPage(1);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unknown error";

      console.log("CURRENCY ERROR:", msg);

      // 🔥 Duplicate currency code
      if (
        msg.toLowerCase().includes("currency code already exists") ||
        (msg.toLowerCase().includes("exists") && msg.toLowerCase().includes("code"))
      ) {
        CommonToaster(
          isVI
            ? "Mã tiền tệ này đã tồn tại."
            : "This currency code already exists.",
          "error"
        );
        return;
      }

      // 🔥 Duplicate currency name
      if (
        msg.toLowerCase().includes("currency with this name already exists") ||
        (msg.toLowerCase().includes("exists") && msg.toLowerCase().includes("name"))
      ) {
        CommonToaster(
          isVI
            ? "Tên tiền tệ này đã tồn tại."
            : "This currency name already exists.",
          "error"
        );
        return;
      }

      // ❌ Fallback error
      CommonToaster(
        isVI ? "Không thể lưu dữ liệu." : "Failed to save data.",
        "error"
      );
    }
  };

  // Edit
  const handleEdit = (currency) => {
    setEditingCurrency(currency);
    setForm({
      code_en: currency.currencyCode.en,
      code_vi: currency.currencyCode.vi,
      name_en: currency.currencyName.en,
      name_vi: currency.currencyName.vi,
      symbol_en: currency.currencySymbol.en,
      symbol_vi: currency.currencySymbol.vi,
      status: currency.status,
    });
    setActiveLang(language === "vi" ? "VI" : "EN");
    setShowModal(true);
  };

  // Delete
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
  const handleDelete = async () => {
    try {
      await deleteCurrency(deleteConfirm.id);
      CommonToaster(
        isVI ? "Xóa thành công!" : "Deleted successfully!",
        "success"
      );
      setDeleteConfirm({ show: false, id: null });
      fetchCurrencies();
    } catch {
      CommonToaster(
        isVI ? "Không thể xóa tiền tệ." : "Failed to delete currency.",
        "error"
      );
    }
  };

  // Toggle status
  const handleToggleStatus = async (currency) => {
    const newStatus = currency.status === "Active" ? "Inactive" : "Active";
    try {
      await updateCurrency(currency._id, { status: newStatus });
      CommonToaster(
        isVI
          ? `Đã chuyển sang ${newStatus === "Active" ? "hoạt động" : "không hoạt động"
          }`
          : `Marked as ${newStatus}`,
        "success"
      );
      fetchCurrencies();
    } catch {
      CommonToaster(
        isVI ? "Không thể cập nhật trạng thái." : "Failed to update status.",
        "error"
      );
    }
  };

  // Mark default
  const handleMarkDefault = async (currency) => {
    try {
      if (currency.isDefault) {
        await markCurrencyAsDefault(currency._id);
        CommonToaster(
          isVI
            ? "Đã bỏ đánh dấu là tiền tệ mặc định!"
            : "Unmarked as default successfully!",
          "success"
        );
      } else {
        await markCurrencyAsDefault(currency._id);
        CommonToaster(
          isVI
            ? "Đã đặt làm tiền tệ mặc định thành công!"
            : "Marked as default successfully!",
          "success"
        );
      }
      fetchCurrencies();
    } catch {
      CommonToaster(
        isVI
          ? "Không thể thay đổi trạng thái mặc định."
          : "Failed to toggle default status.",
        "error"
      );
    }
  };

  return (
    <div className="p-8 min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] cursor-pointer hover:bg-[#41398be3] text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            {isVI ? "Tiền tệ" : "Currency Master"}
          </h2>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingCurrency(null);
            setForm({
              code_en: "",
              code_vi: "",
              name_en: "",
              name_vi: "",
              symbol_en: "",
              symbol_vi: "",
              status: "Active",
            });
            setActiveLang(language === "vi" ? "VI" : "EN");
          }}
          className="flex items-center gap-2 bg-[#41398B] cursor-pointer hover:bg-[#41398be3] text-white px-4 py-2 rounded-full text-sm"
        >
          <Plus size={16} />
          {isVI ? "Thêm tiền tệ" : "Add Currency"}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <CommonSkeleton rows={6} />
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-medium">
                {isVI ? "STT" : "S.no"}
              </th>
              <th className="px-6 py-3 text-left font-medium">
                {isVI ? "Tên tiền tệ" : "Currency Name"}
              </th>
              <th className="px-6 py-3 text-left font-medium">
                {isVI ? "Ký hiệu" : "Symbol"}
              </th>
              <th className="px-6 py-3 text-left font-medium">
                {isVI ? "Trạng thái" : "Status"}
              </th>
              <th className="px-6 py-3 text-right font-medium">
                {isVI ? "Hành động" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  {isVI ? "Không có dữ liệu." : "No records found."}
                </td>
              </tr>
            ) : (
              visibleData.map((row, i) => (
                <tr
                  key={i}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                >
                  <td className="px-6 py-3">
                    {startIndex + i + 1}
                  </td>
                  <td className="px-6 py-3">
                    {isVI ? row.currencyName.vi : row.currencyName.en}
                  </td>
                  <td className="px-6 py-3">
                    {isVI ? row.currencySymbol.vi : row.currencySymbol.en}
                  </td>
                  <td className="px-6 py-3 flex items-center gap-2">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-medium ${row.status === "Active"
                        ? "bg-[#E8FFF0] text-[#12B76A]"
                        : "bg-[#FFE8E8] text-[#F04438]"
                        }`}
                    >
                      {isVI
                        ? row.status === "Active"
                          ? "Đang hoạt động"
                          : "Không hoạt động"
                        : row.status}
                    </span>
                    {row.isDefault && (
                      <Star size={16} className="text-yellow-400" />
                    )}
                  </td>
                  <td className="px-6 py-3 text-right relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100"
                      onClick={() =>
                        setOpenMenuIndex(openMenuIndex === i ? null : i)
                      }
                    >
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>

                    {openMenuIndex === i && (
                      <div className="absolute right-8 top-10 bg-white border border-[#E5E5E5] rounded-xl shadow-md z-50 w-44 py-2">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                          onClick={() => {
                            handleEdit(row);
                            setOpenMenuIndex(null);
                          }}
                        >
                          <Pencil size={14} className="mr-2" />
                          {isVI ? "Chỉnh sửa" : "Edit"}
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                          onClick={() => {
                            handleToggleStatus(row);
                            setOpenMenuIndex(null);
                          }}
                        >
                          <Eye size={14} className="mr-2" />
                          {row.status === "Active"
                            ? isVI
                              ? "Đánh dấu là không hoạt động"
                              : "Mark as Inactive"
                            : isVI
                              ? "Đánh dấu là hoạt động"
                              : "Mark as Active"}
                        </button>
                        <button
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 ${row.isDefault ? "text-red-600" : "text-gray-800"
                            }`}
                          onClick={() => {
                            handleMarkDefault(row);
                            setOpenMenuIndex(null);
                          }}
                        >
                          <Star
                            size={14}
                            className={`mr-2 ${row.isDefault ? "text-red-500" : "text-gray-600"}`}
                          />
                          {row.isDefault
                            ? isVI
                              ? "Bỏ đánh dấu là mặc định"
                              : "Unmark as Default"
                            : isVI
                              ? "Đặt làm mặc định"
                              : "Mark as Default"}
                        </button>

                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-[#F04438] hover:bg-[#FFF2F2]"
                          onClick={() => {
                            confirmDelete(row._id);
                            setOpenMenuIndex(null);
                          }}
                        >
                          <Trash2 size={14} className="mr-2 text-[#F04438]" />{" "}
                          {isVI ? "Xóa" : "Delete"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* ✅ Pagination */}
      <div className="flex justify-end items-center px-6 py-3 bg-white rounded-b-2xl text-sm text-gray-700 mt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>{isVI ? "Số hàng mỗi trang:" : "Rows per page:"}</span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <span>
            {totalRows === 0
              ? "0–0"
              : `${startIndex + 1}–${endIndex} ${isVI ? "trên" : "of"
              } ${totalRows}`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={goToFirst} disabled={currentPage === 1}>
              <ChevronsLeft size={16} />
            </button>
            <button onClick={goToPrev} disabled={currentPage === 1}>
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages || totalRows === 0}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={goToLast}
              disabled={currentPage === totalPages || totalRows === 0}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <div className="flex items-center mb-3">
              <AlertTriangle className="text-red-600 mr-2" />
              <h3 className="font-semibold text-gray-800">
                {isVI ? "Xác nhận xóa" : "Confirm Deletion"}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              {isVI
                ? "Bạn có chắc chắn muốn xóa tiền tệ này? Hành động này không thể hoàn tác."
                : "Are you sure you want to delete this currency? This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 border rounded-full hover:bg-gray-100"
              >
                {isVI ? "Hủy" : "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                {isVI ? "Xóa" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingCurrency
                  ? activeLang === "EN"
                    ? "Edit Currency"
                    : "Chỉnh sửa tiền tệ"
                  : activeLang === "EN"
                    ? "New Currency"
                    : "Thêm tiền tệ mới"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCurrency(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] cursor-pointer hover:bg-[#41398be3] text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-start gap-8 px-6">
              <button
                onClick={() => setActiveLang("EN")}
                className={`py-3 font-medium transition-all ${activeLang === "EN"
                  ? "text-black border-b-2 border-[#41398B]"
                  : "text-gray-500 hover:text-[#41398B]"
                  }`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setActiveLang("VI")}
                className={`py-3 font-medium transition-all ${activeLang === "VI"
                  ? "text-black border-b-2 border-[#41398B]"
                  : "text-gray-500 hover:text-[#41398B]"
                  }`}
              >
                Tiếng Việt (VI)
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeLang === "EN" ? "Currency Name" : "Tên tiền tệ"}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name={`name_${activeLang.toLowerCase()}`}
                  value={form[`name_${activeLang.toLowerCase()}`]}
                  onChange={(e) => {
                    const selectedText = e.target.value;
                    const match = currencyOptions.find(
                      ([code, name]) => `${name} (${code})` === selectedText
                    );
                    if (match) {
                      const [code, name] = match;
                      setForm((prev) => ({
                        ...prev,
                        [`name_${activeLang.toLowerCase()}`]: `${name} (${code})`,
                        // Sync code to both EN and VI
                        code_en: code,
                        code_vi: code,
                      }));
                    } else {
                      handleChange(e);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">
                    {activeLang === "EN" ? "Select" : "Chọn"}
                  </option>
                  {currencyOptions.map(([code, name]) => {
                    const displayValue = `${name} (${code})`;
                    return (
                      <option key={code} value={displayValue}>
                        {displayValue}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeLang === "EN" ? "Code" : "Mã"}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name={`code_${activeLang.toLowerCase()}`}
                  value={form[`code_${activeLang.toLowerCase()}`]}
                  onChange={handleChange}
                  placeholder={
                    activeLang === "EN" ? "Type here" : "Nhập tại đây"
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeLang === "EN" ? "Currency Symbol" : "Ký hiệu tiền tệ"}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name={`symbol_${activeLang.toLowerCase()}`}
                  value={form[`symbol_${activeLang.toLowerCase()}`]}
                  onChange={handleChange}
                  placeholder={
                    activeLang === "EN" ? "Type here" : "Nhập tại đây"
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCurrency(null);
                }}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {activeLang === "EN" ? "Cancel" : "Hủy"}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-[#41398B] cursor-pointer hover:bg-[#41398be3] text-white"
              >
                {editingCurrency
                  ? activeLang === "EN"
                    ? "Update"
                    : "Cập nhật"
                  : activeLang === "EN"
                    ? "Add"
                    : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
