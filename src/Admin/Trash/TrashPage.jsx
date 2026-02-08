import React from "react";
import ManageProperty from "../Property/ManageProperty";

export default function TrashPage() {
    return (
        <div className="p-8 pt-3">
            <ManageProperty trashMode={true} />
        </div>
    );
}
