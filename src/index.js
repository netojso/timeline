import React from "react";
import ReactDOM from "react-dom/client";
import Timeline from "./components/Timeline";
import timelineItems from "./timelineItems"

export default function App() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Airtable Timeline Assignment</h1>
            </div>
          </div>
        </div>
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);