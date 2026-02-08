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
  createAvailabilityStatus,
  deleteAvailabilityStatus,
  updateAvailabilityStatus,
  getAllAvailabilityStatuses,
} from "../../../Api/action";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";
import { useLanguage } from "../../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function AvailabilityStatusPage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { language } = useLanguage();
  const isVI = language === "vi";

  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    code_en: "",
    code_vi: "",
    name_en: "",
    name_vi: "",
    status: "Active",
  });

  // ✅ Fetch all statuses
  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const res = await getAllAvailabilityStatuses();
      setStatuses(res.data.data || []);
    } catch {
      CommonToaster(
        isVI
          ? "Không thể tải danh sách trạng thái."
          : "Failed to load statuses.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const totalRows = statuses.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = statuses.slice(startIndex, endIndex);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Open modal for new
  const openAddModal = () => {
    setEditingStatus(null);
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

  // ✅ Open modal for edit
  const openEditModal = (status) => {
    setEditingStatus(status);
    setForm({
      code_en: status.code.en,
      code_vi: status.code.vi,
      name_en: status.name.en,
      name_vi: status.name.vi,
      status: status.status,
    });
    setActiveLang(language === "vi" ? "VI" : "EN");
    setShowModal(true);
  };

  // ✅ Submit Add/Edit
  // ✅ Submit Add/Edit
  const handleSubmit = async () => {
    if (!form.name_en || !form.name_vi) {
      CommonToaster(
        isVI
          ? "Vui lòng nhập đầy đủ trường tiếng Anh và tiếng Việt."
          : "Please fill all English and Vietnamese fields",
        "error"
      );
      return;
    }

    try {
      if (editingStatus) {
        await updateAvailabilityStatus(editingStatus._id, form);
        CommonToaster(
          isVI
            ? "Cập nhật trạng thái khả dụng thành công!"
            : "Availability Status updated successfully!",
          "success"
        );
      } else {
        await createAvailabilityStatus(form);
        CommonToaster(
          isVI
            ? "Thêm trạng thái khả dụng thành công!"
            : "Availability Status added successfully!",
          "success"
        );
      }

      setShowModal(false);
      fetchStatuses();
      setEditingStatus(null);

    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unknown error";

      // 🔥 FIXED duplicate name detection
      if (msg.toLowerCase().includes("availability status with this name")) {
        CommonToaster(
          isVI
            ? "Tên trạng thái khả dụng đã tồn tại."
            : "This Availability Status name already exists.",
          "error"
        );
        return;
      }

      CommonToaster(
        isVI ? "Không thể lưu dữ liệu." : "Failed to save data.",
        "error"
      );
    }
  };

  // ✅ Delete confirmation
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
  const handleDelete = async () => {
    try {
      await deleteAvailabilityStatus(deleteConfirm.id);
      CommonToaster("Deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchStatuses();
    } catch (error) {
      CommonToaster(
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isVI ? "Không thể xóa trạng thái." : "Failed to delete status."),
        "error"
      );
    }
  };

  // ✅ Toggle active/inactive
  const handleToggleStatus = async (status) => {
    const newStatus = status.status === "Active" ? "Inactive" : "Active";
    try {
      await updateAvailabilityStatus(status._id, { status: newStatus });
      CommonToaster(`Marked as ${newStatus}`, "success");
      fetchStatuses();
    } catch {
      CommonToaster("Failed to update status.", "error");
    }
  };

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-white to-[#f3f2ff]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-[#41398B] text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            {isVI ? "Trạng thái khả dụng" : "Availability Status"}
          </h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#41398B] hover:bg-[#41398be3] text-white px-4 py-2 rounded-full text-sm cursor-pointer"
        >
          <Plus size={16} />
          {isVI ? "Thêm trạng thái mới" : "Add Availability Status"}
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
                <th className="px-6 py-3 font-medium text-left">
                  {isVI ? "STT" : "S.no"}
                </th>
                <th className="px-6 py-3 font-medium text-left">
                  {isVI ? "Trạng thái" : "Availability Status"}
                </th>
                <th className="px-6 py-3 font-medium text-left">
                  {isVI ? "Tình trạng" : "Status"}
                </th>
                <th className="px-6 py-3 font-medium text-right">
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
                      } hover:bg-gray-100 transition`}
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

                    {/* ✅ Actions Dropdown */}
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
                            <Pencil size={14} className="mr-2 text-gray-800" />
                            {isVI ? "Chỉnh sửa" : "Edit"}
                          </button>

                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                            onClick={() => {
                              handleToggleStatus(row);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Eye size={14} className="mr-2 text-gray-800" />
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
      <div className="flex justify-end items-center px-6 py-3 bg-white mt-4 rounded-b-2xl text-sm text-gray-700">
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

      {/* Delete Confirm Modal */}
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
                ? "Bạn có chắc chắn muốn xóa trạng thái này? Hành động này không thể hoàn tác."
                : "Are you sure you want to delete this Availability Status? This action cannot be undone."}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingStatus
                  ? activeLang === "EN"
                    ? "Edit Availability Status"
                    : "Chỉnh sửa trạng thái khả dụng"
                  : activeLang === "EN"
                    ? "New Availability Status"
                    : "Thêm trạng thái khả dụng mới"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingStatus(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white"
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
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code_en"
                      placeholder="Type here"
                      value={form.code_en}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability Status<span className="text-red-500">*</span>
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
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code_vi"
                      placeholder="Nhập tại đây"
                      value={form.code_vi}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none"
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái khả dụng<span className="text-red-500">*</span>
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
                  setEditingStatus(null);
                }}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                {activeLang === "EN" ? "Cancel" : "Hủy"}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white transition cursor-pointer"
              >
                {editingStatus
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
