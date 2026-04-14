import { useEffect, useRef } from "react";
import { useAppDispatch } from "./index";

export function useRefetchOnFocus(fetchActions: (() => any)[]) {
  const dispatch = useAppDispatch();
  const actionsRef = useRef(fetchActions);
  actionsRef.current = fetchActions;

  useEffect(() => {
    const refetch = () => {
      actionsRef.current.forEach((action) => dispatch(action()));
    };

    // Tab pe wapas aao
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refetch();
    };

    // Internet/backend wapas aaye
    const handleOnline = () => refetch();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}