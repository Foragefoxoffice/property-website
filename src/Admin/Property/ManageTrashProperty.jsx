import React, { useState, useMemo, useEffect } from "react";
import { Select, ConfigProvider, Checkbox } from "antd";
import {
  Search,
  Eye,
  Trash2,
  RotateCcw,
  X,
  SlidersHorizontal,
} from "lucide-react";

import {
  getPropertiesByTransactionType,
  permanentlyDeleteProperty,
  restoreProperty,
} from "../../Api/action";

import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

import { useNavigate } from "react-router-dom";
import FiltersPage from "../Filters/Filter";

/* ======================================================
   🗑️ MANAGE TRASH PROPERTY (Option C - Dropdown Filter)
====================================================== */
export default function ManageTrashProperty() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  // Core state
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Backend pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Dropdown for type filter
  const [selectedType, setSelectedType] = useState("All");

  /* ======================================================
     FETCH TRASHED PROPERTIES
  ====================================================== */
  const fetchProperties = async () => {
    setLoading(true);

    try {
      const params = {
        type: selectedType === "All" ? "" : selectedType,
        page: currentPage,
        limit: rowsPerPage,
        trashMode: "true"
      };

      // Add applied filters to params
      if (appliedFilters) {
        if (appliedFilters.projectId?.name) params.project = appliedFilters.projectId.name;
        if (appliedFilters.zoneId?.name) params.zone = appliedFilters.zoneId.name;
        if (appliedFilters.blockId?.name) params.block = appliedFilters.blockId.name;
        if (appliedFilters.propertyType?.name) params.propertyType = appliedFilters.propertyType.name;
        if (appliedFilters.propertyNumber) params.propertyNo = appliedFilters.propertyNumber;
        if (appliedFilters.floorRange?.name) params.floor = appliedFilters.floorRange.name;

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
      }
    } catch (error) {
      console.error("Error fetching trash:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters/pagination/type/search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [selectedType, currentPage, rowsPerPage, appliedFilters, searchTerm]);

  /* ======================================================
     CLIENT SIDE FILTERING / SEARCH (REMOVED - Backend handles)
  ====================================================== */
  const currentRows = useMemo(() => {
    return properties || [];
  }, [properties]);

  // Pagination helpers
  const startIndex =
    totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;

  const endIndex =
    totalRows === 0
      ? 0
      : Math.min((currentPage - 1) * rowsPerPage + currentRows.length, totalRows);

  /* ======================================================
     RESTORE
  ====================================================== */
  const handleRestore = async (id) => {
    try {
      await restoreProperty(id);
      CommonToaster(t.restoredSuccess, "success");

      setProperties((prev) => prev.filter((p) => p._id !== id));
      setTotalRows((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      CommonToaster(t.restoredFailed, "error");
    }
  };

  /* ======================================================
     PERMANENT DELETE
  ====================================================== */
  const handleDelete = async () => {
    try {
      await permanentlyDeleteProperty(deleteConfirm.id);

      CommonToaster(t.deleteSuccess, "success");

      setProperties((prev) => prev.filter((p) => p._id !== deleteConfirm.id));
      setTotalRows((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      CommonToaster(t.deleteFailed, "error");
    } finally {
      setDeleteConfirm({ show: false, id: null });
    }
  };

  /* ======================================================
     BULK ACTIONS
  ====================================================== */
  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map(id => permanentlyDeleteProperty(id)));
      CommonToaster(t.bulkDeleteSuccess, "success");
      setSelectedRowKeys([]);
      fetchProperties();
    } catch (err) {
      console.error(err);
      CommonToaster(t.bulkDeleteFailed, "error");
    } finally {
      setLoading(false);
      setBulkDeleteConfirm(false);
    }
  };

  const onSelectAll = (e) => {
    if (e.target.checked) {
      const allKeys = currentRows.map(p => p._id);
      setSelectedRowKeys(allKeys);
    } else {
      setSelectedRowKeys([]);
    }
  };

  const onSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRowKeys(prev => [...prev, id]);
    } else {
      setSelectedRowKeys(prev => prev.filter(k => k !== id));
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className="min-h-screen px-2 py-2">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">{t.trash}</h1>

        {/* Dropdown + Filters */}
        <div className="flex items-center gap-4">
          <ConfigProvider theme={{ token: { colorPrimary: "#41398B" } }}>
            <Select
              value={selectedType}
              onChange={(value) => {
                setSelectedType(value);
                setCurrentPage(1);
              }}
              className="min-w-[140px]"
              size="large"
              options={[
                { value: "All", label: t.allTypes },
                { value: "Sale", label: t.sale },
                { value: "Lease", label: t.lease },
                { value: "Home Stay", label: t.homeStay },
              ]}
            />
          </ConfigProvider>

          <button
            onClick={() => setShowFilterPopup(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t.filter}
          </button>
        </div>
      </div>

      {/* SEARCH */}
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
          className="w-full pl-10 pr-4 py-3 rounded-full bg-white focus:ring-2 focus:ring-gray-300"
        />
      </div>

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
            Clear All Filters
          </button>
        </div>
      )}

      {/* BULK ACTIONS BAR */}
      {selectedRowKeys.length > 0 && (
        <div className="flex items-center gap-4 mb-4 bg-purple-50 p-4 rounded-xl border border-purple-100 animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-semibold text-[#41398B]">
            {selectedRowKeys.length} {t.selected}
          </span>
          <div className="h-4 w-px bg-purple-200"></div>
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t.deleteSelected}
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <table className="w-full text-sm text-gray-700 text-center">
            <thead className="bg-[#EAE9EE] text-gray-600">
              <tr>
                <th className="px-6 py-3 w-12">
                  <Checkbox
                    checked={currentRows.length > 0 && selectedRowKeys.length === currentRows.length}
                    indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < currentRows.length}
                    onChange={onSelectAll}
                  />
                </th>
                <th className="px-6 py-3">{t.propertyId}</th>
                <th className="px-6 py-3">{t.propertyNo}</th>
                <th className="px-6 py-3">{t.propertyType}</th>
                <th className="px-6 py-3">{t.ownerName}</th>
                <th className="px-6 py-3">{t.ownerPhone}</th>
                <th className="px-6 py-3">{t.status}</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>

            <tbody>
              {currentRows.map((p, i) => {
                const info = p.listingInformation;
                const ownerName = p.contactManagement?.contactManagementOwner?.[language] || p.contactManagement?.contactManagementOwner?.en || "—";
                const ownerPhone = p.contactManagement?.contactManagementOwnerPhone?.join(", ") || "—";

                return (
                  <tr
                    key={p._id}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedRowKeys.includes(p._id)}
                        onChange={(e) => onSelectRow(p._id, e.target.checked)}
                      />
                    </td>

                    <td className="px-6 py-4">
                      {info?.listingInformationPropertyId}
                    </td>

                    <td className="px-6 py-4">
                      {info?.listingInformationPropertyNo?.en || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {info?.listingInformationPropertyType?.[language] || info?.listingInformationPropertyType?.en || "—"}
                    </td>

                    <td className="px-6 py-4">{ownerName}</td>

                    <td className="px-6 py-4">{ownerPhone}</td>

                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                        {p.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      {/* VIEW */}
                      <a
                        href={`/property-showcase/${info?.listingInformationPropertyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border rounded-full hover:bg-gray-100 flex items-center justify-center h-10 w-10"
                      >
                        <Eye className="w-4 h-4" />
                      </a>

                      {/* RESTORE */}
                      <button
                        onClick={() => handleRestore(p._id)}
                        className="p-2 border rounded-full hover:bg-gray-100"
                      >
                        <RotateCcw className="w-4 h-4 text-green-600" />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() =>
                          setDeleteConfirm({ show: true, id: p._id })
                        }
                        className="p-2 border rounded-full hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentRows.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    {t.noTrashProperties}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalRows > 0 && (
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t mt-4 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>{t.rowsPerPage}:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <p>
              {startIndex}-{endIndex} {t.of} {totalRows}
            </p>

            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              &lt;
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {t.confirmPermanentDelete}
            </h2>

            <p className="text-gray-600 mb-6">
              {t.permanentDeleteWarning}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-5 py-2 border rounded-full"
              >
                {t.cancel}
              </button>

              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-full"
              >
                {t.deletePermanently}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER MODAL */}
      {showFilterPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-5xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end">
              <button
                onClick={() => setShowFilterPopup(false)}
                className="p-2 rounded-full"
              >
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
      {/* BULK DELETE CONFIRM MODAL */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{t.confirmBulkDelete?.replace('{count}', selectedRowKeys.length)}</h2>
            <p className="text-gray-600 mb-6">
              {t.permanentDeleteWarning}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-5 py-2 border rounded-full"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-full"
              >
                {t.deleteAll}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ======================================================
   Skeleton Loader
====================================================== */
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-6 py-4 bg-white"
        >
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-18 h-14 bg-gray-300 rounded-lg" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-3 bg-gray-300 rounded w-2/3" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-300 rounded w-24" />
          <div className="h-3 bg-gray-300 rounded w-20" />
          <div className="h-3 bg-gray-300 rounded w-24" />
          <div className="h-6 bg-gray-300 rounded-full w-20" />
        </div>
      ))}
    </div>
  );
};
