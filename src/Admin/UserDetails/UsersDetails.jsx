import React, { useState, useEffect } from "react";
import { Select } from "antd";
import {
    Search,
    ArrowLeft,
    MoreVertical,
    X,
    Pencil,
    Trash2,
    AlertTriangle,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    ShieldCheck,
    ShieldAlert,
    UserCheck,
    UserX,
    Mail,
    Phone
} from "lucide-react";
import {
    getAllUsers,
    deleteUser,
    updateUser,
    createUser
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { useLanguage } from "../../Language/LanguageContext";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../Context/PermissionContext";

export default function UsersDetails() {
    const navigate = useNavigate();
    // const goBack = () => navigate(-1);
    const { language } = useLanguage();
    const { can } = usePermissions();
    const isVI = language === "vi";

    const [showModal, setShowModal] = useState(false);
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Pagination
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        employeeId: "",
        password: "",
        role: "user",
        isVerified: false
    });

    // ✅ Fetch all Users

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getAllUsers();
            // Adjust depending on actual API response structure (often res.data.data or res.data)
            const allData = res.data.data || res.data || [];
            const filteredUsers = allData.filter(user => user.role === 'user');
            setUsers(filteredUsers);
        } catch {
            CommonToaster(
                isVI ? "Không thể tải danh sách người dùng." : "Failed to load users.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Search and Sort Logic
    const processedUsers = [...users]
        .filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name-asc") return a.name.localeCompare(b.name);
            if (sortBy === "name-desc") return b.name.localeCompare(a.name);
            if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            return 0;
        });

    // Pagination logic
    const totalRows = processedUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const visibleData = processedUsers.slice(startIndex, endIndex);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
        if (totalRows === 0) setCurrentPage(1);
    }, [totalRows, totalPages]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    // ✅ Add/Edit - simplified for now
    const handleSubmit = async () => {
        const { name, email, employeeId, password, role } = form;

        if (!name || !email || (!editingUser && !password)) {
            CommonToaster(
                isVI
                    ? "Vui lòng điền đầy đủ các thông tin bắt buộc."
                    : "Please fill all required fields.",
                "error"
            );
            return;
        }

        try {
            if (editingUser) {
                // Exclude password if empty during edit
                const updateData = { ...form };
                if (!updateData.password) delete updateData.password;

                await updateUser(editingUser._id, updateData);
                CommonToaster(
                    isVI ? "Cập nhật người dùng thành công!" : "User updated successfully!",
                    "success"
                );
            } else {
                await createUser(form);
                CommonToaster(
                    isVI ? "Thêm người dùng thành công!" : "User added successfully!",
                    "success"
                );
            }

            setShowModal(false);
            setEditingUser(null);

            // Reset form
            setForm({
                name: "",
                email: "",
                phone: "",
                employeeId: "",
                password: "",
                role: "user",
                isVerified: false
            });

            fetchUsers();
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                (isVI ? "Không thể lưu dữ liệu." : "Failed to save data.");
            CommonToaster(msg, "error");
        }
    };

    // ✅ Edit
    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            employeeId: user.employeeId,
            password: "", // Keep password empty for security
            role: user.role,
            isVerified: user.isVerified
        });
        setShowModal(true);
    };

    // ✅ Delete
    const confirmDelete = (id) => setDeleteConfirm({ show: true, id });
    const handleDelete = async () => {
        try {
            await deleteUser(deleteConfirm.id);
            CommonToaster(
                isVI ? "Xóa thành công!" : "Deleted successfully!",
                "success"
            );
            setDeleteConfirm({ show: false, id: null });
            fetchUsers();
        } catch (error) {
            CommonToaster(
                isVI ? "Không thể xóa người dùng." : "Failed to delete user.",
                "error"
            );
        }
    };

    // Pagination controls
    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);
    const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
    const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));

    return (
        <div className="p-8 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {isVI ? "Chi tiết người dùng" : "User Details"}
                    </h2>
                </div>

                <div style={{ alignItems: "baseline" }} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={isVI ? "Tìm kiếm..." : "Search users..."}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-[#41398B] focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Sort Filter */}
                    <Select
                        value={sortBy}
                        onChange={(value) => setSortBy(value)}
                        className="w-full sm:w-48 custom-selects"
                        popupClassName="custom-dropdown"
                        placeholder={isVI ? "Sắp xếp theo" : "Sort by"}
                    >
                        <Select.Option value="newest">{isVI ? "Mới nhất" : "Newest First"}</Select.Option>
                        <Select.Option value="oldest">{isVI ? "Cũ nhất" : "Oldest First"}</Select.Option>
                        <Select.Option value="name-asc">{isVI ? "Tên (A-Z)" : "Name (A-Z)"}</Select.Option>
                        <Select.Option value="name-desc">{isVI ? "Tên (Z-A)" : "Name (Z-A)"}</Select.Option>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div
                className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}
            >
                {loading ? (
                    <CommonSkeleton rows={6} />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium">
                                        {isVI ? "Nhân viên" : "User Info"}
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">
                                        {isVI ? "Liên hệ" : "Contact"}
                                    </th>
                                    <th className="px-6 py-4 text-center font-medium">
                                        {isVI ? "Vai trò" : "Role"}
                                    </th>
                                    <th className="px-6 py-4 text-center font-medium">
                                        {isVI ? "Tích cực" : "Active"}
                                    </th>
                                    <th className="px-6 py-4 text-right font-medium">
                                        {isVI ? "Hành động" : "Actions"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">
                                            {isVI ? "Không có dữ liệu." : "No records found."}
                                        </td>
                                    </tr>
                                ) : (
                                    visibleData.map((row, i) => (
                                        <tr
                                            key={row._id || i}
                                            className="border-b last:border-0 border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                        {row.profileImage ? (
                                                            <img src={row.profileImage} alt={row.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-lg font-bold text-gray-500">
                                                                {row.name ? row.name.charAt(0).toUpperCase() : "U"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{row.name}</div>
                                                        <div className="text-xs text-gray-500">ID: {row.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail size={14} />
                                                        <span className="truncate max-w-[150px]" title={row.email}>{row.email}</span>
                                                    </div>
                                                    {row.phone && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Phone size={14} />
                                                            <span>{row.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize 
                            ${row.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {row.role}
                                                </span>
                                            </td>

                                            {/* Verified Status */}
                                            <td className="px-6 py-4 text-center">
                                                {row.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                                                        <ShieldCheck size={14} /> {isVI ? "Tích cực" : "Active"}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                                                        <ShieldAlert size={14} /> {isVI ? "Không tích cực" : "Inactive"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    className="p-2 rounded-full hover:bg-gray-100 transition"
                                                    onClick={() =>
                                                        setOpenMenuIndex(openMenuIndex === i ? null : i)
                                                    }
                                                >
                                                    <MoreVertical size={16} className="text-gray-600" />
                                                </button>

                                                {openMenuIndex === i && (
                                                    <div className="absolute right-8 top-12 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-48 py-2">
                                                        {can("userManagement.userDetails", "edit") && (
                                                            <button
                                                                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                                onClick={() => {
                                                                    handleEdit(row);
                                                                    setOpenMenuIndex(null);
                                                                }}
                                                            >
                                                                <Pencil size={15} className="mr-3 text-blue-600" />
                                                                {isVI ? "Chỉnh sửa" : "Edit Details"}
                                                            </button>
                                                        )}

                                                        <div className="h-px bg-gray-100 my-1"></div>

                                                        {can("userManagement.userDetails", "delete") && (
                                                            <button
                                                                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                                                                onClick={() => {
                                                                    confirmDelete(row._id);
                                                                    setOpenMenuIndex(null);
                                                                }}
                                                            >
                                                                <Trash2 size={15} className="mr-3" />
                                                                {isVI ? "Xóa người dùng" : "Delete User"}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ✅ Pagination Bar */}
            <div className="flex justify-end items-center px-6 py-4 bg-white rounded-b-2xl text-sm text-gray-700 mt-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span>{isVI ? "Số hàng mỗi trang:" : "Rows per page:"}</span>
                        <select
                            className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:ring-1 focus:ring-[#41398B] outline-none"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            {[5, 10, 20, 50].map((n) => (
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
                        <button onClick={goToFirst} disabled={currentPage === 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                            <ChevronsLeft size={18} />
                        </button>
                        <button onClick={goToPrev} disabled={currentPage === 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={goToNext} disabled={currentPage === totalPages || totalRows === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                            <ChevronRight size={18} />
                        </button>
                        <button onClick={goToLast} disabled={currentPage === totalPages || totalRows === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ Delete Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <AlertTriangle className="text-red-600 w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800">
                                {isVI ? "Xác nhận xóa" : "Confirm Deletion"}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {isVI
                                ? "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
                                : "Are you sure you want to delete this user? This action cannot be undone."}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, id: null })}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
                            >
                                {isVI ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm transition"
                            >
                                {isVI ? "Xóa vĩnh viễn" : "Delete User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingUser
                                    ? (isVI ? "Chỉnh sửa người dùng" : "Edit User")
                                    : (isVI ? "Thêm người dùng mới" : "New User")}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isVI ? "Tên đầy đủ" : "Full Name"}<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder={isVI ? "Nhập tên" : "Enter full name"}
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition"
                                />
                            </div>

                            {/* Only show Employee ID when editing */}
                            {editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isVI ? "Mã nhân viên" : "Employee ID"}
                                    </label>
                                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                                        {form.employeeId}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {isVI ? "Mã nhân viên không thể chỉnh sửa" : "Employee ID cannot be edited"}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="example@mail.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        readOnly={!!editingUser}
                                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition ${!!editingUser ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isVI ? "Số điện thoại" : "Phone Number"}
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="+65..."
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition"
                                    />
                                </div>
                            </div>

                            {(!editingUser) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isVI ? "Mật khẩu" : "Password"}<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder={isVI ? "Tạo mật khẩu" : "Create password"}
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isVI ? "Trạng thái hoạt động" : "Active Status"}
                                </label>
                                <Select
                                    value={form.isVerified ? "active" : "inactive"}
                                    onChange={(value) => setForm({ ...form, isVerified: value === "active" })}
                                    className="w-full h-11 custom-select"
                                    popupClassName="custom-dropdown"
                                >
                                    <Select.Option value="active">
                                        {isVI ? "Tích cực" : "Active"}
                                    </Select.Option>
                                    <Select.Option value="inactive">
                                        {isVI ? "Không tích cực" : "Inactive"}
                                    </Select.Option>
                                </Select>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 cursor-pointer rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-sm transition bg-white shadow-sm"
                            >
                                {isVI ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2.5 cursor-pointer rounded-lg bg-[#41398B] hover:bg-[#41398b] text-white font-medium text-sm shadow-md transition transform active:scale-95"
                            >
                                {editingUser
                                    ? (isVI ? "Cập nhật" : "Save Changes")
                                    : (isVI ? "Thêm" : "Create User")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}