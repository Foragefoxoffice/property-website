import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  createPropertyType,
  deletePropertyType,
  updatePropertyType,
  getAllPropertyTypes,
} from "../../../Api/action";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";
import { useLanguage } from "../../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function PropertyTypePage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { language } = useLanguage();
  const isVI = language === "vi";

  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name_en: "",
    name_vi: "",
    status: "Active",
  });

  // ✅ Fetch Property Types
  const fetchPropertyTypes = async () => {
    try {
      setLoading(true);
      const res = await getAllPropertyTypes();
      setTypes(res.data.data || []);
    } catch {
      CommonToaster(
        isVI
          ? "Không thể tải danh sách loại tài sản."
          : "Failed to load Property Types.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  // Pagination
  const totalRows = types.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = types.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalRows, totalPages]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Open Add/Edit Modals
  const openAddModal = () => {
    setEditingType(null);
    setForm({
      code_en: "",
      code_vi: "",
      name_en: "",
      name_vi: "",
      status: "Active",
    });
    setActiveLang(language === "vi" ? "VI" : "EN");
    setShowModal(true);
  };

  const openEditModal = (type) => {
    setEditingType(type);
    setForm({
      name_en: type.name.en,
      name_vi: type.name.vi,
      status: type.status,
    });
    setActiveLang(language === "vi" ? "VI" : "EN");
    setShowModal(true);
  };

  // ✅ Submit Add/Edit
  const handleSubmit = async () => {
    if (!form.name_en || !form.name_vi) {
      CommonToaster("Please fill all English and Vietnamese fields", "error");
      return;
    }
    try {
      if (editingType) {
        await updatePropertyType(editingType._id, form);
        CommonToaster("Property Type updated successfully", "success");
      } else {
        await createPropertyType(form);
        CommonToaster("Property Type added successfully", "success");
      }
      setShowModal(false);
      fetchPropertyTypes();
      setEditingType(null);
    } catch {
      CommonToaster("Failed to save data.", "error");
    }
  };

  // ✅ Delete
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
  const handleDelete = async () => {
    try {
      await deletePropertyType(deleteConfirm.id);
      CommonToaster(
        isVI ? "Xóa thành công!" : "Deleted successfully!",
        "success"
      );
      setDeleteConfirm({ show: false, id: null });
      fetchPropertyTypes();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isVI
          ? "Không thể xóa loại tài sản."
          : "Failed to delete Property Type.");

      CommonToaster(msg, "error");
    }
  };


  // ✅ Toggle Status
  const handleToggleStatus = async (type) => {
    const newStatus = type.status === "Active" ? "Inactive" : "Active";
    try {
      await updatePropertyType(type._id, { status: newStatus });
      CommonToaster(
        isVI
          ? `Đã chuyển sang ${newStatus === "Active" ? "hoạt động" : "không hoạt động"
          }`
          : `Marked as ${newStatus}`,
        "success"
      );
      fetchPropertyTypes();
    } catch {
      CommonToaster("Failed to update status.", "error");
    }
  };

  // Pagination
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  return (
    <div className="p-8 min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-[#41398B] text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            {isVI ? "Loại tài sản" : "Property Type"}
          </h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center cursor-pointer gap-2 bg-[#41398B] hover:bg-[#41398be3] text-white px-4 py-2 rounded-full text-sm"
        >
          <Plus size={16} />
          {isVI ? "Thêm loại tài sản" : "Add Property Type"}
        </button>
      </div>

      {/* Table */}
      <div
        className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"
          }`}
      >
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
                  {isVI ? "Loại tài sản" : "Property Type"}
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  {isVI ? "Tình trạng" : "Status"}
                </th>
                <th className="px-6 py-3 text-right font-medium">
                  {isVI ? "Hành động" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
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
                      {isVI ? row.name.vi : row.name.en}
                    </td>

                    {/* ✅ Status Badge */}
                    <td className="px-6 py-3">
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
                    </td>

                    {/* ✅ Dropdown Actions */}
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
                              openEditModal(row);
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
                            className="flex items-center w-full px-4 py-2 text-sm text-[#F04438] hover:bg-[#FFF2F2]"
                            onClick={() => {
                              confirmDelete(row._id);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Trash2 size={14} className="mr-2 text-[#F04438]" />
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
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center px-6 py-3 bg-white rounded-b-2xl text-sm text-gray-700 mt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>{isVI ? "Số hàng mỗi trang:" : "Rows per page:"}</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-md px-2 py-1 text-gray-700"
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

      {/* ✅ Delete Confirm Modal */}
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
                ? "Bạn có chắc chắn muốn xóa loại tài sản này? Hành động này không thể hoàn tác."
                : "Are you sure you want to delete this Property Type? This action cannot be undone."}
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

      {/* ✅ Add/Edit Modal with Tabs */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingType
                  ? activeLang === "EN"
                    ? "Edit Property Type"
                    : "Chỉnh sửa loại tài sản"
                  : activeLang === "EN"
                    ? "New Property Type"
                    : "Thêm loại tài sản mới"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingType(null);
                }}
                className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white"
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
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setActiveLang("VI")}
                className={`py-3 font-medium transition-all ${activeLang === "VI"
                  ? "text-black border-b-2 border-[#41398B]"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                Tiếng Việt (VI)
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {activeLang === "EN" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      placeholder="Type here"
                      value={form.name_en}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại tài sản<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_vi"
                      placeholder="Nhập tại đây"
                      value={form.name_vi}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingType(null);
                }}
                className="px-5 py-2 cursor-pointer rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {activeLang === "EN" ? "Cancel" : "Hủy"}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 cursor-pointer rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white"
              >
                {editingType
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
