import React, { useState } from "react";
import ManageProperty from "./ManageProperty";
import CreatePropertyPreview from "../CreateProperty/CreatePropertyPreview";
import CreatePropertyListStep1 from "../CreateProperty/CreatePropertyListStep1";

export default function PropertyManager({
  openCreateProperty,
  openEditProperty,
  propertyTypeFilter, // 👈 new prop (Sale / Lease / Home Stay)
}) {
  const [activeStep, setActiveStep] = useState("list");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const handleViewProperty = (propertyId) => {
    setSelectedPropertyId(propertyId);
    setActiveStep("view");
  };

  const handleBackToList = () => {
    setSelectedPropertyId(null);
    setActiveStep("list");
  };

  return (
    <div className="min-h-screen">
      {activeStep === "list" && (
        <ManageProperty
          openCreateProperty={openCreateProperty}
          openEditProperty={openEditProperty}
          onViewProperty={handleViewProperty}
          filterByTransactionType={propertyTypeFilter} // 👈 filter the list
        />
      )}

      {activeStep === "view" && (
        <CreatePropertyPreview
          savedId={selectedPropertyId}
          onPrev={handleBackToList}
          onPublish={() => handleBackToList()}
        />
      )}

      {activeStep === "create" && (
        <CreatePropertyListStep1
          defaultTransactionType={propertyTypeFilter} // 👈 pre-fill here
          onNext={handleBackToList}
        />
      )}
    </div>
  );
}
