// tomer
import { useMemo } from 'react';
import merge from 'lodash/merge';



import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeOptions, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { palette } from './palette';
import { shadows } from './shadows';
import { typography } from './typography';
import RTL from './options/right-to-left';
import { customShadows } from './custom-shadows';
import { componentsOverrides } from './overrides';
import { createPresets } from './options/presets';
import { createContrast } from './options/contrast';

type Props = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  // Setup presets and contrast with default values directly
  const presets = createPresets('orange');
  const contrast = createContrast('default', 'light');

  // Since these are constants, they do not need to be dependencies in useMemo
  const memoizedValue = useMemo(
    () => ({
      palette: {
        ...palette('light'),
        ...presets.palette,
        ...contrast.palette,
      },
      customShadows: {
        ...customShadows('light'),
        ...presets.customShadows,
      },
      direction: 'rtl',
      shadows: shadows('light'),
      shape: { borderRadius: 8 },
      typography,
    }),
    [presets.palette, presets.customShadows, contrast.palette]
  );

  // Create theme based on the memoized value
  const theme = createTheme(memoizedValue as ThemeOptions);
  theme.components = merge(componentsOverrides(theme), contrast.components);

  return (
    <MuiThemeProvider theme={theme}>
      <RTL themeDirection="rtl">
        <CssBaseline />
        {children}
      </RTL>
    </MuiThemeProvider>
  );
}
