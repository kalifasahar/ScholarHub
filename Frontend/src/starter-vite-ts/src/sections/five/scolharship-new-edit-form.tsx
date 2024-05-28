import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import './custom-quill.css';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';


import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import {
  _tags,
  PRODUCT_SIZE_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_COLOR_NAME_OPTIONS,
  PRODUCT_CATEGORY_GROUP_OPTIONS,
} from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFEditor,
//   RHFUpload,
  RHFSwitch,
  RHFTextField,
  RHFMultiSelect,
  RHFMultiCheckbox,
} from 'src/components/hook-form';
import { IScholarshipItem } from 'src/types/scholarship';


// ----------------------------------------------------------------------

const StyledReactQuill = styled(ReactQuill)(({ theme }) => ({
  '& .ql-container': {
    minHeight: '200px',
    height: '400px',
    direction: 'rtl', // Add this line
    textAlign: 'right', // Add this line
  },
  '& .ql-editor': {
    direction: 'rtl', // Add this line
    textAlign: 'right', // Add this line
  },
}));
  
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }],
      [{ 'list': 'bullet' }],
      [{ 'direction': 'rtl' }, { 'align': [] }],
      ['bold', 'italic', 'underline'],
    ],
    clipboard: {
      matchVisual: false,
    }
  };
  
  const formats = [
    'header',
    'list', 'bullet',
    'direction', 'align',
    'bold', 'italic', 'underline'
  ]

type Props = {
  currentScholarship?: IScholarshipItem;
};

export default function ProductNewEditForm({ currentScholarship }: Props) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const NewScholarshipSchema = Yup.object().shape({
    title: Yup.string().required('Name is required'),
    categories: Yup.array().min(2, 'Must have at least 2 categories'),
    grant: Yup.number().moreThan(0, 'מענק צריך להיות גדול מ-0'),
    description: Yup.string().required('Description is required'),
    content: Yup.string().required('יש למלא תוכן'),
    DepartmentExpirationDate: Yup.date().required('יש לציין תאריך סיום')
  });

  const defaultValues = useMemo(
    () => ({
      title: currentScholarship?.title || '',
      description: currentScholarship?.description || '',
      grant: currentScholarship?.grant || 0,
      categories: currentScholarship?.categories || [],
      content: currentScholarship?.content || '',
      DepartmentExpirationDate: currentScholarship?.DepartmentExpirationDate || new Date()
    }),
    [currentScholarship]
  );

  const methods = useForm({
    resolver: yupResolver(NewScholarshipSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentScholarship) {
      reset(defaultValues);
    }
  }, [currentScholarship, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(currentScholarship ? 'Update success!' : 'Create success!');
    //   router.push(paths.dashboard.product.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

//   const handleDrop = useCallback(
//     (acceptedFiles: File[]) => {
//       const files = values.images || [];

//       const newFiles = acceptedFiles.map((file) =>
//         Object.assign(file, {
//           preview: URL.createObjectURL(file),
//         })
//       );

//       setValue('images', [...files, ...newFiles], { shouldValidate: true });
//     },
//     [setValue, values.images]
//   );

//   const handleRemoveFile = useCallback(
//     (inputFile: File | string) => {
//       const filtered = values.images && values.images?.filter((file) => file !== inputFile);
//       setValue('images', filtered);
//     },
//     [setValue, values.images]
//   );

//   const handleRemoveAllFiles = useCallback(() => {
//     setValue('images', []);
//   }, [setValue]);


  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            פרטים
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            שם מלגה, הסבר קצר...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="name" label="שם מלגה" />

            <RHFTextField name="subDescription" label="תיאור קצר" multiline rows={4} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Content</Typography>
              <StyledReactQuill 
                value={values.content} 
                onChange={(value) => setValue('content', value)} 
                modules={modules}
                formats={formats}
                />
            </Stack>

          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            קטגוריות
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            מילות מפתח
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              {/* <RHFTextField name="code" label="Product Code" /> */}

              <RHFTextField
                name="quantity"
                label="Quantity"
                placeholder="0"
                type="number"
                InputLabelProps={{ shrink: true }}
              />

              <RHFSelect native name="category" label="Category" InputLabelProps={{ shrink: true }}>
                {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
                  <optgroup key={category.group} label={category.group}>
                    {category.classify.map((classify) => (
                      <option key={classify} value={classify}>
                        {classify}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </RHFSelect>

              {/* <RHFMultiSelect
                checkbox
                name="colors"
                label="Colors"
                options={PRODUCT_COLOR_NAME_OPTIONS}
              />

              <RHFMultiSelect checkbox name="sizes" label="Sizes" options={PRODUCT_SIZE_OPTIONS} /> */}
            </Box>

            {/* <Stack spacing={1}>
              <Typography variant="subtitle2">Gender</Typography>
              <RHFMultiCheckbox row name="gender" spacing={2} options={PRODUCT_GENDER_OPTIONS} />
            </Stack> */}

            {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}
{/* 
            <Stack direction="row" alignItems="center" spacing={3}>
              <RHFSwitch name="saleLabel.enabled" label={null} sx={{ m: 0 }} />
              <RHFTextField
                name="saleLabel.content"
                label="Sale Label"
                fullWidth
                disabled={!values.saleLabel.enabled}
              />
            </Stack> */}

            {/* <Stack direction="row" alignItems="center" spacing={3}>
              <RHFSwitch name="newLabel.enabled" label={null} sx={{ m: 0 }} />
              <RHFTextField
                name="newLabel.content"
                label="New Label"
                fullWidth
                disabled={!values.newLabel.enabled}
              /> */}
            {/* </Stack> */}
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderPricing = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            מענק מלגה
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            סכום מענק המלגה
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Pricing" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField
              name="price"
              label="סכום"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                    ₪
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentScholarship ? 'צור מלגה' : 'שמור שינויים'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderPricing}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}
