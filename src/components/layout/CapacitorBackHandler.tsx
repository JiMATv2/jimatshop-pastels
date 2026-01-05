import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/**
 * Ensures Android hardware back button uses React Router history.
 * - If we're not on "/", navigate back.
 * - If we're on "/", exit the app (native expected behavior).
 */
export function CapacitorBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    const sub = CapacitorApp.addListener("backButton", () => {
      if (location.pathname !== "/") {
        navigate(-1);
        return;
      }
      CapacitorApp.exitApp();
    });

    return () => {
      sub.remove();
    };
  }, [location.pathname, navigate]);

  return null;
}


