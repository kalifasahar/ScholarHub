import { useState } from 'react';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { Box, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
// import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IScholarshipItem } from 'src/types/scholarship';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type Props = {
  job: IScholarshipItem;
  onView: VoidFunction;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
};

const CategoryList = ({ categories }: { categories: string[] }) => (
  <Stack direction="row" spacing={3} sx={{ p: 0 }}>
    {categories.map((category, index) => (
      <Stack
        key={index} 
        spacing={0.5}
        flexShrink={0}
        direction="row"
        alignItems="center"
        sx={{ color: 'text.disabled', minWidth: 0, py: 0 }}
      >
        <Typography variant="body1" noWrap>
          {category}
        </Typography>
      </Stack>
    ))}
  </Stack>
);


export default function JobItem({ job, onView, onEdit, onDelete }: Props) {
  const popover = usePopover();

  const { id, title, grant,categories,expiredDate} = job;

  const [openWizard, setOpenWizard] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Step 1', 'Step 2', 'Step 3'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setOpenWizard(false);
  };

  const handleOpenWizard = () => {
    setOpenWizard(true);
  };

  const handleCloseWizard = () => {
    setOpenWizard(false);
  };

  const renderWizardContent = (step: number) => {
    switch (step) {
      case 0:
        return <Typography>Content for Step 1</Typography>;
      case 1:
        return <Typography>Content for Step 2</Typography>;
      case 2:
        return <Typography>Content for Step 3</Typography>;
      default:
        return 'Unknown step';
    }
  };

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
                        תאריך אחרון להגשה: {fDate(expiredDate)}
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

    <Box sx={{ p: 2 }}>
      {[
        {
          label: <CategoryList categories={categories} />,
          // icon: <Iconify width={16} icon="solar:wad-of-money-bold" sx={{ flexShrink: 0 }} />,
        },
      ].map((item, index) => (
        <Stack
          key={index} // Use the index or another unique value for the key
          spacing={0.5}
          flexShrink={0}
          direction="column"
          alignItems="flex-start"
          sx={{ color: 'text.disabled', minWidth: 0 }}
        >
          {item.label}
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
