import React from "react";
import { X } from "lucide-react";

export function IframeViewModal({ title, url, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl flex flex-col w-full h-full max-w-6xl z-[10000]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-t-xl">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden rounded-b-xl">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
}
