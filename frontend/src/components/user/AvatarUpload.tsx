import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import imageService from '@/services/imageService';
import userService from '@/services/userService';
import { User } from '@/types/user';
import { authService } from '@/services/authService';

interface AvatarUploadProps {
  user: User;
  onAvatarUpdated: (avatarUrl: string) => void;
  getInitials: (name: string) => string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onAvatarUpdated, getInitials }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should not exceed 2MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload to ImgBB
      const uploadResult = await imageService.uploadImage(file);
      const newAvatarUrl = uploadResult.url;
      
      // Update user in backend
      await userService.updateAvatar(Number(user.id), newAvatarUrl);
      
      // Update local storage for auth context
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        currentUser.user.avatarUrl = newAvatarUrl;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      onAvatarUpdated(newAvatarUrl);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="relative">
      <Avatar className="h-24 w-24 cursor-pointer group" onClick={triggerFileInput}>
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
        ) : null}
        <AvatarFallback className="text-lg">
          {user.fullName ? getInitials(user.fullName) : 'U'}
        </AvatarFallback>
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-8 w-8 text-white" />
        </div>
      </Avatar>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs text-center mt-2 text-gray-500">
        Click to change avatar
      </p>
    </div>
  );
};

export default AvatarUpload;
