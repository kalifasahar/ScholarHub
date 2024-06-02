import { Helmet } from 'react-helmet-async';

import MyScholarships from 'src/sections/my_scholarships/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Two</title>
      </Helmet>

      <MyScholarships />
    </>
  );
}
