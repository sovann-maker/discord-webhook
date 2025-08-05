"use client";

import { useState } from "react";
import MessageForm from "./components/index";
import DailyReportForm from "./components/DailyReportForm";

export default function Home() {
  const [activeTab, setActiveTab] = useState("message");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Discord Webhook Tools
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab("message")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "message"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              💬 Message Form
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "report"
                  ? "bg-green-500 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📊 Daily Report
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex justify-center">
          {activeTab === "message" ? <MessageForm /> : <DailyReportForm />}
        </div>
      </div>
    </div>
  );
}
