import * as Yup from 'yup';
import { useForm, useFieldArray, Resolver ,Controller, Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useEffect } from 'react';
import { useSnackbar } from 'notistack';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import './custom-quill.css';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

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

type FormValues = {
  title: string;
  categories: { value: string }[];
  grant: number;
  description: string;
  additionalgrantDescription: string; 
  content: string;
  ExpirationDate: Date;
};

type QuillEditorProps = {
  name: string;
  control: Control<any>;
};
// ----------------------------------------------------------------------

const StyledReactQuill = styled(ReactQuill)(({ theme }) => ({
  '& .ql-container': {
    minHeight: '200px',
    height: '400px',
    direction: 'rtl',
    textAlign: 'right',
  },
  '& .ql-editor': {
    direction: 'rtl',
    textAlign: 'right', 
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
];

const QuillEditor = ({ name, control }: QuillEditorProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <StyledReactQuill
        {...field}
        onChange={(value) => field.onChange(value)}
        modules={modules}
        formats={formats}
      />
    )}
  />
);

type Props = {
  currentScholarship?: IScholarshipItem;
};

export default function ProductNewEditForm({ currentScholarship }: Props) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewScholarshipSchema = Yup.object().shape({
    title: Yup.string().required('Name is required'),
    categories: Yup.array().of(Yup.object().shape({
      value: Yup.string().trim().min(3, 'קטגוריה צריכה להיות באורך של 3 לפחות')
    })).max(10, 'Can have up to 10 categories'),
    grant: Yup.number().moreThan(0, 'מענק צריך להיות גדול מ-0'),
    description: Yup.string().required('תיאור הוא חובה'),
    additionalgrantDescription: Yup.string().required('Additional description is required'), 
    content: Yup.string()
    .test('is-not-empty', 'יש למלא תוכן', (value) => {
      if (!value) return false;
      const strippedContent = value.replace(/<\/?[^>]+(>|$)/g, "").trim();
      return strippedContent.length > 0;
    })
    .required('יש למלא תוכן'),
      ExpirationDate: Yup.date().required('יש לציין תאריך סיום')
  });

  const defaultValues = useMemo(
    () => ({
      title: currentScholarship?.title || '',
      description: currentScholarship?.description || '',
      additionalgrantDescription: currentScholarship?.additionalgrantDescription || '', 
      grant: currentScholarship?.grant || 0,
      categories: currentScholarship?.categories?.map((category) => ({ value: category })) || [{ value: '' }],
      content: currentScholarship?.content || '',
      ExpirationDate: currentScholarship?.ExpirationDate ? new Date(currentScholarship?.ExpirationDate) : new Date()
    }),
    [currentScholarship]
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(NewScholarshipSchema) as unknown as Resolver<FormValues>,
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories"
  });

  const values = watch();

  useEffect(() => {
    if (currentScholarship) {
      reset(defaultValues);
    }
  }, [currentScholarship, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.info('Submitting data', data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(currentScholarship ? 'מלגה נערכה בהצלחה!' : 'מלגה נוצרה בהצלחה');
      // TODO send new scholarship to server
    } catch (error) {
      console.error('Submission error', error);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            פרטים
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            שם מלגה, הסבר קצר, אוכלוסיית יעד...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="title" label="שם מלגה" />

            <RHFTextField name="description" label="תיאור קצר" multiline rows={4} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">אוכלוסיית יעד וקריטריונים:</Typography>
              <QuillEditor
                name="content"
                control={control}
              />
               {errors.content && (
                <Typography color="error">{errors.content.message}</Typography>
              )}
            </Stack>

          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderCategories = (
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
          {!mdUp && <CardHeader title="Categories" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            {fields.map((field, index) => (
              <Box key={field.id} display="flex" alignItems="center">
                <TextField
                  {...methods.register(`categories.${index}.value` as const)}
                  label={`קטגוריה ${index + 1}`}
                  fullWidth
                />
                <IconButton onClick={() => remove(index)} disabled={fields.length === 1}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            {fields.length < 10 && (
              <Button
                variant="contained"
                onClick={() => append({ value: '' })}
              >
                Add Category
              </Button>
            )}
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
              name="grant"
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
            <RHFTextField name="additionalgrantDescription" label="תיאור נוסף" multiline rows={4} /> {/* Added new field */}
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderExpirationDate = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            תאריך סיום
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            תאריך סיום המלגה
          </Typography>
        </Grid>
      )}
  
      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Expiration Date" />}
  
          <Stack spacing={3} sx={{ p: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="תאריך סיום"
                value={values.ExpirationDate}
                onChange={(newValue) => setValue('ExpirationDate', newValue || new Date())}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
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
        {renderPricing}
        {renderExpirationDate}
        {renderCategories}
        {renderActions}
      </Grid>
    </FormProvider>
  );
}
