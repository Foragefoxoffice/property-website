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
  getAllBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  getAllProperties,
  getAllZoneSubAreas,
} from "../../../Api/action";
import { Select as AntdSelect } from "antd";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";
import { useLanguage } from "../../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function BlockPage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { language } = useLanguage();
  const isVI = language === "vi";

  const [showModal, setShowModal] = useState(false);
  const [activeLang, setActiveLang] = useState("EN");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // ✅ Pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useState([]);
  const [zones, setZones] = useState([]);
  useEffect(() => {
    getAllProperties().then((res) => setProperties(res.data.data));
  }, []);

  const [form, setForm] = useState({
    name_en: "",
    name_vi: "",
    status: "Active",
    property: "",
    zone: "",
  });

  // ✅ Fetch Blocks
  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await getAllBlocks();
      setBlocks(res.data.data || []);
    } catch {
      CommonToaster(
        isVI ? "Không thể tải danh sách khối." : "Failed to load block list.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handlePropertySelect = (propertyId) => {
    const selectedProperty = properties.find(p => p._id === propertyId);

    setForm({
      ...form,
      property: propertyId,
      zone: ""
    });

    // ⬇️ Set zones from property.zones
    setZones(selectedProperty?.zones || []);
  };


  // ✅ Sort Blocks for grouping
  const sortedBlocks = [...blocks].sort((a, b) => {
    const projA = (isVI ? a.property?.name?.vi : a.property?.name?.en) || "";
    const projB = (isVI ? b.property?.name?.vi : b.property?.name?.en) || "";
    if (projA < projB) return -1;
    if (projA > projB) return 1;

    const zoneA = (isVI ? a.zone?.name?.vi : a.zone?.name?.en) || "";
    const zoneB = (isVI ? b.zone?.name?.vi : b.zone?.name?.en) || "";
    if (zoneA < zoneB) return -1;
    if (zoneA > zoneB) return 1;

    const blockA = (isVI ? a.name.vi : a.name.en) || "";
    const blockB = (isVI ? b.name.vi : b.name.en) || "";
    return blockA.localeCompare(blockB);
  });

  // ✅ Pagination Calculations
  const totalRows = sortedBlocks.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const visibleData = sortedBlocks.slice(startIndex, endIndex);

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  // ✅ Input Change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Add / Edit Submit
  const handleSubmit = async () => {
    if (!form.name_en || !form.name_vi) {
      CommonToaster("Please fill all English and Vietnamese fields", "error");
      return;
    }

    try {
      if (editingBlock) {
        await updateBlock(editingBlock._id, form);
        CommonToaster(
          isVI ? "Cập nhật thành công!" : "Block updated successfully!",
          "success"
        );
      } else {
        await createBlock({
          ...form,
          property: form.property,
          zone: form.zone,
        });
        CommonToaster(
          isVI ? "Thêm khối thành công!" : "Block added successfully!",
          "success"
        );
      }

      setShowModal(false);
      setEditingBlock(null);
      setForm({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        status: "Active",
        property: "",
        zone: "",
      });
      setZones([]);
      fetchBlocks();
      setCurrentPage(1);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unknown error";

      console.log("BLOCK ERROR:", msg);

      // 🔥 Duplicate detection (CREATE + UPDATE)
      if (
        msg.toLowerCase().includes("block with this name already exists") ||
        msg.toLowerCase().includes("another block with this name already exists") ||
        (msg.toLowerCase().includes("exists") && msg.toLowerCase().includes("block")) ||
        msg.toLowerCase().includes("duplicate")
      ) {
        CommonToaster(
          isVI
            ? "Tên khối này đã tồn tại trong khu vực đã chọn."
            : "This block name already exists in the selected Zone.",
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

  const handleEdit = async (block) => {
    setEditingBlock(block);

    const selectedProperty = properties.find(
      p => p._id === block.property?._id
    );

    // ⬇️ load zones from property.zones
    setZones(selectedProperty?.zones || []);

    setForm({
      name_en: block.name.en,
      name_vi: block.name.vi,
      status: block.status,
      property: block.property?._id || "",
      zone: block.zone?._id || "",
    });

    setActiveLang(language === "vi" ? "VI" : "EN");
    setShowModal(true);
  };

  // ✅ Delete
  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });

  const handleDelete = async () => {
    try {
      await deleteBlock(deleteConfirm.id);
      CommonToaster(
        isVI ? "Xóa thành công!" : "Deleted successfully!",
        "success"
      );
      setDeleteConfirm({ show: false, id: null });
      fetchBlocks();
    } catch (error) {
      CommonToaster(
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isVI ? "Không thể xóa khối." : "Failed to delete block."),
        "error"
      );
    }
  };

  // ✅ Toggle Status
  const handleToggleStatus = async (block) => {
    const newStatus = block.status === "Active" ? "Inactive" : "Active";
    try {
      await updateBlock(block._id, { status: newStatus });
      CommonToaster(
        isVI
          ? `Đã chuyển sang ${newStatus === "Active" ? "hoạt động" : "không hoạt động"
          }`
          : `Marked as ${newStatus}`,
        "success"
      );
      fetchBlocks();
    } catch {
      CommonToaster(
        isVI ? "Không thể cập nhật trạng thái." : "Failed to update status.",
        "error"
      );
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-white to-[#f3f2ff]">
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
            {isVI ? "Tên Khối" : "Block Name"}
          </h2>
        </div>

        <button
          onClick={() => {
            setEditingBlock(null);
            setForm({
              name_en: "",
              name_vi: "",
              status: "Active",
              property: "",
              zone: "",
            });

            setZones([]);
            setActiveLang(language === "vi" ? "VI" : "EN");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#41398B] cursor-pointer
          hover:bg-[#41398be3] text-white px-4 py-2 rounded-full text-sm"
        >
          <Plus size={18} />
          {isVI ? "Thêm khối" : "Add Block"}
        </button>
      </div>

      {/* ✅ Table */}
      <div className={`${loading ? "opacity-50" : "opacity-100"}`}>
        {loading ? (
          <CommonSkeleton rows={6} />
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-medium">
                  {isVI ? "Dự án / Cộng đồng" : "Project / Community"}
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  {isVI ? "Khu vực/Khu vực" : " Area /Zone"}
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  {isVI ? "Tên khối" : "Block Name"}
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
                  <td colSpan="4" className="py-6 text-center text-gray-500">
                    {isVI ? "Không có dữ liệu." : "No records found."}
                  </td>
                </tr>
              ) : (
                visibleData.map((row, i) => {
                  const currentProject = isVI ? row.property?.name?.vi : row.property?.name?.en;
                  const prevProject = i > 0 ? (isVI ? visibleData[i - 1]?.property?.name?.vi : visibleData[i - 1]?.property?.name?.en) : null;
                  const showProject = i === 0 || currentProject !== prevProject;

                  const currentZone = isVI ? row.zone?.name?.vi : row.zone?.name?.en;
                  const prevZone = i > 0 ? (isVI ? visibleData[i - 1]?.zone?.name?.vi : visibleData[i - 1]?.zone?.name?.en) : null;
                  const showZone = i === 0 || currentZone !== prevZone || showProject;

                  return (
                    <tr
                      key={i}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100`}
                    >
                      <td className="px-6 py-3">
                        {showProject ? currentProject : ""}
                      </td>
                      <td className="px-6 py-3">
                        {showZone ? currentZone : ""}
                      </td>
                      <td className="px-6 py-3">
                        {isVI ? row.name.vi : row.name.en}
                      </td>
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
                          <div
                            className="absolute right-8 top-10 bg-white border 
                          border-gray-200 rounded-xl shadow-lg z-50 w-44 py-2"
                          >
                            <button
                              className="flex items-center w-full px-4 py-2 
                            text-sm text-gray-800 hover:bg-gray-50"
                              onClick={() => {
                                handleEdit(row);
                                setOpenMenuIndex(null);
                              }}
                            >
                              <Pencil size={14} className="mr-2" />{" "}
                              {isVI ? "Chỉnh sửa" : "Edit"}
                            </button>

                            <button
                              className="flex items-center w-full px-4 py-2 
                            text-sm text-gray-800 hover:bg-gray-50"
                              onClick={() => {
                                handleToggleStatus(row);
                                setOpenMenuIndex(null);
                              }}
                            >
                              <Eye size={14} className="mr-2" />{" "}
                              {row.status === "Active"
                                ? isVI
                                  ? "Đánh dấu không hoạt động"
                                  : "Mark as Inactive"
                                : isVI
                                  ? "Đánh dấu hoạt động"
                                  : "Mark as Active"}
                            </button>

                            <button
                              className="flex items-center w-full px-4 py-2 
                            text-sm text-[#F04438] hover:bg-[#FFF2F2]"
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
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Pagination */}
      <div className="flex justify-end items-center px-6 py-3 bg-white rounded-b-2xl text-sm mt-4">
        <div className="flex items-center gap-6">
          {/* Rows per page */}
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
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Showing X of Y */}
          <span>
            {totalRows === 0
              ? "0–0"
              : `${startIndex + 1}–${endIndex} ${isVI ? "trên" : "of"
              } ${totalRows}`}
          </span>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={goToFirst}>
              <ChevronsLeft size={16} />
            </button>

            <button disabled={currentPage === 1} onClick={goToPrev}>
              <ChevronLeft size={16} />
            </button>

            <button disabled={currentPage === totalPages} onClick={goToNext}>
              <ChevronRight size={16} />
            </button>

            <button disabled={currentPage === totalPages} onClick={goToLast}>
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Delete Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center mb-3">
              <AlertTriangle className="text-red-600 mr-2" />
              <h3 className="font-semibold text-gray-800">
                {isVI ? "Xác nhận xóa" : "Confirm Deletion"}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              {isVI
                ? "Bạn có chắc muốn xóa khối này?"
                : "Are you sure you want to delete this block?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 rounded-full border hover:bg-gray-100"
              >
                {isVI ? "Hủy" : "Cancel"}
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
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
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingBlock
                  ? activeLang === "EN"
                    ? "Edit Block"
                    : "Chỉnh sửa khối"
                  : activeLang === "EN"
                    ? "New Block"
                    : "Thêm khối mới"}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBlock(null);
                }}
                className="w-8 h-8 rounded-full bg-[#41398B] 
                hover:bg-[#41398be3] text-white flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveLang("EN")}
                className={`py-3 font-medium ${activeLang === "EN"
                  ? "border-b-2 border-[#41398B]"
                  : "text-gray-500 hover:text-black"
                  }`}
              >
                English (EN)
              </button>

              <button
                onClick={() => setActiveLang("VI")}
                className={`py-3 font-medium ${activeLang === "VI"
                  ? "border-b-2 border-[#41398B]"
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
                    <label>Project / Community</label>
                    <AntdSelect
                      style={{ marginTop: 7 }}
                      showSearch
                      allowClear
                      placeholder={isVI ? "Chọn dự án" : "Select Project"}
                      value={form.property || undefined}
                      onChange={(value) => handlePropertySelect(value)}
                      className="w-full custom-select"
                      popupClassName="custom-dropdown"
                      optionFilterProp="children"
                    >
                      {properties.map((p) => (
                        <AntdSelect.Option key={p._id} value={p._id}>
                          {isVI ? p.name?.vi : p.name?.en}
                        </AntdSelect.Option>
                      ))}
                    </AntdSelect>

                  </div>
                  <div>
                    <label>Area / Zones</label>
                    <AntdSelect
                      style={{ marginTop: 7 }}
                      showSearch
                      allowClear
                      placeholder={isVI ? "Chọn khu vực" : "Select Zone"}
                      value={form.zone || null}
                      onChange={(value) => setForm({ ...form, zone: value })}
                      className="w-full custom-select focus:ring-2 focus:ring-gray-300"
                      popupClassName="custom-dropdown"
                      optionFilterProp="children"
                    >
                      {zones.map((z) => (
                        <AntdSelect.Option key={z._id} value={z._id}>
                          {isVI ? z.name?.vi : z.name?.en}
                        </AntdSelect.Option>
                      ))}
                    </AntdSelect>

                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Block Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name_en"
                      value={form.name_en}
                      onChange={handleChange}
                      placeholder="Type here"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label>Dự án / Cộng đồng</label>
                    <AntdSelect
                      key={"property-" + activeLang} // ✅ important
                      style={{ marginTop: 7 }}
                      showSearch
                      allowClear
                      placeholder={
                        activeLang === "VI" ? "Chọn dự án" : "Select Project"
                      }
                      value={form.property || undefined}
                      onChange={(value) => handlePropertySelect(value)}
                      optionFilterProp="children"
                      className="w-full custom-select"
                      popupClassName="custom-dropdown"
                    >
                      {properties.map((p) => (
                        <AntdSelect.Option key={p._id} value={p._id}>
                          {activeLang === "VI" ? p.name?.vi : p.name?.en}
                        </AntdSelect.Option>
                      ))}
                    </AntdSelect>
                  </div>

                  <div>
                    <label>Khu vực / Khu vực</label>
                    <AntdSelect
                      key={"zone-" + activeLang} // ✅ important
                      style={{ marginTop: 7 }}
                      showSearch
                      allowClear
                      placeholder={
                        activeLang === "VI" ? "Chọn khu vực" : "Select Zone"
                      }
                      value={form.zone || null}
                      onChange={(value) => setForm({ ...form, zone: value })}
                      optionFilterProp="children"
                      className="w-full custom-select"
                      popupClassName="custom-dropdown"
                    >
                      {zones.map((z) => (
                        <AntdSelect.Option key={z._id} value={z._id}>
                          {activeLang === "VI" ? z.name?.vi : z.name?.en}
                        </AntdSelect.Option>
                      ))}
                    </AntdSelect>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên khối <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name_vi"
                      value={form.name_vi}
                      onChange={handleChange}
                      placeholder="Nhập tại đây"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded-full hover:bg-gray-100"
              >
                {isVI ? "Hủy" : "Cancel"}
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-[#41398B] 
                hover:bg-[#41398be3] text-white"
              >
                {editingBlock
                  ? isVI
                    ? "Cập nhật"
                    : "Update"
                  : isVI
                    ? "Thêm"
                    : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
