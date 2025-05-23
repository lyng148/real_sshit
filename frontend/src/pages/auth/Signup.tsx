
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (!termsAccepted) {
      toast({
        title: "Terms and Conditions",
        description: "You must accept the Terms of Service and Privacy Policy to create an account.",
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
          title: "Registration successful",
          description: "Your account has been created. Please login.",
          variant: "default",
        });
        navigate('/login');
      } else {
        toast({
          title: "Registration failed",
          description: response.message || "Could not create account",
          variant: "destructive",
        });
      }    
    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message || error.response?.data?.message || "An error occurred during registration",
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
          <Link to="/login" className="animate-fade-in">
            <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md relative animate-fade-in-up">
          {/* Animated gradient background effect */}
          <div className="absolute -z-10 w-full h-full max-w-[30rem] max-h-[30rem] blur-3xl rounded-full bg-gradient-to-br from-blue-600 to-purple-800 opacity-20 animate-pulse"></div>
          
          <Card className="border border-gray-800 bg-gray-900/50 backdrop-blur-md rounded-xl shadow-xl">
            <CardHeader className="space-y-1">
              <div className="text-reveal-container">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent text-reveal-item animate text-reveal-delay-1 text-white">Create an account</CardTitle>
              </div>
              <div className="text-reveal-container text-white">
                <CardDescription className="text-gray-300 text-center text-reveal-item animate text-reveal-delay-2">
                  Get started with MindTask
                </CardDescription>
              </div>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2 animate-fade-in-up">
                  <Label htmlFor="username" className="text-gray-200">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="johndoe" 
                    className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 rounded-lg text-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-gray-200">First name</Label>
                    <Input 
                      id="first-name" 
                      placeholder="John" 
                      className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 rounded-lg text-white"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-gray-200">Last name</Label>
                    <Input 
                      id="last-name" 
                      placeholder="Doe" 
                      className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 rounded-lg text-white"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 rounded-lg text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 pr-10 rounded-lg text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
                </div>
                <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/50 rounded-lg text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                  <input 
                    type="checkbox" 
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded bg-gray-800/70 border-gray-700 text-blue-500 focus:ring-blue-500" 
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-300">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button 
                  className="w-full mb-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2 shadow-lg shadow-blue-700/30 transition-all duration-300 animate-fade-in-up" 
                  type="submit" 
                  disabled={loading}
                  style={{animationDelay: '0.6s'}}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <p className="text-center text-gray-400 text-sm animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign in
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

export default Signup;
