"use client";

import { useState, useCallback } from "react";

// Constants
const VALIDATION_STATES = {
  IDLE: "idle",
  VALIDATING: "validating",
  VALID: "valid",
  INVALID: "invalid",
};

// Utility functions
const validatePath = (path) => {
  return path.replace(/['"]/g, '').trim().length > 0;
};

const validateMultiplePaths = (paths) => {
  const pathArray = paths
    .split("\n")
    .map((p) => p.replace(/['"]/g, '').trim())
    .filter((p) => p.length > 0);
  return pathArray.length > 0;
};

// Custom hook for repository validation
const useRepositoryValidation = (onRepositorySelect) => {
  const [repoPath, setRepoPath] = useState("");
  const [validationState, setValidationState] = useState(
    VALIDATION_STATES.IDLE
  );

  const validateRepository = useCallback(
    async (path) => {
      try {
        setValidationState(VALIDATION_STATES.VALIDATING);

        if (validateMultiplePaths(path)) {
          setValidationState(VALIDATION_STATES.VALID);
          // Send multiple paths as an array for backend processing
          const pathArray = path
            .split("\n")
            .map((p) => p.replace(/['"]/g, '').trim())
            .filter((p) => p.length > 0);
          onRepositorySelect(pathArray);
        } else {
          setValidationState(VALIDATION_STATES.INVALID);
        }
      } catch (error) {
        setValidationState(VALIDATION_STATES.INVALID);
      }
    },
    [onRepositorySelect]
  );

  const handlePathChange = useCallback(
    (e) => {
      const path = e.target.value;
      setRepoPath(path);
      validateRepository(path);
    },
    [validateRepository]
  );

  return {
    repoPath,
    validationState,
    handlePathChange,
  };
};

// Modern Components
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

const ValidationStatus = ({
  validationState,
  repoPath,
  isDarkMode = false,
}) => {
  if (!repoPath) return null;

  const statusConfig = {
    [VALIDATION_STATES.VALIDATING]: {
      className: isDarkMode
        ? "bg-yellow-900/20 border-yellow-600/30 text-yellow-300"
        : "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: (
        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      ),
      content: "Validating repository paths...",
    },
    [VALIDATION_STATES.VALID]: {
      className: isDarkMode
        ? "bg-green-900/20 border-green-600/30 text-green-300"
        : "bg-green-50 border-green-200 text-green-700",
      icon: (
        <svg
          className="w-5 h-5 text-green-500"
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
      ),
      content: (() => {
        const paths = repoPath
          .split("\n")
          .map((p) => p.replace(/['"]/g, '').trim())
          .filter((p) => p.length > 0);
        if (paths.length === 1) {
          return (
            <div className="space-y-2">
              <span className="font-medium">
                Repository path set successfully
              </span>
              <div
                className={`rounded-lg p-2 text-sm font-mono ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}
              >
                {paths[0]}
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <span className="font-medium">
                ✅ {paths.length} repository path(s) configured
              </span>
              <div className="space-y-1">
                {paths.map((path, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 rounded-lg p-2 text-sm ${
                      isDarkMode ? "bg-green-900/30" : "bg-green-100"
                    }`}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-mono">
                      {path.split(/[\\\/]/).pop() || path}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      })(),
    },
    [VALIDATION_STATES.INVALID]: {
      className: isDarkMode
        ? "bg-red-900/20 border-red-600/30 text-red-300"
        : "bg-red-50 border-red-200 text-red-700",
      icon: (
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      content: "Please enter at least one valid repository path",
    },
  };

  const config = statusConfig[validationState];
  if (!config) return null;

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-lg border ${config.className}`}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1">{config.content}</div>
    </div>
  );
};

const HelpSection = ({ isDarkMode = false }) => (
  <ModernCard
    className={
      isDarkMode
        ? "bg-blue-900/20 border-blue-700/30"
        : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
    }
    isDarkMode={isDarkMode}
  >
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <h4
          className={`text-sm font-semibold mb-3 ${
            isDarkMode ? "text-blue-300" : "text-blue-800"
          }`}
        >
          How to use GitHub repositories
        </h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isDarkMode ? "bg-blue-800" : "bg-blue-100"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  isDarkMode ? "text-blue-300" : "text-blue-600"
                }`}
              >
                1
              </span>
            </div>
            <div>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-blue-200" : "text-blue-700"
                }`}
              >
                Go to your GitHub repository
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Navigate to your repository on GitHub.com
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isDarkMode ? "bg-blue-800" : "bg-blue-100"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  isDarkMode ? "text-blue-300" : "text-blue-600"
                }`}
              >
                2
              </span>
            </div>
            <div>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-blue-200" : "text-blue-700"
                }`}
              >
                Click the green "Code" button
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Copy the repository URL from the dropdown
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isDarkMode ? "bg-blue-800" : "bg-blue-100"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  isDarkMode ? "text-blue-300" : "text-blue-600"
                }`}
              >
                3
              </span>
            </div>
            <div>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-blue-200" : "text-blue-700"
                }`}
              >
                Copy the HTTPS URL
              </p>
              <div className="space-y-1 mt-1">
                <div className="flex items-center space-x-2">
                  <code
                    className={`px-2 py-1 rounded text-xs font-mono ${
                      isDarkMode ? "bg-blue-800 text-blue-200" : "bg-blue-100"
                    }`}
                  >
                    https://github.com/username/repo.git
                  </code>
                </div>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Make sure to copy the .git URL
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isDarkMode ? "bg-blue-800" : "bg-blue-100"
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  isDarkMode ? "text-blue-300" : "text-blue-600"
                }`}
              >
                4
              </span>
            </div>
            <div>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-blue-200" : "text-blue-700"
                }`}
              >
                Paste the URL here
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                For multiple repos, add one URL per line
              </p>
            </div>
          </div>
        </div>

        <div
          className={`mt-4 p-3 rounded-lg ${
            isDarkMode ? "bg-blue-800/30" : "bg-blue-100"
          }`}
        >
          <p
            className={`text-xs font-medium mb-2 ${
              isDarkMode ? "text-blue-300" : "text-blue-800"
            }`}
          >
            Example paths:
          </p>
          <div
            className={`space-y-1 text-xs font-mono ${
              isDarkMode ? "text-blue-200" : "text-blue-700"
            }`}
          >
            <div>https://github.com/username/react-portfolio.git</div>
            <div>https://github.com/username/ecommerce-store.git</div>
            <div>https://github.com/username/mobile-app-backend.git</div>
          </div>
        </div>
      </div>
    </div>
  </ModernCard>
);

const RepositorySelector = ({ onRepositorySelect, isDarkMode = false }) => {
  const { repoPath, validationState, handlePathChange } =
    useRepositoryValidation(onRepositorySelect);

  return (
    <ModernCard isDarkMode={isDarkMode}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Select Git Repository(ies)
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Choose the repositories to analyze for your report
            </p>
          </div>
        </div>

        {/* Repository Path Input */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="repoPath"
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Repository Path(s)
            </label>
            <textarea
              id="repoPath"
              value={repoPath}
              onChange={handlePathChange}
              placeholder="Enter GitHub repository URL(s)...&#10;Example:&#10;https://github.com/username/react-portfolio.git&#10;https://github.com/username/ecommerce-store.git&#10;https://github.com/username/mobile-app-backend.git"
              rows="4"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none font-mono text-sm ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-400 focus:border-transparent hover:border-gray-500"
                  : "border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-transparent hover:border-gray-300"
              }`}
            />
            <p
              className={`text-xs mt-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Enter GitHub repository URL(s). One URL per line for multiple repositories.
              <br />
              <span className="text-orange-500 font-medium">
                Note: Local file paths are not supported in the deployed version.
              </span>
            </p>
          </div>

          {/* Validation Status */}
          <ValidationStatus
            validationState={validationState}
            repoPath={repoPath}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Help Section */}
        <HelpSection isDarkMode={isDarkMode} />
      </div>
    </ModernCard>
  );
};

export default RepositorySelector;
