// tomer
import { Helmet } from 'react-helmet-async';

import OneView from 'src/sections/scholarships/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Scholarships</title>
      </Helmet>

      <OneView />
    </>
  );
}
