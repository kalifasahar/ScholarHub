// tomer
/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

// ----------------------------------------------------------------------

import Router from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import ThemeProvider from 'src/theme';

import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
// import { SettingsDrawer, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export default function App() {

  useScrollToTop();

  return (
    <AuthProvider>
        <ThemeProvider>
          <MotionLazy>
            {/* <SettingsDrawer /> */}
            <ProgressBar />
            <Router />
          </MotionLazy>
        </ThemeProvider>
    </AuthProvider>
  );
}
