import { useEffect } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { clearAuthState } from "../store/slices/authSlice";

const SESSION_CHANNEL = "app_session";

export function broadcastUserLogin(username: string) {
  try {
    const ch = new BroadcastChannel(SESSION_CHANNEL);
    ch.postMessage({ type: "USER_CHANGED", username });
    ch.close();
  } catch {
  }
}

export function useCrossTabAuth(currentUser: string | null) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let channel: BroadcastChannel;

    try {
      channel = new BroadcastChannel(SESSION_CHANNEL);
    } catch {
      return; // unsupported browser, skip
    }

    channel.onmessage = (event: MessageEvent) => {
      const { type, username } = event.data ?? {};

      if (type === "USER_CHANGED" && username !== currentUser) {
        dispatch(clearAuthState());
      }
    };

    return () => channel.close();
  }, [currentUser, dispatch]);
}