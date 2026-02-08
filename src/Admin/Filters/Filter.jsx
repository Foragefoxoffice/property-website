import React, { useState, useEffect } from "react";
import { Select as AntdSelect } from "antd";
import {
  getAllProperties,
  getAllZoneSubAreas,
  getAllBlocks,
  getAllPropertyTypes,
  getAllFloorRanges,
  getAllCurrencies,
} from "@/Api/action";
import { ArrowRight } from "lucide-react";
import { usePermissions } from "@/Context/PermissionContext";

/* ======================================================
   SIMPLE TEXT INPUT
====================================================== */
const Input = ({ label, value, onChange, name, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm text-[#131517] font-semibold mb-2">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder || ""}
      className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
    />
  </div>
);

/* ======================================================
   SELECT WITH EN/VI SUPPORT (Stores {id, name})
   - value expects { id, name } (or null)
   - onChange(name, { id, name })
====================================================== */
const Select = ({ label, name, value, onChange, options = [], placeholder, lang }) => {
  const { Option } = AntdSelect;

  const getOptionLabel = (opt) => {
    if (!opt) return "";
    // opt may be full object from API (has name.en/name.vi) or already a { label, value } object
    if (opt.name) {
      return lang === "vi" ? opt.name.vi || opt.name.en : opt.name.en || opt.name.vi;
    }
    if (opt.label) return opt.label;
    if (opt.value) return opt.value;
    return "";
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">{label}</label>

      <AntdSelect
        showSearch
        allowClear
        placeholder={placeholder || "Select"}
        value={value?.id || undefined}
        onChange={(val, option) =>
          onChange(name, { id: val, name: option?.label || "" })
        }
        optionFilterProp="children"
        className="w-full h-12 custom-select"
        popupClassName="custom-dropdown"
      >
        {options.map((opt) => {
          const labelText = getOptionLabel(opt);
          const key = opt._id || opt.id || labelText || Math.random();
          const valueId = opt._id || opt.id || opt.value || labelText;
          return (
            <Option key={key} value={valueId} label={labelText}>
              {labelText}
            </Option>
          );
        })}
      </AntdSelect>
    </div>
  );
};

/* ======================================================
   LABELS
====================================================== */
const t = {
  en: {
    propertyInfo: "Property Information",
    priceRange: "Price Range",
    project: "Project / Community",
    zone: "Area / Zone",
    block: "Block Name",
    propertyType: "Property Type",
    propertyNumber: "Property Number",
    floorRange: "Floor Range",
    currency: "Currency",
    from: "From",
    to: "To",
    cancel: "Cancel",
    apply: "Apply",
    clear: "Clear Filters",
  },
  vi: {
    propertyInfo: "Thông tin bất động sản",
    priceRange: "Khoảng giá",
    project: "Dự án / Khu dân cư",
    zone: "Khu vực / Vùng",
    block: "Tên khối",
    propertyType: "Loại bất động sản",
    propertyNumber: "Số bất động sản",
    floorRange: "Phạm vi tầng",
    currency: "Tiền tệ",
    from: "Từ",
    to: "Đến",
    cancel: "Hủy",
    apply: "Áp dụng",
    clear: "Xóa bộ lọc",
  },
};

/* ======================================================
   MAIN FILTERS COMPONENT
====================================================== */
export default function FiltersPage({ onApply, defaultFilters }) {
  const [lang, setLang] = useState("vi");
  const { can } = usePermissions();

  // master lists (full objects)
  const [projectsAll, setProjectsAll] = useState([]);
  const [zonesAll, setZonesAll] = useState([]);
  const [blocksAll, setBlocksAll] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [floorRanges, setFloorRanges] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // visible options (filtered by parent selection)
  const [projects, setProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [blocks, setBlocks] = useState([]);

  // Filter state (stores { id, name } for selects)
  const [filters, setFilters] = useState({
    projectId: null,
    zoneId: null,
    blockId: null,
    propertyType: null,
    propertyNumber: "",
    floorRange: null,
    currency: null,
    priceFrom: "",
    priceTo: "",
  });

  // Generic updater used by Select and Input
  const update = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /* ======================================================
     Load all master dropdowns on mount
  ======================================================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, zRes, bRes, tRes, fRes, cRes] = await Promise.all([
          getAllProperties(),
          getAllZoneSubAreas(),
          getAllBlocks(),
          getAllPropertyTypes(),
          getAllFloorRanges(),
          getAllCurrencies(),
        ]);

        const pList = pRes.data?.data || [];
        const zList = zRes.data?.data || [];
        const bList = bRes.data?.data || [];
        const tList = tRes.data?.data || [];
        const fList = fRes.data?.data || [];
        const cList = cRes.data?.data || [];

        // ✅ Filter to only show Active items in dropdowns
        const filterActive = (items) => items.filter(item => item.status === "Active");

        // master lists
        setProjectsAll(filterActive(pList));
        setZonesAll(filterActive(zList));
        setBlocksAll(filterActive(bList));
        setPropertyTypes(filterActive(tList));
        setFloorRanges(filterActive(fList));

        // FIXED: currency now matches Select component format
        setCurrencies(
          filterActive(cList).map((c) => ({
            id: c._id,
            name: c.currencyName,
            code: c.currencyCode,
            symbol: c.currencySymbol,
          }))
        );

        setProjects(filterActive(pList));
      } catch (err) {
        console.error("Filter dropdown load error:", err);
      }
    };


    load();
  }, [can]);

  // ✅ Filter property types based on permissions
  const filteredPropertyTypes = React.useMemo(() => {
    const hasLeaseAccess = can('properties.lease', 'view');
    const hasSaleAccess = can('properties.sale', 'view');
    const hasHomestayAccess = can('properties.homestay', 'view');

    // If user has access to all, show all types
    if (hasLeaseAccess && hasSaleAccess && hasHomestayAccess) {
      return propertyTypes;
    }

    // For now, show all types if user has any access
    return propertyTypes;
  }, [propertyTypes, can]);

  /* ======================================================
     Apply defaultFilters if provided (normalize to {id,name})
  ======================================================= */
  useEffect(() => {
    if (!defaultFilters) return;

    // helper to normalize incoming id or object
    const normalizeSelect = (key, value) => {
      if (!value) return null;
      // if already object with id
      if (typeof value === "object" && (value.id || value._id)) {
        return { id: value.id || value._id, name: value.name || "" };
      }
      // if string id, try to find name from master lists (after masters loaded)
      return { id: value, name: "" };
    };

    setFilters((prev) => ({
      ...prev,
      projectId: normalizeSelect("projectId", defaultFilters.projectId),
      zoneId: normalizeSelect("zoneId", defaultFilters.zoneId),
      blockId: normalizeSelect("blockId", defaultFilters.blockId),
      propertyType: normalizeSelect("propertyType", defaultFilters.propertyType),
      floorRange: normalizeSelect("floorRange", defaultFilters.floorRange),
      currency: normalizeSelect("currency", defaultFilters.currency),
      propertyNumber: defaultFilters.propertyNumber || "",
      priceFrom: defaultFilters.priceFrom || "",
      priceTo: defaultFilters.priceTo || "",
    }));
  }, [defaultFilters]);

  /* ======================================================
     Whenever project changes -> update visible zones (no auto-select)
  ======================================================= */
  useEffect(() => {
    const projectId = filters.projectId?.id || null;
    if (!projectId) {
      setZones([]);
      setBlocks([]);
      // clear dependent selects
      setFilters((prev) => ({ ...prev, zoneId: null, blockId: null }));
      return;
    }

    // zones filtered by property reference - note: some zone objects store property as id or object
    const filteredZones = zonesAll.filter((z) => {
      // z.property might be id or object
      if (!z) return false;
      if (typeof z.property === "string") return z.property === projectId;
      if (z.property && z.property._id) return z.property._id === projectId;
      return false;
    });

    setZones(filteredZones);

    // clear block list when project changes
    setBlocks([]);
    setFilters((prev) => ({ ...prev, zoneId: null, blockId: null }));
  }, [filters.projectId, zonesAll]);

  /* ======================================================
     Whenever zone changes -> update visible blocks (no auto-select)
  ======================================================= */
  useEffect(() => {
    const zoneId = filters.zoneId?.id || null;
    if (!zoneId) {
      setBlocks([]);
      setFilters((prev) => ({ ...prev, blockId: null }));
      return;
    }

    // filter blocks by block.zone._id or block.zone (string)
    const filteredBlocks = blocksAll.filter((b) => {
      if (!b) return false;
      if (!b.zone) return false;
      if (typeof b.zone === "string") return b.zone === zoneId;
      if (b.zone && b.zone._id) return b.zone._id === zoneId;
      return false;
    });

    setBlocks(filteredBlocks);

    // clear selected block (no auto-selection)
    setFilters((prev) => ({ ...prev, blockId: null }));
  }, [filters.zoneId, blocksAll]);

  /* ======================================================
     If masters load and defaultFilters were ids only,
     try to resolve their display names (best-effort)
  ======================================================= */
  useEffect(() => {
    // resolve names when we have masters
    // resolve names when we have masters
    const resolveName = (selectValue, allList, getNameFn, extraField = null) => {
      if (!selectValue || !selectValue.id) return selectValue;
      const found = allList.find((x) => x._id === selectValue.id || x.id === selectValue.id);
      if (!found) return selectValue;
      const result = { id: selectValue.id, name: getNameFn(found) || selectValue.name || "" };
      if (extraField && found[extraField]) {
        result[extraField] = found[extraField];
      }
      return result;
    };

    setFilters((prev) => {
      const resolvedProject = resolveName(prev.projectId, projectsAll, (p) => p.name?.[lang] || "");
      const resolvedZone = resolveName(prev.zoneId, zonesAll, (z) => z.name?.[lang] || "");
      const resolvedBlock = resolveName(prev.blockId, blocksAll, (b) => b.name?.[lang] || "");
      const resolvedCurrency = resolveName(prev.currency, currencies, (c) => c.name || "", "code");

      return {
        ...prev,
        projectId: resolvedProject,
        zoneId: resolvedZone,
        blockId: resolvedBlock,
        currency: resolvedCurrency
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsAll, zonesAll, blocksAll, lang]);

  /* ======================================================
     Clear button handler
  ======================================================= */
  const handleClear = () => {
    setFilters({
      projectId: null,
      zoneId: null,
      blockId: null,
      propertyType: null,
      propertyNumber: "",
      floorRange: null,
      currency: null,
      priceFrom: "",
      priceTo: "",
    });
    // reset visible lists to initial
    setProjects(projectsAll);
    setZones([]);
    setBlocks([]);
  };

  /* ======================================================
     Render
  ======================================================= */
  return (
    <div className="min-h-screen rounded-2xl p-10">
      {/* language toggle */}
      <div className="flex mb-6 border-b border-gray-200">
        {["vi", "en"].map((lng) => (
          <button
            key={lng}
            className={`px-6 py-2 text-sm font-medium ${lang === lng ? "border-b-2 border-[#41398B] text-black" : "text-gray-500 hover:text-black"
              }`}
            onClick={() => setLang(lng)}
          >
            {lng === "vi" ? "Tiếng Việt (VI)" : "English (EN)"}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-5">{t[lang].propertyInfo}</h3>

      <div className="grid grid-cols-3 gap-7">
        <Select
          label={t[lang].project}
          name="projectId"
          value={filters.projectId}
          onChange={update}
          options={projects}
          lang={lang}
        />

        <Select
          label={t[lang].zone}
          name="zoneId"
          value={filters.zoneId}
          onChange={update}
          options={zones}
          lang={lang}
        />

        <Select
          label={t[lang].block}
          name="blockId"
          value={filters.blockId}
          onChange={update}
          options={blocks}
          lang={lang}
        />

        <Select
          label={t[lang].propertyType}
          name="propertyType"
          value={filters.propertyType}
          onChange={update}
          options={filteredPropertyTypes}
          lang={lang}
        />

        <Input
          label={t[lang].propertyNumber}
          name="propertyNumber"
          value={filters.propertyNumber}
          onChange={update}
          placeholder="Type here"
        />

        <Select
          label={t[lang].floorRange}
          name="floorRange"
          value={filters.floorRange}
          onChange={update}
          options={floorRanges}
          lang={lang}
        />
      </div>

      <h3 className="text-lg font-semibold mt-8 mb-5">{t[lang].priceRange}</h3>

      <div className="grid grid-cols-3 gap-7">
        <Select
          label={t[lang].currency}
          name="currency"
          value={filters.currency}
          onChange={(name, valObj) => {
            // Look up the code from the master list
            const found = currencies.find(c => c.id === valObj.id);
            update(name, { ...valObj, code: found?.code });
          }}
          options={currencies}
          lang={lang}
        />

        <Input
          label={t[lang].from}
          name="priceFrom"
          value={filters.priceFrom}
          onChange={update}
          placeholder="Type here"
        />
        <Input
          label={t[lang].to}
          name="priceTo"
          value={filters.priceTo}
          onChange={update}
          placeholder="Type here"
        />
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <button
          onClick={handleClear}
          className="px-6 py-2 rounded-full cursor-pointer border border-gray-400 text-gray-700"
        >
          {t[lang].clear}
        </button>

        <button
          onClick={() => onApply && onApply(filters)}
          className="px-6 py-2 bg-[#41398B] flex items-center gap-1 hover:bg-[#41398Be3] text-white rounded-full cursor-pointer"
        >
          {t[lang].apply}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
