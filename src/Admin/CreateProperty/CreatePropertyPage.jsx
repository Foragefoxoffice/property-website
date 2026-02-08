/*** COMPLETE & CLEANED CREATE/EDIT PROPERTY PAGE ***/

import React, { useState, useEffect } from "react";
import Steps from "./Steps";
import CreatePropertyListStep1 from "./CreatePropertyListStep1";
import CreatePropertyListStep2 from "./CreatePropertyListStep2";
import CreatePropertyListStep3 from "./CreatePropertyListStep3";
import CreatePropertyListStep4SEO from "./CreatePropertyListStep4SEO";
import CreatePropertyPreview from "./CreatePropertyPreview";
import { useParams, useLocation } from "react-router-dom";
import {
  createPropertyListing,
  updatePropertyListing,
  getSingleProperty,
  getAllProperties,
  getAllZoneSubAreas,
  getAllPropertyTypes,
  getAllAvailabilityStatuses,
  getAllUnits,
  getAllFurnishings,
  getAllParkings,
  getAllPetPolicies,
  getAllBlocks,
  getAllFloorRanges,
  getAllFeeTax,
  getAllLegalDocuments,
  getAllDeposits,
  getAllPayments,
  getAllCurrencies,
  getAllOwners,
  getAllStaffs,
  getMe,
  getNextPropertyId,
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { useNavigate } from "react-router-dom";

/* =====================================================================================
   MAP API → FORM
===================================================================================== */
function mapApiToForm(api) {
  if (!api) return {};

  const safe = (v, fallback = { en: "", vi: "" }) =>
    v && typeof v === "object" ? v : fallback;

  const safeStr = (v) => (v ? v : "");

  return {
    _id: api._id,
    /* -----------------------------------------
       LISTING INFORMATION
    ------------------------------------------ */
    transactionType: safe(api.listingInformation?.listingInformationTransactionType),

    propertyId: safeStr(api.listingInformation?.listingInformationPropertyId),

    projectName: safe(api.listingInformation?.listingInformationProjectCommunity),
    projectId: api.listingInformation?.listingInformationProjectCommunity?._id || "",

    zoneName: safe(api.listingInformation?.listingInformationZoneSubArea),
    zoneId: api.listingInformation?.listingInformationZoneSubArea?._id || "",

    blockName: safe(api.listingInformation?.listingInformationBlockName),
    blockId: api.listingInformation?.listingInformationBlockName?._id || "",

    title: safe(api.listingInformation?.listingInformationPropertyTitle),

    description: safe(api.whatNearby?.whatNearbyDescription),

    propertyNo: safe(api.listingInformation?.listingInformationPropertyNo),

    propertyType: safe(api.listingInformation?.listingInformationPropertyType),

    dateListed:
      api.listingInformation?.listingInformationDateListed?.split("T")[0] || "",

    availabilityStatus: safe(
      api.listingInformation?.listingInformationAvailabilityStatus
    ),

    availableFrom:
      api.listingInformation?.listingInformationAvailableFrom?.split("T")[0] || "",

    googleMapsIframe: safe(api.listingInformation?.listingInformationGoogleMapsIframe), // ✅ Added

    /* -----------------------------------------
       PROPERTY INFORMATION
    ------------------------------------------ */
    unit: safe(api.propertyInformation?.informationUnit),

    unitSize: api.propertyInformation?.informationUnitSize || "",

    bedrooms: api.propertyInformation?.informationBedrooms || "",

    bathrooms: api.propertyInformation?.informationBathrooms || "",

    floors: safe(api.propertyInformation?.informationFloors),

    furnishing: safe(api.propertyInformation?.informationFurnishing),

    view: safe(api.propertyInformation?.informationView),

    /* -----------------------------------------
       UTILITIES
    ------------------------------------------ */
    utilities: (api.propertyUtility || []).map((u) => ({
      name: safe(u.propertyUtilityUnitName),
      icon: safeStr(u.propertyUtilityIcon),
    })),

    /* -----------------------------------------
       IMAGES / VIDEOS
    ------------------------------------------ */
    propertyImages: (api.imagesVideos?.propertyImages || []).map((url) => ({ url })),

    propertyVideos: (api.imagesVideos?.propertyVideo || []).map((url) => ({ url })),

    floorPlans: (api.imagesVideos?.floorPlan || []).map((url) => ({ url })),

    /* -----------------------------------------
       FINANCIAL DETAILS
       (All fields remain unchanged, only localized wrapped)
    ------------------------------------------ */
    currency: api.financialDetails?.financialDetailsCurrency
      ? {
        symbol: api.financialDetails.financialDetailsCurrency,
        code: api.financialDetails.financialDetailsCurrency,
        name: api.financialDetails.financialDetailsCurrency,
      }
      : { symbol: "", code: "", name: "" },

    price: api.financialDetails?.financialDetailsPrice || "",

    leasePrice: api.financialDetails?.financialDetailsLeasePrice || "",

    contractLength: api.financialDetails?.financialDetailsContractLength || "",

    pricePerNight: api.financialDetails?.financialDetailsPricePerNight || "",

    checkIn: api.financialDetails?.financialDetailsCheckIn || "2:00 PM",

    checkOut: api.financialDetails?.financialDetailsCheckOut || "11:00 AM",

    contractTerms: safe(api.financialDetails?.financialDetailsTerms),

    depositPaymentTerms: safe(api.financialDetails?.financialDetailsDeposit),

    maintenanceFeeMonthly: safe(api.financialDetails?.financialDetailsMainFee),

    financialDetailsAgentFee:
      api.financialDetails?.financialDetailsAgentFee || "",

    financialDetailsAgentPaymentAgenda: safe(
      api.financialDetails?.financialDetailsAgentPaymentAgenda
    ),

    financialDetailsFeeTax: safe(api.financialDetails?.financialDetailsFeeTax),

    financialDetailsLegalDoc: safe(api.financialDetails?.financialDetailsLegalDoc),

    /* -----------------------------------------
       VISIBILITY FIELDS
    ------------------------------------------ */
    videoVisibility: api.videoVisibility || false,
    floorImageVisibility: api.floorImageVisibility || false,
    googleMapVisibility: api.listingInformationVisibility?.googleMap || false, // ✅ Added root mapping
    titleVisibility: api.titleVisibility || false,
    descriptionVisibility: api.descriptionVisibility || false,
    whatNearbyVisibility: api.whatNearbyVisibility || false,
    propertyUtilityVisibility: api.propertyUtilityVisibility || false,

    listingInformationVisibility: api.listingInformationVisibility || {
      transactionType: false,
      propertyId: false,
      projectCommunity: false,
      areaZone: false,
      blockName: false,
      propertyNo: false,
      dateListed: false,
      availableFrom: false,
      availabilityStatus: false,
      googleMap: false, // ✅ Added
    },

    propertyInformationVisibility: api.propertyInformationVisibility || {
      unit: false,
      unitSize: false,
      bedrooms: false,
      bathrooms: false,
      floorRange: false,
      furnishing: false,
      view: false,
    },

    financialVisibility: api.financialVisibility || {
      contractLength: false,
      deposit: false,
      paymentTerm: false,
      feeTaxes: false,
      legalDocs: false,
      agentFee: false,
      checkIn: false,
      checkOut: false,
    },

    /* -----------------------------------------
       CONTACT MANAGEMENT
    ------------------------------------------ */
    contactManagement: {
      contactManagementOwner: safe(
        api.contactManagement?.contactManagementOwner
      ),
      contactManagementOwnerPhone: api.contactManagement?.contactManagementOwnerPhone || [],
      contactManagementOwnerNotes: safe(
        api.contactManagement?.contactManagementOwnerNotes
      ),
      contactManagementConsultant: safe(
        api.contactManagement?.contactManagementConsultant
      ),
      contactManagementConnectingPoint: safe(
        api.contactManagement?.contactManagementConnectingPoint
      ),
      contactManagementConnectingPointNotes: safe(
        api.contactManagement?.contactManagementConnectingPointNotes
      ),
      contactManagementInternalNotes: safe(
        api.contactManagement?.contactManagementInternalNotes
      ),
      contactManagementSource: safe(
        api.contactManagement?.contactManagementSource
      ),
      contactManagementAgentFee:
        api.contactManagement?.contactManagementAgentFee || "",
    },

    /* -----------------------------------------
       SEO
    ------------------------------------------ */
    seoInformation: {
      metaTitle: safe(api.seoInformation?.metaTitle),
      metaDescription: safe(api.seoInformation?.metaDescription),

      metaKeywords: {
        en: api.seoInformation?.metaKeywords?.en || [],
        vi: api.seoInformation?.metaKeywords?.vi || [],
      },

      slugUrl: safe(api.seoInformation?.slugUrl),
      canonicalUrl: safe(api.seoInformation?.canonicalUrl),
      schemaType: safe(api.seoInformation?.schemaType),

      allowIndexing:
        api.seoInformation?.allowIndexing !== undefined
          ? api.seoInformation.allowIndexing
          : true,

      ogTitle: safe(api.seoInformation?.ogTitle),
      ogDescription: safe(api.seoInformation?.ogDescription),

      ogImages: api.seoInformation?.ogImages || [],
    },

    status: api.status || "Draft",
  };
}

/* ====================================================================== */

export default function CreatePropertyPage({
  editData = null,
  isEditMode = false,
  defaultTransactionType = null,
}) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialStep = parseInt(searchParams.get('step')) || 1;

  const [step, setStep] = useState(initialStep);
  const [propertyData, setPropertyData] = useState({});
  const { id } = useParams();
  const [dropdowns, setDropdowns] = useState({});
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [loadingSingle, setLoadingSingle] = useState(true);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  console.log("propertyData", propertyData)



  /* =====================================================================================
     EDIT MODE → LOAD FULL PROPERTY DATA
  ===================================================================================== */
  useEffect(() => {
    async function loadSingle() {
      if (!isEditMode || !id) {
        setLoadingSingle(false);
        return;
      }

      try {
        setLoadingSingle(true);
        const res = await getSingleProperty(id);
        const full = res.data.data;
        console.log("full data", full)
        setPropertyData(mapApiToForm(full));
      } catch (err) {
        console.log("❌ Single property load error:", err);
      } finally {
        setLoadingSingle(false);
      }
    }

    loadSingle();
  }, [isEditMode, id]);

  /* =====================================================================================
     LOAD DROPDOWNS
  ===================================================================================== */
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const res = await Promise.all([
          getAllProperties(),
          getAllZoneSubAreas(),
          getAllPropertyTypes(),
          getAllAvailabilityStatuses(),
          getAllUnits(),
          getAllFurnishings(),
          getAllParkings(),
          getAllPetPolicies(),
          getAllBlocks(),
          getAllFloorRanges(),
          getAllFeeTax(),
          getAllLegalDocuments(),
          getAllDeposits(),
          getAllPayments(),
          getAllCurrencies(),

          // ✅ Missing before — NOW ADDED
          getAllOwners(),
          getAllStaffs(),
          getMe(),
        ]);

        // ✅ Filter to only show Active items in dropdowns
        const filterActive = (items) => items.filter(item => item.status === "Active");

        setDropdowns({
          properties: filterActive(res[0].data.data),
          zones: filterActive(res[1].data.data),
          types: filterActive(res[2].data.data),
          statuses: filterActive(res[3].data.data),
          units: filterActive(res[4].data.data),
          furnishings: filterActive(res[5].data.data),
          parkings: filterActive(res[6].data.data),
          pets: filterActive(res[7].data.data),
          blocks: filterActive(res[8].data.data),
          floorRanges: filterActive(res[9].data.data),
          feeTaxes: filterActive(res[10].data.data),
          legalDocs: filterActive(res[11].data.data),
          deposits: filterActive(res[12].data.data),
          payments: filterActive(res[13].data.data),
          currencies: filterActive(res[14].data.data),

          // ✅ New
          owners: res[15].data.data,
          staffs: res[16].data.data,
          me: res[17].data.data,
        });
      } catch (err) {
        console.log("Dropdown load error:", err);
      }
    }

    loadDropdowns();
  }, []);


  /* =====================================================================================
     AUTO PROPERTY ID (only CREATE mode)
  ===================================================================================== */
  useEffect(() => {
    if (isEditMode) return;
    if (!propertyData.transactionType) return;

    getNextPropertyId(propertyData.transactionType)
      .then((res) => {
        setPropertyData((prev) => ({
          ...prev,
          propertyId: res.data.nextId,
        }));
      })
      .catch((e) => console.error("ID error:", e));
  }, [propertyData.transactionType, isEditMode]);

  /* =====================================================================================
     BUILD PAYLOAD FOR SUBMIT
  ===================================================================================== */
  function buildPayload(n, d) {
    const num = (v) => (isNaN(v) ? 0 : Number(v));

    const arr = (v) => (Array.isArray(v) ? v : []);

    const wrap = (v) =>
      typeof v === "string"
        ? { en: v, vi: v }
        : { en: v?.en || "", vi: v?.vi || "" };

    return {
      /* ================================================
         LISTING INFORMATION
      ================================================= */
      listingInformation: {
        listingInformationPropertyId: n.propertyId,

        listingInformationTransactionType: wrap(n.transactionType),

        listingInformationProjectCommunity: wrap(n.projectName),

        listingInformationZoneSubArea: wrap(n.zoneName),

        listingInformationBlockName: wrap(n.blockName),

        listingInformationPropertyNo: wrap(n.propertyNo),

        listingInformationPropertyType: wrap(n.propertyType),

        listingInformationDateListed: n.dateListed || "",

        listingInformationAvailabilityStatus: wrap(n.availabilityStatus),

        listingInformationPropertyTitle: wrap(n.title),

        listingInformationAvailableFrom: n.availableFrom || "",
        listingInformationGoogleMapsIframe: wrap(n.googleMapsIframe), // ✅ Added
      },

      /* ================================================
         PROPERTY INFORMATION
      ================================================= */
      propertyInformation: {
        informationUnit: wrap(n.unit),

        informationUnitSize: num(n.unitSize),

        informationBedrooms: num(n.bedrooms),

        informationBathrooms: num(n.bathrooms),

        informationFloors: wrap(n.floors),

        informationFurnishing: wrap(n.furnishing),

        informationView: wrap(n.view),
      },

      /* ================================================
         WHAT'S NEARBY
      ================================================= */
      whatNearby: {
        whatNearbyDescription: wrap(n.description),
      },

      /* ================================================
         PROPERTY UTILITIES
         (icon stays string URL, name stays {en,vi})
      ================================================= */
      propertyUtility: arr(n.utilities).map((u) => ({
        propertyUtilityUnitName: wrap(u.name),
        propertyUtilityIcon: u.icon,
      })),

      /* ================================================
         IMAGES & VIDEOS
      ================================================= */
      imagesVideos: {
        propertyImages: arr(n.propertyImages).map((f) => f.url),
        propertyVideo: arr(n.propertyVideos).map((f) => f.url),
        floorPlan: arr(n.floorPlans).map((f) => f.url),
      },

      /* ================================================
         FINANCIAL DETAILS
      ================================================= */
      financialDetails: {
        financialDetailsCurrency:
          typeof n.currency === "object" ? n.currency.code : n.currency,

        financialDetailsPrice: num(n.price),

        financialDetailsLeasePrice: num(n.leasePrice),

        financialDetailsContractLength: n.contractLength || "",

        financialDetailsPricePerNight: num(n.pricePerNight),

        financialDetailsCheckIn: n.checkIn || "2:00 PM",

        financialDetailsCheckOut: n.checkOut || "11:00 AM",

        financialDetailsTerms: wrap(n.contractTerms),

        financialDetailsDeposit: wrap(n.depositPaymentTerms),

        financialDetailsMainFee: wrap(n.maintenanceFeeMonthly),

        financialDetailsAgentFee: num(n.financialDetailsAgentFee),

        financialDetailsAgentPaymentAgenda: wrap(
          n.financialDetailsAgentPaymentAgenda
        ),

        financialDetailsFeeTax: wrap(n.financialDetailsFeeTax),

        financialDetailsLegalDoc: wrap(n.financialDetailsLegalDoc),
      },

      /* ================================================
         VISIBILITY FIELDS
      ================================================= */
      videoVisibility: n.videoVisibility || false,
      floorImageVisibility: n.floorImageVisibility || false,
      titleVisibility: n.titleVisibility || false,
      descriptionVisibility: n.descriptionVisibility || false,
      whatNearbyVisibility: n.whatNearbyVisibility || false,
      propertyUtilityVisibility: n.propertyUtilityVisibility || false,

      listingInformationVisibility: {
        ...(n.listingInformationVisibility || {}),
        transactionType: n.listingInformationVisibility?.transactionType || false,
        propertyId: n.listingInformationVisibility?.propertyId || false,
        projectCommunity: n.listingInformationVisibility?.projectCommunity || false,
        areaZone: n.listingInformationVisibility?.areaZone || false,
        blockName: n.listingInformationVisibility?.blockName || false,
        propertyNo: n.listingInformationVisibility?.propertyNo || false,
        dateListed: n.listingInformationVisibility?.dateListed || false,
        availableFrom: n.listingInformationVisibility?.availableFrom || false,
        availabilityStatus: n.listingInformationVisibility?.availabilityStatus || false,
        googleMap: n.googleMapVisibility !== undefined ? n.googleMapVisibility : (n.listingInformationVisibility?.googleMap || false), // ✅ Merged
      },

      propertyInformationVisibility: n.propertyInformationVisibility || {
        unit: false,
        unitSize: false,
        bedrooms: false,
        bathrooms: false,
        floorRange: false,
        furnishing: false,
        view: false,
      },

      financialVisibility: n.financialVisibility || {
        contractLength: false,
        deposit: false,
        paymentTerm: false,
        feeTaxes: false,
        legalDocs: false,
        agentFee: false,
        checkIn: false,
        checkOut: false,
      },

      /* ================================================
         CONTACT MANAGEMENT
      ================================================= */
      contactManagement: {
        contactManagementOwner: wrap(
          n.contactManagement?.contactManagementOwner
        ),
        contactManagementOwnerPhone: n.contactManagement?.contactManagementOwnerPhone || [],
        contactManagementOwnerNotes: wrap(
          n.contactManagement?.contactManagementOwnerNotes
        ),

        contactManagementConsultant: wrap(
          n.contactManagement?.contactManagementConsultant
        ),

        contactManagementConnectingPoint: wrap(
          n.contactManagement?.contactManagementConnectingPoint
        ),

        contactManagementConnectingPointNotes: wrap(
          n.contactManagement?.contactManagementConnectingPointNotes
        ),

        contactManagementInternalNotes: wrap(
          n.contactManagement?.contactManagementInternalNotes
        ),

        contactManagementSource: wrap(
          n.contactManagement?.contactManagementSource
        ),

        contactManagementAgentFee:
          n.contactManagement?.contactManagementAgentFee || 0,
      },

      /* ================================================
         SEO
      ================================================= */
      seoInformation: {
        metaTitle: wrap(n.seoInformation?.metaTitle),

        metaDescription: wrap(n.seoInformation?.metaDescription),

        metaKeywords: {
          en: n.seoInformation?.metaKeywords?.en || [],
          vi: n.seoInformation?.metaKeywords?.vi || [],
        },

        slugUrl: wrap(n.seoInformation?.slugUrl),

        canonicalUrl: wrap(n.seoInformation?.canonicalUrl),

        schemaType: wrap(n.seoInformation?.schemaType),

        allowIndexing:
          n.seoInformation?.allowIndexing !== undefined
            ? n.seoInformation.allowIndexing
            : true,

        ogTitle: wrap(n.seoInformation?.ogTitle),

        ogDescription: wrap(n.seoInformation?.ogDescription),

        ogImages: arr(n.seoInformation?.ogImages),
      },

      /* ================================================
         STATUS
      ================================================= */
      status: n.status || "Draft",
    };
  }

  const previewPayload = buildPayload(propertyData, dropdowns);

  /* =====================================================================================
      FINAL SUBMIT (CREATE / UPDATE)
  ===================================================================================== */
  const handleSubmitFinal = async (status) => {
    try {
      const payload = buildPayload(propertyData, dropdowns);
      console.log("🚀 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

      let res;
      if (isEditMode) {
        res = await updatePropertyListing(id, {
          ...payload,
          status,
        });
      } else {
        res = await createPropertyListing({
          ...payload,
          status,
        });
      }

      CommonToaster("Property saved successfully!", "success");
      const routePath = defaultTransactionType.toLowerCase().replace(/\s+/g, '');
      navigate(`/dashboard/${routePath}`);

    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || "Property save failed";
      CommonToaster(errorMsg, "error");
    }
  };

  /* =====================================================================================
      STEP CHANGE HANDLER
  ===================================================================================== */
  const handleStepChange = (data) =>
    setPropertyData((prev) => ({ ...prev, ...data }));

  /* =====================================================================================
      UI STEP CONFIG
  ===================================================================================== */
  const steps = [
    { title: t.createProperty, label: t.listingPropertyInfo },
    { title: t.createProperty, label: t.libraryFinanceInfo },
    { title: t.createProperty, label: t.landlordInfo },
    { title: t.createProperty, label: t.seoInfo },
    { title: t.createProperty, label: t.reviewPublish },
  ];

  /* =====================================================================================
      RENDER STEPS
  ===================================================================================== */
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <CreatePropertyListStep1
            onNext={() => setStep(2)}
            onChange={handleStepChange}
            initialData={propertyData}
            defaultTransactionType={defaultTransactionType}
            dropdowns={dropdowns}
            isEditMode={isEditMode}
          />
        );

      case 2:
        return (
          <CreatePropertyListStep2
            onNext={() => setStep(3)}
            onPrev={() => setStep(1)}
            onChange={handleStepChange}
            initialData={propertyData}
            dropdowns={dropdowns}
          />
        );

      case 3:
        return (
          <CreatePropertyListStep3
            onPrev={() => setStep(2)}
            onNext={() => setStep(4)}
            onChange={handleStepChange}
            initialData={propertyData}
            owners={dropdowns.owners || []}
            staffs={dropdowns.staffs || []}
            me={dropdowns.me || null}
            refreshOwners={async () => {
              try {
                const res = await getAllOwners();
                setDropdowns((prev) => ({
                  ...prev,
                  owners: res.data.data,
                }));
              } catch (err) {
                console.log("Failed to refresh owners:", err);
              }
            }}
          />
        );

      case 4:
        return (
          <CreatePropertyListStep4SEO
            onNext={() => setStep(5)}
            onPrev={() => setStep(3)}
            onChange={handleStepChange}
            initialData={propertyData}
          />
        );

      case 5:
        return (
          <CreatePropertyPreview
            propertyData={previewPayload}
            isEditMode={isEditMode}
            onPublish={handleSubmitFinal}
            onPrev={() => setStep(4)}
          />
        );

      default:
        return null;
    }
  };

  /* =====================================================================================
      RENDER PAGE
  ===================================================================================== */


  if (isEditMode && loadingSingle) {
    return <SkeletonLoader />;
  }

  return (
    <Steps
      steps={steps}
      currentStep={step}
      onNext={() => step < steps.length && setStep(step + 1)}
      onPrev={() => setStep(Math.max(1, step - 1))}
      onCancel={() => navigate(-1)}
      onSubmit={null}
    >
      {renderStepContent()}
    </Steps>
  );
}

/* ✅ Skeleton Loader Component */
const SkeletonLoader = () => (
  <div className="min-h-screen bg-white rounded-2xl shadow-sm border border-gray-100 p-10 animate-pulse">
    <div className="h-8 bg-[#41398b29] rounded w-64 mb-8"></div> {/* Page Title Placeholder */}

    {/* Steps Placeholder */}
    <div className="flex gap-4 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 w-full">
          <div className="h-1 bg-[#41398b29] rounded-full mb-2"></div>
          <div className="h-4 bg-[#41398b29] rounded w-3/4"></div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-10">
      {/* Left Column (Inputs) */}
      <div className="col-span-2 space-y-8">
        <div className="h-6 bg-[#41398b29] rounded w-40 mb-4"></div>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 bg-[#41398b29] rounded w-24"></div>
              <div className="h-12 bg-[#41398b29] rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="h-40 bg-[#41398b29] rounded-lg mt-6"></div>
      </div>

      {/* Right Column (Map/Status/Etc) */}
      <div className="col-span-1 space-y-6">
        <div className="h-64 bg-[#41398b29] rounded-2xl"></div>
        <div className="h-32 bg-[#41398b29] rounded-xl"></div>
      </div>
    </div>
  </div>
);