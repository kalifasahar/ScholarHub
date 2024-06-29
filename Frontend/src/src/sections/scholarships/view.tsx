import React, { useState, useEffect, useCallback } from 'react';
import { Box, Step, Modal, Button, Stepper, StepLabel, Typography, IconButton, Stack, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import parse from 'html-react-parser';
import { wizard_data } from 'src/auth/types';
import { fDate } from 'src/utils/format-time';
import axios, { endpoints } from 'src/utils/axios';
import orderBy from 'lodash/orderBy';
import { IScholarshipItem } from 'src/types/scholarship';
import JobSort from './scholarship-sort';
import JobSearch from './scholarship-search';
import JobList from './scholarship-list';
import StudentSubmitForm from './student-submit-form';
import StudentUploadForm from './student-upload-form';

interface ScholarshipData {
  id: string;
  title: string;
  content: string;
  categories: string[];
  expiredDate: string;
  grant: number;
  additional_grant_description: string;
  description: string;
}

const JOB_SORT_OPTIONS = [
  { value: 'עדכני', label: 'עדכני' },
  { value: 'ישן', label: 'ישן' },
];

export default function ScholarshipsListView() {
  const [sortBy, setSortBy] = useState('עדכני');
  const [selectedJob, setSelectedJob] = useState<IScholarshipItem | null>(null);
  const [openWizard, setOpenWizard] = useState(false);
  const [jobs, setJobs] = useState<IScholarshipItem[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const steps = ['צעד 1', 'צעד 2', 'צעד 3'];
  const [search, setSearch] = useState<{ query: string; results: IScholarshipItem[] }>({
    query: '',
    results: [],
  });
  const [formData, setFormData] = useState<wizard_data>({
    hebFirstName: '',
    hebLastName: '',
    engFirstName: '',
    engLastName: '',
    supervisor: '',
    studentID: '',
    department: '',
    email: '',
    gender: '',
    yearOfBirth: new Date(),
    phoneNumber: '',
    faculty: '',
    fieldOfResearch: '',
    topicOfResearch: '',
    dateOfStartDgree: new Date(),
    dateOfFinishDgree: new Date(),
    fundsResources: '',
    instituteOfBechlor: '',
    gradesAvarageOfBechlor: '',
    isFinalGrade: false,
    facultyOfBechlor: '',
    rankingOfBechlor: '',
    dateOfFinishBechlor: new Date(),
    departmentOfBechlor: '',
    secondScholarship: '',
    studentNotes: '',
  });

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');
    axios
      .get(endpoints.scholarship.all, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        const realData = response.data.data;

        const transformedJobs: IScholarshipItem[] = realData.map((job: ScholarshipData) => ({
          id: job.id,
          title: job.title,
          description: job.description,
          categories: job.categories,
          content: job.content,
          ExpirationDate: job.expiredDate,
          additionalgrantDescription: job.additional_grant_description,
          grant: job.grant,
        }));

        setJobs(transformedJobs);
      })
      .catch((error) => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  const dataFiltered = applyFilter({
    inputData: jobs,
    sortBy,
  });

  const handleOpenWizard = useCallback(
    (id: string) => {
      const selected = jobs.find((job) => job.id === id);
      if (selected) {
        setSelectedJob(selected);
        setOpenWizard(true);
      }
    },
    [jobs]
  );

  const handleOpenWizardFromButton = useCallback((job: IScholarshipItem) => {
    setSelectedJob(job);
    setOpenWizard(true);
  }, []);

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback(
    (inputValue: string) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = jobs.filter((job) => job.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1);

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [jobs]
  );

  const validateForm = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(
          formData.hebFirstName
          // && formData.hebLastName
          // && formData.engFirstName
          // && formData.engLastName
          // && formData.studentID
          // && formData.yearOfBirth
          // && formData.email
          // && formData.phoneNumber
          // && formData.faculty
          // && formData.department
          // && formData.instituteOfBechlor
          // && formData.facultyOfBechlor
          // && formData.departmentOfBechlor
          // && formData.gradesAvarageOfBechlor
          // && formData.dateOfFinishBechlor
        );
      case 2:
        return files.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const isValid = validateForm(activeStep);
    if (isValid || selectedJob?.id !== '1') {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      alert('יש למלא את כל השדות הרלוונטים');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setFiles([]);
    setActiveStep(0);
    setOpenWizard(false);
    setFormData({
      hebFirstName: '',
      hebLastName: '',
      engFirstName: '',
      engLastName: '',
      supervisor: '',
      studentID: '',
      department: '',
      email: '',
      gender: '',
      yearOfBirth: new Date(),
      phoneNumber: '',
      faculty: '',
      fieldOfResearch: '',
      topicOfResearch: '',
      dateOfStartDgree: new Date(),
      dateOfFinishDgree: new Date(),
      fundsResources: '',
      instituteOfBechlor: '',
      gradesAvarageOfBechlor: '',
      isFinalGrade: false,
      facultyOfBechlor: '',
      rankingOfBechlor: '',
      dateOfFinishBechlor: new Date(),
      departmentOfBechlor: '',
      secondScholarship: '',
      studentNotes: '',
    })
  };

  const handleCloseWizard = () => {
    handleReset();
    setActiveStep(0);
    setOpenWizard(false);
  };

  const handleFormChange = (newFormData: wizard_data) => {
    setFormData(newFormData);
  };

  const handleSubmitFinal = () => {
    const isValid = validateForm(activeStep); 
    if (isValid || selectedJob?.id !== '1') {
      console.log('Final form submission data:', formData);
      // Add your final submission logic here
      handleReset();
    } else {
      alert('יש למלא את כל השדות הרלוונטים');
    }
  };

  const getButtonProps = () => {
    if (activeStep === steps.length - 1) {
      return { text: 'סיים', action: handleSubmitFinal };
    }
    if (activeStep === 0) {
      return { text: 'להגשה', action: handleNext };
    }
    return { text: 'הבא', action: handleNext };
  };

  const { text, action } = getButtonProps();

  const renderWizardContent = (step: number) => {
    if (fetchError) {
      return <Typography color="error">{fetchError}</Typography>;
    }
    if (selectedJob) {
      switch (step) {
        case 0:
          return (
            <Box sx={{ maxHeight: '400px', px: 2 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                style={{
                  fontSize: '2.5rem',
                  margin: '20px 0',
                  padding: '10px 0',
                  borderBottom: '2px solid black',
                }}
              >
                {selectedJob.title}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                {parse(selectedJob.content)}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                <span style={{ borderBottom: '2px solid black' }}>גובה מלגה: {selectedJob.grant} ₪</span>
                <div>{selectedJob.additionalgrantDescription}</div>
              </Typography>
              <Typography variant="body2">
                <span style={{ borderBottom: '2px solid black' }}>תאריך אחרון להגשה: {fDate(selectedJob.ExpirationDate)}</span>
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h5">הרכב תיק מועמד</Typography>
                <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                  will be expliantion here
                  {/* {bla.explanation} */}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                  {/* {bla.files.map((file, index) => (
                    <div key={index}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        {file.name}
                      </a>
                    </div>
                  ))} */}
                </Typography>
              </Box>
            </Box>
          );
        case 1:
          return (
            <Typography>
              {selectedJob?.id === '1' ? <StudentSubmitForm formData={formData} onFormChange={handleFormChange} /> : 'כרגע לא נתמך במערכת נסו שוב מאוחר יותר'}
            </Typography>
          );
        case 2:
          return (
            <Typography>
              {selectedJob?.id === '1' ? <StudentUploadForm files={files} onFileChange={handleFileChange} /> : 'כרגע לא נתמך במערכת נסו שוב מאוחר יותר'}
            </Typography>
          );
        default:
          return 'Unknown step';
      }
    }
    return <Typography>No data available</Typography>;
  };

  const renderFilters = (
    <Stack spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-end', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }}>
      <JobSearch query={search.query} results={search.results} onSearch={handleSearch} onResultClick={handleOpenWizard} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <JobSort sort={sortBy} onSort={handleSortBy} sortOptions={JOB_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  return (
    <Container maxWidth="lg">
      <Stack
        spacing={2.5}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}
      </Stack>

      <JobList jobs={dataFiltered} onOpenWizard={handleOpenWizardFromButton} />
      <Modal
        open={openWizard}
        onClose={handleCloseWizard}
        disableEscapeKeyDown
        BackdropProps={{ onClick: (e) => e.stopPropagation() }} // Disable closing on backdrop click
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
            maxWidth: '95%',
            height: '95%',
            maxHeight: '95%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <IconButton
            onClick={handleCloseWizard}
            sx={{
              position: 'absolute',
              top: -3,
              right: -2,
              color: '#ff1744', // beautiful red color
              '&:hover': {
                color: '#d50000', // darker red on hover
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ flex: 1, my: 0, pb: 10, overflowY: 'auto' }}>{renderWizardContent(activeStep)}</Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              אחורה
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={action}>{text}</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({
  inputData,
  sortBy,
}: {
  inputData: IScholarshipItem[];
  sortBy: string;
}) => {
  // SORT BY
  if (sortBy === 'עדכני') {
    inputData = orderBy(inputData, ['ExpirationDate'], ['desc']);
  }

  if (sortBy === 'ישן') {
    inputData = orderBy(inputData, ['ExpirationDate'], ['asc']);
  }

  // Return the sorted data without any filtering
  return inputData;
};
