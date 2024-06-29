import React from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import DeleteIcon from '@mui/icons-material/Delete';

interface StudentUploadFormProps {
  files: File[];
  onFileChange: (newFiles: File[]) => void;
}

const StudentUploadForm: React.FC<StudentUploadFormProps> = ({ files, onFileChange }) => {

  const onDrop = (acceptedFiles: File[]) => {
    const updatedFiles = [...files, ...acceptedFiles];
    onFileChange(updatedFiles);
  };

  const handleDeleteFile = (fileToDelete: File) => {
    const updatedFiles = files.filter(file => file !== fileToDelete);
    onFileChange(updatedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Box component="form" sx={{ mt: 3, width: '100%', maxWidth: '600px', mx: 'auto' }}>
      <Typography variant="h3" gutterBottom>
        מלא את הפרטים
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ width: '100%', borderStyle: 'double' }} />
        <Typography variant="h6" gutterBottom>
          נא להעלות את הקבצים הרלוונטים כפי שפורט בפרטי המלגה (צעד 1)
        </Typography>
      </Box>
      <Box
        {...getRootProps()}
        sx={{
          mt: 2,
          p: 2,
          border: '2px dashed gray',
          borderRadius: '4px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body1">גרור ושחרר את הקבצים כאן, או לחץ להעלאה</Typography>
      </Box>
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem key={index}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={file.name} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default StudentUploadForm;
