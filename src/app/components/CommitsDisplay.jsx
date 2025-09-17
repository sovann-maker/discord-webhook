"use client";

import { useState } from "react";

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

// Simple Copy Button Component
const CopyButton = ({ text, label = "Copy", isDarkMode = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1 text-xs rounded border transition-colors ${
        isDarkMode
          ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
          : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {copied ? "✓ Copied!" : `📋 ${label}`}
    </button>
  );
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
      className={`p-3 border-l-4 border-l-blue-500 ${
        isDarkMode
          ? "bg-gray-800/30 border-gray-700"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span>{typeIcon}</span>
            <span className="text-sm font-mono text-gray-500">{timeStr}</span>
            {commit.repoName && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {commit.repoName}
              </span>
            )}
          </div>
          <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            {commit.message}
          </p>
          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
            <span>by {commit.author}</span>
            <span>•</span>
            <span className="font-mono">{commit.hash}</span>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <CopyButton text={commitText} label="Copy" isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

const CommitsDisplay = ({ reportData, isDarkMode = false }) => {
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
      {/* Simple Header with Copy Button */}
      <div
        className={`p-4 rounded border ${
          isDarkMode
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-lg font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            📊 Commits Report
          </h2>
          <CopyButton text={textReport} label="Copy All" isDarkMode={isDarkMode} />
        </div>
        
        <div className="text-sm space-y-1">
          <div>
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Date: {reportData.isDateRange ? `${reportData.startDate} → ${reportData.endDate}` : reportData.date}
            </span>
          </div>
          <div>
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Commits: {reportData.commits.length} | Summary: {reportData.summary}
            </span>
          </div>
        </div>
      </div>

      {/* Simple Commits List */}
      <div className="space-y-2">
        {reportData.commits.map((commit, index) => (
          <SimpleCommitItem
            key={`${commit.hash}-${index}`}
            commit={commit}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
};

export default CommitsDisplay;
