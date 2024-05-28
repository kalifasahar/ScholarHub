import { Helmet } from 'react-helmet-async';

import RankingView from 'src/sections/studentsRanking/view/student-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Ranking Students </title>
      </Helmet>

      <RankingView />
    </>
  );
}
