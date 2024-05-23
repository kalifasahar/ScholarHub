// Sahar - Created for email verification

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';


export default function JwtEmailVerificationView() {
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
  
    useEffect(() => {
      const verifyEmail = async () => {
        try { 
          const response = await fetch(`http://localhost:8000/api/users/authenticate?token=${token}`, {
            method: 'GET',
          });
          const data = await response.json();
          if (response.ok) {
            setStatus('success');
            setMessage('הדואר אלקטרוני אומת בהצלחה, בצע כעת התחברות למערכת.');
            setTimeout(() => {
              router.push('/auth/jwt/login');
            }, 5000); // Redirect after 5 seconds
          } else {
            setStatus('error');
            setMessage("הדואר האלקטרוני לא אומת כראוי, אנא נסה להרשם בשנית.");
          }
        } catch (error) {
          setStatus('error');
          setMessage("הדואר האלקטרוני לא אומת כראוי, אנא נסה להרשם בשנית.");
        }
      };
  
      if (token) {
        verifyEmail();
      } else {
        setStatus('error');
        setMessage('הדואר האלקטרוני לא אומת כראוי, אנא נסה להרשם בשנית.');
      }
    }, [token, router]);
  
    return (
      <Container maxWidth="sm" style={{ marginTop: '50px' }}>
        {status === 'loading' && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="h6">Verifying your email...</Typography>
          </Stack>
        )}
        {status === 'success' && (
          <Alert severity="success">
            <Typography variant="h6">{message}</Typography>
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error">
            <Typography variant="h6">{message}</Typography>
          </Alert>
        )}
      </Container>
    );
  }