import React from "react";
import { Clock } from "lucide-react";
import { Button } from "../../ui/button";

interface IdleTimeoutModalProps {
  onContinue: () => void;
  onLogout: () => void;
}

export function IdleTimeoutModal({ onContinue, onLogout }: IdleTimeoutModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-[360px] overflow-hidden">

        {/* Header stripe */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 border border-amber-200 shrink-0">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h2
              id="idle-title"
              className="text-base font-semibold text-gray-900"
            >
              Still there?
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Your session is about to expire</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            You've been inactive for a while. Choose to continue your session
            or you'll be logged out.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex-1 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            Log out
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-[#007BFF] hover:bg-[#0056cc] text-white"
          >
            Continue session
          </Button>
        </div>

      </div>
    </div>
  );
}