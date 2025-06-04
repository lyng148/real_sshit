import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, Calendar, MapPin, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { animations } from '@/lib/animations';
import AvatarUpload from '@/components/user/AvatarUpload';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { currentUser, setCurrentUser } = useAuth();
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    fullName: currentUser?.user.fullName || '',
    email: currentUser?.user.email || '',
    phone: '',
    bio: '',
    location: '',
    dateOfBirth: ''
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Page entrance animation
    animations.page.slideInFromRight('.profile-content', 200);
    
    // Cards stagger animation
    setTimeout(() => {
      animations.list.staggeredAppear('.profile-card', 100);
    }, 300);
  }, []);

  useEffect(() => {
    if (currentUser?.user) {
      setFormData({
        fullName: currentUser.user.fullName || '',
        email: currentUser.user.email || '',
        phone: '', // Fetch from user profile if available
        bio: '',
        location: '',
        dateOfBirth: ''
      });
    }
  }, [currentUser]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    // Add a subtle animation to editing mode
    animations.card.hoverScale('.profile-card');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      toast({
        title: "Success",
        description: "Password changed successfully!",
      });

      // Reset form and close dialog
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.user.id) return;

    setLoading(true);
    try {
      // Update user data
      await userService.updateUser(Number(currentUser.user.id), {
        fullName: formData.fullName,
        email: formData.email,
        // Add other fields as supported by backend
      });

      // Update local storage and context
      const updatedUser = {
        ...currentUser,
        user: {
          ...currentUser.user,
          fullName: formData.fullName,
          email: formData.email
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      fullName: currentUser?.user.fullName || '',
      email: currentUser?.user.email || '',
      phone: '',
      bio: '',
      location: '',
      dateOfBirth: ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        user: {
          ...currentUser.user,
          avatarUrl: newAvatarUrl
        }
      };
      setCurrentUser(updatedUser);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (!currentUser?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="profile-content">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Personal Profile</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="transition-all duration-300 hover:scale-105"
                  disabled={loading}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleEditClick}
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105"
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar and Basic Info */}
          <Card className="profile-card opacity-0 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <User className="mr-2" size={20} />
                Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <AvatarUpload 
                user={currentUser.user}
                onAvatarUpdated={handleAvatarUpdated}
                getInitials={getInitials}
              />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {currentUser.user.fullName}
                </h3>
                <p className="text-gray-500">{currentUser.user.email}</p>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {currentUser.user.roles?.map((role, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="profile-card opacity-0 transition-all duration-300 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <User className="mr-2" size={20} />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-gray-600">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded">{formData.fullName || 'Not updated'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-600">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 bg-gray-50 rounded">
                    <Mail className="mr-2 text-gray-400" size={16} />
                    <span className="text-gray-800">{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-600">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 bg-gray-50 rounded">
                    <Phone className="mr-2 text-gray-400" size={16} />
                    <span className="text-gray-800">{formData.phone || 'Not updated'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-gray-600">Date of Birth</Label>
                {isEditing ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 bg-gray-50 rounded">
                    <Calendar className="mr-2 text-gray-400" size={16} />
                    <span className="text-gray-800">{formData.dateOfBirth || 'Not updated'}</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location" className="text-gray-600">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="mt-1"
                    placeholder="Enter location"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 bg-gray-50 rounded">
                    <MapPin className="mr-2 text-gray-400" size={16} />
                    <span className="text-gray-800">{formData.location || 'Not updated'}</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bio" className="text-gray-600">Biography</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="mt-1"
                    placeholder="Write a few lines about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded min-h-[80px]">
                    {formData.bio || 'No biography available'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Cards for Statistics/Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="profile-card opacity-0 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <User className="mr-2" size={20} />
                Activity Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Joined projects:</span>
                <span className="font-semibold text-gray-800">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasks completed:</span>
                <span className="font-semibold text-gray-800">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average rating:</span>
                <span className="font-semibold text-green-600">4.2/5</span>
              </div>
            </CardContent>
          </Card>

          <Card className="profile-card opacity-0 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <Lock className="mr-2" size={20} />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showChangePassword ? (
                <>
                  <p className="text-gray-600 text-sm">
                    Manage your account security and password settings.
                  </p>
                  <Button 
                    onClick={() => setShowChangePassword(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Lock className="mr-2" size={16} />
                    Change Password
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">Change Password</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword" className="text-gray-600">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                          className="mt-1 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-gray-600">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                          className="mt-1 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-600">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                          className="mt-1 pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="flex-1"
                      disabled={passwordLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    >
                      {passwordLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Changing...</span>
                        </div>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
