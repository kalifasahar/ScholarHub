import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { IScholarshipItem } from 'src/types/scholarship';

import ScholarshipItem from './scholarship-item';

// ----------------------------------------------------------------------

type Props = {
  jobs: IScholarshipItem[];
  onOpenWizard: (job: IScholarshipItem) => void;
};

export default function JobList({ jobs, onOpenWizard }: Props) {
  const router = useRouter();

  const handleEdit = useCallback(
    (id: string) => {
      router.push(paths.dashboard.scholarships.edit(id));
    },
    [router]
  );

  const handleDelete = useCallback((id: string) => {
    console.info('DELETE', id);
  }, []);

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(1, 1fr)',
        }}
      >
        {jobs.map((job) => (
          <ScholarshipItem
            key={job.id}
            job={job}
            onEdit={() => handleEdit(job.id)}
            onDelete={() => handleDelete(job.id)}
            onOpenWizard={() => onOpenWizard(job)}
          />
        ))}
      </Box>

      {jobs.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )}
    </>
  );
}
