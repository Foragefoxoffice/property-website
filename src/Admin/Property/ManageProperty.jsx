import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Pencil,
  X,
  SlidersHorizontal,
  RotateCcw,
  Upload,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import {
  updatePropertyListing,
  deletePropertyListing,
  permanentlyDeleteProperty,
  copyPropertyToSale,
  copyPropertyToLease,
  copyPropertyToHomeStay,
  getPropertiesByTransactionType,
  restoreProperty,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { translateError } from "../../utils/translateError";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import FiltersPage from "../Filters/Filter";
import { usePermissions } from "../../Context/PermissionContext";

export default function ManageProperty({
  filterByTransactionType,
  trashMode = false,
}) {
  // core states
  const [properties, setProperties] = useState([]); // current page items from backend
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // backend pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [copyFullLoading, setCopyFullLoading] = useState(false);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const { can, isApprover } = usePermissions();
  const [activeTab, setActiveTab] = useState("all"); // all, pending

  const getPermissionKey = () => {
    if (filterByTransactionType === "Lease") return "properties.lease";
    if (filterByTransactionType === "Sale") return "properties.sale";
    if (filterByTransactionType === "Home Stay" || filterByTransactionType === "HomeStay") return "properties.homestay";
    return null;
  };
  const permissionKey = getPermissionKey();


  // Helper: fetch page from backend
  const fetchProperties = async () => {
    // if no transaction type provided, nothing to fetch (component expects a type)
    if (!filterByTransactionType) {
      setProperties([]);
      setTotalRows(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = {
        type: filterByTransactionType,
        page: currentPage,
        limit: rowsPerPage,
        trashMode: trashMode ? "true" : undefined
      };

      if (!trashMode && isApprover) {
        if (activeTab === "pending") {
          params.status = "Pending";
        } else if (activeTab === "all") {
          params.excludeStatus = "Pending";
        }
      }

      // Add applied filters to params
      if (appliedFilters) {
        if (appliedFilters.projectId?.name) params.project = appliedFilters.projectId.name;
        if (appliedFilters.zoneId?.name) params.zone = appliedFilters.zoneId.name;
        if (appliedFilters.blockId?.name) params.block = appliedFilters.blockId.name;
        if (appliedFilters.propertyType?.name) params.propertyType = appliedFilters.propertyType.name;
        if (appliedFilters.propertyNumber) params.propertyNo = appliedFilters.propertyNumber;
        if (appliedFilters.floorRange?.name) params.floor = appliedFilters.floorRange.name;
        // Check for code first, then name
        if (appliedFilters.currency?.code) {
          params.currency = appliedFilters.currency.code;
        } else if (appliedFilters.currency?.name) {
          params.currency = appliedFilters.currency.name;
        }
        if (appliedFilters.priceFrom) params.priceFrom = appliedFilters.priceFrom;
        if (appliedFilters.priceTo) params.priceTo = appliedFilters.priceTo;
      }

      if (searchTerm) {
        params.keyword = searchTerm;
      }

      const res = await getPropertiesByTransactionType(params);

      if (res?.data?.success) {
        setProperties(res.data.data || []);
        setTotalRows(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setProperties([]);
        setTotalRows(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties([]);
      setTotalRows(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // main effect: re-fetch when transaction type, page, or page size changes
  useEffect(() => {
    // reset to first page when transaction type changes
    setCurrentPage((prev) => (prev === 1 ? 1 : prev)); // keep page unless changed elsewhere

    // Simple debounce for search
    const timer = setTimeout(() => {
      fetchProperties();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterByTransactionType, currentPage, rowsPerPage, trashMode, activeTab, appliedFilters, searchTerm]);

  // client-side filtering REMOVED - backend now handles filtering
  const filteredProperties = useMemo(() => {
    return properties || [];
  }, [properties]);

  // currentRows = filtered (already representing the backend page after client-side filtering)
  const currentRows = filteredProperties;

  // pagination helpers for display
  const startIndex = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex =
    totalRows === 0 ? 0 : Math.min((currentPage - 1) * rowsPerPage + currentRows.length, totalRows);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleRestore = async (id) => {
    try {
      await restoreProperty(id);
      CommonToaster(t.propertyRestored, "success");
      // remove from UI
      setProperties((prev) => prev.filter((p) => p._id !== id));
      // optionally adjust totalRows
      setTotalRows((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      CommonToaster(t.failedToRestore, "error");
    }
  };

  const handleApprove = async (id) => {
    try {
      await updatePropertyListing(id, { status: "Published" });
      CommonToaster(t.propertyApproved, "success");
      fetchProperties();
    } catch (err) {
      CommonToaster(t.failedToApprove, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (trashMode) {
        await permanentlyDeleteProperty(deleteConfirm.id);
        CommonToaster(t.propertyPermanentlyDeleted, "success");
      } else {
        await deletePropertyListing(deleteConfirm.id);
        CommonToaster(t.movedToTrash, "success");
      }

      setProperties((prev) => prev.filter((p) => p._id !== deleteConfirm.id));
      setTotalRows((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error deleting property:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || t.failedToDeleteProperty;
      CommonToaster(translateError(msg, t), "error");
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const confirmDelete = (id) => setDeleteConfirm({ show: true, id });

  const getCopyMenuItems = (p) => {
    if (!p) return [];

    if (filterByTransactionType === "Sale") {
      return [
        {
          key: "copy_lease",
          label: "Copy to Lease",
          onClick: () => handleCopy(p._id, "Lease"),
        },
        {
          key: "copy_home",
          label: "Copy to Home Stay",
          onClick: () => handleCopy(p._id, "Home Stay"),
        },
      ];
    }

    if (filterByTransactionType === "Lease") {
      return [
        {
          key: "copy_sale",
          label: "Copy to Sale",
          onClick: () => handleCopy(p._id, "Sale"),
        },
        {
          key: "copy_home",
          label: "Copy to Home Stay",
          onClick: () => handleCopy(p._id, "Home Stay"),
        },
      ];
    }

    if (filterByTransactionType === "Home Stay" || filterByTransactionType === "HomeStay") {
      return [
        {
          key: "copy_sale",
          label: "Copy to Sale",
          onClick: () => handleCopy(p._id, "Sale"),
        },
        {
          key: "copy_lease",
          label: "Copy to Lease",
          onClick: () => handleCopy(p._id, "Lease"),
        },
      ];
    }

    return [];
  };

  const handleCopy = async (id, target) => {
    try {
      setCopyFullLoading(true);

      let res;
      if (target === "Sale") res = await copyPropertyToSale(id);
      if (target === "Lease") res = await copyPropertyToLease(id);
      if (target === "Home Stay") res = await copyPropertyToHomeStay(id);

      if (res?.data?.success) {
        CommonToaster(t.propertyCopied, "success");
        // add new item into current page (or you may want to refetch)
        setProperties((prev) => [res.data.data, ...prev]);
        setTotalRows((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      CommonToaster(t.copyFailed, "error");
    } finally {
      setCopyFullLoading(false);
    }
  };

  const transactionRoute = filterByTransactionType?.toLowerCase()?.replace(" ", "");

  return (
    <div className="min-h-screen px-2 py-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          {filterByTransactionType === "Lease"
            ? t.propertyTitleLease
            : filterByTransactionType === "Sale"
              ? t.propertyTitleSale
              : (filterByTransactionType === "Home Stay" || filterByTransactionType === "HomeStay")
                ? t.propertyTitleHomeStay
                : ""}
        </h1>


        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilterPopup(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t.filter}
          </button>


          {trashMode ? null : (
            can(permissionKey, 'bulkUpload') && (
              <button
                onClick={() => navigate(`/dashboard/${transactionRoute}/bulk-upload`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {t.bulkUpload}
              </button>
            )
          )}


          {trashMode ? null : (
            // Conditionally render Add button based on 'add' permission
            can(permissionKey, 'add') && (
              <button
                onClick={() => navigate(`/dashboard/${transactionRoute}/create`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white rounded-full shadow-md"
              >
                <Plus className="w-4 h-4" />
                {t.addProperty}
              </button>
            )
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`${t.search}...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 rounded-full focus:ring-2 focus:ring-gray-300 focus:outline-none bg-white"
        />
      </div>

      {/* TABS */}
      {!trashMode && isApprover && (
        <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "all" ? "text-[#41398B] font-bold" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {t.allProperties || "All Properties"}
            {activeTab === "all" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#41398B] rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "pending" ? "text-[#41398B] font-bold" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {t.pendingApprovals || "Pending Approvals"}
            {activeTab === "pending" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#41398B] rounded-t-full"></div>}
          </button>
        </div>
      )}

      {/* ACTIVE FILTER BADGES + CLEAR BUTTON */}
      {appliedFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {Object.entries(appliedFilters).map(([key, val]) =>
            val && (typeof val === "string" ? val : val?.name) ? (
              <span
                key={key}
                className="bg-[#41398B] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {key}: {typeof val === "string" ? val : val?.name}
                <button
                  onClick={() =>
                    setAppliedFilters((prev) => ({ ...prev, [key]: "" }))
                  }
                  className="text-white ml-1 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            ) : null
          )}

          <button
            onClick={() => setAppliedFilters(null)}
            className="ml-2 text-sm underline text-red-600 cursor-pointer"
          >
            {t.clearAllFilters}
          </button>
        </div>
      )}

      {/* Table - Added overflow-x-auto for horizontal scrolling */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto thin-scrollbar">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <table className="w-full text-sm text-gray-700 min-w-[1000px]">
            <thead className="bg-[#EAE9EE] text-gray-600 text-left h-18">
              <tr>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.propertyId}</th>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.propertyNo}</th>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.propertyType}</th>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.ownerName}</th>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.ownerPhone}</th>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.actionBy}</th>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.sentBy}</th>
                <th className="px-6 py-3 font-medium text-[#111111] whitespace-nowrap">{t.publishTheWebsite}</th>
                <th className="px-6 py-3 font-medium text-[#111111] text-right whitespace-nowrap sticky right-0 bg-[#EAE9EE] z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)]"></th>
              </tr>
            </thead>

            <tbody>
              {currentRows.map((p, i) => {
                const info = p.listingInformation || {};
                const transactionType =
                  info.listingInformationTransactionType?.[language] ||
                  info.listingInformationTransactionType?.en ||
                  "—";
                const propertyType =
                  info.listingInformationPropertyType?.[language] ||
                  info.listingInformationPropertyType?.en ||
                  "—";
                const propertyNo =
                  info.listingInformationPropertyNo?.[language] ||
                  info.listingInformationPropertyNo?.en ||
                  "—";
                const blockName =
                  info.listingInformationBlockName?.[language] ||
                  info.listingInformationBlockName?.en ||
                  "—";
                const ownerName = p.contactManagement?.contactManagementOwner?.[language] || p.contactManagement?.contactManagementOwner?.en || "—";
                const ownerPhone = p.contactManagement?.contactManagementOwnerPhone?.join(", ") || "—";

                return (
                  <tr
                    key={p._id || i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition align-middle group`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {info.listingInformationPropertyId || "—"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-6 capitalize whitespace-nowrap">{propertyNo}</td>

                    <td className="px-6 py-4 whitespace-nowrap">{propertyType}</td>

                    <td className="px-6 py-4 whitespace-nowrap">{ownerName}</td>

                    <td className="px-6 py-4 whitespace-nowrap">{ownerPhone}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.status === "Published" && (p.approvedByName || p.approvedBy) ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-green-600 uppercase tracking-wider font-bold mb-0.5">{t.approvedBy}</span>
                          <span className="text-sm font-medium text-gray-900">{p.approvedByName || p.approvedBy?.name || "—"}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{p.sentByName || p.sentBy?.name || p.createdByName || p.createdBy?.name || "—"}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium ${p.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Draft"
                              ? "bg-[#FFF3DE] text-[#FFA600]"
                              : p.status === "Pending"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-gray-200 text-gray-700"
                            }`}
                        >
                          {p.status === "Published"
                            ? t.published
                            : p.status === "Draft"
                              ? t.draft
                              : p.status === "Pending"
                                ? t.pendingApproval
                                : p.status || "—"}
                        </span>
                      </div>
                    </td>

                    <td className={`px-3 py-4 text-right flex justify-end gap-3 sticky right-0 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)] ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} group-hover:bg-gray-100`}>
                      {/* Approve Button */}
                      {isApprover && p.status === "Pending" && (
                        <button
                          onClick={() => handleApprove(p._id)}
                          title="Approve"
                          className="p-2 rounded-full hover:bg-green-100 bg-green-50 border border-green-200 h-10 w-10 cursor-pointer flex justify-center items-center text-green-600"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}

                      {can(permissionKey, 'view') && (
                        <Link
                          to={`/property-showcase/${p?.listingInformation?.listingInformationPropertyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer flex justify-center items-center"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Link>
                      )}

                      {can(permissionKey, 'preview') && (
                        <button
                          onClick={() => navigate(`/dashboard/${transactionRoute}/edit/${p._id}?step=5`)}
                          title="Preview"
                          className="p-2 rounded-full hover:bg-purple-100 bg-purple-50 transition border border-purple-300 h-10 w-10 cursor-pointer flex justify-center items-center"
                        >
                          <Eye className="w-4 h-4 text-purple-600" />
                        </button>
                      )}

                      {can(permissionKey, 'edit') && (
                        <button
                          onClick={() => navigate(`/dashboard/${transactionRoute}/edit/${p._id}`)}
                          className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer flex justify-center items-center"
                        >
                          <Pencil color="#1d47ffff" className="w-4 h-4 text-gray-600" />
                        </button>
                      )}

                      {trashMode ? (
                        <button onClick={() => handleRestore(p._id)} className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer flex justify-center items-center">
                          <RotateCcw className="w-4 h-4 text-green-600" />
                        </button>
                      ) : (
                        can(permissionKey, 'delete') && (
                          <button onClick={() => confirmDelete(p._id)} className="p-2 rounded-full hover:bg-gray-200 transition border border-gray-300 h-10 w-10 cursor-pointer flex justify-center items-center">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )
                      )}

                      {can(permissionKey, 'copy') && (
                        <Dropdown trigger={["click"]} menu={{ items: getCopyMenuItems(p) }} placement="bottomRight">
                          <button className="p-2 rounded-full hover:bg-gray-200 transition border h-10 w-10">
                            <MoreVertical />
                          </button>
                        </Dropdown>
                      )}
                    </td>
                  </tr>
                );
              })}

              {currentRows.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    {t.noPropertiesFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalRows > 0 && (
        <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-600 border-t bg-gray-50 mt-4 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>{t.rowsPerPage}:</span>
            <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="border rounded-md text-gray-700 focus:outline-none px-2 py-1">
              {[5, 10, 20, 25, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <p>
              {totalRows === 0
                ? `0–0 ${t.of} 0`
                : `${(currentPage - 1) * rowsPerPage + 1}–${(currentPage - 1) * rowsPerPage + currentRows.length
                } ${t.of} ${totalRows}`}
            </p>

            <button onClick={handlePrevPage} disabled={currentPage === 1} className={`p-1 px-2 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}>
              &lt;
            </button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`p-1 px-2 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}>
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-black-800">
                {trashMode ? t.areYouAbsolutelySure : t.moveToTrashQuestion}
              </h3>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              {trashMode ? t.permanentlyDeleteMessage : t.moveToTrashMessage}
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer">
                {t.cancel}
              </button>

              <button onClick={handleDelete} className={`px-6 py-2 rounded-full text-white  cursor-pointer ${trashMode ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700"}`}>
                {trashMode ? t.deletePermanently : t.moveToTrash}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilterPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 z-[50]">
          <div className="bg-white rounded-2xl w-full max-w-5xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end">
              <button onClick={() => setShowFilterPopup(false)} className="px-4 py-1 rounded-full cursor-pointer">
                <X />
              </button>
            </div>

            <FiltersPage
              defaultFilters={appliedFilters}
              onApply={(data) => {
                setAppliedFilters(data);
                setShowFilterPopup(false);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Copy loading overlay */}
      {copyFullLoading && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-[#41398B] border-t-transparent rounded-full"></div>
            <p className="text-gray-700 text-lg font-medium">{t.copyingProperty}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* Skeleton Loader */
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between px-6 py-4 bg-white">
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-18 h-14 bg-[#41398b29] rounded-lg" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-3 bg-[#41398b29] rounded w-2/3" />
              <div className="h-3 bg-[#41398b29] rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-[#41398b29] rounded w-24" />
          <div className="h-3 bg-[#41398b29] rounded w-20" />
          <div className="h-3 bg-[#41398b29] rounded w-24" />
          <div className="h-6 bg-[#41398b29] rounded-full w-20" />
          <div className="flex gap-3">
            {[...Array(4)].map((__, j) => (
              <div key={j} className="w-10 h-10 bg-[#41398b29] rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
