import React from 'react';
import { Box, Checkbox, TextField, Typography, FormControlLabel, FormGroup, Radio, RadioGroup, FormControl, FormLabel, Divider } from '@mui/material';
import { form_data } from 'src/auth/types';


interface StudentSubmitFormProps {
  formData: form_data;
  onFormChange: (newFormData: form_data) => void;
}

const StudentSubmitForm: React.FC<StudentSubmitFormProps> = ({ formData, onFormChange }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormChange({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onFormChange({
      ...formData,
      checklist: {
        ...formData.checklist,
        [name]: checked,
      },
    });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({
      ...formData,
      check_5_options: e.target.value,
    });
  };

  return (
    <Box component="form" sx={{ mt: 3, width: '100%', maxWidth: '600px', mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
        מלא את הפרטים
      </Typography>
       <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          יש לוודא שהתנאים הבאים מתקיימים:
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={formData.checklist.check_1} onChange={handleCheckboxChange} name="check_1" />}
            label="המועמד הינו אזרח ישראלי או בעל מעמד של תושב קבע"
          />
          <FormControlLabel
            control={<Checkbox checked={formData.checklist.check_2} onChange={handleCheckboxChange} name="check_2" />}
            label="תחום המחקר של המועמד נמנה על אחד מהתחומים המפורטים בתקנון המלגה."
          />
          <FormControlLabel
            control={<Checkbox checked={formData.checklist.check_3} onChange={handleCheckboxChange} name="check_3" />}
            label="המועמד בעל זכאות לתואר ראשון ממוסד  אקדמי ישראלי המוכר על ידי המלג"
          />
          <FormControlLabel
            control={<Checkbox checked={formData.checklist.check_4} onChange={handleCheckboxChange} name="check_4" />}
            label="סיום התואר הראשון חל אחרי: 01-09-2021 עבור עתודאים, שרות צבאי חובה לא יכלל במניין שלוש השנים"
          />
          <FormControlLabel
            control={<Checkbox checked={formData.checklist.check_5} onChange={handleCheckboxChange} name="check_5" />}
            label="המועמד התקבל לאחד מהמסלולים הבאים ללימודי תואר שני מחקרי באונברסיטת בן גוריון בנגב"
          />
          {formData.checklist.check_5 && (
            <Box sx={{ ml: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">סמן את הנכון:</FormLabel>
                <RadioGroup
                  name="check_5_options"
                  value={formData.check_5_options}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel value="option1" control={<Radio />} label="למסלול הרגיל לתואר שני עם עבודת גמר, כתלמיד מן המניין" />
                  <FormControlLabel value="option2" control={<Radio />} label="המסלול המשולב לתואר שני (רק בסטטוס לקראת סיום חובות לתואר ראשון)" />
                  <FormControlLabel value="option3" control={<Radio />} label="מסלול ישיר לדוקטורט כתלמיד מן המניין" />
                </RadioGroup>
              </FormControl>
            </Box>
          )}
          <FormControlLabel
            control={<Checkbox checked={formData.checklist.check_6} onChange={handleCheckboxChange} name="check_6" />}
            label="מועד תחילת לימודי התואר השני חל בסמסטר ב תשפ''ד או בסמסטר א תשפ''ה"
          />
        </FormGroup>
    <Divider sx={{ width: '100%', borderStyle: 'double' }} />
    <Typography variant="h6" gutterBottom>
       פרטי המועמד
    </Typography>
      </Box>
      <TextField
        fullWidth
        label="שם פרטי (עברית)"
        name="student_first_name_heb"
        value={formData.student_first_name_heb}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="שם משפחה (עברית)"
        name="student_last_name_heb"
        value={formData.student_last_name_heb}
        onChange={handleChange}
        margin="normal"
      />
        <TextField
        fullWidth
        label="שם פרטי (אנגלית)"
        name="student_first_name_english"
        value={formData.student_first_name_english}
        onChange={handleChange}
        margin="normal"
      />
              <TextField
        fullWidth
        label="שם משפחה (אנגלית)"
        name="student_last_name_english"
        value={formData.student_last_name_english}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="שם מנחה"
        name="mentor_name"
        value={formData.mentor_name}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="שם מחלקה"
        name="department"
        value={formData.department}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="תעודת זהות"
        name="israeli_id"
        type="number"
        value={formData.israeli_id}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="מגדר"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="תאריך לידה"
        name="birth_date"
        type="date"
        value={formData.birth_date}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        fullWidth
        label="מייל המועמד"
        name="email"
        value={formData.email}
        type="email"
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="מספר טלפון"
        name="phone_number"
        type="number"
        value={formData.phone_number}
        onChange={handleChange}
        margin="normal"
      />
    <Divider sx={{ width: '100%', borderStyle: 'double' }} />
    <Typography variant="h6" gutterBottom>
        פרטי התואר השני המתוכנן
    </Typography>
    <TextField
        fullWidth
        label="פקולטה"
        name="faculty"
        value={formData.faculty}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="תחום מחקר"
        name="resarch_field"
        value={formData.resarch_field}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="נושא מחקר"
        name="resarch_subject"
        value={formData.resarch_subject}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="מועד קבלה למסלול לתואר שני מחקרי"
        name="second_dgree_accpet_date"
        type="date"
        value={formData.second_dgree_accpet_date}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
        <TextField
        fullWidth
        label="מועד סיום צפוי של התואר השני"
        name="second_dgree_finsih_date"
        type="date"
        value={formData.second_dgree_finsih_date}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        fullWidth
        label="מקורות מימון נוספים (במידה וישנם)"
        name="second_funding"
        value={formData.second_funding}
        onChange={handleChange}
        margin="normal"
      />    
    <Divider sx={{ width: '100%', borderStyle: 'double' }} />
      <Typography variant="h6" gutterBottom>
        פרטי התואר הראשון 
      </Typography>
    <TextField
        fullWidth
        label="שם המוסד בו סיים המועמד את לימודי התואר הראשון"
        name="first_dgree_institution"
        value={formData.first_dgree_institution}
        onChange={handleChange}
        margin="normal"
      />    
      
      {/* <TextField
        fullWidth
        label="Essay"
        name="essay"
        value={formData.essay}
        onChange={handleChange}
        multiline
        rows={4}
        margin="normal"
      /> */}
      {/* <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Submit
      </Button> */}
    </Box>
  );
};

export default StudentSubmitForm;
