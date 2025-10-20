import { useEffect } from 'react';
import { useSelector } from 'store';

export const useThemeWatcher = (): void => {
  const themeType = useSelector((state) => state.theme.themeType);

  useEffect(() => {
    window.document.documentElement.setAttribute('data-theme', themeType);
  }, [themeType]);
};
