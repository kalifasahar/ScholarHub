import { useState, useEffect } from 'react';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { Box, Stack, Typography, Modal, Stepper, Step, StepLabel, Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { IScholarshipItem } from 'src/types/scholarship';

type Props = {
  job: IScholarshipItem;
  onView: VoidFunction;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
  selectedJob: IScholarshipItem | null;
  openWizard: boolean;
  setOpenWizard: (open: boolean) => void;
  onOpenWizard: () => void;
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

export default function ScholarshipItem({ job, onView, onEdit, onDelete, selectedJob ,openWizard, setOpenWizard, onOpenWizard }: Props) {
  const popover = usePopover();
  const { id, title, grant, categories, ExpirationDate } = job;
  const [activeStep, setActiveStep] = useState(0);
  const [scholarshipsData, setScholarshipsData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const steps = ['Step 1', 'Step 2', 'Step 3']; // Define the steps of the wizard

  useEffect(() => {
    if (selectedJob) {
      fetchScholarshipData(selectedJob.id);
    }
  }, [selectedJob]);

  const fetchScholarshipData = async (scholarshipId: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      
      // const response = await fetch(`/api/scholarships/${scholarshipId}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch scholarship data');
      // }
      // const data: IScholarshipItem = await response.json();
      const data = `דגשים חשובים:\n\nההגשה הינה באמצעות מערכתISF online . לצורך כך יש לבצע אימות פרטים, ורק חוקרים שאומתו פרטיהם יוכלו להתחיל למלא טופס הרשמה להגשת בקשה.\nאימות הפרטים אינו מהווה הרשמה להגשת הבקשה\nרשאים להגיש בקשות לקרן רק מועמדים שהגישו את עבודת הדוקטורט עד 14 באוגוסט 2024, ושלא עברו יותר משנתיים מאז תאריך אישור עבודת הדוקטורט, לבין המועד האחרון להגשת בקשות, קרי - 14 באוגוסט 2024.\nרשאים להגיש חוקרים שהתואר השלישי שלהם הוא בכל אחד מתחומי מדעי החברה. במקרים בהם התואר השלישי אינו במדעי החברה, אך אחד המנחים לדוקטורט הוא מתחום מדעי החברה ובנוסף השתלמות הבתר-דוקטורט מתוכננת להיות במחלקה של מדעי החברה, ניתן להגיש בקשה.\nהמועד האחרון לרישום במאגר וביצוע אימות נתונים: 31 ביולי 2024, בשעה 13:00. חוקרים שלא ירשמו במועד, לא יהיו רשאים להגיש את ההצעה במועד ההגשה.\nהמועד האחרון להגשת הבקשות לקרן, לאחר אישור רשות המחקר: 14 באוגוסט 2024, בשעה 13:00.\n\nניתן להוריד את ההנחיות המעודכנות מאתר הקרן וממערכת ISF online.\n\nניתן גם לפנות לאורלי קיים מהרשות למו"פ בכתובת: orlykay@bgu.ac.il`;

      
      setScholarshipsData(data);
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setOpenWizard(false);
    setScholarshipsData(null);
  };


  const handleCloseWizard = () => {
    setOpenWizard(false);
  };

  const renderWizardContent = (step: number) => {
    if (loading) {
      return <Typography>Loading...</Typography>;
    }
    if (fetchError) {
      return <Typography color="error">{fetchError}</Typography>;
    }
    if (scholarshipsData) {
      switch (step) {
        case 0:
          return (
            <Box sx={{ maxHeight: '400px', px: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">{title}</Typography>
              <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>{scholarshipsData}</Typography>
              <Typography variant="body2">תאריך אחרון להגשה: {fDate(ExpirationDate)}</Typography>
            </Box>
          );
        case 1:
          return <Typography>Content for Step 2</Typography>;
        case 2:
          return <Typography>Content for Step 3</Typography>;
        default:
          return 'Unknown step';
      }
    }
    return <Typography>No data available</Typography>;
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
                  תאריך אחרון להגשה: {fDate(ExpirationDate)}
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
            },
          ].map((item, index) => (
            <Stack
              key={index}
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
          <Button variant="contained" color="primary" onClick={onOpenWizard}>
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

  <Modal open={openWizard} onClose={handleCloseWizard}>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '900px',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 4,
      maxHeight: '80vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
      {steps.map((label, index) => (
        <Step key={index}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
    <Box sx={{ flex: 1, my: 2, pb: 8, overflowY: 'auto' }}> {/* Added pb: 8 */}
      {renderWizardContent(activeStep)}
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
      <Button
        color="inherit"
        disabled={activeStep === 0}
        onClick={handleBack}
        sx={{ mr: 1 }}
      >
        אחורה
      </Button>
      <Box sx={{ flex: '1 1 auto' }} />
      {activeStep === steps.length - 1 ? (
        <Button onClick={handleReset}>הגש</Button>
      ) : (
        <Button onClick={handleNext}>הבא</Button>
      )}
    </Box>
  </Box>
</Modal>


    </>
  );
}
