"use client";
import React from "react";

export default function EditModal({
  visible,
  onClose,
  onSave,
  formState,
  onChange,
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center  justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-4xl shadow-md w-96 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Edit Profile</h2>

        <input
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="username"
          placeholder="Username"
          value={formState.username}
          onChange={onChange}
        />

        <input
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="about"
          placeholder="About"
          value={formState.about}
          onChange={onChange}
        />
        <input
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="study"
          placeholder="Study"
          value={formState.study}
          onChange={onChange}
        />
        <input
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="profession"
          placeholder="Profession"
          value={formState.profession}
          onChange={onChange}
        />
        <input
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="contact"
          placeholder="Contact"
          value={formState.contact}
          onChange={onChange}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
