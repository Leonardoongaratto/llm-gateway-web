import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/Router';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};
