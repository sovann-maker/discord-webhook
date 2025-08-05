"use client";

import Form from "next/form";
import { useActionState } from "react";
import { generateDailyReport } from "../actions/gitReport";
import { useEffect } from "react";
import { toast } from "sonner";

const DailyReportForm = () => {
  const [formState, formAction, isPending] = useActionState(
    generateDailyReport,
    null
  );

  useEffect(() => {
    if (formState?.success) {
      toast.success(formState?.message);
    } else if (formState?.success === false) {
      toast.error(formState?.message);
    }
  }, [formState?.success]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-black">
        📊 Daily Development Report
      </h2>
      <p className="text-gray-600 mb-4">
        Generate a daily report based on your Git commits. Select a date to see
        all commits and their descriptions.
      </p>

      <Form className="flex flex-col gap-4" action={formAction}>
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Report Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            defaultValue={today}
            max={today}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Select the date for which you want to generate the report
          </p>
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            📋 What this report includes:
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• All Git commits for the selected date</li>
            <li>• Commit messages and timestamps</li>
            <li>• Summary of work by type (feat, fix, docs, etc.)</li>
            <li>• Total commit count</li>
            <li>• Beautiful Discord embed formatting</li>
          </ul>
        </div>

        <div className="flex justify-center items-center">
          <button
            type="submit"
            className="flex justify-center items-center mt-4 bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            {isPending ? "Generating Report..." : "📈 Generate Daily Report"}
          </button>
        </div>
      </Form>

      {formState?.reportData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Preview:</h4>
          <p className="text-xs text-gray-600">
            <strong>Date:</strong> {formState.reportData.date}
            <br />
            <strong>Commits:</strong> {formState.reportData.commits.length}
            <br />
            <strong>Summary:</strong> {formState.reportData.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyReportForm;
