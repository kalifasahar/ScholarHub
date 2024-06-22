import { Box, Stack, Typography, Button } from '@mui/material';
import { fDate } from 'src/utils/format-time';
import { IScholarshipItem } from 'src/types/scholarship';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { useAuthContext } from 'src/auth/hooks';

type Props = {
  job: IScholarshipItem;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
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

export default function ScholarshipItem({ job, onEdit, onDelete, onOpenWizard }: Props) {
  const popover = usePopover();
  const { hasPermission } = useAuthContext();
  const admin_view = hasPermission('editSettings')
  const { title, categories, ExpirationDate } = job;


  return (
    <>
      <Card>
        {admin_view &&
          <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>}

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
        {!admin_view &&
        <Divider sx={{ width: '100%', borderStyle: 'dashed' }} />}

        {!admin_view &&
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Button variant="contained" color="primary" onClick={onOpenWizard}>
            פרטים נוספים
          </Button>
        </Box>}
          
      </Card>
      
      {admin_view &&
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          ערוך
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          מחק
        </MenuItem>
      </CustomPopover>
      }



    </>
  );
}
