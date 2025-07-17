"use client";
import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { usePathname } from "next/navigation";

const stepsByPath = {
  "/dashboard": [
    {
      target: "#header",
      content: "Това е твоят основен екран. Тук виждаш най-важната информация.",
    },
    {
      target: "#cash-balance-card",
      content: "Тук виждаш наличността в касата си. Това също е бутон към страницата с касата ти.",
    },
    {
      target: "#gross-income-card",
      content: "Тук виждаш генерирания оборот за деня.",
    },
  ],
  "/dashboard/stands": [
    {
      target: "#card",
      content: "Това е един от твоите зачислени щендери.",
    },
    {
        target: "#stand-name",
        content: "Това е името на щендера",
    },
    {
        target: "#stand-partner",
        content: "Това е името на парнтьора, на когото е щендера",
    },
    {
        target: "#stand-store",
        content: "Това е името на магазина, в който е щендера",
    },
    {
        target: "#stand-products",
        content: "Това е показва, колко позиции има на този щендер",
    },
    {
        target: "#stand-button",
        content: "Натискайки този бутон, отваряш щендера.",
    },
  ],
};

export default function PageHelpTour() {
  const pathname = usePathname();
  const [run, setRun] = useState(true);
  const [mounted, setMounted] = useState(false);

  const localKey = `tour_seen:${pathname}`;
  const steps = stepsByPath[pathname] || [];

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
