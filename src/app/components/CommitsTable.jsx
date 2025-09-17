"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";


// Export functionality
const exportToCSV = (data, filename = "commits-report.csv") => {
  if (!data || data.length === 0) return;

  const headers = ["Date", "Commit Messages", "Time(s)", "Hash(es)", "Author(s)", "Repository", "Count"];
  
  const csvContent = [
    headers.join(","),
    ...data.map(row => [
      `"${row.date}"`,
      `"${row.message.replace(/"/g, '""')}"`,
      `"${row.time}"`,
      `"${row.hash}"`,
      `"${row.author}"`,
      `"${row.repository}"`,
      row.commitCount
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToJSON = (data, filename = "commits-report.json") => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Table component
const CommitsTable = ({ tableData, isDarkMode = false }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState('');

  if (!tableData || tableData.length === 0) {
    return (
      <div
        className={`p-6 text-center rounded border ${
          isDarkMode
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="text-3xl mb-2">📊</div>
        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
          No Data Available
        </h3>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          No commits found for the selected criteria.
        </p>
      </div>
    );
  }

  // Filter data
  const filteredData = tableData.filter(row =>
    row.message.toLowerCase().includes(filterText.toLowerCase()) ||
    row.author.toLowerCase().includes(filterText.toLowerCase()) ||
    row.repository.toLowerCase().includes(filterText.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-3">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={`px-3 py-1 text-sm border rounded ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => exportToCSV(sortedData)}
            className={`px-2 py-1 text-xs rounded border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            }`}
          >
            CSV
          </button>
          <button
            onClick={() => exportToJSON(sortedData)}
            className={`px-2 py-1 text-xs rounded border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
          <thead>
            <tr className={`${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <th
                className="border p-2 text-left cursor-pointer text-sm"
                onClick={() => handleSort('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th
                className="border p-2 text-left cursor-pointer text-sm"
                onClick={() => handleSort('message')}
              >
                Messages {getSortIcon('message')}
              </th>
              <th
                className="border p-2 text-left cursor-pointer text-sm"
                onClick={() => handleSort('author')}
              >
                Author {getSortIcon('author')}
              </th>
              <th
                className="border p-2 text-left cursor-pointer text-sm"
                onClick={() => handleSort('commitCount')}
              >
                Count {getSortIcon('commitCount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const rowText = `${row.date} - ${row.message}\nAuthor: ${row.author}\nCommits: ${row.commitCount}`;
              
              return (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0
                      ? isDarkMode
                        ? "bg-gray-800/50"
                        : "bg-white"
                      : isDarkMode
                      ? "bg-gray-800/30"
                      : "bg-gray-50"
                  }`}
                >
                  <td className="border p-2 text-sm">{row.date}</td>
                  <td className="border p-2 text-sm max-w-md">
                    <div className="truncate" title={row.message}>
                      {row.message}
                    </div>
                  </td>
                  <td className="border p-2 text-sm">{row.author}</td>
                  <td className="border p-2 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          isDarkMode
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {row.commitCount}
                      </span>
                      <CopyButton 
                        content={rowText} 
                        size="sm" 
                        variant="outline"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CommitsTable;
