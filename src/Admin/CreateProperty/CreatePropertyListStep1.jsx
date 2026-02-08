import React, { useState, useEffect, useCallback, memo } from "react";
import { ArrowRight, CirclePlus, Trash2 } from "lucide-react";
import { getNextPropertyId, validatePropertyNo } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { Select as AntdSelect, Switch } from "antd";
import iconOptions from "../../data/iconOptions";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { usePermissions } from "../../Context/PermissionContext";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

/* ======================================================
   REUSABLE INPUT COMPONENTS
====================================================== */
const Input = memo(
  ({ label, name, type = "text", value, onChange, placeholder }) => (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder || ""}
        className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
      />
    </div>
  )
);
const Select = memo(({ label, name, value, onChange, options = [], lang }) => {
  const { Option } = AntdSelect;

  // Get visible label for UI
  const getLabel = (opt) => {
    if (name === "unit") return opt.symbol?.[lang] || "";
    return opt.name?.[lang] || "";
  };

  // Full localized object {en,vi}
  const getValueObject = (opt) => {
    if (name === "unit") {
      return { en: opt.symbol?.en || "", vi: opt.symbol?.vi || "" };
    }
    return { en: opt.name?.en || "", vi: opt.name?.vi || "" };
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">{label}</label>

      <AntdSelect
        showSearch
        allowClear
        labelInValue
        placeholder={lang === "en" ? "Select" : "Chọn"}
        className="w-full h-12 custom-select"
        popupClassName="custom-dropdown"

        /* Selected value MUST be STRING */
        value={
          value
            ? {
              value: JSON.stringify(value),  // store string
              label: value[lang] || "",      // visible text
            }
            : undefined
        }

        /* When user selects → restore object */
        onChange={(option) => {
          const obj = JSON.parse(option.value); // full {en,vi}

          onChange({
            target: {
              name,
              value: obj,       // store the localized object
            },
          });
        }}

        filterOption={(input, option) =>
          option?.label?.toLowerCase().includes(input.toLowerCase())
        }
      >
        {options.map((opt) => {
          const fullObj = getValueObject(opt); // {en,vi}
          const label = getLabel(opt);         // string

          return (
            <Option
              key={`${name}-${label}`}
              value={JSON.stringify(fullObj)}   // STRING ONLY
              label={label}                     // STRING
              children={label}                  // STRING
            >
              {label}
            </Option>
          );
        })}
      </AntdSelect>
    </div>
  );
});

/* ======================================================
   LOCALIZED INPUT + TEXTAREA
====================================================== */
const LocalizedInput = memo(
  ({ label, name, lang, value, onChange, placeholder }) => (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label}
      </label>
      <input
        name={name}
        value={value || ""}
        onChange={(e) => onChange(lang, name, e.target.value)}
        placeholder={
          placeholder || (lang === "en" ? "Type here" : "Nhập tại đây")
        }
        className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
      />
    </div>
  )
);

const LocalizedTextarea = memo(
  ({ label, name, lang, value, onChange, placeholder }) => (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label}
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={(e) => onChange(lang, name, e.target.value)}
        placeholder={
          placeholder || (lang === "en" ? "Type here" : "Nhập tại đây")
        }
        rows={3}
        className="border border-[#B2B2B3] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 outline-none"
      />
    </div>
  )
);

const LocalizedRichText = memo(
  ({ label, name, lang, value, onChange, placeholder }) => {
    const modules = {
      toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'clean']
      ],
    };

    const formats = [
      'header',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link'
    ];

    return (
      <div className="flex flex-col">
        <label className="text-sm text-[#131517] font-semibold mb-2">
          {label}
        </label>
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={(content) => onChange(lang, name, content)}
          placeholder={placeholder || (lang === "en" ? "Type here" : "Nhập tại đây")}
          modules={modules}
          formats={formats}
          className="bg-white rounded-lg"
        />
        <style>{`
          .ql-container.ql-snow {
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            border-color: #B2B2B3;
          }
          .ql-toolbar.ql-snow {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            border-color: #B2B2B3;
          }
          .ql-editor {
            min-height: 120px;
          }
        `}</style>
      </div>
    );
  }
);

