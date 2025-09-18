"use client";

import Form from "next/form";
import { useActionState } from "react";
import { generateDailyReport } from "../actions/gitReport";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import RepositorySelector from "./RepositorySelector";
import CommitsDisplay from "./CommitsDisplay";

// Constants
const REPORT_TYPES = {
  SINGLE: "single",
  RANGE: "range",
};

const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.SINGLE]: "Single Date",
  [REPORT_TYPES.RANGE]: "Date Range",
};

// Utility functions
const getTodayDate = () => new Date().toISOString().split("T")[0];

const useFormToast = (formState) => {
  useEffect(() => {
    if (formState?.success) {
      toast.success(formState?.message);
    } else if (formState?.success === false) {
      toast.error(formState?.message);
    }
  }, [formState?.success]);
};

const useReportTypeToggle = () => {
  const [activeReportType, setActiveReportType] = useState(REPORT_TYPES.SINGLE);

  const handleReportTypeChange = useCallback((reportType) => {
    setActiveReportType(reportType);
  }, []);

  return { activeReportType, handleReportTypeChange };
};

// Modern Reusable Components
const ModernCard = ({ children, className = "", isDarkMode = false }) => (
  <div
    className={`rounded-xl shadow-lg border transition-all duration-300 ${
      isDarkMode
        ? "bg-gray-800/50 border-gray-700/50 backdrop-blur-sm"
        : "bg-white border-gray-100"
    } p-6 ${className}`}
  >
    {children}
  </div>
);

