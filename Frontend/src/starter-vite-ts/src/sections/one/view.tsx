import orderBy from 'lodash/orderBy';
import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { _jobs, JOB_SORT_OPTIONS } from 'src/_mock';

import Iconify from 'src/components/iconify';
// import EmptyContent from 'src/components/empty-content';
// import { useSettingsContext } from 'src/components/settings';

// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IScholarshipItem } from 'src/types/scholarship';
import JobList from './scholarship-list';
import JobSort from './scholarship-sort';
import JobSearch from './scholarship-search';

// ----------------------------------------------------------------------

export default function JobListView() {

  const [sortBy, setSortBy] = useState('עדכני');

  const [search, setSearch] = useState<{ query: string; results: IScholarshipItem[] }>({
    query: '',
    results: [],
  });

  const dataFiltered = applyFilter({
    inputData: _jobs,
    sortBy,
  });

  const notFound = !dataFiltered.length;

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
        hrefItem={(id: string) => paths.dashboard.one.details(id)}
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


      <JobList jobs={dataFiltered} />
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
    inputData = orderBy(inputData, ['DepartmentExpirationDate'], ['desc']);
  }

  if (sortBy === 'ישן') {
    inputData = orderBy(inputData, ['DepartmentExpirationDate'], ['asc']);
  }


  // Return the sorted data without any filtering
  return inputData;
};
