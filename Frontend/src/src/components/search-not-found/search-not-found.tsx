import Typography from '@mui/material/Typography';
import Paper, { PaperProps } from '@mui/material/Paper';

// ----------------------------------------------------------------------

interface Props extends PaperProps {
  query?: string;
}

export default function SearchNotFound({ query, sx, ...other }: Props) {
  return query ? (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
       לא קיים
      </Typography>

      <Typography variant="body2">
        לא נמצאו תוצאות עבור &nbsp;
        <strong>&quot;{query}&quot;</strong>.
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
      הכנס מילות חיפוש
    </Typography>
  );
}
