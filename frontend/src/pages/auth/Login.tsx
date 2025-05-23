
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

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
          title: "Login successful",
          description: "Welcome back to MindTask!",
          variant: "default",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
      }    
    } catch (error: any) {
      toast({
        title: "Login error",
        description: "Check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] text-white flex flex-col relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/wallpaper.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 to-black/40"></div>
      </div>

      {/* Header with Logo */}
      <header className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-fade-in">MindTask</Link>
          <Link to="/signup" className="animate-fade-in">
            <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md relative animate-fade-in-up">
          {/* Animated gradient effect */}
          <div className="absolute -z-10 w-full h-full max-w-[30rem] max-h-[30rem] blur-3xl rounded-full bg-gradient-to-br from-blue-600 to-purple-800 opacity-20 animate-pulse"></div>
          
          <Card className="border border-gray-800 bg-gray-900/50 backdrop-blur-md rounded-xl shadow-xl">
            <CardHeader className="space-y-1">
              <div className="text-reveal-container">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent text-reveal-item animate text-reveal-delay-1 text-white">Welcome back</CardTitle>
              </div>
              <div className="text-reveal-container text-white">
                <CardDescription className="text-white text-center text-reveal-item animate text-reveal-delay-2">
                  Sign in to your MindTask account
                </CardDescription>
              </div>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2 animate-fade-in-up">
                  <Label htmlFor="username" className="text-gray-200">Username</Label>
                  <div className="relative">
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="your_username" 
                      className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 rounded-lg p-3 text-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 pr-10 rounded-lg p-3 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="rounded bg-gray-800/70 border-gray-700 text-blue-500 focus:ring-blue-500" 
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-300">Remember me</Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button 
                  className="w-full mb-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2 shadow-lg shadow-blue-700/30 transition-all duration-300 animate-fade-in-up" 
                  type="submit" 
                  disabled={loading}
                  style={{animationDelay: '0.3s'}}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <p className="text-center text-gray-400 text-sm animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
