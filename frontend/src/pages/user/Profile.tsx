
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, User, Mail, MoreHorizontal, Key, Shield } from 'lucide-react';
import { Group } from '@/services/groupService';
import { useToast } from '@/components/ui/use-toast';
import AvatarUpload from '@/components/user/AvatarUpload';

const Profile = () => {
  const { currentUser, login } = useAuth();
  const { toast } = useToast();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(currentUser?.user.avatarUrl);

  useEffect(() => {
    const fetchMyGroups = async () => {
      setIsLoading(true);
      try {
        // Here you would fetch the user's groups
        // For now, we'll just simulate some data
        setMyGroups([]);
        setIsLoading(false);      } catch (error: any) {
        console.error('Error fetching groups:', error);
        toast({
          title: "Error",
          description: error.message || error.response?.data?.message || "Failed to load your groups",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchMyGroups();
  }, [toast]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}            <Card className="md:col-span-1">
              <CardContent className="pt-6 flex flex-col items-center">
                {currentUser && (
                  <AvatarUpload 
                    user={currentUser.user} 
                    onAvatarUpdated={(url) => setUserAvatar(url)} 
                    getInitials={getInitials}
                  />
                )}
                <h2 className="text-xl font-bold mt-4">{currentUser?.user.fullName}</h2>
                <p className="text-gray-500 mb-4">{currentUser?.user.username}</p>
                
                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{currentUser?.user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <User className="mr-2 h-4 w-4" />
                    <span>Username: {currentUser?.user.username}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Roles: {currentUser?.user.roles?.join(', ')}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="mt-6 w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="mt-2 w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
            
            {/* Activity & Stats */}
            <div className="md:col-span-2">
              <Tabs defaultValue="activity">
                <TabsList className="mb-4">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="groups">My Groups</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="bg-blue-100 rounded-full p-2 mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Joined a new group</p>
                            <p className="text-sm text-gray-500">2 days ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-100 rounded-full p-2 mr-3">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Completed a task</p>
                            <p className="text-sm text-gray-500">5 days ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="groups" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myGroups.length > 0 ? (
                        <div className="space-y-4">
                          {myGroups.map((group) => (
                            <div key={group.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                              <div>
                                <p className="font-medium">{group.name}</p>
                                <p className="text-sm text-gray-500">{group.projectName}</p>
                              </div>
                              <Button variant="outline" size="sm">View</Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          {isLoading ? "Loading your groups..." : "You haven't joined any groups yet."}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="stats" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Completed Tasks</p>
                          <p className="text-2xl font-bold">24</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Average Contribution</p>
                          <p className="text-2xl font-bold">87%</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Projects Completed</p>
                          <p className="text-2xl font-bold">3</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Pressure Score</p>
                          <p className="text-2xl font-bold">Low</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
