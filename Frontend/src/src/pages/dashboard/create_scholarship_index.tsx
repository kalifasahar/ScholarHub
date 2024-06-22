import { Helmet } from 'react-helmet-async';

import FiveView from 'src/sections/create_scholarship/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Create</title>
      </Helmet>

      <FiveView />
    </>
  );
}
