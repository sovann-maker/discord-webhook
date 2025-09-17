"use client";

import { useState, useEffect } from "react";
import DailyReportForm from "./components/DailyReportForm";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for user's preferred color scheme
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
      }`}
    >
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700 shadow-lg "
              : "bg-white text-gray-600 hover:bg-gray-50 shadow-lg"
          }`}
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1 -1.5 0V3a.75.75 0 0 1 .75 -0.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1 -9 0ZM18.894 6.166a.75.75 0 0 0 -1.06 -1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591 -1.59ZM21.75 12a.75.75 0 0 1 -0.75.75h-2.25a.75.75 0 0 1 0 -1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06 -1.06l-1.59 -1.591a.75.75 0 1 0 -1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1 -1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0 -1.061 -1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591 -1.59ZM6 12a.75.75 0 0 1 -0.75.75H3a.75.75 0 0 1 0 -1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06 -1.06l-1.59 -1.591a.75.75 0 0 0 -1.061 1.06l1.59 1.591Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isDarkMode ? (
          <>
            {/* Dark mode animated elements */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </>
        ) : (
          <>
            {/* Light mode animated elements */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <DailyReportForm isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
