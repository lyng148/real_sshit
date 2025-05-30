import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, Calendar, MapPin, Edit2, Save, X } from 'lucide-react';
import { animations } from '@/lib/animations';
import AvatarUpload from '@/components/user/AvatarUpload';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/services/userService';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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
    animations.card.pulse('.profile-card');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        title: "Thành công",
        description: "Cập nhật thông tin thành công!",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
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
        <p className="text-gray-500">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  return (
    <div className="profile-content">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
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
                  Hủy
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleEditClick}
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105"
              >
                <Edit2 size={16} className="mr-2" />
                Chỉnh sửa
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
                Ảnh đại diện
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
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-gray-600">Họ và tên</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded">{formData.fullName || 'Chưa cập nhật'}</p>
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
                <Label htmlFor="phone" className="text-gray-600">Số điện thoại</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 bg-gray-50 rounded">
                    <Phone className="mr-2 text-gray-400" size={16} />
                    <span className="text-gray-800">{formData.phone || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-gray-600">Ngày sinh</Label>
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
                    <span className="text-gray-800">{formData.dateOfBirth || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location" className="text-gray-600">Địa chỉ</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="mt-1"
                    placeholder="Nhập địa chỉ"
                  />
                ) : (
                  <div className="flex items-center mt-1 p-2 bg-gray-50 rounded">
                    <MapPin className="mr-2 text-gray-400" size={16} />
                    <span className="text-gray-800">{formData.location || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bio" className="text-gray-600">Giới thiệu bản thân</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="mt-1"
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded min-h-[80px]">
                    {formData.bio || 'Chưa có thông tin giới thiệu'}
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
                Thống kê hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Dự án tham gia:</span>
                <span className="font-semibold text-gray-800">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nhiệm vụ hoàn thành:</span>
                <span className="font-semibold text-gray-800">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm đánh giá trung bình:</span>
                <span className="font-semibold text-green-600">4.2/5</span>
              </div>
            </CardContent>
          </Card>

          <Card className="profile-card opacity-0 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <User className="mr-2" size={20} />
                Cài đặt tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600 text-sm">
                Để thay đổi mật khẩu hoặc cài đặt bảo mật, vui lòng liên hệ quản trị viên.
              </p>
              <Button variant="outline" className="w-full">
                Liên hệ hỗ trợ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
