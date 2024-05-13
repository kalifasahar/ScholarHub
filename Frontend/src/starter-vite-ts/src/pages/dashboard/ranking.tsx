import { Helmet } from 'react-helmet-async';

import RankingView from 'src/sections/user/view/user-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Ranking Students</title>
      </Helmet>

      <RankingView />
    </>
  );
}