const ModernInput = ({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  max,
  disabled,
  helpText,
  className = "",
  isDarkMode = false,
}) => (
  <div className={`space-y-2 ${className}`}>
    <label
      htmlFor={name}
      className={`block text-sm font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-700"
      }`}
    >
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      max={max}
      disabled={disabled}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none font-mono text-sm ${
        isDarkMode
          ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-400 focus:border-transparent hover:border-gray-500"
          : "border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent hover:border-gray-300"
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
          : ""
      }`}
    />
    {helpText && (
      <p
        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
      >
        {helpText}
      </p>
    )}
  </div>
);

const ModernToggle = ({
  options,
  value,
  onChange,
  disabled,
  isDarkMode = false,
}) => (
  <div className="space-y-3">
    <label
      className={`block text-sm font-semibold ${
        isDarkMode ? "text-gray-200" : "text-gray-700"
      }`}
    >
      Report Type
    </label>
    <div
      className={`flex rounded-lg p-1 ${
        isDarkMode ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      {Object.entries(REPORT_TYPE_LABELS).map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          disabled={disabled}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            value === optionValue
              ? isDarkMode
                ? "bg-gray-600 text-blue-300 shadow-sm"
                : "bg-white text-blue-600 shadow-sm"
              : isDarkMode
              ? "text-gray-300 hover:text-gray-100"
              : "text-gray-600 hover:text-gray-800"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

const LoadingState = ({ isPending, isDarkMode = false }) =>
  isPending && (
    <ModernCard className="mt-6" isDarkMode={isDarkMode}>
      <div className="flex items-center justify-center space-x-3">
        <div className="relative">
          <div
            className={`w-8 h-8 border-4 rounded-full ${
              isDarkMode ? "border-gray-600" : "border-blue-200"
            }`}
          ></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <p
            className={`text-sm font-medium ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Generating report...
          </p>
          <p
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Sending to Discord
          </p>
        </div>
      </div>
      <div
        className={`mt-4 rounded-lg p-3 ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-900/20 to-indigo-900/20"
            : "bg-gradient-to-r from-blue-50 to-indigo-50"
        }`}
      >
        <div className="flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Processing Git logs and formatting Discord message</span>
        </div>
      </div>
    </ModernCard>
  );

const SuccessPreview = ({ formState, isPending, isDarkMode = false }) =>
  formState?.reportData &&
  !isPending && (
    <ModernCard
      className={`mt-6 ${
        isDarkMode
          ? "border-green-500/30 bg-green-900/10"
          : "border-green-200 bg-green-50/30"
      }`}
      isDarkMode={isDarkMode}
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h4
          className={`text-sm font-semibold ${
            isDarkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Report Generated Successfully
        </h4>
      </div>

      <div className="space-y-4">
        {formState.reportData.repositories && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Repositories:
              </span>
              <span
                className={`font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {formState.reportData.successfulRepos}/
                {formState.reportData.totalRepos}
              </span>
            </div>
            <div className="space-y-1">
              {formState.reportData.repositories.map((repo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <span
                    className={`flex items-center space-x-1 ${
                      repo.success ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        repo.success ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span>{repo.name}</span>
                  </span>
                  <span
                    className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {repo.commitCount} commits
                    {!repo.success && (
                      <span className="text-red-500 ml-1">({repo.error})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Date Range:
            </span>
            <span
              className={`font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {formState.reportData.isDateRange
                ? `${formState.reportData.startDate} → ${formState.reportData.endDate}`
                : formState.reportData.date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Total Commits:
            </span>
            <span
              className={`font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {formState.reportData.commits.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Summary:
            </span>
            <span
              className={`font-medium text-right ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {formState.reportData.summary}
            </span>
          </div>
        </div>
      </div>
    </ModernCard>
  );

const FeatureCard = ({ icon, title, description, isDarkMode = false }) => (
  <div
    className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 ${
      isDarkMode
        ? "bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/30"
        : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
    }`}
  >
    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm">{icon}</span>
    </div>
    <div>
      <h4
        className={`text-sm font-semibold ${
          isDarkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {title}
      </h4>
      <p
        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
      >
        {description}
      </p>
    </div>
  </div>
);

const DailyReportForm = ({ isDarkMode = false }) => {
  const [formState, formAction, isPending] = useActionState(
    generateDailyReport,
    null
  );
  const [selectedRepoPath, setSelectedRepoPath] = useState(null);

  // Custom hooks
  useFormToast(formState);
  const { activeReportType, handleReportTypeChange } = useReportTypeToggle();

  const today = getTodayDate();

  const handleRepositorySelect = useCallback((repoPath) => {
    // Clean the repository paths by removing quotes and trimming
    if (Array.isArray(repoPath)) {
      const cleanPaths = repoPath.map(path => path.replace(/['"]/g, '').trim());
      setSelectedRepoPath(cleanPaths);
    } else if (typeof repoPath === 'string') {
      const cleanPath = repoPath.replace(/['"]/g, '').trim();
      setSelectedRepoPath(cleanPath);
    } else {
      setSelectedRepoPath(repoPath);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Daily Development Report Generator</span>
        </div>
        <h1
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Generate Git Commit Reports
        </h1>
        <p
          className={`max-w-2xl mx-auto ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Automatically generate comprehensive daily reports from your Git
          commits and send them directly to Discord with beautiful formatting.
        </p>
      </div>

      <Form action={formAction} className="space-y-6">
        {/* Hidden input for repository path */}
        <input
          type="hidden"
          name="repoPath"
          value={
            Array.isArray(selectedRepoPath)
              ? selectedRepoPath.join(",")
              : selectedRepoPath || ""
          }
        />

        {/* Repository Selector */}
        <RepositorySelector
          onRepositorySelect={handleRepositorySelect}
          isDarkMode={isDarkMode}
        />

        {/* Configuration Section */}
        <ModernCard isDarkMode={isDarkMode}>
          <div className="space-y-6">
            {/* Author Filter */}
            <ModernInput
              label="Author Filter (Optional)"
              name="author"
              placeholder="e.g., John Doe, john.doe@email.com"
              disabled={isPending}
              helpText="Filter commits by specific author name or email. Leave empty to include all authors."
              isDarkMode={isDarkMode}
            />

            {/* Report Type Toggle */}
            <ModernToggle
              options={REPORT_TYPE_LABELS}
              value={activeReportType}
              onChange={handleReportTypeChange}
              disabled={isPending}
              isDarkMode={isDarkMode}
            />

            {/* Date Inputs */}
            <div className="space-y-4">
              {activeReportType === REPORT_TYPES.SINGLE ? (
                <ModernInput
                  label="Report Date"
                  name="date"
                  type="date"
                  defaultValue={today}
                  max={today}
                  disabled={isPending}
                  helpText="Select the date for which you want to generate the report"
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ModernInput
                    label="Start Date"
                    name="startDate"
                    type="date"
                    defaultValue={today}
                    max={today}
                    disabled={isPending}
                    isDarkMode={isDarkMode}
                  />
                  <ModernInput
                    label="End Date"
                    name="endDate"
                    type="date"
                    defaultValue={today}
                    max={today}
                    disabled={isPending}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </div>

            {/* Hidden inputs for report type */}
            <input type="hidden" name="reportType" value={activeReportType} />
          </div>
        </ModernCard>

        {/* Features Section */}
        <ModernCard
          className={
            isDarkMode
              ? "bg-gray-800/30"
              : "bg-gradient-to-br from-gray-50 to-blue-50"
          }
          isDarkMode={isDarkMode}
        >
          <h3
            className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>What's Included in Your Report</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureCard
              icon="📊"
              title="Complete Git History"
              description="All commits for the selected date range with timestamps and messages"
              isDarkMode={isDarkMode}
            />
            <FeatureCard
              icon="👤"
              title="Author Filtering"
              description="Filter commits by specific authors or include all team members"
              isDarkMode={isDarkMode}
            />
            <FeatureCard
              icon="📈"
              title="Smart Summaries"
              description="Automatically categorized commits (feat, fix, docs, etc.)"
              isDarkMode={isDarkMode}
            />
            <FeatureCard
              icon="🎨"
              title="Beautiful Discord Format"
              description="Rich embeds with organized layout and pagination for large reports"
              isDarkMode={isDarkMode}
            />
          </div>
        </ModernCard>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isPending}
            className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg transform transition-all duration-300 focus:outline-none focus:ring-4 ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-400/30 shadow-blue-500/25 hover:shadow-blue-500/40"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-300"
            } hover:shadow-xl hover:-translate-y-0.5 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Generating Report...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Daily Report
              </>
            )}
          </button>
        </div>
      </Form>

      <LoadingState isPending={isPending} isDarkMode={isDarkMode} />
      <SuccessPreview
        formState={formState}
        isPending={isPending}
        isDarkMode={isDarkMode}
      />
      
      {/* Commits Display */}
      {formState?.reportData && !isPending && (
        <div className="mt-8">
          <CommitsDisplay
            reportData={formState.reportData}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};

export default DailyReportForm;
