
import React from 'react';

interface MainContentProps {
  title: string;
}

const MainContent: React.FC<MainContentProps> = ({ title }) => {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-center mt-12">{title}</h1>
    </div>
  );
};

export default MainContent;
