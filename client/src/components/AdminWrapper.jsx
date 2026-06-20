import React from 'react';
import { NotificationProvider } from '../context/NotificationContext';

function AdminWrapper({ children }) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}

export default AdminWrapper;
