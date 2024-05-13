import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
// import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IJobItem } from 'src/types/job';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type Props = {
  job: IJobItem;
  onView: VoidFunction;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
};

export default function JobItem({ job, onView, onEdit, onDelete }: Props) {
  const popover = usePopover();

  const { id, title, createdAt, salary} =
    job;

  return (
    <>
<Card>
    <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Iconify icon="eva:more-vertical-fill" />
    </IconButton>

    <Stack sx={{ p: 3, pb: 2 }}>
        <ListItemText
            sx={{ mb: 1 }}
            primary={
                <Typography variant="subtitle1" color="inherit">
                    {title}
                </Typography>
            }
            secondary={
                <Stack spacing={0.5}>
                    <Typography component="span" variant="body2" color="textSecondary">
                        {job.description}
                    </Typography>
                    <Typography component="span" variant="body2" color="textPrimary">
                        תאריך פרסום: {fDate(createdAt)}
                    </Typography>
                </Stack>
            }
            primaryTypographyProps={{
                typography: 'subtitle1',
            }}
            secondaryTypographyProps={{
                component: 'div',
            }}
        />
    </Stack>

    <Divider sx={{ width: '100%', borderStyle: 'dashed' }} />

    <Box rowGap={1.5} display="grid" gridTemplateColumns="repeat(2, 1fr)" sx={{ p: 3 }}>
        {[
            {
                label: salary.negotiable ? 'Negotiable' : salary.price.toString().concat('₪')
                // icon: <Iconify width={16} icon="solar:wad-of-money-bold" sx={{ flexShrink: 0 }} />,
            },
        ].map((item) => (
            <Stack
                key={item.label}
                spacing={0.5}
                flexShrink={0}
                direction="row"
                alignItems="center"
                sx={{ color: 'text.disabled', minWidth: 0 }}
            >
                {/* {item.icon} */}
                <Typography variant="caption" noWrap>
                    {item.label}
                </Typography>
            </Stack>
        ))}
    </Box>
    <Divider sx={{ width: '100%', borderStyle: 'dashed' }} />

    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Button 
            variant="contained"
            color="primary"
            onClick={() => console.log('Navigate to new page')}
        >
            פרטים נוספים
        </Button>
    </Box>
</Card>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onView();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}
