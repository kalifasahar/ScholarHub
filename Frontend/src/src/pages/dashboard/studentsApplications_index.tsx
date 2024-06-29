import { Helmet } from 'react-helmet-async';

import StudentsApplications from 'src/sections/studentsApplications/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Students Applications</title>
      </Helmet>

      <StudentsApplications />
    </>
  );
}
