// Sahar - register page

import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const { register } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('נדרש למלא שם פרטי'),
    lastName: Yup.string().required('נדרש למלא שם משפחה'),
    email: Yup.string().required('נדרש למלא דואר אלקטרוני').email('כתובת הדואר האלקטרונית חייבת להיות תקינה'),
    password: Yup.string().required('נדרש למלא סיסמא'),
    isStaff: Yup.boolean().default(false),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    isStaff: false,
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // user's registration data is submitted to the authentication service
      await register?.(data.email, data.password, data.firstName, data.lastName, data.isStaff);
      
      // Set success message
      setSuccessMsg('הודעת אימות נשלחה בהצלחה לדואר האלקטרוני, אנא לחץ על הקישור על מנת לסיים את תהליך ההרשמה בהצלחה');

      // Redirect to login page after 5 seconds
      setTimeout(() => {
        router.push(paths.auth.jwt.login);
      }, 7000);
    } catch (error) {
      console.error(error);
      setSuccessMsg(''); // Clear success message if there's an error
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">רישום למערכת</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">קיים ברשותך משתמש?</Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          התחבר כעת
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name="firstName" label="שם פרטי" />
        <RHFTextField name="lastName" label="שם משפחה" />
      </Stack>

      <RHFTextField name="email" label="דואר אלקטרוני" />

      <RHFTextField
        name="password"
        label="סיסמא"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <FormControlLabel
        control={<Checkbox name="isStaff" />}
        label="חבר סגל"
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        צור משתמש
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {successMsg && (
        <Alert severity="success" sx={{ m: 3 }}>
          {successMsg}
        </Alert>
      )}

      {!!errorMsg && (
        <Alert severity="error" sx={{ m: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>

    </>
  );
}