const DatePicker = memo(({ label, name, value, onChange }) => {
  const [date, setDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (value && (!date || new Date(value).getTime() !== date.getTime())) {
      setDate(new Date(value));
    }
  }, [value]); // eslint-disable-line

  const handleSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    onChange({
      target: {
        name,
        value: format(selectedDate, "yyyy-MM-dd"),
      },
    });
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm text-[#131517] font-semibold mb-2">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between text-left font-normal h-12 border border-[#B2B2B3] rounded-lg px-3 py-2 ${!date && "text-muted-foreground"
              }`}
          >
            {date ? format(date, "dd/MM/yyyy") : <span>Select date</span>}
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            modifiers={{ disabled: { after: new Date(2100, 0, 1) } }}
            initialFocus={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});

/* ✅ Skeleton Loader Component */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white border border-gray-100 rounded-2xl p-10 animate-pulse">
    <div className="h-6 bg-[#41398b29] rounded w-40 mb-6"></div>
    {[...Array(3)].map((_, sectionIndex) => (
      <div key={sectionIndex} className="mb-8">
        <div className="h-5 bg-[#41398b29] rounded w-48 mb-4"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 bg-[#41398b29] rounded w-24"></div>
              <div className="h-12 bg-[#41398b29] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
    <div className="flex justify-end mt-10">
      <div className="h-10 w-32 bg-[#41398b29] rounded-full"></div>
    </div>
  </div>
);

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function CreatePropertyListStep1({
  initialData = {},
  onNext,
  onChange,
  defaultTransactionType,
  dropdowns, // ✅ Correct
  isEditMode, // ✅ Added
}) {
  useEffect(() => {
    console.log("initialData:", initialData);
  }, [initialData]);

  const { can } = usePermissions();
  const [lang, setLang] = useState("vi");
  const getToday = () => new Date().toISOString().split("T")[0];

  // ✅ Filter property types based on permissions
  const filteredPropertyTypes = React.useMemo(() => {
    if (!dropdowns?.types) return [];

    const hasLeaseAccess = can('properties.lease', 'view');
    const hasSaleAccess = can('properties.sale', 'view');
    const hasHomestayAccess = can('properties.homestay', 'view');

    // If user has access to all, show all types
    if (hasLeaseAccess && hasSaleAccess && hasHomestayAccess) {
      return dropdowns.types;
    }

    // For now, show all types if user has any access
    return dropdowns.types;
  }, [dropdowns?.types, can]);

  const [form, setForm] = useState({
    ...initialData,
    transactionType:
      initialData.transactionType || defaultTransactionType || "Sale",
    blockName: initialData.blockName || { en: "", vi: "" },
    propertyNo: initialData.propertyNo || { en: "", vi: "" },
    title: initialData.title || { en: "", vi: "" },
    address: initialData.address || { en: "", vi: "" },
    description: initialData.description || { en: "", vi: "" },
    view: initialData.view || { en: "", vi: "" },
    whatsNearby: initialData.whatsNearby || { en: "", vi: "" },
    amenities: initialData.amenities || [{ name: "", km: "" }],
    utilities: initialData.utilities || [{ name: "", icon: "" }],
    dateListed: initialData.dateListed || getToday(),
    projectId: initialData.projectId || "",
    zoneId: initialData.zoneId || "",
    blockId: initialData.blockId || "",

    listingInformationVisibility: initialData.listingInformationVisibility || {
      transactionType: false,
      propertyId: false,
      projectCommunity: false,
      areaZone: false,
      blockName: false,
      propertyNo: false,
      dateListed: false,
      availableFrom: false,
      availabilityStatus: false,
    },

    propertyInformationVisibility:
      initialData.propertyInformationVisibility || {
        unit: false,
        unitSize: false,
        bedrooms: false,
        bathrooms: false,
        floorRange: false,
        furnishing: false,
        view: false,
      },

    titleVisibility: initialData.titleVisibility || false,
    descriptionVisibility: initialData.descriptionVisibility || false,
    propertyUtilityVisibility: initialData.propertyUtilityVisibility || false,
  });

  console.log("form", form)

  // ✅ Auto-generate ID when transactionType changes
  useEffect(() => {
    if (isEditMode) return; // ✅ Skip if editing
    if (!form.transactionType) return;

    getNextPropertyId(form.transactionType)
      .then((res) => {
        setForm((prev) => ({
          ...prev,
          propertyId: res.data.nextId,
        }));
      })
      .catch((err) => console.log(err));
  }, [form.transactionType, isEditMode]);

  const loading =
    !dropdowns ||
    !dropdowns.properties ||
    !dropdowns.zones ||
    !dropdowns.blocks ||
    !dropdowns.types ||
    !dropdowns.units ||
    !dropdowns.furnishings ||
    !dropdowns.statuses ||
    !dropdowns.floorRanges;

  /* ✅ Sync when editing an existing property */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0 && dropdowns?.properties && dropdowns?.zones && dropdowns?.blocks) {

      let newFormUpdates = {
        ...initialData,
        blockName: initialData.blockName || form.blockName || { en: "", vi: "" },
        title: initialData.title || form.title || { en: "", vi: "" },
        address: initialData.address || form.address || { en: "", vi: "" },
        description: initialData.description || form.description || { en: "", vi: "" },
        view: initialData.view || form.view || { en: "", vi: "" },
        whatsNearby: initialData.whatsNearby || form.whatsNearby || { en: "", vi: "" },
        utilities: initialData.utilities && initialData.utilities.length ? initialData.utilities : form.utilities,
      };

      /* --------------------------------------------------------------------
         ⭐⭐ RESTORE ZONE + BLOCK + PROJECT (FULL RESTORE SYSTEM)
      -------------------------------------------------------------------- */

      // Helper to find item by ID or Name
      const findItem = (list, id, nameObj) => {
        if (id) {
          const found = list.find(item => item._id === id);
          if (found) return found;
        }
        if (nameObj?.en) {
          return list.find(item => item.name?.en === nameObj.en);
        }
        return null;
      };

      // 1) Restore Project
      const project = findItem(dropdowns.properties, initialData.projectId, initialData.projectName);
      if (project) {
        newFormUpdates.projectId = project._id;
        newFormUpdates.projectName = project.name;
      }

      // 2) Restore Zone
      const zone = findItem(dropdowns.zones, initialData.zoneId, initialData.zoneName);
      if (zone) {
        newFormUpdates.zoneId = zone._id;
        newFormUpdates.zoneName = zone.name;
        newFormUpdates.zone = {
          en: zone.name?.en || "",
          vi: zone.name?.vi || "",
        };
      }

      // 3) Restore Block
      const block = findItem(dropdowns.blocks, initialData.blockId, initialData.blockName);
      if (block) {
        newFormUpdates.blockId = block._id;
        // Logic to determine display text based on available name
        const displayName = lang === "vi" ? block.name?.vi : block.name?.en;
        newFormUpdates.blockNameText = displayName;
        newFormUpdates.blockName = block.name;
      }

      setForm((prev) => ({
        ...prev,
        ...newFormUpdates
      }));
    }
  }, [initialData, dropdowns]); // eslint-disable-line

  // ✅ Auto-select default UNIT
  // Auto-select default UNIT (localized object)
  useEffect(() => {
    if (!dropdowns?.units?.length) return;

    // Skip if unit already set (edit mode)
    if (form.unit && typeof form.unit === "object") return;

    const defUnit = dropdowns.units.find((u) => u.isDefault);
    if (!defUnit) return;

    const fullObj = {
      en: defUnit.symbol?.en || "",
      vi: defUnit.symbol?.vi || "",
    };

    setForm((prev) => ({
      ...prev,
      unit: fullObj,
    }));

    onChange &&
      onChange({
        ...form,
        unit: fullObj,
      });
  }, [dropdowns?.units]);

  /* Handlers */
  const handleInputChange = useCallback(
    (e) => {
      let name, value;

      if (e?.target) {
        name = e.target.name;
        value = e.target.value;
      } else if (typeof e === "object" && e.name) {
        name = e.name;
        value = e.value;
      } else {
        console.warn("handleInputChange: invalid event structure", e);
        return;
      }

      const newForm = { ...form, [name]: value };
      setForm(newForm);
      onChange && onChange(newForm);
    },
    [form, onChange]
  );

  const handleLocalizedChange = useCallback((langCode, field, value) => {
    const updated = {
      ...form,
      [field]: { ...(form[field] || { en: "", vi: "" }), [langCode]: value },
    };
    setForm(updated);
    onChange && onChange(updated);
  }, [form, onChange]);

  const handleUtilityChange = (i, f, v) => {
    const u = [...form.utilities];
    u[i][f] = v;
    const updated = { ...form, utilities: u };
    setForm(updated);
    onChange && onChange(updated);
  };

  const addUtility = () => {
    const updated = {
      ...form,
      utilities: [...form.utilities, { name: "", icon: "" }],
    };
    setForm(updated);
    onChange && onChange(updated);
  };

  const removeUtility = (i) => {
    const updated = {
      ...form,
      utilities: form.utilities.filter((_, x) => x !== i),
    };
    setForm(updated);
    onChange && onChange(updated);
  };

  const t = {
    listingInfo: lang === "en" ? "Listing Information" : "Thông Tin Niêm Yết",
    propertyInfo:
      lang === "en" ? "Property Information" : "Thông Tin Bất Động Sản",
    whatsNearby: lang === "en" ? "What's Nearby?" : "Gần Đây Có Gì?",
    description: lang === "en" ? "Description" : "Mô Tả",
    propertyUtility:
      lang === "en" ? "Property Utility" : "Tiện Ích Bất Động Sản",
  };

  const { Option } = AntdSelect;

  const [searchValue, setSearchValue] = useState("");

  // Filter + prioritize dynamically
  const filteredIcons = iconOptions
    .filter((opt) =>
      opt.labelText.toLowerCase().includes(searchValue.toLowerCase())
    )
    .sort((a, b) => {
      const q = searchValue.toLowerCase();
      const aText = a.labelText.toLowerCase();
      const bText = b.labelText.toLowerCase();
      const aStarts = aText.startsWith(q);
      const bStarts = bText.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aText.localeCompare(bText);
    });

  const syncLinkedFields = useCallback(
    (changedField, value, label) => {
      let updated = { ...form, [changedField]: value };

      const { properties, zones, blocks } = dropdowns;

      /* ✅ CASE 1 — User selected BLOCK */
      if (changedField === "blockId") {
        const block = blocks.find((b) => b._id === value);
        if (block) {
          updated.blockNameText = label;
          updated.blockName = {
            en: block.name?.en || label,
            vi: block.name?.vi || label,
          };

          // set zone
          updated.zoneId = block.zone?._id || "";
          updated.zoneName =
            lang === "vi" ? block.zone?.name?.vi : block.zone?.name?.en;
          updated.zone = {
            en: block.zone?.name?.en || updated.zoneName || "",
            vi: block.zone?.name?.vi || updated.zoneName || "",
          };

          // set project
          updated.projectId = block.property?._id || "";
          updated.projectName =
            lang === "vi" ? block.property?.name?.vi : block.property?.name?.en;
        }
      }

      /* ✅ CASE 2 — User selected ZONE */
      if (changedField === "zoneId") {
        const zone = zones.find((z) => z._id === value);
        if (zone) {
          updated.zoneName = label;
          updated.zone = {
            en: zone.name?.en || label,
            vi: zone.name?.vi || label,
          };

          // ensure project matches zone
          updated.projectId = zone.property?._id || "";
          updated.projectName =
            lang === "vi" ? zone.property?.name?.vi : zone.property?.name?.en;

          // auto-pick first block under this zone
          const zoneBlocks = blocks.filter((b) => b.zone?._id === zone._id);
          if (zoneBlocks.length > 0) {
            const firstBlock = zoneBlocks[0];
            updated.blockId = firstBlock._id;
            updated.blockNameText =
              lang === "vi" ? firstBlock.name?.vi : firstBlock.name?.en;
            updated.blockName = {
              en: firstBlock.name?.en || updated.blockNameText || "",
              vi: firstBlock.name?.vi || updated.blockNameText || "",
            };
          } else {
            updated.blockId = "";
            updated.blockNameText = "";
            updated.blockName = { en: "", vi: "" };
          }
        } else {
          // zone cleared
          updated.zoneName = "";
          updated.zone = { en: "", vi: "" };
          updated.blockId = "";
          updated.blockNameText = "";
          updated.blockName = { en: "", vi: "" };
        }
      }

      /* ✅ CASE 3 — User selected PROJECT */
      if (changedField === "projectId") {
        const project = properties.find((p) => p._id === value);

        updated.projectId = value || "";
        updated.projectName = label || "";

        // Filter zones by selected project
        const projectZones = (dropdowns.zones || []).filter(
          (z) => z.property?._id === value
        );

        // Auto-select first zone (if exists)
        if (projectZones.length > 0) {
          const firstZone = projectZones[0];
          updated.zoneId = firstZone._id;
          updated.zoneName =
            lang === "vi" ? firstZone.name?.vi : firstZone.name?.en;
          updated.zone = {
            en: firstZone.name?.en || updated.zoneName || "",
            vi: firstZone.name?.vi || updated.zoneName || "",
          };

          // Auto-select first block in that zone (if exists)
          const zoneBlocks = (dropdowns.blocks || []).filter(
            (b) => b.zone?._id === firstZone._id
          );
          if (zoneBlocks.length > 0) {
            const firstBlock = zoneBlocks[0];
            updated.blockId = firstBlock._id;
            updated.blockNameText =
              lang === "vi" ? firstBlock.name?.vi : firstBlock.name?.en;
            updated.blockName = {
              en: firstBlock.name?.en || updated.blockNameText || "",
              vi: firstBlock.name?.vi || updated.blockNameText || "",
            };
          } else {
            updated.blockId = "";
            updated.blockNameText = "";
            updated.blockName = { en: "", vi: "" };
          }
        } else {
          // no zones for this project
          updated.zoneId = "";
          updated.zoneName = "";
          updated.zone = { en: "", vi: "" };

          updated.blockId = "";
          updated.blockNameText = "";
          updated.blockName = { en: "", vi: "" };
        }
      }

      setForm(updated);
      onChange && onChange(updated);
    },
    [form, dropdowns, lang, onChange]
  );

  if (loading) return <SkeletonLoader />;

  return (
    <div className="min-h-screen bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
      {/* Language Toggle */}
      <div className="flex mb-6 border-b border-gray-200">
        {["vi", "en"].map((lng) => (
          <button
            key={lng}
            className={`px-6 py-2 text-sm font-medium ${lang === lng
              ? "border-b-2 border-[#41398B] text-black"
              : "text-gray-500 hover:text-black"
              }`}
            onClick={() => setLang(lng)}
          >
            {lng === "vi" ? "Tiếng Việt (VI)" : "English (EN)"}
          </button>
        ))}
      </div>

      {/* Form Section */}
      <div className=" p-8 pt-2">
        {/* === Listing Info === */}
        <h2 className="text-lg font-semibold mb-8">{t.listingInfo}</h2>
        <div className="grid grid-cols-3 gap-7">
          <div style={{ pointerEvents: "none" }}>
            <Input
              label={lang === "en" ? "Transaction Type" : "Loại giao dịch"}
              name="transactionType"
              value={
                (() => {
                  const type = form.transactionType;
                  const map = {
                    "Sale": { en: "Sale", vi: "Bán" },
                    "Lease": { en: "Lease", vi: "Cho thuê" },
                    "Home Stay": { en: "Home Stay", vi: "Homestay" }
                  };

                  if (typeof type === 'object') {
                    return type?.[lang] || "";
                  }

                  return map[type]?.[lang] || type || "";
                })()
              }
              onChange={(e) => {
                const val = e.target.value;

                setForm((prev) => {
                  // If currently storing object { en, vi }
                  if (typeof prev.transactionType === "object") {
                    return {
                      ...prev,
                      transactionType: {
                        ...prev.transactionType,
                        [lang]: val,
                      },
                    };
                  }

                  // If currently storing a string → convert to object
                  return {
                    ...prev,
                    transactionType: {
                      en: lang === "en" ? val : prev.transactionType || "",
                      vi: lang === "vi" ? val : prev.transactionType || "",
                    },
                  };
                });
              }}
              placeholder={
                lang === "en" ? "Enter Transaction Type" : "Nhập loại giao dịch"
              }
              disabled={!!defaultTransactionType}
            />


          </div>

          <div style={{ pointerEvents: "none" }}>
            <Input
              label={lang === "en" ? "Property ID" : "Mã bất động sản"}
              name="propertyId"
              placeholder={lang === "en" ? "Auto Generated" : "Tự động tạo"}
              value={form.propertyId}
            />
          </div>

          <div className="flex flex-col w-full gap-1">
            {/* ✅ Top Row: Label + Switch */}
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Project / Community" : "Dự án / Khu dân cư"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.listingInformationVisibility?.projectCommunity}
                  style={{
                    backgroundColor: form.listingInformationVisibility?.projectCommunity
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      listingInformationVisibility: {
                        ...p.listingInformationVisibility,
                        projectCommunity: val,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* ✅ Select dropdown below */}
            {/* ========================= PROJECT SELECT ========================= */}
            <AntdSelect
              showSearch
              allowClear
              placeholder={lang === "en" ? "Select Project" : "Chọn dự án"}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              optionFilterProp="label"
              value={form.projectId || undefined}
              onChange={(val) => {
                if (!val) {
                  setForm((p) => ({
                    ...p,
                    projectId: "",
                    projectName: null,
                    zoneId: "",
                    zoneName: null,
                    blockId: "",
                    blockName: null,
                  }));
                  return;
                }

                const project = dropdowns.properties.find(
                  (p) => p._id === val
                );

                setForm((p) => ({
                  ...p,
                  projectName: project?.name || { en: "", vi: "" },
                  projectId: project?._id || "",

                  // ❌ reset zone & block
                  zoneName: null,
                  zoneId: "",
                  blockName: null,
                  blockId: "",
                }));
              }}
            >
              {dropdowns.properties.map((p) => (
                <AntdSelect.Option
                  key={p._id}
                  value={p._id}
                  label={p.name[lang]}
                >
                  {p.name[lang]}
                </AntdSelect.Option>
              ))}
            </AntdSelect>


          </div>


          <div className="flex flex-col w-full gap-1">
            {/* ✅ Top Row: Label + Switch */}
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Area / Zone" : "Khu vực / Vùng"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.listingInformationVisibility?.areaZone}
                  style={{
                    backgroundColor: form.listingInformationVisibility?.areaZone
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      listingInformationVisibility: {
                        ...p.listingInformationVisibility,
                        areaZone: val,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* ✅ Select dropdown below */}
            {/* ========================= ZONE SELECT ========================= */}
            <AntdSelect
              showSearch
              allowClear
              placeholder={lang === "en" ? "Select Zone" : "Chọn khu vực"}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              optionFilterProp="label"
              value={form.zoneId || undefined}
              onChange={(val) => {
                if (!val) {
                  setForm((p) => ({
                    ...p,
                    zoneId: "",
                    zoneName: null,
                    blockId: "",
                    blockName: null,
                  }));
                  return;
                }
                const zone = dropdowns.zones.find((z) => z._id === val);

                setForm((p) => ({
                  ...p,
                  zoneName: zone?.name || { en: "", vi: "" },
                  zoneId: zone?._id || "",

                  // ❌ reset block
                  blockName: null,
                  blockId: "",
                }));
              }}
            >
              {dropdowns.zones
                .filter((z) => z.property?._id === form.projectId)
                .map((z) => (
                  <AntdSelect.Option
                    key={z._id}
                    value={z._id}
                    label={z.name[lang]}
                  >
                    {z.name[lang]}
                  </AntdSelect.Option>
                ))}
            </AntdSelect>
          </div>

          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold">
                {lang === "en" ? "Block Name" : "Tên khối"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.listingInformationVisibility?.blockName}
                  style={{
                    backgroundColor: form.listingInformationVisibility?.blockName
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      listingInformationVisibility: {
                        ...p.listingInformationVisibility,
                        blockName: val,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* ========================= BLOCK SELECT ========================= */}
            <AntdSelect
              showSearch
              allowClear
              placeholder={lang === "en" ? "Select Block" : "Chọn khối"}
              className="w-full custom-select"
              popupClassName="custom-dropdown"
              optionFilterProp="label"
              value={form.blockId || undefined}
              onChange={(val) => {
                if (!val) {
                  setForm((p) => ({
                    ...p,
                    blockId: "",
                    blockName: null,
                  }));
                  return;
                }

                const block = dropdowns.blocks.find((b) => b._id === val);

                setForm((p) => ({
                  ...p,
                  blockName: block?.name || { en: "", vi: "" },
                  blockId: block?._id || "",
                }));
              }}
            >
              {dropdowns.blocks
                .filter((b) => b.zone?._id === form.zoneId)
                .map((b) => (
                  <AntdSelect.Option
                    key={b._id}
                    value={b._id}
                    label={b.name[lang]}
                  >
                    {b.name[lang]}
                  </AntdSelect.Option>
                ))}
            </AntdSelect>

          </div>

          <div className="flex flex-col w-full">
            {/* Top row: Label + Switch */}
            <div className="flex items-center justify-between w-full">
              <label className="text-sm font-medium">
                {lang === "en" ? "Property No" : "Số bất động sản"}
              </label>
              {/* 
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.listingInformationVisibility?.propertyNo}
                  style={{
                    backgroundColor: form.listingInformationVisibility?.propertyNo
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      listingInformationVisibility: {
                        ...p.listingInformationVisibility,
                        propertyNo: val,
                      },
                    }))
                  }
                />
              </div> */}
            </div>

            {/* Input field */}
            <LocalizedInput
              name="propertyNo"
              lang={lang}
              placeholder="Type here"
              value={form.propertyNo?.[lang]}
              onChange={handleLocalizedChange}
            />
          </div>

          <Select
            label={lang === "en" ? "Property Type" : "Loại bất động sản"}
            name="propertyType"
            lang={lang}
            options={filteredPropertyTypes}
            value={form.propertyType}
            onChange={handleInputChange}
          />
          <div style={{ pointerEvents: "none" }}>
            <DatePicker
              label={lang === "en" ? "Date Listed" : "Ngày niêm yết"}
              name="dateListed"
              value={form.dateListed}
              onChange={handleInputChange}
            />
          </div>
          {form.transactionType === "Home Stay" ? (
            ""
          ) : (
            <>
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between ">
                  <label className="text-sm text-[#131517] font-semibold">
                    {lang === "en" ? "Available From" : "Có sẵn từ"}
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {lang === "en" ? "Hide" : "Trốn"}
                    </span>
                    <Switch
                      checked={form.listingInformationVisibility?.availableFrom}
                      style={{
                        backgroundColor: form.listingInformationVisibility?.availableFrom
                          ? "#41398B"
                          : "#d9d9d9",
                      }}
                      onChange={(val) =>
                        setForm((p) => ({
                          ...p,
                          listingInformationVisibility: {
                            ...p.listingInformationVisibility,
                            availableFrom: val,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                {/* ✅ DatePicker Below */}
                <DatePicker
                  name="availableFrom"
                  placeholder={lang === "en" ? "Available From" : "Có sẵn từ"}
                  value={form.availableFrom}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <Select
                label={
                  lang === "en" ? "Availability Status" : "Trạng thái sẵn có"
                }
                name="availabilityStatus"
                lang={lang}
                options={dropdowns.statuses}
                value={form.availabilityStatus}
                onChange={handleInputChange}
              />
            </>
          )}
        </div>

        {/* === Property Info === */}
        <h2 className="text-lg font-semibold mt-8 mb-4">{t.propertyInfo}</h2>
        <div className="grid grid-cols-3 gap-5">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Unit" : "Đơn vị"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.propertyInformationVisibility?.unit}
                  style={{
                    backgroundColor: form.propertyInformationVisibility?.unit
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      propertyInformationVisibility: {
                        ...p.propertyInformationVisibility,
                        unit: val,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <Select
              name="unit"
              lang={lang}
              options={dropdowns.units}
              value={form.unit}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Unit Size" : "Diện tích"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.propertyInformationVisibility?.unitSize}
                  style={{
                    backgroundColor: form.propertyInformationVisibility?.unitSize
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      propertyInformationVisibility: {
                        ...p.propertyInformationVisibility,
                        unitSize: val,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <Input
              name="unitSize"
              value={form.unitSize}
              onChange={handleInputChange}
              placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Bedrooms" : "Phòng ngủ"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.propertyInformationVisibility?.bedrooms}
                  style={{
                    backgroundColor: form.propertyInformationVisibility?.bedrooms
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      propertyInformationVisibility: {
                        ...p.propertyInformationVisibility,
                        bedrooms: val,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <Input
              name="bedrooms"
              value={form.bedrooms}
              onChange={handleInputChange}
              placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Bathrooms" : "Phòng tắm"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.propertyInformationVisibility?.bathrooms}
                  style={{
                    backgroundColor: form.propertyInformationVisibility?.bathrooms
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      propertyInformationVisibility: {
                        ...p.propertyInformationVisibility,
                        bathrooms: val,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <Input
              name="bathrooms"
              value={form.bathrooms}
              onChange={handleInputChange}
              placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            />
          </div>

          <div className="flex flex-col w-full gap-1">
            {/* ✅ Top Row: Label + Switch */}
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Floor Range" : "Phạm vi tầng"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.propertyInformationVisibility?.floorRange}
                  style={{
                    backgroundColor: form.propertyInformationVisibility?.floorRange
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      propertyInformationVisibility: {
                        ...p.propertyInformationVisibility,
                        floorRange: val,
                      },
                    }))
                  }
                />
              </div>
            </div>

            {/* ✅ Floor Range Select Below */}
            <AntdSelect
              showSearch
              allowClear
              placeholder={
                lang === "en" ? "Select Floor Range" : "Chọn phạm vi tầng"
              }

              /* Selected value (must be string) */
              value={
                form.floors && (form.floors.en || form.floors.vi)
                  ? JSON.stringify(form.floors) // store full {en,vi} as string
                  : undefined
              }

              /* On change → restore object */
              onChange={(value) => {
                const parsed = JSON.parse(value); // restore {en,vi}

                const fr = dropdowns.floorRanges.find(
                  (item) =>
                    item.name.en === parsed.en || item.name.vi === parsed.vi
                );

                if (fr) {
                  setForm((prev) => ({
                    ...prev,
                    floorRangeId: fr._id,
                    floors: {
                      en: fr.name.en || "",
                      vi: fr.name.vi || "",
                    },
                  }));
                }
              }}

              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }

              className="w-full custom-select"
              popupClassName="custom-dropdown"

              /* Options (values must be string only) */
              options={dropdowns.floorRanges.map((fr) => ({
                label: lang === "vi" ? fr.name.vi : fr.name.en,
                value: JSON.stringify({ en: fr.name.en, vi: fr.name.vi }), // safe string
              }))}
            />

          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "Furnishing" : "Trang bị nội thất"}
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.propertyInformationVisibility?.furnishing}
                  style={{
                    backgroundColor: form.propertyInformationVisibility?.furnishing
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      propertyInformationVisibility: {
                        ...p.propertyInformationVisibility,
                        furnishing: val,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <Select
              name="furnishing"
              lang={lang}
              options={dropdowns.furnishings}
              value={form.furnishing}
              onChange={handleInputChange}
              placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#131517] font-semibold">
                {lang === "en" ? "View" : "Hướng nhìn"}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {lang === "en" ? "Hide" : "Trốn"}
                </span>
                <Switch
                  checked={form.propertyInformationVisibility?.view}
                  style={{
                    backgroundColor: form.propertyInformationVisibility?.view
                      ? "#41398B"
                      : "#d9d9d9",
                  }}
                  onChange={(val) =>
                    setForm((p) => ({
                      ...p,
                      propertyInformationVisibility: {
                        ...p.propertyInformationVisibility,
                        view: val,
                      },
                    }))
                  }
                />
              </div>
            </div>
            <LocalizedInput
              name="view"
              lang={lang}
              value={form.view?.[lang]}
              onChange={handleLocalizedChange}
              placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
            />
          </div>
        </div>
        <div className="mt-8">
          <LocalizedTextarea
            label={lang === "en" ? "Property Title" : "Tiêu đề bất động sản"}
            name="title"
            lang={lang}
            value={form.title?.[lang]}
            onChange={handleLocalizedChange}
          />
        </div>

        {/* === Description === */}
        <div className="flex flex-col w-full mt-5">
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#131517] font-semibold">
              {lang === "en" ? "Description" : "Mô tả"}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {lang === "en" ? "Hide" : "Trốn"}
              </span>
              <Switch
                checked={form.whatNearbyVisibility}
                style={{
                  backgroundColor: form.whatNearbyVisibility
                    ? "#41398B"
                    : "#d9d9d9",
                }}
                onChange={(val) =>
                  setForm((p) => ({
                    ...p,
                    whatNearbyVisibility: val,
                  }))
                }
              />
            </div>
          </div>
          <LocalizedRichText
            name="description"
            lang={lang}
            value={form.description?.[lang]}
            onChange={handleLocalizedChange}
            placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
          />
        </div>

        {/* === Property Utility === */}
        {/* ✅ Header Row: Title + Add + {lang === "en" ? "Hide" : "Trốn"} Switch */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t.propertyUtility}</h2>
            <button
              onClick={addUtility}
              className="flex items-center text-[#131517] font-semibold hover:text-black cursor-pointer"
            >
              <CirclePlus size={22} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {lang === "en" ? "Hide" : "Trốn"}
            </span>
            <Switch
              checked={form.propertyUtilityVisibility}
              style={{
                backgroundColor: form.propertyUtilityVisibility
                  ? "#41398B"
                  : "#d9d9d9",
              }}
              onChange={(val) =>
                setForm((p) => ({
                  ...p,
                  propertyUtilityVisibility: val,
                }))
              }
            />
          </div>
        </div>

        {/* ✅ Utility Items List */}
        {form.utilities.map((u, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-6 mb-4 items-center pb-3"
          >            {/* ✅ Select Icon */}
            <div className="col-span-5">
              <label className="block text-sm text-[#131517] font-semibold mb-2">
                {lang === "en" ? "Select Icon" : "Chọn biểu tượng"}
              </label>

              <AntdSelect
                showSearch
                allowClear
                placeholder={
                  lang === "en"
                    ? "Search and Select Icon"
                    : "Tìm và chọn biểu tượng"
                }
                labelInValue
                className="w-full custom-select"
                popupClassName="custom-dropdown"

                /* Selected value */
                value={(() => {
                  if (!u.icon) return undefined;
                  const match = iconOptions.find((opt) => opt.icon === u.icon);
                  if (match) {
                    return {
                      value: JSON.stringify({ icon: match.icon, name: match.name }),
                      label: match.name[lang],
                    };
                  }
                  return {
                    value: JSON.stringify({ icon: u.icon, name: u.name }),
                    label: u.name?.[lang],
                  };
                })()}

                /* When user selects */
                onChange={(option) => {
                  const parsed = JSON.parse(option.value); // restore object

                  handleUtilityChange(i, "icon", parsed.icon);
                  handleUtilityChange(i, "name", parsed.name);
                }}

                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {filteredIcons.map((item) => (
                  <AntdSelect.Option
                    key={item.value}
                    value={JSON.stringify({
                      icon: item.icon,
                      name: item.name,
                    })}
                    label={item.name[lang]}
                  >
                    {/* React children allowed because label is string */}
                    <div className="flex items-center gap-2">
                      <img src={item.icon} className="w-5 h-5" alt="" />
                      <span>{item.name[lang]}</span>
                    </div>
                  </AntdSelect.Option>
                ))}
              </AntdSelect>
            </div>

            {/* ✅ Utility Name */}
            <div className="col-span-5">
              <label className="block text-sm text-[#131517] font-semibold mb-2">
                {lang === "en" ? "Utility Name" : "Tên tiện ích"}
              </label>

              <input
                type="text"
                value={u.name?.[lang] || ""}
                onChange={(e) =>
                  setForm((prev) => {
                    const updated = [...prev.utilities];
                    updated[i].name = {
                      ...(updated[i].name || { en: "", vi: "" }),
                      [lang]: e.target.value,
                    };
                    return { ...prev, utilities: updated };
                  })
                }
                placeholder={lang === "en" ? "Type here" : "Nhập tại đây"}
                className="border border-[#B2B2B3] h-12 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-gray-300 outline-none"
              />
            </div>

            {/* ✅ Delete Button */}
            <div className="col-span-2 flex justify-start mt-7">
              {i > 0 && (
                <button
                  onClick={() => removeUtility(i)}
                  className="p-3 text-red-500 cursor-pointer hover:bg-[#fb2c362b] hover:border-[#fb2c36] rounded-full border border-[#B1B1B1]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Next */}
        <div className="text-end flex justify-end">
          <button
            onClick={async () => {
              const syncLangFields = [
                "title",
                "address",
                "description",
                "view",
                "whatsNearby",
              ];
              const updatedForm = { ...form };

              syncLangFields.forEach((field) => {
                const val = updatedForm[field];
                if (val && typeof val === "object") {
                  if (!val.vi || val.vi.trim() === "") val.vi = val.en || "";
                  if (!val.en || val.en.trim() === "") val.en = val.vi || "";
                }
              });

              // ✅ VALIDATE PROPERTY NO BEFORE PROCEEDING
              try {
                if (updatedForm.propertyNo?.en || updatedForm.propertyNo?.vi) {
                  await validatePropertyNo({
                    propertyNo: updatedForm.propertyNo,
                    transactionType: updatedForm.transactionType,
                    excludeId: initialData?._id, // if editing
                  });
                }
              } catch (err) {
                console.error("❌ Property No Validation Error:", err);
                const errorMsg = err.response?.data?.message || "Property No already exists";
                // Show error ONLY if it's about the property number
                if (errorMsg.toLowerCase().includes("property no")) {
                  CommonToaster(errorMsg, "error");
                  return; // 🛑 Stop here
                }
              }

              onChange && onChange(updatedForm);
              onNext({
                ...updatedForm,
                title: updatedForm.title,
                listingInformationVisibility:
                  updatedForm.listingInformationVisibility,
                propertyInformationVisibility:
                  updatedForm.propertyInformationVisibility,
                titleVisibility: updatedForm.titleVisibility,
                descriptionVisibility: updatedForm.descriptionVisibility,
                propertyUtilityVisibility:
                  updatedForm.propertyUtilityVisibility,
              });
            }}
            className="mt-4 px-6 py-2 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-full flex items-center cursor-pointer gap-1.5"
          >
            {lang === "en" ? "Next" : "Tiếp theo"} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div >
  );
}
