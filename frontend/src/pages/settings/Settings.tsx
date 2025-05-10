
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

const Settings = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <MainContent title="Settings" />
    </div>
  );
};

export default Settings;
