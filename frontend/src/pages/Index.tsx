
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

const Index = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <MainContent title="Main Content Area" />
    </div>
  );
};

export default Index;
