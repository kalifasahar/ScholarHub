import axios, {endpoints} from 'src/utils/axios';

import orderBy from 'lodash/orderBy';
import { useState, useCallback , useEffect} from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';



import { _jobs, JOB_SORT_OPTIONS } from 'src/_mock';


import { IScholarshipItem } from 'src/types/scholarship';
import JobList from './scholarship-list';
import JobSort from './scholarship-sort';
import JobSearch from './scholarship-search';

// ----------------------------------------------------------------------

export default function ScholarshipsListView() {

  const [sortBy, setSortBy] = useState('עדכני');
  const [selectedJob, setSelectedJob] =  useState<IScholarshipItem | null>(null);
  const [openWizard, setOpenWizard] = useState(false);
  const [jobs, setJobs] = useState<IScholarshipItem[]>([]);
  const [search, setSearch] = useState<{ query: string; results: IScholarshipItem[] }>({
    query: '',
    results: [],
  });

  useEffect(() => {
    axios.get(endpoints.scholarship.all)
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
      });
  }, []);

  const dataFiltered = applyFilter({
    inputData: _jobs,
    sortBy,
  });

  useEffect(() => {
    // remove this later
    console.log('dataFiltered updated', dataFiltered);
  }, [dataFiltered]);

  const handleOpenWizard = useCallback((id: string) => {
    const selected = _jobs.find(job => job.id === id);
    if (selected) {
      setSelectedJob(selected);
      setOpenWizard(true);
    }
  }, []);
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
        const results = _jobs.filter(
          (job) => job.title.toLowerCase().indexOf(search.query.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [search.query]
  );

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <JobSearch
        query={search.query}
        results={search.results}
        onSearch={handleSearch}
        onResultClick={handleOpenWizard} // Add this line
      />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <JobSort sort={sortBy} onSort={handleSortBy} sortOptions={JOB_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  return (
    <Container maxWidth='lg'>
      <Stack
        spacing={2.5}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}
      </Stack>


      <JobList 
        jobs={dataFiltered} 
        selectedJob={selectedJob}
        openWizard={openWizard} 
        setOpenWizard={setOpenWizard} 
        onOpenWizard={handleOpenWizardFromButton} 

/>
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
