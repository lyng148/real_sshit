
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

const Index = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <MainContent title="Dashboard" />
    </div>
  );
};

export default Index;
