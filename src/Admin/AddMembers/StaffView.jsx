import React, { useEffect, useState } from "react";
import { ArrowLeft, Phone, Mail, UserCog } from "lucide-react";
import { getAllStaffs } from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

export default function StaffView({ staffId, goBack }) {
  const { language } = useLanguage();
  const t = translations[language];
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getAllStaffs();
        const foundStaff = res.data.data.find((s) => s._id === staffId);
        if (!foundStaff) {
          CommonToaster(
            language === "vi" ? "Không tìm thấy nhân viên" : "Staff not found",
            "error"
          );
          goBack();
          return;
        }
        setStaff(foundStaff);
      } catch (err) {
        console.error(err);
        CommonToaster(
          language === "vi"
            ? "Không thể tải chi tiết nhân viên"
            : "Failed to fetch staff details",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    if (staffId) fetchStaff();
  }, [staffId, language]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
        <div className="w-full max-w-3xl animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-gray-200"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>

          {/* Card Skeleton */}
          <div className="relative bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col sm:flex-row gap-8 border border-gray-100">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex-shrink-0 flex justify-center sm:justify-start">
              <div className="w-44 h-44 rounded-xl bg-gray-200"></div>
            </div>
            <div className="flex-1">
              <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-11/12 bg-gray-200 rounded"></div>
                <div className="h-3 w-10/12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (!staff)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        {language === "vi" ? "Không tìm thấy nhân viên." : "Staff not found."}
      </div>
    );

  const {
    staffsImage,
    staffsName,
    staffsId,
    staffsRole,
    staffsNumber,
    staffsEmail,
    staffsNotes,
  } = staff;

  const defaultImage = "/dummy-img.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9fc] to-[#f4f3fb] px-4 sm:px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-[#41398B] hover:bg-[#41398be3] text-white cursor-pointer transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {language === "vi"
              ? staffsName?.vi || "Chi tiết nhân viên"
              : staffsName?.en || "Staff Details"}
          </h1>
        </div>

        {/* Card */}
        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">

            {/* LEFT — IMAGE */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-xl overflow-hidden bg-[#e7e4fb] flex items-center justify-center">
                <img
                  src={staffsImage || defaultImage}
                  alt={staffsName?.[language] || "Staff"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* MIDDLE — DETAILS */}
            <div className="flex-1 text-gray-800">
              {/* Name */}
              <h2 className="text-xl font-semibold mb-2">
                {staffsName?.[language] || staffsName?.en}
              </h2>

              {/* Phones */}
              {staff.staffsNumbers?.map((phone, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                  <Phone size={16} />
                  <span>{phone}</span>
                </div>
              ))}

              {/* Role */}
              <p className="text-sm text-gray-800 mt-3">
                <span className="font-semibold">{language === "vi" ? "Chức vụ:" : "Role:"}</span>{" "}
                {staffsRole?.[language] || staffsRole?.en || "N/A"}
              </p>

              {/* Staff ID */}
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold">{language === "vi" ? "Mã nhân viên:" : "Staff ID:"}</span>{" "}
                {staffsId}
              </p>
            </div>
          </div>

          {/* NOTES */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-gray-800">
              {language === "vi" ? "Ghi chú" : "Notes"}
            </h3>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {staffsNotes?.[language] ||
                staffsNotes?.en ||
                (language === "vi"
                  ? "Không có ghi chú cho nhân viên này."
                  : "No notes available for this staff.")}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
