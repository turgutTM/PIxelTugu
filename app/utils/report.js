"use client";
import React from "react";

export default function ReportModal({
  show,
  reportingArt,
  reportReason,
  setReportReason,
  closeReportModal,
  submitReport,
}) {
  if (!show || !reportingArt) return null;

  return (
    <div
      className="fixed inset-0  bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={closeReportModal}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Report Artwork</h2>
        <p className="text-gray-600 mb-4">
          Why are you reporting {reportingArt.title || "this artwork"}?
        </p>
        <div className="flex flex-col gap-2 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              className="form-radio text-red-500"
              name="reportReason"
              value="Spam"
              onChange={(e) => setReportReason(e.target.value)}
            />
            <span className="text-gray-800">Spam or Advertisement</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              className="form-radio text-red-500"
              name="reportReason"
              value="Hate Speech"
              onChange={(e) => setReportReason(e.target.value)}
            />
            <span className="text-gray-800">Hate Speech</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              className="form-radio text-red-500"
              name="reportReason"
              value="Inappropriate Content"
              onChange={(e) => setReportReason(e.target.value)}
            />
            <span className="text-gray-800">Inappropriate Content</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              className="form-radio text-red-500"
              name="reportReason"
              value="Other"
              onChange={(e) => setReportReason(e.target.value)}
            />
            <span className="text-gray-800">Other</span>
          </label>
        </div>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            onClick={closeReportModal}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            onClick={submitReport}
            disabled={!reportReason}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
