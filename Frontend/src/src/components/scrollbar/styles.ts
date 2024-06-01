import SimpleBar from 'simplebar-react';

import { alpha, styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

export const StyledRootScrollbar = styled('div')(() => ({
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden',
}));

export const StyledScrollbar = styled(SimpleBar)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar::before': {
    backgroundColor: alpha(theme.palette.grey[600], 0.48),
    opacity: 1,
  },
  '& .simplebar-scrollbar': {
    '&:before': {
      backgroundColor: alpha(theme.palette.grey[600], 0.48),
    },
    '&.simplebar-visible:before': {
      opacity: 1,
    },
  },
  '& .simplebar-mask': {
    zIndex: 'inherit',
  },
}));



// import SimpleBar from 'simplebar-react';
// import { alpha, styled } from '@mui/material/styles';

// // ----------------------------------------------------------------------

// export const StyledRootScrollbar = styled('div')(() => ({
//   flexGrow: 1,
//   height: '100%',
//   overflow: 'hidden',
// }));

// export const StyledScrollbar = styled(SimpleBar)(({ theme }) => ({
//   maxHeight: '100%',
//   '& .simplebar-scrollbar::before': {
//     backgroundColor: alpha(theme.palette.grey[600], 0.48),
//     opacity: 1, // Ensure the scrollbar thumb is always visible
//   },
//   '& .simplebar-scrollbar': {
//     visibility: 'visible !important', // Make the scrollbar track always visible
//     '&:before': {
//       transition: 'opacity 0.2s linear',
//     },
//     '&.simplebar-visible:before': {
//       opacity: 1, // Make sure the thumb is visible when hovered
//     },
//   },
//   '& .simplebar-mask': {
//     zIndex: 'inherit',
//   },
// }));
