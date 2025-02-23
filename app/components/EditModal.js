"use client";
import React, { useRef } from "react";
import { UploadButton } from "@/app/utils/uploadthing";

export default function EditModal({
  visible,
  onClose,
  onSave,
  formState,
  onChange,
  usernameLastChangedAt,
}) {
  const initialUsernameRef = useRef(formState.username);
  const isUsernameChanged = formState.username !== initialUsernameRef.current;

  let canChangeUsername = true;
  let nextChangeDate = null;
  if (usernameLastChangedAt) {
    const lastChangedDate = new Date(usernameLastChangedAt);
    nextChangeDate = new Date(lastChangedDate.getTime());
    nextChangeDate.setMonth(nextChangeDate.getMonth() + 1);
    if (new Date() < nextChangeDate) {
      canChangeUsername = false;
    }
  }

  if (!visible) return null;

  const handleUploadComplete = (res) => {
    console.log("Upload response:", res);
    const fileUrl = res?.[0]?.url;
    if (fileUrl) {
      onChange({ target: { name: "profilePhoto", value: fileUrl } });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-4xl shadow-md w-96 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Edit Profile</h2>

        <div>
          <input
            maxLength="30"
            className="p-2 rounded bg-gray-700 focus:outline-none w-full"
            name="username"
            placeholder="Username"
            value={formState.username}
            onChange={onChange}
            disabled={!canChangeUsername}
          />
          {!canChangeUsername ? (
            <p className="mt-1 text-xs text-yellow-400">
              You can change your username on{" "}
              {nextChangeDate.toLocaleDateString()}.
            </p>
          ) : (
            isUsernameChanged && (
              <p className="mt-1 text-xs text-yellow-400">
                Warning: Changing your username will lock further changes for 1
                month.
              </p>
            )
          )}
        </div>

        <div className="flex flex-col items-center">
          <p className="mb-2">Change the profile photo</p>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={(error) => {
              console.error("Upload error:", error);
            }}
          />

          {formState.profilePhoto && (
            <img
              src={formState.profilePhoto}
              alt="Profil Fotoğrafı"
              className="mt-2 w-24 h-24 rounded-full object-cover border"
            />
          )}
        </div>

        <input
          maxLength="30"
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="about"
          placeholder="About"
          value={formState.about}
          onChange={onChange}
        />
        <input
          maxLength="30"
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="study"
          placeholder="Study"
          value={formState.study}
          onChange={onChange}
        />
        <input
          maxLength="30"
          className="p-2 rounded bg-gray-700 focus:outline-none"
          name="profession"
          placeholder="Profession"
          value={formState.profession}
          onChange={onChange}
        />
        <input
          maxLength="30"
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
