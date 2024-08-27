import { Box, Container, Typography } from '@mui/material';


const Footer = () => (
  <div>
    <Container
      maxWidth="xl"
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          sm: 'row'
        },
        py: 3,
        '& a': {
          mt: {
            xs: 1,
            sm: 0
          },
          '&:not(:last-child)': {
            mr: {
              xs: 0,
              sm: 5
            }
          }
        }
      }}
    >
      <Typography
        color="text.secondary"
        variant="caption"
      >
        © 2024 Fia - Management Aset
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
    
    </Container>
  </div>
);

export default Footer