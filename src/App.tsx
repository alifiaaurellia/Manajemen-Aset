import { useRoutes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { routes } from './routes';
import { createTheme } from './theme';
import 'simplebar-react/dist/simplebar.min.css';
import './App.css'
import { createContext } from 'react';
import { FBService } from './services/FBService';


interface DBProviderModel {
  db: FBService
}

export const DBProvider = createContext<DBProviderModel>({
  db: new FBService()
})

const App = () => {
  const element = useRoutes(routes);
  const theme = createTheme({
    colorPreset: 'green',
    contrast: 'high'
  });

  return (
    <DBProvider.Provider value={{db: new FBService()}}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {element}
      </ThemeProvider>
    </DBProvider.Provider>
  );
};

export default App