import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { animations, createAnimationTimeline, DURATION, EASING } from '@/lib/animations';
import { animate } from 'animejs';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(username, password);
      if (response.success) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn trở lại ITss!",
          variant: "default",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: response.message || "Thông tin đăng nhập không chính xác",
          variant: "destructive",
        });
      }    
    } catch (error: any) {
      toast({
        title: "Lỗi đăng nhập",
        description: "Vui lòng kiểm tra thông tin và thử lại.",
        variant: "destructive",
      });
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
          <Link to="/signup">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-300 hover:scale-105">
              Đăng ký
            </Button>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md relative">
          {/* Animated gradient background effect */}
          <div className="absolute -z-10 w-full h-full blur-3xl rounded-full bg-gradient-to-br from-purple-600 to-pink-800 opacity-20 animate-pulse"></div>
          
          <div ref={formRef} className="opacity-0">
            <Card className="border border-white/20 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl">
              <CardHeader className="space-y-4 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle ref={titleRef} className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent opacity-0">
                  Chào mừng trở lại
                </CardTitle>
                <CardDescription ref={subtitleRef} className="text-gray-300 text-lg opacity-0">
                  Đăng nhập vào hệ thống ITss
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-200 font-medium">Tên đăng nhập</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Nhập tên đăng nhập" 
                      className="bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-200 font-medium">Mật khẩu</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Nhập mật khẩu" 
                        className="bg-white/10 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 pr-12 rounded-lg p-3 text-white placeholder-gray-400 backdrop-blur-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="remember" 
                        aria-label="Ghi nhớ đăng nhập"
                        className="rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-2" 
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-300">Ghi nhớ đăng nhập</Label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200">
                      Quên mật khẩu?
                    </Link>
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
                        <span>Đang đăng nhập...</span>
                      </div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                  
                  <p className="text-center text-gray-400">
                    Chưa có tài khoản?{' '}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
                      Đăng ký ngay
                    </Link>
                  </p>
                  
                  <div className="text-center">
                    <Link 
                      to="/" 
                      className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <ArrowLeft size={16} />
                      <span>Quay lại trang chủ</span>
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

export default Login;
