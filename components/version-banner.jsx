'use client';

import useVersionCheck from '@/hooks/useVersionCheck';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function VersionBanner() {
  const showReload = useVersionCheck(15000); // check every 15 seconds
  const toastShown = useRef(false);

  useEffect(() => {
    if (showReload && !toastShown.current) {
      toast.info(
        <div className="flex items-center justify-between w-full gap-2">
          <span>Нова версия е налична</span>
          <button
            onClick={() => location.reload()}
            className="ml-2 cursor underline font-medium text-primary"
          >
            Обнови
          </button>
        </div>,
        {
          duration: 100000, // stays until user interacts
          position: 'bottom-right',
        }
      );
      toastShown.current = true;
    }
  }, [showReload]);

  return null;
}
