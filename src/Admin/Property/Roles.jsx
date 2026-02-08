import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
} from "lucide-react";
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { Switch, Collapse, Select } from "antd";
import CommonSkeleton from "../../Common/CommonSkeleton";
import { usePermissions } from "../../Context/PermissionContext";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { translateError } from "../../utils/translateError";

const { Panel } = Collapse;

export default function Roles() {
    const { can, refreshPermissions } = usePermissions();
    const { language } = useLanguage();
    const t = translations[language];
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    const [loading, setLoading] = useState(true);

    // Definition of the permission structure
    const permissionStructure = [
        {
            label: t.properties,
            key: "properties",
            subModules: [
                { key: "lease", label: t.lease, controls: ["hide", "view", "preview", "add", "edit", "delete", "copy", "bulkUpload"] },
                { key: "sale", label: t.sale, controls: ["hide", "view", "preview", "add", "edit", "delete", "copy", "bulkUpload"] },
                { key: "homestay", label: t.homeStay, controls: ["hide", "view", "preview", "add", "edit", "delete", "copy", "bulkUpload"] }
            ]
        },
        {
            label: t.cmsAdmin,
            key: "cms",
            subModules: [
                { key: "homePage", label: t.homePage, controls: ["hide", "edit"] },
                { key: "aboutUs", label: t.aboutUs, controls: ["hide", "edit"] },
                { key: "contactUs", label: t.contactUs, controls: ["hide", "edit"] },
                { key: "header", label: t.header, controls: ["hide", "edit"] },
                { key: "footer", label: t.footer, controls: ["hide", "edit"] },
                { key: "agent", label: t.propertyConsultant, controls: ["hide", "edit"] },
                { key: "termsConditions", label: t.termsConditions || "Terms & Conditions", controls: ["hide", "edit"] },
                { key: "privacyPolicy", label: t.privacyPolicy || "Privacy Policy", controls: ["hide", "edit"] },
                { key: "blogBanner", label: t.blogBanner, controls: ["hide", "edit"] }

            ]
        },
        {
            label: t.blogs,
            key: "blogs",
            subModules: [
                { key: "category", label: t.category, controls: ["hide", "add", "edit", "delete"] },
                { key: "blogCms", label: t.blogCms, controls: ["hide", "view", "edit", "delete"] },
                { key: "subscription", label: t.subscription, controls: ["hide"] }
            ]
        },
        {
            label: t.userManagement,
            key: "userManagement",
            subModules: [
                { key: "userDetails", label: t.userDetails, controls: ["hide", "add", "edit", "delete"] },
                { key: "enquires", label: t.enquires, controls: ["hide", "delete"] }
            ]
        },
        {
            label: t.manageStaffs,
            key: "menuStaffs",
            subModules: [
                { key: "roles", label: t.roles, controls: ["hide", "add", "edit", "delete"] },
                { key: "staffs", label: t.staffs, controls: ["hide", "view", "add", "edit", "delete"] }
            ]
        },
        {
            label: t.otherEnquiry,
            key: "otherEnquiry",
            subModules: [
                { key: "contactEnquiry", label: t.contactEnquiry, controls: ["hide"] }
            ]
        },
        {
            label: t.landlords,
            key: "landlords",
            isDirect: true, // No submodules
            controls: ["hide", "view", "add", "edit", "delete"]
        },
        {
            label: t.masters,
            key: "masters",
            isDirect: true,
            controls: ["hide"]
        },
        {
            label: t.settings,
            key: "settings",
            subModules: [
                { key: "notification", label: t.notification, controls: ["hide"] },
                { key: "testimonials", label: t.testimonials, controls: ["hide"] }
            ]
        }
    ];

    // Helper to generate empty permission state
    const generateEmptyPermissions = () => {
        const perms = {};
        permissionStructure.forEach(section => {
            if (section.isDirect) {
                perms[section.key] = {};
                section.controls.forEach(c => (perms[section.key][c] = false));
            } else {
                perms[section.key] = {};
                section.subModules.forEach(sub => {
                    perms[section.key][sub.key] = {};
                    sub.controls.forEach(c => (perms[section.key][sub.key][c] = false));
                });
            }
        });
        return perms;
    };

    const initialFormState = {
        name: "",
        status: "Active",
        isApprover: false,
        permissions: generateEmptyPermissions()
    };

    const [form, setForm] = useState(initialFormState);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await getRoles();
            setRoles(res.data.data || []);
        } catch {
            CommonToaster(t.failedToFetchRoles, "error");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (role = null) => {
        if (role) {
            setEditMode(true);
            setEditingRole(role);

            // Deep merge logic to ensure structure safety
            const mergedPermissions = generateEmptyPermissions();
            // We assume role.permissions matches our structure mostly
            if (role.permissions) {
                // Manually merge to avoid losing keys if backend misses some
                Object.keys(mergedPermissions).forEach(mainKey => {
                    if (role.permissions[mainKey]) {
                        if (permissionStructure.find(ps => ps.key === mainKey)?.isDirect) {
                            mergedPermissions[mainKey] = { ...mergedPermissions[mainKey], ...role.permissions[mainKey] };
                        } else {
                            // Submodules
                            Object.keys(mergedPermissions[mainKey]).forEach(subKey => {
                                if (role.permissions[mainKey][subKey]) {
                                    mergedPermissions[mainKey][subKey] = { ...mergedPermissions[mainKey][subKey], ...role.permissions[mainKey][subKey] };
                                }
                            });
                        }
                    }
                });
            }

            setForm({
                name: role.name,
                status: role.status,
                isApprover: role.isApprover || false,
                permissions: mergedPermissions
            });
        } else {
            setEditMode(false);
            setEditingRole(null);
            setForm(initialFormState);
        }
        setShowModal(true);
    };

    const togglePermission = (mainKey, subKey, type, value) => {
        setForm(prev => {
            const newPerms = { ...prev.permissions };

            if (subKey) {
                // Nested
                newPerms[mainKey] = {
                    ...newPerms[mainKey],
                    [subKey]: {
                        ...newPerms[mainKey][subKey],
                        [type]: type === 'hide' ? !value : value
                    }
                };
            } else {
                // Direct (Landlords)
                newPerms[mainKey] = {
                    ...newPerms[mainKey],
                    [type]: type === 'hide' ? !value : value
                };
            }
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode && editingRole?._id) {
                await updateRole(editingRole._id, form);
                CommonToaster(t.roleUpdated, "success");
            } else {
                await createRole(form);
                CommonToaster(t.roleCreated, "success");
            }
            await refreshPermissions();
            setShowModal(false);
            fetchRoles();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || t.errorSavingRole;
            CommonToaster(translateError(msg, t), "error");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteRole(deleteConfirm.id);
            CommonToaster(t.roleDeleted, "success");
            await refreshPermissions();
            setDeleteConfirm({ show: false, id: null });
            fetchRoles();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || t.errorDeletingRole;
            CommonToaster(translateError(msg, t), "error");
        }
    };

    const toggleSection = (sectionKey, isAccessible) => {
        setForm(prev => {
            const newPerms = { ...prev.permissions };
            const section = permissionStructure.find(s => s.key === sectionKey);

            if (section && !section.isDirect) {
                section.subModules.forEach(sub => {
                    if (!newPerms[sectionKey][sub.key]) {
                        newPerms[sectionKey][sub.key] = {};
                    }
                    newPerms[sectionKey][sub.key] = {
                        ...newPerms[sectionKey][sub.key],
                        hide: !isAccessible
                    };
                });
            }
            return { ...prev, permissions: newPerms };
        });
    };

    const renderToggle = (mainKey, subKey, control) => {
        let value = false;
        if (subKey) {
            value = form.permissions[mainKey]?.[subKey]?.[control] || false;
        } else {
            value = form.permissions[mainKey]?.[control] || false;
        }

        const checked = control === 'hide' ? !value : value;

        return (
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-1 border border-gray-200">
                <span className="text-gray-700 capitalize text-sm font-medium">
                    {control === 'hide' ? t.accessTab : control === 'preview' ? t.preview : control === 'bulkUpload' ? t.bulkUpload : control === 'view' ? t.view : control === 'add' ? t.add : control === 'edit' ? t.edit : control === 'delete' ? t.deletePermission : control === 'copy' ? t.copy : control.charAt(0).toUpperCase() + control.slice(1)}
                </span>
                <Switch
                    size="small"
                    checked={checked}
                    onChange={(val) => togglePermission(mainKey, subKey, control, val)}
                    className={`${checked ? 'bg-[#41398B]' : 'bg-gray-300'}`}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen px-6 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{t.roleManagement}</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={t.searchRoles}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:border-[#41398B] shadow-sm"
                        />
                    </div>

                    {can("menuStaffs.roles", "add") && (
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full font-medium transition shadow-md"
                        >
                            <Plus size={18} /> {t.addRole}
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className={`transform transition-all duration-300 ${loading ? "opacity-70" : "opacity-100"}`}>
                {loading ? (
                    <CommonSkeleton rows={5} />
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">S.NO</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">{t.roleName}</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600">{t.status}</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">{t.action}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((role, index) => (
                                    <tr key={role._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}.</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">{role.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${role.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {role.status === 'Active' ? t.active : t.inactive}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            {can("menuStaffs.roles", "edit") && role.name !== "Super Admin" && (
                                                <button onClick={() => openModal(role)} className="p-2 bg-white border border-gray-200 hover:bg-[#41398B] hover:text-white rounded-full transition text-gray-600 shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {can("menuStaffs.roles", "delete") && role.name !== "Super Admin" && (
                                                <button onClick={() => setDeleteConfirm({ show: true, id: role._id })} className="p-2 bg-white border border-gray-200 hover:bg-red-600 hover:text-white rounded-full transition text-gray-600 shadow-sm">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {roles.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-gray-500">
                                            {t.noRolesFound}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editMode ? t.editRole : t.addRole}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[#F9FAFB]">
                            <form id="roleForm" onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t.roleName} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={t.enterRoleName}
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#41398B] focus:border-[#41398B] outline-none transition"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t.status} <span className="text-red-500">*</span></label>
                                        <Select
                                            value={form.status}
                                            onChange={(value) => setForm({ ...form, status: value })}
                                            className="w-full h-11 custom-select"
                                            popupClassName="custom-dropdown"
                                        >
                                            <Select.Option value="Active">{t.active}</Select.Option>
                                            <Select.Option value="Inactive">{t.inactive}</Select.Option>
                                        </Select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role Type <span className="text-red-500">*</span></label>
                                        <Select
                                            value={form.isApprover ? "Approver" : "Non-approver"}
                                            onChange={(value) => setForm({ ...form, isApprover: value === "Approver" })}
                                            className="w-full h-11 custom-select"
                                            popupClassName="custom-dropdown"
                                        >
                                            <Select.Option value="Non-approver">Non-approver</Select.Option>
                                            <Select.Option value="Approver">Approver</Select.Option>
                                        </Select>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        {t.permissionsMatrix}
                                    </h3>

                                    <div className="space-y-6">
                                        {permissionStructure.map((section) => {
                                            // Check if all submodules in this section are accessible
                                            const isSectionAccessible = !section.isDirect && section.subModules.every(
                                                sub => !form.permissions[section.key]?.[sub.key]?.hide
                                            );

                                            return (
                                                <div key={section.key} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                    <div className="px-4 py-3 bg-[#f8f9fa] border-b border-gray-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-5 bg-[#41398B] rounded-full"></div>
                                                            <span className="font-bold text-gray-800">{section.label}</span>
                                                        </div>

                                                        {/* Master Hide Toggle for Section */}
                                                        {!section.isDirect && (
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {t.accessTab || "Access"}
                                                                </span>
                                                                <Switch
                                                                    size="small"
                                                                    checked={isSectionAccessible}
                                                                    onChange={(val) => toggleSection(section.key, val)}
                                                                    className={`${isSectionAccessible ? 'bg-[#41398B]' : 'bg-gray-300'}`}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-4">
                                                        {section.isDirect ? (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                                                {section.controls.map(control => (
                                                                    <div key={control}>
                                                                        {renderToggle(section.key, null, control)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {section.subModules.map(sub => (
                                                                    <div key={sub.key} className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                                                                        <h4 className="font-semibold text-gray-700 mb-3 text-sm">{sub.label}</h4>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {sub.controls.map(control => (
                                                                                <div key={control}>
                                                                                    {renderToggle(section.key, sub.key, control)}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-white">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium shadow-sm"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                form="roleForm"
                                className="px-6 py-2.5 rounded-lg bg-[#41398B] hover:bg-[#41398be3] text-white transition font-medium shadow-md"
                            >
                                {editMode ? t.updateRole : t.createRole}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{t.deleteRole}</h3>
                        <p className="text-gray-500 text-sm mb-6 text-center leading-relaxed">
                            {t.deleteRoleConfirm}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">{t.cancel}</button>
                            <button onClick={handleDelete} className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm">{t.delete}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}