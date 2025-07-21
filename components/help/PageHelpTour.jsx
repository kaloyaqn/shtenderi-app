"use client";
import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { usePathname } from "next/navigation";

const stepsByPath = {
  "/dashboard": [
    {
      target: "#cash-balance-card",
      content: "Тук виждаш наличността в касата си. Това също е бутон към страницата с касата ти.",
    },
    {
      target: "#gross-income-card",
      content: "Тук виждаш генерирания оборот за деня.",
    },
  ],
};

// Helper to match dynamic routes like /dashboard/stands/[standId]
function getHelpStepsForPath(pathname) {
  // Exact match first
  if (stepsByPath[pathname]) return stepsByPath[pathname];

  // Pattern match for dynamic routes
  for (const pattern in stepsByPath) {
    // Convert pattern to regex: /dashboard/stands/[standId] -> ^/dashboard/stands/[^/]+$
    const regex = new RegExp('^' + pattern.replace(/\[.*?\]/g, '[^/]+') + '$');
    if (regex.test(pathname)) {
      return stepsByPath[pattern];
    }
  }
  return [];
}

export default function PageHelpTour() {
  const pathname = usePathname();
  const [run, setRun] = useState(true);
  const [mounted, setMounted] = useState(false);

  const steps = getHelpStepsForPath(pathname);
  const localKey = `tour_seen:${pathname}`;

  useEffect(() => {
    // За да не чупи при SSR
    setMounted(true);
    const seen = localStorage.getItem(localKey);
    if (!seen && steps.length > 0) {
      setRun(true);
    }
  }, [pathname]);

  const handleCallback = (data) => {
    if (data.status === "finished" || data.status === "skipped") {
      localStorage.setItem(localKey, "true");
      setRun(false);
    }
  };

  if (!mounted || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleCallback}
      continuous
      showProgress
      showSkipButton
      styles={{ options: { zIndex: 9999, primaryColor: "#2563eb" } }}
    />
  );
}
