import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState, useEffect } from 'react';
import axios, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import Grid from '@mui/material/Grid';

// ----------------------------------------------------------------------

interface Application {
  id: string;
  name_of_scholarship: string;
  status: string;
  student_email: string;
}

export default function MyScholarships() {
  const [applications, setApplications] = useState<Application[]>([]);
  const { user } = useAuthContext();
  const user_email = user?.email;

  useEffect(() => {
    console.log(user_email);
    const accessToken = sessionStorage.getItem('accessToken');
    axios.get(endpoints.applications.get_all, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then(response => {
        const data = response.data.data;
        console.log(data);
        setApplications(data.filter((app: Application) => app.student_email === user_email));
        console.log(data[0]);
      })
      .catch(error => {
        console.error('Error fetching applications:', error);
      });
  }, [user_email]);

  const heb_status = (status:string) => {
    if (status === 'active'){
      return 'פעיל'
    }
    return status
  }

  return (
    <Container maxWidth='xl'>
      <Typography variant="h4" gutterBottom>הבקשות שלי</Typography>

      <Grid container spacing={3}>
        {applications.map(application => (
          <Grid item xs={12} sm={6} md={4} key={application.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{application.name_of_scholarship}</Typography>
                <Typography variant="body2" color="textSecondary">סטטוס: {heb_status(application.status)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
