import React from "react";
import { ArrowLeft } from "lucide-react";

export default function Steps({
  steps,
  currentStep,
  onNext,
  onPrev,
  onCancel,
  onSubmit, // ✅ Add this line
  children,
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-10 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onCancel}
            className="p-2 rounded-full bg-[#41398B] hover:bg-[#41398be3] cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {steps[currentStep - 1]?.title || "Create Property"}
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between px-2 py-3">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = stepNumber < currentStep;

            return (
              <div
                key={index}
                className="flex items-center gap-2 w-1/4 justify-center"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-md font-semibold ${
                    isActive
                      ? "bg-black text-white"
                      : isCompleted
                      ? "bg-[#009980] text-white"
                      : "bg-[#9994CE] text-[#fff]"
                  }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={`text-md ${
                    isActive
                      ? "text-black font-medium"
                      : isCompleted
                      ? "text-[#009980] font-normal"
                      : "text-[#9994CE]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Step Content */}
      <div className="flex-1 mt-3 px-10 overflow-y-auto pb-32">{children}</div>
    </div>
  );
}
