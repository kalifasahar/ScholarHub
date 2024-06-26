import axios from 'axios';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { _userList, USER_STATUS_OPTIONS } from 'src/_mock';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { IUserTableFilters, IUserTableFilterValue } from 'src/types/student';

import UserTableRow from '../student-table-row';
import UserTableToolbar from '../student-table-toolbar';
import UserTableFiltersResult from '../student-table-filters-result';

// ----------------------------------------------------------------------

type StudentApplication = {
  id: number;
  scholarship_id: number;
  scholarshipName: string;
  name: string;
  email: string;
  gender: string;
  yearOfBirth: string;
  supervisor: string;
  fieldOfResearch: string;
  topicOfReasearch: string;
  dateOfStartDgree: string;
  instituteOfBechlor: string;
  facultyOfBechlor: string;
  studentID: string;
  phoneNumber: string;
  department: string;
  gradesAvarage: number;
  degree: string;
  numOfArticles: number;
  ranking: number;
  status: string;
  departmentOfBechlor: string;
  rankArticles: number;
};

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'ranking', label: 'דירוג', width: 100 },
  { id: 'name', label: 'שם' },
  { id: 'phoneNumber', label: 'מספר טלפון', width: 180 },
  { id: 'studentID', label: 'תעודת זהות', width: 180 },
  { id: 'gender', label: 'מגדר', width: 180 },
  { id: 'yearOfBirth', label: 'שנת לידה', width: 180 },
  { id: 'department', label: 'מחלקה', width: 220 },
  { id: 'degree', label: 'תואר', width: 180 },
  { id: 'dateOfStartDgree', label: 'תאריך התחלה', width: 200 },
  { id: 'gradesAvarage', label: 'ממוצע ציונים', width: 180 },
  { id: 'numOfArticles', label: 'מספר מאמרים', width: 180 },
  { id: 'rankArticles', label: 'דירוג המאמרים', width: 180 },
  { id: 'supervisor', label: 'מנחה', width: 180 },
  { id: 'fieldOfResearch', label: 'תחום מחקר', width: 180 },
  { id: 'topicOfReasearch', label: 'נושא מחקר', width: 180 },
  { id: 'instituteOfBechlor', label: 'מוסד קודם', width: 180 },
  { id: 'facultyOfBechlor', label: 'פקולטה קודמת', width: 180 },
  { id: 'departmentOfBechlor', label: 'מחלקה קודמת', width: 180 },
  { id: 'status', label: 'סטטוס', width: 100 },

  { id: '', label: 'עריכה', width: 88 },
];

