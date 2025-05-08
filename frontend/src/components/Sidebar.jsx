const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "gallery", label: "Gallery", icon: "📷" },
    { key: "notes", label: "Notes", icon: "📝" },
    { key: "songs", label: "Songs", icon: "🎵" },
    { key: "dates", label: "Special Dates", icon: "📅" },
  ];

  return (
    <div className="w-60 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">PairLogs</h2>
      <ul className="space-y-2">
        {tabs.map((tab) => (
          <li
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === tab.key
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}>
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
