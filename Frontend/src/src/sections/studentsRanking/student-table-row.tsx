import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IStudentItem } from 'src/types/student';

import UserQuickEditForm from './student-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IStudentItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onRankingChange: (id: string, rank: number) => void;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onRankingChange,
}: Props) {
  const { rank, name, studentID, email,
     phoneNumber, department, degree, status, gradesAvarage, numOfArticles,
      gender, yearOfBirth, supervisor, fieldOfResearch, topicOfReasearch, dateOfStartDgree,
       instituteOfBechlor, facultyOfBechlor, departmentOfBechlor, rankArticles } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const handleRankingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRank = Number(event.target.value);
    onRankingChange(studentID, newRank);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <TextField
            type="number"
            value={rank || ''}
            onChange={handleRankingChange}
            inputProps={{ min: 0 }}
            sx={{
              width: '5rem', // Wider input
              '& .MuiInputBase-input': {
                padding: '0.5rem', // Add some padding
                textAlign: 'center', // Center-align the text
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', // Rounded corners
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)', // Default border color
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.87)', // Border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'orange', // Border color when focused
                },
              },
            }}
          />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemText
            primary={name}
            secondary={email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{phoneNumber}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{studentID}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{gender}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{yearOfBirth}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{department}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{degree}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{dateOfStartDgree}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{gradesAvarage}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{numOfArticles}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{rankArticles}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{supervisor}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fieldOfResearch}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{topicOfReasearch}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{instituteOfBechlor}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{facultyOfBechlor}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{departmentOfBechlor}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'active' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'banned' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>

        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="מחיקה"
        content="האם אתה בטוח שברצונך למחוק?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
