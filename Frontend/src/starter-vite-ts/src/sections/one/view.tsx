import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Container from '@mui/material/Container';



export default function OneView() {
  const scholarships = [
    { id: 1, name: "מלגת משרד המדע", amount: "₪5000", deadline: "Dec 31, 2024" },
    { id: 2, name: "מלגת פריפריה", amount: "₪3000", deadline: "Jan 15, 2025" },
    { id: 3, name: "מלגת המשהו", amount: "₪4000", deadline: "Nov 10, 2024" },
  ];

  return (
    <Container maxWidth='xl'>
      <Typography variant="h4">רשימת מלגות</Typography>

      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          overflowY: 'auto'  // Allows scrolling if content exceeds the box height
        }}
      >
        <List>
          {scholarships.map((scholarship) => (
            <ListItem key={scholarship.id} divider>
              <ListItemText 
                primary={scholarship.name} 
                secondary={`Amount: ${scholarship.amount}, Deadline: ${scholarship.deadline}`} 
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}
