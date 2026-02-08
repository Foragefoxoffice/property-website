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
    Languages,
} from "lucide-react";
import {
    createParking,
    deleteParking,
    updateParking,
    getAllParkings,
} from "../../../Api/action";
import { CommonToaster } from "../../../Common/CommonToaster";
import CommonSkeleton from "../../../Common/CommonSkeleton";

export default function ParkingPage({ goBack }) {
    const [showModal, setShowModal] = useState(false);
    const [activeLang, setActiveLang] = useState("EN");
    const [tableLang, setTableLang] = useState("EN");
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [parkings, setParkings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingParking, setEditingParking] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

    const [form, setForm] = useState({
        code_en: "",
        code_vi: "",
        name_en: "",
        name_vi: "",
        status: "Active",
    });

    // ✅ Fetch all
    const fetchParkings = async () => {
        try {
            setLoading(true);
            const res = await getAllParkings();
            setParkings(res.data.data || []);
        } catch (error) {
            console.error("Failed to load parking data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParkings();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ✅ Add / Edit
    const handleSubmit = async () => {
        try {
            const { code_en, code_vi, name_en, name_vi } = form;
            if (!code_en || !code_vi || !name_en || !name_vi) {
                CommonToaster("Please fill all English and Vietnamese fields", "error");
                return;
            }

            if (editingParking) {
                await updateParking(editingParking._id, form);
                CommonToaster("Parking Availability updated successfully", "success");
            } else {
                await createParking(form);
                CommonToaster("Parking Availability added successfully", "success");
            }

            setShowModal(false);
            setEditingParking(null);
            setForm({ code_en: "", code_vi: "", name_en: "", name_vi: "", status: "Active" });
            fetchParkings();
        } catch (err) {
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Something went wrong";
            CommonToaster(message, "error");
        }
    };

    // ✅ Edit
    const handleEdit = (item) => {
        setEditingParking(item);
        setForm({
            code_en: item.code.en,
            code_vi: item.code.vi,
            name_en: item.name.en,
            name_vi: item.name.vi,
            status: item.status,
        });
        setShowModal(true);
    };

    // ✅ Delete
    const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
    const handleDelete = async () => {
        try {
            await deleteParking(deleteConfirm.id);
            CommonToaster("Parking Availability deleted successfully!", "success");
            setDeleteConfirm({ show: false, id: null });
            fetchParkings();
        } catch {
            CommonToaster("Failed to delete Parking Availability", "error");
        }
    };

    // ✅ Toggle Status
    const handleToggleStatus = async (item) => {
        const newStatus = item.status === "Active" ? "Inactive" : "Active";
        try {
            await updateParking(item._id, { status: newStatus });
            CommonToaster(`Marked as ${newStatus}`, "success");
            fetchParkings();
        } catch {
            CommonToaster("Failed to update status", "error");
        }
    };

    return (
        <div className="p-8 min-h-screen relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={goBack}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Parking Availability
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-gray-600" />
                        <div
                            onClick={() => setTableLang((prev) => (prev === "EN" ? "VI" : "EN"))}
                            className="cursor-pointer flex items-center bg-gray-200 rounded-full px-2 py-1 text-xs font-medium"
                        >
                            <span
                                className={`transition-all px-2 py-1 rounded-full ${tableLang === "EN" ? "bg-black text-white" : "text-gray-600"
                                    }`}
                            >
                                EN
                            </span>
                            <span
                                className={`transition-all px-2 py-1 rounded-full ${tableLang === "VI" ? "bg-black text-white" : "text-gray-600"
                                    }`}
                            >
                                VI
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Parking Availability
                    </button>
                </div>
            </div>

            <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
                {loading ? (
                    <CommonSkeleton rows={6} />
                ) : (
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-3 font-medium">S.no</th>
                                <th className="px-6 py-3 font-medium">Parking Availability</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parkings.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            ) : (
                                parkings.map((row, i) => (
                                    <tr
                                        key={i}
                                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            } hover:bg-gray-100 transition`}
                                    >
                                        <td className="px-6 py-3">
                                            {i + 1}
                                        </td>
                                        <td className="px-6 py-3">
                                            {tableLang === "EN" ? row.name.en : row.name.vi}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right relative">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-100 transition"
                                                onClick={() =>
                                                    setOpenMenuIndex(openMenuIndex === i ? null : i)
                                                }
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-600" />
                                            </button>

                                            {openMenuIndex === i && (
                                                <div className="absolute right-8 top-10 bg-white border rounded-lg shadow-lg z-50 w-44 py-2">
                                                    <button
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={() => {
                                                            handleEdit(row);
                                                            setOpenMenuIndex(null);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4 mr-2" /> Edit
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
                                                            ? "Mark as Inactive"
                                                            : "Mark as Active"}
                                                    </button>
                                                    <button
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            confirmDelete(row._id);
                                                            setOpenMenuIndex(null);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
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

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
                        <div className="flex justify-between mb-4 border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {editingParking ? "Edit Parking Availability" : "New Parking Availability"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingParking(null);
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex border-b mb-4">
                            <button
                                onClick={() => setActiveLang("EN")}
                                className={`px-4 py-2 font-medium ${activeLang === "EN"
                                    ? "text-black border-b-2 border-black"
                                    : "text-gray-500"
                                    }`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setActiveLang("VI")}
                                className={`px-4 py-2 font-medium ${activeLang === "VI"
                                    ? "text-black border-b-2 border-black"
                                    : "text-gray-500"
                                    }`}
                            >
                                Vietnamese
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activeLang === "EN" ? (
                                <>
                                    <input
                                        type="text"
                                        name="code_en"
                                        placeholder="Code (EN)"
                                        value={form.code_en}
                                        onChange={handleChange}
                                        className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                                    />
                                    <input
                                        type="text"
                                        name="name_en"
                                        placeholder="Parking Availability (EN)"
                                        value={form.name_en}
                                        onChange={handleChange}
                                        className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                                    />
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        name="code_vi"
                                        placeholder="Mã (VI)"
                                        value={form.code_vi}
                                        onChange={handleChange}
                                        className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                                    />
                                    <input
                                        type="text"
                                        name="name_vi"
                                        placeholder="Chỗ đậu xe (VI)"
                                        value={form.name_vi}
                                        onChange={handleChange}
                                        className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-black"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex justify-end mt-6 gap-3 border-t pt-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingParking(null);
                                }}
                                className="px-5 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800"
                            >
                                {editingParking ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="text-red-600 w-6 h-6 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Confirm Delete
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to delete this Parking Availability?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: null })}
                                className="px-5 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
