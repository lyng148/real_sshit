
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import MainContent  from '@/components/MainContent';

const Roadmaps = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <MainContent title="Roadmaps" />
    </div>
  );
};

export default Roadmaps;
