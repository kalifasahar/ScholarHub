import * as Yup from 'yup';
import { useForm, useFieldArray, Resolver, Controller, Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';
import { IScholarshipItem } from 'src/types/scholarship';
import axios, { endpoints } from 'src/utils/axios';

type FormValues = {
  id: string;
  title: string;
  categories: { value: string }[];
  grant: number;
  description: string;
  additionalgrantDescription: string;
  content: string;
  ExpirationDate: Date;
  files: File[];
  fileExplanation: string; 
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
  currentScholarship?: IScholarshipItem | null;
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
    additionalgrantDescription: Yup.string(),
    content: Yup.string()
      .test('is-not-empty', 'יש למלא תוכן', (value) => {
        if (!value) return false;
        const strippedContent = value.replace(/<\/?[^>]+(>|$)/g, "").trim();
        return strippedContent.length > 0;
      })
      .required('יש למלא תוכן'),
    ExpirationDate: Yup.date().required('יש לציין תאריך סיום'),
    fileExplanation: Yup.string(), 

  });

  const defaultValues = useMemo(
    () => ({
      id: currentScholarship?.id || '',
      title: currentScholarship?.title || '',
      description: currentScholarship?.description || '',
      additionalgrantDescription: currentScholarship?.additionalgrantDescription || '',
      grant: currentScholarship?.grant || 0,
      categories: currentScholarship?.categories?.map((category) => ({ value: category })) || [{ value: '' }],
      content: currentScholarship?.content || '',
      ExpirationDate: currentScholarship?.ExpirationDate ? new Date(currentScholarship?.ExpirationDate) : new Date(),
      files: [],
      fileExplanation: '', 
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
      const accessToken = sessionStorage.getItem('accessToken');
  
      // Map the form categories to an array of strings
      const formattedCategories = data.categories.map((category) => category.value);
  
      const newScholarshipData = {
        id:data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        categories: formattedCategories,
        expiredDate: data.ExpirationDate,
        grant: data.grant,
        additional_grant_description: data.additionalgrantDescription,
      };
  
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      console.info('Submitting data', newScholarshipData);
      axios
        .post(currentScholarship ? endpoints.scholarship.edit_scholarship :endpoints.scholarship.new_scholarship, newScholarshipData, { headers })
        .then((response) => {
          reset();
          enqueueSnackbar(currentScholarship ? 'מלגה נערכה בהצלחה!' : 'מלגה נוצרה בהצלחה');
          console.log('Scholarship created successfully:', response.data);
        })
        .catch((error) => {
          console.error('Error creating scholarship:', error);
        });
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
                הוסף קטגוריה
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

  const renderFiles = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            הרכב תיק מועמד
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            קבצים שיש למלא והסבר על יצרית תיק מועמד
          </Typography>
        </Grid>
      )}
  
      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="File Uploads" />}
  
          <Stack spacing={3} sx={{ p: 3 }}>
            <Controller
              name="files"
              control={control}
              render={({ field }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const { getRootProps, getInputProps } = useDropzone({
                  onDrop: (acceptedFiles: File[]) => {
                    field.onChange([...field.value, ...acceptedFiles]);
                  },
                  multiple: true,
                });
  
                return (
                  <>
                    <div
                      {...getRootProps()}
                      style={{
                        border: '2px dashed #cccccc',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <input {...getInputProps()} />
                      <p>גרור ושחרר את כל הקבצים הרלוונטים כאן, או לחץ כדי לבחור קבצים</p>
                    </div>
                    <Stack spacing={1}>
                      {field.value && field.value.map((file, index) => (
                        <Box key={index} display="flex" alignItems="center">
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {file.name}
                          </Typography>
                          <IconButton onClick={() => {
                            const newFiles = [...field.value];
                            newFiles.splice(index, 1);
                            field.onChange(newFiles);
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </>
                );
              }}
            />
            {errors.files && (
              <Typography color="error">{errors.files.message}</Typography>
            )}
  
            {/* Explanation headline */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">הסבר על תהליך מילוי הקבצים:</Typography>
              <RHFTextField name="fileExplanation" label="תיאור" multiline rows={4} />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );  
    
  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid container xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        {renderFiles}
        {renderActions}
      </Grid>
    </FormProvider>
  );
}
