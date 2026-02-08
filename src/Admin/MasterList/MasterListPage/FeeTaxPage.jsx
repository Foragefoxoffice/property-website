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
  createFeeTax,
  deleteFeeTax,
  updateFeeTax,
  getAllFeeTax,
} from "../../../Api/action";

import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";
import { useLanguage } from "../../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function FeeTaxPage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { language } = useLanguage();
  const isVI = language === "vi";

  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // ✅ Pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name_en: "",
    name_vi: "",
    status: "Active",
  });

  // ✅ Load FeeTax records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await getAllFeeTax();
      setRecords(res.data.data || []);
    } catch {
      CommonToaster(
        isVI
          ? "Không thể tải danh sách phí / thuế."
          : "Failed to load Fee/Tax list.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // ✅ Pagination logic
  const totalRows = records.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleRows = records.slice(startIndex, endIndex);

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  // ✅ Input Change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Add / Edit
  const handleSubmit = async () => {
    if (!form.name_en || !form.name_vi) {
      CommonToaster(
        isVI
          ? "Vui lòng điền đầy đủ trường tiếng Anh & tiếng Việt."
          : "Please fill all English & Vietnamese fields.",
        "error"
      );
      return;
    }

    try {
      if (editingRecord) {
        await updateFeeTax(editingRecord._id, form);
        CommonToaster(
          isVI ? "Cập nhật thành công!" : "Fee/Tax updated successfully!",
          "success"
        );
      } else {
        await createFeeTax(form);
        CommonToaster(
          isVI ? "Thêm mới thành công!" : "Fee/Tax created successfully!",
          "success"
        );
      }

      setShowModal(false);
      setEditingRecord(null);

      setForm({
        name_en: "",
        name_vi: "",
        status: "Active",
      });

      fetchRecords();
      setCurrentPage(1);

    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unknown error";

      // ✅ FIXED — EXACT MATCH TO BACKEND
      if (
        msg.toLowerCase().includes("fee/tax with this name already exists") ||
        msg.toLowerCase().includes("fee tax with this name already exists") ||
        msg.toLowerCase().includes("fee/tax already exists") ||
        msg.toLowerCase().includes("fee tax already exists") ||
        msg.toLowerCase().includes("same name")
      ) {
        CommonToaster(
          isVI
            ? "Tên phí / thuế này đã tồn tại."
            : "This Fee/Tax name already exists.",
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


  // ✅ Edit
  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      name_en: record.name.en,
      name_vi: record.name.vi,
      status: record.status,
    });
    setActiveLang(language === "vi" ? "VI" : "EN");
    setShowModal(true);
  };

  // ✅ Delete
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });

  const handleDelete = async () => {
    try {
      await deleteFeeTax(deleteConfirm.id);
      CommonToaster(
        isVI ? "Xóa thành công!" : "Deleted successfully!",
        "success"
      );
      setDeleteConfirm({ show: false, id: null });
      fetchRecords();
    } catch (error) {
      CommonToaster(
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isVI ? "Không thể xóa." : "Failed to delete."),
        "error"
      );
    }
  };

  // ✅ Status Toggle
  const handleToggleStatus = async (record) => {
    const newStatus = record.status === "Active" ? "Inactive" : "Active";

    try {
      await updateFeeTax(record._id, { status: newStatus });

      CommonToaster(
        isVI
          ? newStatus === "Active"
            ? "Đã chuyển sang hoạt động"
            : "Đã chuyển sang không hoạt động"
          : `Marked as ${newStatus}`,
        "success"
      );

      fetchRecords();
    } catch {
      CommonToaster(
        isVI ? "Không thể cập nhật trạng thái." : "Status update failed.",
        "error"
      );
    }
  };

  return (
    <div className="p-8 min-h-screen relative">
      {/* ✅ Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-[#41398B] text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            {isVI ? "Phí và thuế" : "Fees & taxes"}
          </h2>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setEditingRecord(null);
            setActiveLang(language === "vi" ? "VI" : "EN");
          }}
          className="flex items-center gap-2 bg-[#41398B] hover:bg-[#41398be3] text-white px-4 py-2 rounded-full text-sm"
        >
          <Plus className="w-4 h-4" />
          {isVI ? "Thêm Phí và thuế" : "Add Fees & taxes"}
        </button>
      </div>

      {/* ✅ TABLE */}
      <div
        className={`transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"
          }`}
      >
        {loading ? (
          <CommonSkeleton rows={6} />
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">{isVI ? "STT" : "S.no"}</th>
                <th className="px-6 py-3 text-left">{isVI ? "Tên" : "Name"}</th>
                <th className="px-6 py-3 text-left">
                  {isVI ? "Trạng thái" : "Status"}
                </th>
                <th className="px-6 py-3 text-right">
                  {isVI ? "Hành động" : "Actions"}
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    {isVI ? "Không có dữ liệu" : "No records found"}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, i) => (
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

                    <td className="px-6 py-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-medium 
                          ${row.status === "Active"
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

                    {/* ✅ ACTIONS */}
                    <td className="px-6 py-3 text-right relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() =>
                          setOpenMenuIndex(openMenuIndex === i ? null : i)
                        }
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuIndex === i && (
                        <div className="absolute right-8 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-44 py-2">
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              handleEdit(row);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Pencil size={14} className="mr-2" />
                            {isVI ? "Chỉnh sửa" : "Edit"}
                          </button>

                          <button
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              handleToggleStatus(row);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Eye size={14} className="mr-2" />
                            {isVI
                              ? row.status === "Active"
                                ? "Đánh dấu không hoạt động"
                                : "Đánh dấu hoạt động"
                              : row.status === "Active"
                                ? "Mark as Inactive"
                                : "Mark as Active"}
                          </button>

                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-[#F04438] hover:bg-[#FFF2F2]"
                            onClick={() => {
                              confirmDelete(row._id);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
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

      {/* ✅ Pagination */}
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
              className="border rounded-md px-2 py-1"
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

      {/* ✅ Delete Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <div className="flex items-center mb-3">
              <AlertTriangle className="text-red-600 mr-2" />
              <h3 className="font-semibold">
                {isVI ? "Xác nhận xóa" : "Confirm Delete"}
              </h3>
            </div>

            <p className="text-sm mb-5">
              {isVI
                ? "Bạn có chắc muốn xóa mục này? Hành động này không thể hoàn tác."
                : "Are you sure you want to delete this? This action cannot be undone."}
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

      {/* ✅ Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-lg font-medium">
                {editingRecord
                  ? activeLang === "EN"
                    ? "Edit Fees & taxes"
                    : "Chỉnh sửa Phí và thuế"
                  : activeLang === "EN"
                    ? "New Fees & taxes"
                    : "Thêm Phí và thuế"}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRecord(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveLang("EN")}
                className={`py-3 font-medium ${activeLang === "EN"
                  ? "border-b-2 border-[#41398B] text-black"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                English (EN)
              </button>

              <button
                onClick={() => setActiveLang("VI")}
                className={`py-3 font-medium ${activeLang === "VI"
                  ? "border-b-2 border-[#41398B] text-black"
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
                    <label className="block text-sm font-medium mb-1">
                      Fees & taxes <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name_en"
                      value={form.name_en}
                      onChange={handleChange}
                      placeholder="Type here"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phí và thuế <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name_vi"
                      value={form.name_vi}
                      onChange={handleChange}
                      placeholder="Nhập tại đây"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRecord(null);
                }}
                className="px-5 py-2 border rounded-full hover:bg-gray-100"
              >
                {activeLang === "EN" ? "Cancel" : "Hủy"}
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#41398B] text-white rounded-full hover:bg-[#41398be3]"
              >
                {editingRecord
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
