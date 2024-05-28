import Container from '@mui/material/Container';

import ProductNewEditForm from './scolharship-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  return (
    <Container  maxWidth='lg'>
      <h1>מלגה חדשה</h1>
      <ProductNewEditForm />
    </Container>
  );
}
