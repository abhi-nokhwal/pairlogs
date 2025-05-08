import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Gallery from "./Gallery"; // placeholder
import ImageUpload from "./ImageUpload";

function CoupleDashboard() {
  const [activeTab, setActiveTab] = useState("gallery");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 overflow-auto">
          {/* {activeTab === "gallery" && <Gallery />} */}
          {/* Add more tabs later */}
          <ImageUpload />
          <Gallery />
        </main>
      </div>
    </div>
  );
}

export default CoupleDashboard;
