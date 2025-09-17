"use client";

import { useState } from "react";
import CommitsTable from "./CommitsTable";
import { CopyButton } from "@/components/ui/copy-button";

// Utility functions
const formatTime = (timeStr) => {
  if (timeStr.includes(" ")) {
    return timeStr.split(" ")[1]; // Extract time part
  }
  return timeStr;
};

const formatDate = (timeStr) => {
  if (timeStr.includes(" ")) {
    return timeStr.split(" ")[0]; // Extract date part
  }
  return new Date().toISOString().split("T")[0];
};

const categorizeCommit = (message) => {
  const lowerMessage = message.toLowerCase();
  const commitTypes = {
    feat: "feat:",
    fix: "fix:",
    docs: "docs:",
    style: "style:",
    refactor: "refactor:",
    test: "test:",
    chore: "chore:",
  };

  for (const [type, prefix] of Object.entries(commitTypes)) {
    if (lowerMessage.startsWith(prefix)) return type;
  }
  return "other";
};

const getCommitTypeIcon = (type) => {
  const icons = {
    feat: "✨",
    fix: "🐛",
    docs: "📚",
    style: "💄",
    refactor: "♻️",
    test: "🧪",
    chore: "🔧",
    other: "📝",
  };
  return icons[type] || icons.other;
};

// Copy to clipboard function
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};


// Simple Commit Item Component
const SimpleCommitItem = ({ commit, isDarkMode = false }) => {
  const commitType = categorizeCommit(commit.message);
  const typeIcon = getCommitTypeIcon(commitType);
  const timeStr = formatTime(commit.time);
  const repoInfo = commit.repoName ? ` [${commit.repoName}]` : "";

  // Generate simple text for this commit
  const commitText = `${timeStr}${repoInfo} - ${commit.message}\nby ${commit.author} (${commit.hash})`;

  return (
    <div
      className={`p-3 border rounded ${
        isDarkMode
          ? "bg-gray-800/30 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <span className="text-lg">{typeIcon}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
              {commit.message}
            </p>
            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
              <span>{timeStr}</span>
              <span>•</span>
              <span>{commit.author}</span>
              {commit.repoName && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">{commit.repoName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <CopyButton content={commitText} size="sm" variant="outline" />
        </div>
      </div>
    </div>
  );
};

const CommitsDisplay = ({ reportData, isDarkMode = false }) => {
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'table'

  if (!reportData || !reportData.commits || reportData.commits.length === 0) {
    return (
      <div
        className={`p-6 text-center rounded border ${
          isDarkMode
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="text-3xl mb-2">📭</div>
        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
          No Commits Found
        </h3>
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          No commits were found for the selected date range.
        </p>
      </div>
    );
  }

  // Generate simple text format for copying
  const generateTextReport = () => {
    const dateRange = reportData.isDateRange
      ? `${reportData.startDate} to ${reportData.endDate}`
      : reportData.date;
    
    let text = `📊 Daily Development Report - ${dateRange}\n`;
    text += `Total Commits: ${reportData.commits.length}\n`;
    text += `Summary: ${reportData.summary}\n\n`;
    
    if (reportData.repositories && reportData.repositories.length > 0) {
      text += `Repositories:\n`;
      reportData.repositories.forEach(repo => {
        text += `  ${repo.success ? '✅' : '❌'} ${repo.name}: ${repo.commitCount} commits\n`;
      });
      text += `\n`;
    }
    
    text += `Commits:\n`;
    reportData.commits.forEach((commit, index) => {
      const timeStr = formatTime(commit.time);
      const repoInfo = commit.repoName ? ` [${commit.repoName}]` : "";
      text += `${index + 1}. ${timeStr}${repoInfo} - ${commit.message}\n`;
      text += `   by ${commit.author} (${commit.hash})\n\n`;
    });
    
    return text;
  };

  const textReport = generateTextReport();

  return (
    <div className="space-y-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
          📊 Commits ({reportData.commits.length})
        </h2>
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex rounded border">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'simple'
                  ? isDarkMode
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-800"
                  : isDarkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'table'
                  ? isDarkMode
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-800"
                  : isDarkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Table
            </button>
          </div>
          <CopyButton content={textReport} size="sm" variant="outline" />
        </div>
      </div>

      {/* Conditional Rendering */}
      {viewMode === 'simple' ? (
        <div className="space-y-2">
          {reportData.commits.map((commit, index) => (
            <SimpleCommitItem
              key={`${commit.hash}-${index}`}
              commit={commit}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      ) : (
        <CommitsTable
          tableData={reportData.tableData}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default CommitsDisplay;
