import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy as CopyIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import projectService from '@/services/projectService';

interface ProjectAccessCodeProps {
  projectId: number;
  projectName: string;
}

export const ProjectAccessCode: React.FC<ProjectAccessCodeProps> = ({ projectId, projectName }) => {
  const [accessCode, setAccessCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccessCode();
    fetchQRCode();
  }, [projectId]);

  // Cleanup object URL when component unmounts or projectId changes
  useEffect(() => {
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [qrCodeUrl]);

  const fetchAccessCode = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectAccessCode(projectId);
      if (response.success) {
        setAccessCode(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch access code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    try {
      setQrCodeLoading(true);
      const qrCodeBlobUrl = await projectService.getProjectQRCodeBlob(projectId);
      setQrCodeUrl(qrCodeBlobUrl);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast({
        title: "Error",
        description: "Could not load QR code",
        variant: "destructive"
      });
    } finally {
      setQrCodeLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(accessCode);
    toast({
      title: "Copied!",
      description: "Access code copied to clipboard",
    });
  };

  const downloadQRCode = async () => {
    try {
      const qrCodeBlobUrl = await projectService.getProjectQRCodeBlob(projectId);
      const link = document.createElement('a');
      link.href = qrCodeBlobUrl;
      link.download = `project-${projectId}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(qrCodeBlobUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not download QR code",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Project Access</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Access</DialogTitle>
          <DialogDescription>
            Share this code or QR code with students to allow them access to "{projectName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label htmlFor="accessCode" className="text-sm font-medium leading-none">
                Access Code
              </label>
              <div className="flex">
                <Input 
                  id="accessCode" 
                  value={accessCode}
                  readOnly
                  className="flex-1"
                  disabled={loading} 
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyToClipboard}
                  disabled={loading}
                  className="ml-2"
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
            <Card className="p-4 flex justify-center">
            {qrCodeLoading ? (
              <div className="w-[250px] h-[250px] flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8" />
              </div>
            ) : qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="Project access QR code"
                className="w-[250px] h-[250px] object-contain"
              />
            ) : (
              <div className="w-[250px] h-[250px] flex items-center justify-center text-gray-500">
                QR code not available
              </div>
            )}
          </Card>
          
          <p className="text-sm text-muted-foreground">
            Students can join your project by scanning this QR code or entering the access code.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={downloadQRCode}>
            Download QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectAccessCode;