const defaultFilters: IUserTableFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function StudentListView() {

  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState<StudentApplication[]>([]);
  const [filters, setFilters] = useState<IUserTableFilters>(defaultFilters);

  const [scholarships, setScholarships] = useState<{ id: string; title: string }[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<string>('');
  const [allStudentApplications, setAllStudentApplications] = useState<StudentApplication[]>([]);
  const [studentApplications, setStudentApplications] = useState<StudentApplication[]>([]);



  // Fetch scholarships and all student applications on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const headers = {
          'Authorization': `Bearer ${accessToken}`,
        };
        
        const [scholarshipResponse, applicationsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/scholarships/get_all', { headers }),
          axios.get('http://localhost:8000/api/applications/get_all', { headers }),
        ]);

        if (scholarshipResponse.data.success) {
          const scholarshipsData = scholarshipResponse.data.data.map((scholarship: any) => ({
            id: scholarship.id,
            title: scholarship.title,
          }));
          setScholarships(scholarshipsData);
        }
        if (applicationsResponse.data.success) {
          const applicationsData = applicationsResponse.data.data.map((application: any) => {
            // need to remove console
            console.log(application.student_name);
            console.log(application.departmentOfBechlor);
            console.log(application.rankArticles);
            console.log(application.student_birthday);
            const yearOfBirth = new Date(application.student_birthday).getFullYear();
            return {
              id: application.id, // int
            scholarship_id: application.scholarship_id, // int
            scholarshipName: application.name_of_scholarship, // string
            name: application.student_name, // string
            email: application.student_email, // string
            gender: application.student_gender, // string
            yearOfBirth, // : application.student_birthday, // string
            supervisor: application.supervisor, // string
            fieldOfResearch: application.field_of_reserch, // string
            topicOfReasearch: application.topic_of_reserch, // string
            dateOfStartDgree: application.date_of_start_degree, // string
            instituteOfBechlor: application.institute_of_bachelor, // string
            facultyOfBechlor: application.faculty_of_bachelor, // string
            studentID: application.student_legal_id, // string
            phoneNumber: application.student_phone, // string
            department: application.student_department, // string
            gradesAvarage: application.student_gpa, // number
            degree: application.student_degree, // string
            numOfArticles: application.student_num_of_articles, // int
            ranking: application.rank, // int
            status: application.status, // string
            departmentOfBechlor: application.department_of_bechlor, // string
            rankArticles: application.rank_articles, // number
            };
            
          });
          setAllStudentApplications(applicationsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }

    fetchData();
  }, []);

  const handleScholarshipChange = (event: SelectChangeEvent<string>) => {
    const scholarshipName = event.target.value;
    setSelectedScholarship(scholarshipName);
    filterStudentApplications(scholarshipName);
  };

  const filterStudentApplications = (scholarshipName: string) => {
    const filteredApplications = allStudentApplications.filter(
      (application) => application.scholarshipName === scholarshipName
    );
    setStudentApplications(filteredApplications);
  };

const handleRankingChange = (id: string, ranking: number) => {
  setStudentApplications((prev) => {
    const updated = prev.map((student) =>
      student.studentID === id ? { ...student, ranking } : student
    );

    // Sort the updated list based on the new rankings
    const sorted = updated.sort((a, b) => a.ranking - b.ranking);

    return sorted;
  });

  // Sort the table data as well
  setTableData((prev) => {
    const updated = prev.map((student) =>
      student.studentID === id ? { ...student, ranking } : student
    );

    // Sort the updated list based on the new rankings
    const sorted = updated.sort((a, b) => a.ranking - b.ranking);

    return sorted;
  });
};



  const handleSaveRankings = async () => {
    try {
      await axios.post('/api/save-rankings', { scholarship: selectedScholarship, rankings: studentApplications });
      enqueueSnackbar('Rankings saved successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Failed to save rankings:', error);
      enqueueSnackbar('Failed to save rankings!', { variant: 'error' });
    }
  };

  const dataFiltered = applyFilter({
    inputData: studentApplications, // tableData // studentApplications
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.studentID !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.studentID));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  return (
    <>
      <Container maxWidth='lg'>
        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }} style={{ maxWidth: '600px', width: '100%' }}>
          <InputLabel id="scholarship-select-label">בחר מלגה</InputLabel>
          <Select
            labelId="scholarship-select-label"
            value={selectedScholarship}
            onChange={handleScholarshipChange}
            label="בחר מלגה"
          >
            {scholarships.map((scholarship) => (
              <MenuItem key={scholarship.id} value={scholarship.title}>
                {scholarship.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Card>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.studentID)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              {/* change to medium */}
              <Table size='small' sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  // rowCount={dataFiltered.length}
                  // numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     dataFiltered.map((row) => row.studentID)
                  //   )
                  // }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.studentID}
                        row={row}
                        selected={table.selected.includes(row.studentID)}
                        onSelectRow={() => table.onSelectRow(row.studentID)}
                        onDeleteRow={() => handleDeleteRow(row.studentID)}
                        onEditRow={() => handleEditRow(row.studentID)}
                        onRankingChange={handleRankingChange}
                      />
                    ))}

                  <TableEmptyRows
                    height={56}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: StudentApplication[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
}) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((user) => role.includes(user.role));
  // }

  return inputData;
}
