
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import  MainContent  from '@/components/MainContent';

const Teams = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <MainContent title="Teams" />
    </div>
  );
};

export default Teams;
