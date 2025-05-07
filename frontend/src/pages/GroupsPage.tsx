
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
}

const GroupsPage = () => {
  const { projectId } = useParams();
  
  const groups: Group[] = [
    { id: 1, name: 'Frontend Team', description: 'Responsible for UI/UX implementation', members: 5 },
    { id: 2, name: 'Backend Team', description: 'API and database development', members: 3 },
    { id: 3, name: 'QA Team', description: 'Testing and quality assurance', members: 4 },
    { id: 4, name: 'Design Team', description: 'UI/UX design and prototypes', members: 2 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Project Groups</h1>
            <p className="text-gray-600">Project ID: {projectId}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              <Plus size={16} />
              Create Group
            </button>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              <Users size={16} />
              Auto Join
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-lg mb-2">{group.name}</h3>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{group.members} members</span>
                <button className="text-blue-600 hover:text-blue-800">Join Group</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
