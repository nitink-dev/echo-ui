import React, { useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "../../ui/button";

interface IdleTimeoutModalProps {
  secondsLeft:  number;
  totalSeconds: number;
  onContinue:   () => void;
  onCancel:     () => void;
}

export function IdleTimeoutModal({
  secondsLeft,
  totalSeconds,
  onContinue,
  onCancel,
}: IdleTimeoutModalProps) {
  const isUrgent      = secondsLeft <= Math.round(totalSeconds * 0.2);
  const progressWidth = Math.max(0, (secondsLeft / totalSeconds) * 100);
  const mins          = Math.floor(secondsLeft / 60);
  const secs          = secondsLeft % 60;
  const display       = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;

  useEffect(() => {
       if (secondsLeft <= 0) {
      onCancel();
    }
  }, [secondsLeft, onCancel]);

  return (
    
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-title"
      aria-describedby="idle-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onMouseDown={(e) => e.stopPropagation()} 
      onClick={(e) => e.stopPropagation()}
    >
      {/* Card — stop event bubbling to backdrop too */}
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-sm w-[380px] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 border border-amber-200 shrink-0">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h2 id="idle-title" className="text-base font-semibold text-gray-900">
              Session expiring soon
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              You've been inactive for a while
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="px-6 pt-6 pb-2 flex flex-col items-center gap-3">
          <div className={`text-5xl font-semibold tabular-nums transition-colors ${
            isUrgent ? "text-red-500" : "text-[#007BFF]"
          }`}>
            {display}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ${
                isUrgent ? "bg-red-500" : "bg-[#007BFF]"
              }`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p id="idle-desc" className="text-sm text-gray-600 leading-relaxed text-center">
            Your session will automatically expire due to inactivity. Click{" "}
            <span className="font-medium text-gray-800">OK</span> to stay
            logged in, or{" "}
            <span className="font-medium text-gray-800">Cancel</span> to let
            the session expire.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-[#007BFF] hover:bg-[#0056cc] text-white"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}