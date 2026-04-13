import { useEffect } from "react";
import { useAppDispatch } from "./index";
import { createAsyncThunk } from "@reduxjs/toolkit";

export function useRefetchOnFocus(fetchActions: (() => any)[]) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchActions.forEach((action) => dispatch(action()));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
}