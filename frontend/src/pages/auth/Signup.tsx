import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Shield, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { animations, createAnimationTimeline, DURATION, EASING } from '@/lib/animations';
import { animate } from 'animejs';
import { displayEnhancedError } from '@/utils/errorHandling';
import { ValidationErrorDisplay, ValidationErrorInline } from '@/components/ui/ValidationErrorDisplay';
import { useFormErrors } from '@/hooks/useFormErrors';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();

  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const { validationErrors, clearErrors, handleError, getFieldErrorClass } = useFormErrors({ toast });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Enhanced entrance animation
    const tl = createAnimationTimeline({
      easing: EASING.smooth,
      duration: DURATION.page,
    });

    tl
      .add(titleRef.current!, { 
        translateY: [50, 0], 
        opacity: [0, 1], 
        duration: 800, 
        delay: 200,
        scale: [0.9, 1]
      })
      .add(subtitleRef.current!, { 
        translateY: [30, 0], 
        opacity: [0, 1], 
        duration: 600 
      }, '-=400')
      .add(formRef.current!, { 
        translateY: [40, 0], 
        opacity: [0, 1], 
        duration: 800,
        scale: [0.95, 1]
      }, '-=500');

    // Background orbs animation
    animate('.bg-orb', {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      rotate: [0, 180, 360],
      duration: 8000,
      loop: true,
      easing: EASING.gentle,
    });

    // Floating elements
    animate('.floating-element', {
      translateY: [-15, 15],
      rotate: [-3, 3],
      duration: 4000,
      loop: true,
      direction: 'alternate',
      easing: EASING.gentle,
    });

  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    clearErrors();
    
    if (password !== confirmPassword) {
      toast({
        title: "Lỗi mật khẩu",
        description: "Mật khẩu xác nhận không khớp. Vui lòng thử lại.",
        variant: "destructive",
      });
      return;
    }
    
    if (!termsAccepted) {
      toast({
        title: "Điều khoản dịch vụ",
        description: "Bạn phải đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật để tạo tài khoản.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const response = await signup(username, email, fullName, password);
      if (response.success) {
        toast({
          title: "Đăng ký thành công",
          description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
          variant: "default",
        });
        navigate('/login');
      } else {
        toast({
          title: "Đăng ký thất bại",
          description: response.message || "Tạo tài khoản thất bại",
          variant: "destructive",
        });
      }    
    } catch (error: any) {
      handleError(error, 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Enhanced Background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-orb absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="bg-orb absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="bg-orb absolute -bottom-20 left-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-element absolute top-32 left-10 w-4 h-4 bg-gradient-to-r from-white to-purple-200 rounded-full opacity-30" />
        <div className="floating-element absolute top-48 right-32 w-6 h-6 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-40" />
        <div className="floating-element absolute bottom-40 left-20 w-3 h-3 bg-gradient-to-r from-pink-300 to-blue-300 rounded-full opacity-35" />
        <div className="floating-element absolute bottom-60 right-10 w-5 h-5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-30" />
      </div>

      {/* Header with Logo */}
      <header className="relative z-10 p-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-80"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              ITss
            </span>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-300 hover:scale-105">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg relative">
          {/* Animated gradient background effect */}
          <div className="absolute -z-10 w-full h-full blur-3xl rounded-full bg-gradient-to-br from-purple-600 to-pink-800 opacity-20 animate-pulse"></div>
          
          <div ref={formRef} className="opacity-0">
            <Card className="border border-white/20 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl">
              <CardHeader className="space-y-4 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle ref={titleRef} className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent opacity-0">
                  Create Account
                </CardTitle>
                <CardDescription ref={subtitleRef} className="text-gray-300 text-lg opacity-0">
                  Start with ITss system
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-6">
                  {/* Display validation errors */}
                  <ValidationErrorDisplay validationErrors={validationErrors} />
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-200 font-medium">Username <span className="text-red-500">*</span></Label>
                    <Input 
                      id="username" 
                      placeholder="Enter username" 
                      className={getFieldErrorClass('username', 'bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm', 'border-red-400 bg-red-50/10')}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <ValidationErrorInline fieldName="username" validationErrors={validationErrors} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name" className="text-gray-200 font-medium">First Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="first-name" 
                        placeholder="Enter first name" 
                        className={getFieldErrorClass('firstName', 'bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm', 'border-red-400 bg-red-50/10')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <ValidationErrorInline fieldName="firstName" validationErrors={validationErrors} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name" className="text-gray-200 font-medium">Last Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="last-name" 
                        placeholder="Enter last name" 
                        className={getFieldErrorClass('lastName', 'bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm', 'border-red-400 bg-red-50/10')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                      <ValidationErrorInline fieldName="lastName" validationErrors={validationErrors} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200 font-medium">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter email address" 
                      className={getFieldErrorClass('email', 'bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm', 'border-red-400 bg-red-50/10')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <ValidationErrorInline fieldName="email" validationErrors={validationErrors} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-200 font-medium">Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password" 
                        className={getFieldErrorClass('password', 'bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 pr-12 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm', 'border-red-400 bg-red-50/10')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <ValidationErrorInline fieldName="password" validationErrors={validationErrors} />
                    <p className="text-xs text-gray-400">Minimum 8 characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Confirm password" 
                      className={getFieldErrorClass('confirmPassword', 'bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm', 'border-red-400 bg-red-50/10')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <ValidationErrorInline fieldName="confirmPassword" validationErrors={validationErrors} />
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      aria-label="I agree to the Terms of Service and Privacy Policy"
                      className="mt-1 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-2" 
                      required
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                      I agree to the{' '}
                      <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  <p className="text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
                      Sign In
                    </Link>
                  </p>
                  
                  <div className="text-center">
                    <Link 
                      to="/" 
                      className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <ArrowLeft size={16} />
                      <span>Back to home</span>
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
