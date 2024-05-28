import { Helmet } from 'react-helmet-async';

import JwtEmailVerificationView from 'src/sections/auth/jwt/jwt-email-verification-view';

// ----------------------------------------------------------------------

export default function EmailVerificationPage() {
  return (
    <>
      <Helmet>
        <title>Email Verification</title>
      </Helmet>

      <JwtEmailVerificationView />
    </>
  );
}