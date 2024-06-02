// tomer
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useState , useEffect} from 'react';
import axios, { endpoints } from 'src/utils/axios';


// ----------------------------------------------------------------------

export default function MyScholarships() {
  // const [selectedApplication, setSelectedApplication] = useState<IApplicationItem | null>(null);
  // const [applications, setApplications] = useState<IApplicationItem[]>([]);

  // useEffect(() => {
  //   const accessToken = sessionStorage.getItem('accessToken');
  //   axios.get(endpoints.applications.get_student_application, {headers: {'Authorization': `Bearer ${accessToken}`}})
  //     .then(response => {
  //       const data = response.data.data;
  //       console.log(data)
  //       setJobs(data);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching jobs:', error);
  //     });
  // }, []);


  return (
    <Container maxWidth='xl'>
      <Typography variant="h4"> המלגות שלי </Typography>

      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      />
    </Container>
  );
}
