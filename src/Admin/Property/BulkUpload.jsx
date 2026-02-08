import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { useNavigate, useParams } from "react-router-dom";
import { CommonToaster } from "../../Common/CommonToaster";
import { bulkUploadProperties } from "../../Api/action";
import { translateError } from "../../utils/translateError";

export default function BulkUpload() {
  const { type } = useParams(); // 'lease', 'sale', or 'homestay'
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const fileInputRef = useRef(null);

  console.log("🔧 BulkUpload component loaded");
  console.log("🔧 URL type parameter:", type);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [pendingUploadData, setPendingUploadData] = useState(null);

  // Bulk Upload page translations
  const bulkTranslations = {
    en: {
      title: "Bulk Upload Properties",
      backToManage: "Back to Manage Properties",
      downloadTemplate: "Download CSV Template",
      downloadDesc: "Download a sample CSV template with bilingual headers (English / Vietnamese) to fill in your property data.",
      uploadFile: "Upload CSV File",
      uploadDesc: "Select your filled CSV file to upload properties in bulk.",
      selectFile: "Select CSV File",
      dragDrop: "or drag and drop here",
      uploadValidate: "Upload & Validate",
      uploadCorrect: "Upload Correct Values Only",
      cancel: "Cancel",
      validating: "Validating...",
      uploading: "Uploading...",
      uploadSuccess: "Upload Successful!",
      uploadFailed: "Upload Failed - All Rows Have Errors",
      uploadPartial: "Upload Completed with Some Errors",
      successMsg: "properties uploaded successfully",
      failedMsg: "properties failed to upload",
      fixErrors: "Please fix the errors below and try uploading again.",
      validationErrors: "Validation Errors",
      row: "Row",
      mandatoryFields: "Mandatory Fields",
      optionalFields: "Optional Fields",
      bilingualSupport: "Bilingual Support",
      bilingualDesc: "This template supports bilingual data entry. Each field has two columns - one for English and one for Vietnamese values.",
      noteTitle: "Note:",
      noteDesc: "Please fix the errors in your CSV file and upload again. Make sure all field names match exactly with the template."
    },
    vi: {
      title: "Tải lên hàng loạt bất động sản",
      backToManage: "Quay lại quản lý bất động sản",
      downloadTemplate: "Tải xuống mẫu CSV",
      downloadDesc: "Tải xuống mẫu CSV với tiêu đề song ngữ (Tiếng Anh / Tiếng Việt) để điền thông tin bất động sản của bạn.",
      uploadFile: "Tải lên tệp CSV",
      uploadDesc: "Chọn tệp CSV đã điền để tải lên hàng loạt bất động sản.",
      selectFile: "Chọn tệp CSV",
      dragDrop: "hoặc kéo thả vào đây",
      uploadValidate: "Tải lên & Xác thực",
      uploadCorrect: "Chỉ tải lên giá trị đúng",
      cancel: "Hủy",
      validating: "Đang xác thực...",
      uploading: "Đang tải lên...",
      uploadSuccess: "Tải lên thành công!",
      uploadFailed: "Tải lên thất bại - Tất cả các hàng có lỗi",
      uploadPartial: "Tải lên hoàn tất với một số lỗi",
      successMsg: "bất động sản đã tải lên thành công",
      failedMsg: "bất động sản tải lên thất bại",
      fixErrors: "Vui lòng sửa các lỗi bên dưới và thử tải lên lại.",
      validationErrors: "Lỗi xác thực",
      row: "Hàng",
      mandatoryFields: "Trường bắt buộc",
      optionalFields: "Trường tùy chọn",
      bilingualSupport: "Hỗ trợ song ngữ",
      bilingualDesc: "Mẫu này hỗ trợ nhập liệu song ngữ. Mỗi trường có hai cột - một cho tiếng Anh và một cho tiếng Việt.",
      noteTitle: "Lưu ý:",
      noteDesc: "Vui lòng sửa lỗi trong tệp CSV của bạn và tải lên lại. Đảm bảo tất cả tên trường khớp chính xác với mẫu."
    }
  };

  const bt = bulkTranslations[language];

  // Define field mappings with separate English and Vietnamese columns
  const baseFields = {
    lease: [
      "Project / Community",
      "Area / Zone",
      "Block Name",
      "Property No",
      "Property Type",
      "Available From",
      "Unit",
      "Unit Size",
      "Bedrooms",
      "Bathrooms",
      "Floor Range",
      "Furnishing",
      "View",
      "Property Title",
      "Description",
      "Currency",
      "Lease Price",
    ],
    sale: [
      "Project / Community",
      "Area / Zone",
      "Block Name",
      "Property No",
      "Property Type",
      "Available From",
      "Unit",
      "Unit Size",
      "Bedrooms",
      "Bathrooms",
      "Floor Range",
      "Furnishing",
      "View",
      "Property Title",
      "Description",
      "Currency",
      "Sale Price",
    ],
    homestay: [
      "Project / Community",
      "Area / Zone",
      "Block Name",
      "Property No",
      "Property Type",
      "Unit",
      "Unit Size",
      "Bedrooms",
      "Bathrooms",
      "Floor Range",
      "Furnishing",
      "View",
      "Property Title",
      "Description",
      "Currency",
      "Price Per Night",
    ],
  };

  // Field translations
  const fieldTranslations = {
    "Project / Community": "Dự án / Cộng đồng",
    "Area / Zone": "Khu vực / Vùng",
    "Block Name": "Tên khối",
    "Property No": "Số bất động sản",
    "Property Type": "Loại bất động sản",
    "Available From": "Có sẵn từ",
    "Unit": "Đơn vị",
    "Unit Size": "Diện tích",
    "Bedrooms": "Phòng ngủ",
    "Bathrooms": "Phòng tắm",
    "Floor Range": "Phạm vi tầng",
    "Furnishing": "Trang bị nội thất",
    "View": "Hướng nhìn",
    "Property Title": "Tiêu đề bất động sản",
    "Description": "Mô tả",
    "Currency": "Tiền tệ",
    "Lease Price": "Giá thuê",
    "Sale Price": "Giá bán",
    "Price Per Night": "Giá mỗi đêm",
  };

  // Create bilingual field arrays (alternating English and Vietnamese columns)
  const createBilingualFields = (fields) => {
    const result = [];
    fields.forEach(field => {
      result.push(field); // English column
      result.push(fieldTranslations[field]); // Vietnamese column
    });
    return result;
  };

  const fieldMappings = {
    lease: createBilingualFields(baseFields.lease),
    sale: createBilingualFields(baseFields.sale),
    homestay: createBilingualFields(baseFields.homestay),
  };

  const currentFields = fieldMappings[type] || fieldMappings.lease;
  const currentBaseFields = baseFields[type] || baseFields.lease;

  // Generate sample CSV template with separate English and Vietnamese columns
  const generateTemplate = () => {
    // Use the bilingual fields directly (already alternating EN/VI)
    const headers = currentFields.join(",");

    const sampleRow = currentFields
      .map((field, index) => {
        // Check if it's a Vietnamese column (odd index)
        const isVietnamese = index % 2 === 1;
        const baseField = isVietnamese ? currentBaseFields[Math.floor(index / 2)] : field;

        if (baseField.includes("Price")) return "1000";
        if (baseField === "Bedrooms" || baseField === "Bathrooms") return "2";
        if (baseField === "Unit Size") return "1200";
        if (baseField === "Currency") return "USD";
        if (baseField === "Available From") return "2024-01-01";
        return isVietnamese ? `${field}` : `${field}`;
      })
      .join(",");

    const csvContent = `${headers}\n${sampleRow}`;
    // Add UTF-8 BOM to ensure Excel recognizes the encoding
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${type}_properties_template_${new Date().getTime()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    CommonToaster(t.templateDownloaded, "success");
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        CommonToaster(t.pleaseSelectCSV, "error");
        return;
      }
      setSelectedFile(file);
      setUploadResults(null);
      setErrors([]);
    }
  };

  // Parse CSV file with separate English and Vietnamese columns
  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const rawHeaders = lines[0].split(",").map((h) => h.trim());

    // Process rows and merge EN/VI columns into localized objects
    const rows = lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim());
      const rowData = {};

      // Process pairs of columns (English, Vietnamese)
      currentBaseFields.forEach((baseField, fieldIndex) => {
        const enIndex = fieldIndex * 2;
        const viIndex = fieldIndex * 2 + 1;

        const enValue = values[enIndex] || "";
        const viValue = values[viIndex] || "";

        // For fields that need localization, create {en, vi} object
        // For numeric/date/identifier fields, just use the English value
        if (baseField === "Property No" || baseField === "Unit Size" || baseField === "Bedrooms" ||
          baseField === "Bathrooms" || baseField.includes("Price") ||
          baseField === "Available From" || baseField === "Currency") {
          rowData[baseField] = enValue;
        } else {
          // Create localized object
          rowData[baseField] = { en: enValue, vi: viValue };
        }
      });

      return { rowNumber: index + 2, data: rowData }; // +2 because row 1 is header
    });

    // Return base field names as headers for validation
    return { headers: currentBaseFields, rows };
  };

  // Validate row against master fields
  const validateRow = (rowData, rowNumber) => {
    const errors = [];
    const missingFields = [];

    // Only these three fields are mandatory
    const mandatoryFields = [
      "Project / Community",
      "Area / Zone",
      "Block Name"
    ];

    mandatoryFields.forEach((field) => {
      const value = rowData[field];
      // Check if value is empty (for localized objects, check both en and vi)
      if (typeof value === 'object') {
        if ((!value.en || value.en.trim() === "") && (!value.vi || value.vi.trim() === "")) {
          missingFields.push(field);
        }
      } else {
        if (!value || value.trim() === "") {
          missingFields.push(field);
        }
      }
    });

    // Check for extra fields
    const extraFields = Object.keys(rowData).filter(
      (key) => !currentBaseFields.includes(key)
    );

    if (missingFields.length > 0) {
      errors.push({
        rowNumber,
        type: "missing_fields",
        message: `Missing required fields: ${missingFields.join(", ")}`,
        fields: missingFields,
      });
    }

    if (extraFields.length > 0) {
      errors.push({
        rowNumber,
        type: "extra_fields",
        message: `Unknown fields: ${extraFields.join(", ")}`,
        fields: extraFields,
      });
    }

    // Validate numeric fields (only if they are provided)
    const numericFields = ["Bedrooms", "Bathrooms", "Unit Size"];
    const priceField = currentFields.find((f) => f.includes("Price"));

    numericFields.forEach((field) => {
      if (
        currentFields.includes(field) &&
        rowData[field] &&
        isNaN(rowData[field])
      ) {
        errors.push({
          rowNumber,
          type: "invalid_format",
          message: `${field} must be a number`,
          field,
        });
      }
    });

    if (priceField && rowData[priceField] && isNaN(rowData[priceField])) {
      errors.push({
        rowNumber,
        type: "invalid_format",
        message: `${priceField} must be a number`,
        field: priceField,
      });
    }

    // Validate date format for Available From (only if provided)
    if (
      currentFields.includes("Available From") &&
      rowData["Available From"]
    ) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(rowData["Available From"])) {
        errors.push({
          rowNumber,
          type: "invalid_format",
          message: "Available From must be in YYYY-MM-DD format",
          field: "Available From",
        });
      }
    }

    return errors;
  };

  // Handle file upload - Phase 1: Validate only
  const handleUpload = async () => {
    if (!selectedFile) {
      CommonToaster(t.selectFileFirst, "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      // Read file with UTF-8 encoding
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(selectedFile, 'UTF-8');
      });
      const { headers, rows } = parseCSV(text);

      // Validate headers - only check mandatory fields
      const mandatoryFields = ["Project / Community", "Area / Zone", "Block Name"];
      const headerErrors = [];
      mandatoryFields.forEach((field) => {
        if (!headers.includes(field)) {
          headerErrors.push(field);
        }
      });

      if (headerErrors.length > 0) {
        CommonToaster(
          `CSV template mismatch. Missing mandatory columns: ${headerErrors.join(", ")}`,
          "error"
        );
        setUploading(false);
        return;
      }

      // Simulate initial progress
      setUploadProgress(20);

      // Get transaction type from URL
      const transactionTypeMap = {
        lease: "Lease",
        sale: "Sale",
        homestay: "Home Stay",
      };
      const transactionType = transactionTypeMap[type];

      console.log("🔍 Transaction Type:", transactionType);
      console.log("🔍 CSV Data Length:", text.length);
      console.log("🔍 About to call bulkUploadProperties with:");
      console.log("   - Param 1 (csvData):", text.substring(0, 50) + "...");
      console.log("   - Param 2 (transactionType):", transactionType);
      console.log("   - Param 3 (validateOnly): true");

      // Call backend API with validateOnly=true
      setUploadProgress(40);
      const response = await bulkUploadProperties(text, transactionType, true);

      setUploadProgress(80);

      if (response?.data?.success) {
        const results = response.data.data;

        // Format errors for display
        const formattedErrors = results.errors.map((err) => ({
          rowNumber: err.row,
          type: "validation_error",
          message: err.errors.map((e) => e.message).join(", "),
          fields: err.errors.map((e) => e.field),
        }));

        setErrors(formattedErrors);
        setUploadResults({
          total: results.total,
          successful: results.successful,
          failed: results.failed,
          validRows: results.validRows,
        });

        // Store CSV data for later upload
        setPendingUploadData({
          csvData: text,
          transactionType: transactionType,
          validCount: results.successful,
          errorCount: results.failed,
        });

        setUploadProgress(100);

        if (results.failed === 0) {
          CommonToaster(
            `All ${results.successful} rows are valid! Click 'Upload Valid Rows' to proceed.`,
            "success"
          );
        } else if (results.successful > 0) {
          CommonToaster(
            `${results.successful} rows are valid, ${results.failed} have errors. You can upload the valid rows only.`,
            "warning"
          );
        } else {
          CommonToaster(
            `All rows have errors. Please fix them and try again.`,
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to process CSV file";
      CommonToaster(translateError(errorMessage, t), "error");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Handle confirmed upload of only valid rows
  const handleConfirmedUpload = async () => {
    if (!pendingUploadData) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log("✅ Uploading valid rows only...");
      setUploadProgress(30);

      // Call backend API with validateOnly=false to actually upload
      const response = await bulkUploadProperties(
        pendingUploadData.csvData,
        pendingUploadData.transactionType,
        false // validateOnly = false, so it will actually create properties
      );

      setUploadProgress(80);

      if (response?.data?.success) {
        const results = response.data.data;

        setUploadProgress(100);

        CommonToaster(
          `${t.uploadSuccessful} ${results.successful}!`,
          "success"
        );

        // Update results to show upload is complete
        setUploadResults({
          total: results.total,
          successful: results.successful,
          failed: results.failed,
          validRows: results.successfulProperties,
          uploaded: true, // Mark as uploaded
        });

        setPendingUploadData(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to upload properties";
      CommonToaster(translateError(errorMessage, t), "error");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Reset upload
  const handleReset = () => {
    setSelectedFile(null);
    setUploadResults(null);
    setErrors([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getTransactionTypeLabel = () => {
    if (type === "lease") return "Lease";
    if (type === "sale") return "Sale";
    if (type === "homestay") return "Home Stay";
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{bt.backToManage}</span>
        </button>
        <h1 className="text-3xl font-semibold text-gray-900">
          {bt.title} - {getTransactionTypeLabel()}
        </h1>
        <p className="text-gray-600 mt-2">
          {bt.uploadDesc}
        </p>
      </div>

      {/* Template Download Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Download className="w-6 h-6 text-[#41398B]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {bt.downloadTemplate}
            </h3>
            <p className="text-gray-600 mb-4">
              {bt.downloadDesc}
            </p>
            <button
              onClick={generateTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-[#41398B] hover:bg-[#41398B] text-white rounded-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {bt.downloadTemplate}
            </button>
          </div>
        </div>

        {/* Required Fields Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📝 {bt.bilingualSupport}:</strong> {bt.bilingualDesc}
            </p>
          </div>

          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            {bt.mandatoryFields}:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            {["Project / Community", "Area / Zone", "Block Name"].map((field, index) => (
              <div
                key={index}
                className="text-sm text-white bg-red-500 px-3 py-1 rounded-lg font-medium"
              >
                {field} / {fieldTranslations[field]} *
              </div>
            ))}
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 mt-4">
            {bt.optionalFields}:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {currentBaseFields.filter(f => !["Project / Community", "Area / Zone", "Block Name"].includes(f)).map((field, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
              >
                {field} / {fieldTranslations[field]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {bt.uploadFile}
        </h3>

        {/* File Input */}
        <div className="mb-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${selectedFile
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {selectedFile ? (
                <>
                  <FileText className="w-12 h-12 text-green-600 mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {bt.selectFile}
                  </p>
                  <p className="text-sm text-gray-600">{bt.dragDrop}</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${!selectedFile || uploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#41398B] hover:bg-[#41398be3] text-white cursor-pointer"
              }`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? bt.validating : bt.uploadValidate}
          </button>

          {selectedFile && (
            <button
              onClick={handleReset}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              {bt.cancel}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{bt.validating}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#41398B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {uploadResults && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Total Rows
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {uploadResults.total}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium mb-1">
                Successful
              </p>
              <p className="text-3xl font-bold text-green-700">
                {uploadResults.successful}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-700">
                {uploadResults.failed}
              </p>
            </div>
          </div>

          {/* Success Message - Not Yet Uploaded */}
          {errors.length === 0 && !uploadResults.uploaded && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    All {uploadResults.successful} rows are valid!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Click the button below to upload these properties to the database.
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirmedUpload}
                disabled={uploading}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : `Upload ${uploadResults.successful} Corrected Values`}
              </button>
            </div>
          )}

          {/* Success Message - Already Uploaded */}
          {errors.length === 0 && uploadResults.uploaded && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">
                  Upload Complete!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {uploadResults.successful} properties have been uploaded successfully.
                </p>
              </div>
            </div>
          )}

          {/* Partial Success Message with Action Button - Not Yet Uploaded */}
          {errors.length > 0 && uploadResults.successful > 0 && !uploadResults.uploaded && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">
                    Validation Complete
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {uploadResults.successful} rows are valid and ready to upload. {uploadResults.failed} rows have errors and will be skipped.
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirmedUpload}
                disabled={uploading}
                className="w-full px-6 py-3 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : `Upload ${uploadResults.successful} Corrected Values`}
              </button>
            </div>
          )}

          {/* Partial Success - Already Uploaded */}
          {errors.length > 0 && uploadResults.successful > 0 && uploadResults.uploaded && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">
                    Partial Upload Completed
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {uploadResults.successful} properties were uploaded successfully. {uploadResults.failed} rows had errors and were skipped.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Failed Message */}
          {errors.length > 0 && uploadResults.successful === 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">
                    Upload Failed - All Rows Have Errors
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Please fix the errors below and try uploading again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Validation Errors ({errors.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {error.rowNumber}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-900 mb-1">
                      Row {error.rowNumber}
                    </p>
                    <p className="text-sm text-red-700">{error.message}</p>
                    {error.type === "missing_fields" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {error.fields.map((field, i) => (
                          <span
                            key={i}
                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Please fix the errors in your CSV file and
              upload again. Make sure all field names match exactly with the
              template.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
