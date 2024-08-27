import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import Logo from '../../components/logo';

const TOP_NAV_HEIGHT = 64;

export const TopNav = () => {
  const navigate = useNavigate()
  return (<Box
    component="header"
    sx={{
      backgroundColor: 'neutral.900',
      color: 'common.white',
      position: 'fixed',
      width: '100%',
      zIndex: (theme) => theme.zIndex.appBar
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        minHeight: TOP_NAV_HEIGHT,
        px: 3
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={3}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'inline-flex',
            height: 24,
            width: 24
          }}
        >
          <Logo />
        </Box>
      </Stack>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
      >
        <Typography>{localStorage.getItem('username')}</Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            color="primary"
            size="small"
            type="submit"
            variant="outlined"
            onClick={() => {
              localStorage.clear()
              navigate('login')
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Stack>
    </Stack>
  </Box>
  )
}


export default TopNav