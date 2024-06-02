import { useCallback, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import axios, { endpoints } from 'src/utils/axios';
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { IScholarshipItem } from 'src/types/scholarship';
import ScholarshipItem from './scholarship-item';
import ProductNewEditForm from '../create_scholarship/scolharship-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  jobs: IScholarshipItem[];
  onOpenWizard: (job: IScholarshipItem) => void;
};

export default function JobList({ jobs: initialJobs, onOpenWizard }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [jobs, setJobs] = useState<IScholarshipItem[]>([]);
  const [currentScholarship, setCurrentScholarship] = useState<IScholarshipItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const handleEdit = useCallback(
    (id: string) => {
      const scholarshipToEdit = jobs.find((job) => job.id === id);
      setCurrentScholarship(scholarshipToEdit || null);
      setIsModalOpen(true);
    },
    [jobs]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const accessToken = sessionStorage.getItem('accessToken');
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      axios
        .post(endpoints.scholarship.delete, { id }, { headers })
        .then((response) => {
          console.log('Scholarship deleted successfully:', response.data);
          setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
          enqueueSnackbar('Scholarship deleted successfully', { variant: 'success' });
        })
        .catch((error) => {
          console.error('Error deleting scholarship:', error);
          enqueueSnackbar('Error deleting scholarship', { variant: 'error' });
        });
      console.info('DELETE', id);
    },
    [enqueueSnackbar]
  );

  const handleFormClose = () => {
    setIsModalOpen(false);
    setCurrentScholarship(null);
  };

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

      <Dialog open={isModalOpen} onClose={handleFormClose}  maxWidth="md" fullWidth>
        <DialogTitle>{currentScholarship ? 'ערוך מלגה' : 'מלגה חדשה'}</DialogTitle>
            <DialogContent>
              <ProductNewEditForm currentScholarship={currentScholarship}/>
            </DialogContent>
      </Dialog>
    </>
  );
}
