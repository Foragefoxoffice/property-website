import React from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function PropertyMaster() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = translations[language];

  const goBack = () => navigate("/dashboard/masters");

  const propertyData = [
    {
      name: language === "vi" ? "Dự án / Khu dân cư" : "Project / Community",
      description:
        language === "vi"
          ? "Tên của dự án hoặc khu dân cư nơi bất động sản tọa lạc."
          : "The name of the project or community where the property is located.",
      path: "/dashboard/masters/property",
    },
    {
      name: language === "vi" ? "Khu vực / Tiểu khu" : "Zone / Sub-area",
      description:
        language === "vi"
          ? "Khu vực, khối hoặc tiểu khu trong dự án."
          : "Specific section or zone inside a project.",
      path: "/dashboard/masters/zone-sub-area",
    },
    {
      name: language === "vi" ? "Tên khối" : "Block Name",
      description:
        language === "vi"
          ? "Tên block hoặc tòa nhà."
          : "Name of the block or tower.",
      path: "/dashboard/masters/block",
    },
    {
      name: language === "vi" ? "Loại bất động sản" : "Property Type",
      description:
        language === "vi"
          ? "Định nghĩa loại bất động sản."
          : "Defines the category of property.",
      path: "/dashboard/masters/property-type",
    },
    {
      name: language === "vi" ? "Trạng thái khả dụng" : "Availability Status",
      description:
        language === "vi"
          ? "Tình trạng hiện tại của bất động sản."
          : "Shows whether the property is available or occupied.",
      path: "/dashboard/masters/availability-status",
    },
    {
      name: language === "vi" ? "Đơn vị đo lường" : "Unit",
      description:
        language === "vi"
          ? "Đơn vị đo diện tích."
          : "Defines area measurement units.",
      path: "/dashboard/masters/unit",
    },
    {
      name: language === "vi" ? "Phạm vi sàn" : "Floor Range",
      description:
        language === "vi"
          ? "Phạm vi tầng trong tòa nhà."
          : "Floor range of the building.",
      path: "/dashboard/masters/floor-range",
    },
    {
      name: language === "vi" ? "Tình trạng nội thất" : "Furnishing",
      description:
        language === "vi"
          ? "Tình trạng nội thất."
          : "Furnishing level of the property.",
      path: "/dashboard/masters/furnishing",
    },
    {
      name: language === "vi" ? "Tiền đặt cọc" : "Deposit",
      description:
        language === "vi"
          ? "Khoản tiền đặt cọc."
          : "Deposit amount for booking or leasing.",
      path: "/dashboard/masters/deposit",
    },
    {
      name: language === "vi" ? "Điều khoản thanh toán" : "Payment Terms",
      description:
        language === "vi"
          ? "Lịch trình và điều kiện thanh toán."
          : "Payment terms and conditions.",
      path: "/dashboard/masters/payment",
    },
    {
      name: language === "vi" ? "Phí và thuế" : "Fees & Taxes",
      description:
        language === "vi"
          ? "Các loại phí và thuế áp dụng."
          : "Additional fees, charges, and taxes.",
      path: "/dashboard/masters/fee-tax",
    },
    {
      name: language === "vi" ? "Văn bản pháp luật" : "Legal Document",
      description:
        language === "vi"
          ? "Giấy tờ hoặc hợp đồng pháp lý."
          : "Official paperwork or legal documents.",
      path: "/dashboard/masters/legal-document",
    },
  ];

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#41398B] hover:bg-[#41398be3] cursor-pointer text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-900">
          {language === "vi"
            ? "Danh mục quản lý bất động sản"
            : "Property Masters"}
        </h2>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_4fr_auto] bg-gray-50 font-medium text-gray-800 px-6 py-3 border-b border-gray-200">
          <div>{language === "vi" ? "Danh mục" : "Property Masters"}</div>
          <div>{language === "vi" ? "Mô tả" : "Description"}</div>
          <div></div>
        </div>

        {propertyData.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className={`grid grid-cols-[2fr_4fr_auto] items-center px-6 py-4 text-sm text-gray-700 cursor-pointer ${
              index % 2 === 1 ? "bg-gray-50" : "bg-white"
            } hover:bg-gray-100 transition-colors`}
          >
            <div className="font-medium">{item.name}</div>
            <div className="text-gray-600 leading-snug">{item.description}</div>
            <div className="flex justify-end">
              <button className="w-8 h-8 flex items-center justify-center border border-[#41398B] rounded-full hover:bg-[#41398B] hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
