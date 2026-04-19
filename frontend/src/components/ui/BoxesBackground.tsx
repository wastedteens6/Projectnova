import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

import { Boxes } from './LoginBoxes';

export const BackgroundContainer = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Boxes />
        <div className={`pointer-events-none absolute inset-0 z-20 ${
          isLight ? 'bg-slate-50' : 'bg-slate-900'
        } [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]`} />
      </div>
      {/* Content wrapper */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-none">
        {children}
      </div>
    </div>
  );
};
