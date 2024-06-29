import React from 'react';
import { Box, Checkbox, TextField, Typography, FormControlLabel, Divider } from '@mui/material';
import { wizard_data } from 'src/auth/types';

interface StudentSubmitFormProps {
  formData: wizard_data;
  onFormChange: (newFormData: wizard_data) => void;
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
      [name]: checked,
    });
  };

  return (
    <Box component="form" sx={{ mt: 3, width: '100%', maxWidth: '600px', mx: 'auto' }}>
      <Typography variant="h3" gutterBottom>
        מלא את הפרטים
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ width: '100%', borderStyle: 'double' }} />
        <Typography variant="h6" gutterBottom>
          פרטי המועמד
        </Typography>
      </Box>
      <TextField
        fullWidth
        label="שם פרטי (עברית)"
        name="hebFirstName"
        value={formData.hebFirstName}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="שם משפחה (עברית)"
        name="hebLastName"
        value={formData.hebLastName}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="שם פרטי (אנגלית) "
        name="engFirstName"
        value={formData.engFirstName}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="שם משפחה (אנגלית) "
        name="engLastName"
        value={formData.engLastName}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="תעודת זהות "
        name="studentID"
        type="number"
        value={formData.studentID}
        onChange={handleChange}
        margin="normal"
        required
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
        label="תאריך לידה "
        name="birth_date"
        type="date"
        value={formData.yearOfBirth}
        onChange={handleChange}
        margin="normal"
        required
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        fullWidth
        label="מייל המועמד "
        name="email"
        value={formData.email}
        type="email"
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="מספר טלפון "
        name="phoneNumber"
        type="number"
        value={formData.phoneNumber}
        onChange={handleChange}
        margin="normal"
        required
      />
      <Divider sx={{ width: '100%', borderStyle: 'double' }} />
      <Typography variant="h6" gutterBottom>
        פרטי התואר השני המתוכנן
      </Typography>
      <TextField
        fullWidth
        label="פקולטה (תואר שני) "
        name="faculty"
        value={formData.faculty}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="שם מחלקה (תואר שני) "
        name="department"
        value={formData.department}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="שם מנחה"
        name="supervisor"
        value={formData.supervisor}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="תחום מחקר"
        name="fieldOfResearch"
        value={formData.fieldOfResearch}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="נושא מחקר"
        name="topicOfResearch"
        value={formData.topicOfResearch}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="מועד קבלה למסלול לתואר שני מחקרי"
        name="dateOfStartDgree"
        type="date"
        value={formData.dateOfStartDgree}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        fullWidth
        label="מועד סיום צפוי של התואר השני"
        name="dateOfFinishDgree"
        type="date"
        value={formData.dateOfFinishDgree}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        fullWidth
        label="מקורות מימון נוספים (במידה וישנם)"
        name="fundsResources"
        value={formData.fundsResources}
        onChange={handleChange}
        margin="normal"
        required
      />
      <Divider sx={{ width: '100%', borderStyle: 'double' }} />
      <Typography variant="h6" gutterBottom>
        פרטי התואר הראשון 
      </Typography>
      <TextField
        fullWidth
        label="שם המוסד בו סיים המועמד את לימודי התואר הראשון "
        name="instituteOfBechlor"
        value={formData.instituteOfBechlor}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="פקולטה (תואר ראשון) "
        name="facultyOfBechlor"
        value={formData.facultyOfBechlor}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="שם מחלקה (תואר ראשון)"
        name="departmentOfBechlor"
        value={formData.departmentOfBechlor}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="ממוצע ציונים"
        name="gradesAvarageOfBechlor"
        value={formData.gradesAvarageOfBechlor}
        onChange={handleChange}
        margin="normal"
        required
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.isFinalGrade}
            onChange={handleCheckboxChange}
            name="isFinalGrade"
          />
        }
        label="סמן אם הציון הוא סופי"
      />
      <TextField
        fullWidth
        label="מדרג בתואר הראשון"
        name="rankingOfBechlor"
        value={formData.rankingOfBechlor}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="מועד זכאות לתואר"
        name="dateOfFinishBechlor"
        type="date"
        value={formData.dateOfFinishBechlor}
        onChange={handleChange}
        margin="normal"
        required
      />
      <Divider sx={{ width: '100%', borderStyle: 'double' }} />
      <Typography variant="h6" gutterBottom>
        פרטים נוספים
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" gutterBottom>
          האם הוגשה מועמדות לתוכנית נוספת של הות&apos;&apos;ת לתשפ&apos;&apos;ה? אם כן פרטו מהי, ומהי המלגה המועדפת, אחרת השאר ריק
        </Typography>
        <TextField
          fullWidth
          name="secondScholarship"
          label="מלגה מועדפת"
          value={formData.secondScholarship}
          onChange={handleChange}
          margin="normal"
        />
      </Box>
      <TextField
        fullWidth
        label="הערות"
        name="studentNotes"
        value={formData.studentNotes}
        onChange={handleChange}
        multiline
        rows={4}
        margin="normal"
      />
    </Box>
  );
};

export default StudentSubmitForm;
