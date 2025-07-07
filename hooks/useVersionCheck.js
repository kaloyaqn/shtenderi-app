import { useEffect, useRef, useState } from 'react';

export default function useVersionCheck(interval = 30000) {
  const [showBanner, setShowBanner] = useState(false);
  const currentVersion = useRef(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/version.txt', { cache: 'no-cache' });
        const version = await res.text();
        if (!currentVersion.current) {
          currentVersion.current = version;
        } else if (currentVersion.current !== version) {
          setShowBanner(true);
        }
      } catch (err) {
        console.error('Version check failed:', err);
      }
    };

    const id = setInterval(check, interval);
    check();
    return () => clearInterval(id);
  }, [interval]);

  return showBanner;
}
