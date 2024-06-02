import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const StudentSubmitForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    essay: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        מלא את הפרטים
      </Typography>
      <TextField
        fullWidth
        label=" שם מנחה"
        name="name"
        value={formData.name}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="תחום מחקר"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Essay"
        name="essay"
        value={formData.essay}
        onChange={handleChange}
        multiline
        rows={4}
        margin="normal"
      />
    </Box>
  );
};

export default StudentSubmitForm;
