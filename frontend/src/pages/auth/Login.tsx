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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header with Logo */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">MindTask</Link>
          <Link to="/signup">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md relative">
          {/* Blue gradient background effect */}
          <div className="absolute -z-10 w-full h-full max-w-[30rem] max-h-[30rem] blur-3xl rounded-full bg-gradient-to-br from-blue-600 to-blue-400 opacity-30"></div>
          
          <Card className="border border-gray-800 bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center font-semibold">Welcome back</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Sign in to your MindTask account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="your_username" 
                    className="bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 rounded-lg p-3 text-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 pr-10 rounded-lg p-3 text-white"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500" 
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-300">Remember me</Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full mb-4 bg-blue-500 hover:bg-blue-400" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <p className="text-center text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-400 hover:text-blue-300">
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
