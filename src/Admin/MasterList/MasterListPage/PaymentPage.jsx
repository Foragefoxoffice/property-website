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
  createPayment,
  deletePayment,
  updatePayment,
  getAllPayments,
} from "../../../Api/action";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";
import { useLanguage } from "../../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";
export default function PaymentPage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { language } = useLanguage();
  const isVI = language === "vi";

  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    name_en: "",
    name_vi: "",
    status: "Active",
  });

  // Fetch all
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPayments();
      setPayments(res.data.data || []);
    } catch {
      CommonToaster(
        isVI
          ? "Không thể tải danh sách thanh toán."
          : "Failed to load payments.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Pagination Calculations
  const totalRows = payments.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = payments.slice(startIndex, endIndex);

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Add / Edit
  const handleSubmit = async () => {
    if (!form.name_en || !form.name_vi) {
      CommonToaster("Please fill all English and Vietnamese fields", "error");
      return;
    }

    try {
      if (editingPayment) {
        await updatePayment(editingPayment._id, form);
        CommonToaster("Payment updated successfully", "success");
      } else {
        await createPayment(form);
        CommonToaster("Payment added successfully", "success");
      }

      setShowModal(false);
      setEditingPayment(null);
      fetchPayments();
      setForm({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        status: "Active",
      });
      setCurrentPage(1);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unknown error";

      console.log("PAYMENT ERROR:", msg);

      // 🔥 Duplicate name match
      if (
        msg.toLowerCase().includes("payment with this name already exists") ||
        msg.toLowerCase().includes("payment already exists") ||
        msg.toLowerCase().includes("payment name already exists") ||
        (msg.toLowerCase().includes("exist") && msg.toLowerCase().includes("name")) ||
        msg.toLowerCase().includes("duplicate")
      ) {
        CommonToaster(
          isVI
            ? "Tên phương thức thanh toán này đã tồn tại."
            : "This payment name already exists.",
          "error"
        );
        return;
      }

      CommonToaster(
        isVI ? "Không thể lưu phương thức thanh toán." : "Failed to save payment.",
        "error"
      );
    }

  };

  // Edit
  const handleEdit = (item) => {
    setEditingPayment(item);
    setForm({
      code_en: item.code.en,
      code_vi: item.code.vi,
      name_en: item.name.en,
      name_vi: item.name.vi,
      status: item.status,
    });
    setActiveLang(language === "vi" ? "VI" : "EN");
    setShowModal(true);
  };

  // Delete
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
  const handleDelete = async () => {
    try {
      await deletePayment(deleteConfirm.id);

      CommonToaster(
        isVI ? "Xóa thành công!" : "Deleted successfully!",
        "success"
      );

      setDeleteConfirm({ show: false, id: null });
      fetchPayments();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (isVI ? "Không thể xóa phương thức thanh toán." : "Failed to delete payment.");

      CommonToaster(msg, "error");
    }
  };
  // Toggle Status
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      await updatePayment(item._id, { status: newStatus });
      CommonToaster(
        isVI
          ? `Đã chuyển sang ${newStatus === "Active" ? "hoạt động" : "không hoạt động"
          }`
          : `Marked as ${newStatus}`,
        "success"
      );
      fetchPayments();
    } catch {
      CommonToaster("Failed to update status", "error");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-white to-[#f3f2ff]">
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
            {isVI ? "Thanh toán" : "Payment"}
          </h2>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setActiveLang(language === "vi" ? "VI" : "EN");
          }}
          className="flex cursor-pointer items-center gap-2 bg-[#41398B] hover:bg-[#41398be3] text-white px-4 py-2 rounded-full text-sm"
        >
          <Plus size={16} />
          {isVI ? "Thêm phương thức" : "Add Payment"}
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
                <th className="px-6 py-3 text-left">{isVI ? "STT" : "S.no"}</th>
                <th className="px-6 py-3 text-left">
                  {isVI ? "Phương thức" : "Payment Name"}
                </th>
                <th className="px-6 py-3 text-left">
                  {isVI ? "Trạng thái" : "Status"}
                </th>
                <th className="px-6 py-3 text-right">
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
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                          }`}
                      >
                        {isVI
                          ? row.status === "Active"
                            ? "Đang hoạt động"
                            : "Không hoạt động"
                          : row.status}
                      </span>
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
                        <div className="absolute right-8 top-10 bg-white border border-gray-200 rounded-lg shadow-lg w-44 py-2 z-50">
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleEdit(row);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            {isVI ? "Chỉnh sửa" : "Edit"}
                          </button>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              handleToggleStatus(row);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {row.status === "Active"
                              ? isVI
                                ? "Đánh dấu là không hoạt động"
                                : "Mark as Inactive"
                              : isVI
                                ? "Đánh dấu là hoạt động"
                                : "Mark as Active"}
                          </button>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              confirmDelete(row._id);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />{" "}
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

          <div className="flex items-center gap-2">
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

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                {isVI ? "Xác nhận xóa" : "Confirm Deletion"}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              {isVI
                ? "Bạn có chắc chắn muốn xóa phương thức thanh toán này?"
                : "Are you sure you want to delete this payment method?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
              >
                {isVI ? "Hủy" : "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
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
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingPayment
                  ? activeLang === "EN"
                    ? "Edit Payment"
                    : "Chỉnh sửa thanh toán"
                  : activeLang === "EN"
                    ? "New Payment"
                    : "Thêm phương thức thanh toán"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPayment(null);
                }}
                className="w-8 cursor-pointer h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white"
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
                      Payment Name<span className="text-red-500">*</span>
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
                      Tên phương thức thanh toán
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_vi"
                      placeholder="Nhập tại đây"
                      value={form.name_vi}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring                       focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end items-center gap-3 px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPayment(null);
                }}
                className="px-5 py-2 cursor-pointer rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                {activeLang === "EN" ? "Cancel" : "Hủy"}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 cursor-pointer rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white transition"
              >
                {editingPayment
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
