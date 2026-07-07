import * as React from 'react';

const mobileBreakPoint = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${mobileBreakPoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < mobileBreakPoint);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < mobileBreakPoint);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
