"use client";

import { useEffect, useMemo, useRef } from "react";
import { useCommand } from "@/components/command-provider";

/**
 * Shared product filter shortcut logic (Ctrl/Cmd + K) with command palette selection.
 */
export function useProductFilter({ onProductSelect, onShortcut }) {
  const { openProductPicker } = useCommand();
  const inputRef = useRef(null);

  const handleOpenPicker = useMemo(() => {
    return (presetQuery = "") => {
      if (!openProductPicker) return;
      openProductPicker({
        presetQuery,
        onSelect: (product) => {
          onProductSelect?.(product);
        },
      });
    };
  }, [openProductPicker, onProductSelect]);

  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onShortcut?.();
        handleOpenPicker(inputRef.current?.value || "");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleOpenPicker, onShortcut]);

  return {
    productInputRef: inputRef,
    openProductPicker: handleOpenPicker,
  };
}
