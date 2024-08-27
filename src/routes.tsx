import { Outlet } from 'react-router-dom';
import NotFoundPage from './pages/404';
import ReportsPage from './pages';
import Layout from './layouts/dashboard/layout';
import Enrolled from './pages/enrolled';
import LogInPage from './pages/login';
import AuthStateHook from './hook/authStateHook';
import TransactionPage from './pages/transaction';
import HistoryPage from './pages/history';

export const routes = [
  {
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
        element: <AuthStateHook><ReportsPage /></AuthStateHook>
      },
      {
        path: 'master',
        element: <AuthStateHook><Enrolled /></AuthStateHook>
      },
      {
        path: 'transaction',
        element: <AuthStateHook><TransactionPage /></AuthStateHook>
      },
      {
        path: 'history',
        element: <AuthStateHook><HistoryPage /></AuthStateHook>
      }
    ]
  },
  {
    path: 'login',
    element: <LogInPage />
  },
  {
    path: '404',
    element: <NotFoundPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];
