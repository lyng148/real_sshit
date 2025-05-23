
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#050A14] text-white relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/wallpaper.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 to-black/40"></div>
      </div>

      {/* Navigation */}
      <header className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-fade-in">MindTask</div>
          <nav className="hidden md:flex space-x-8">
            <Link to="#features" className="hover:text-blue-400 transition-colors animate-fade-in-down">Features</Link>
            <Link to="#resources" className="hover:text-blue-400 transition-colors animate-fade-in-down">Resources</Link>
            <Link to="#help" className="hover:text-blue-400 transition-colors animate-fade-in-down">Help</Link>
            <Link to="/teams" className="hover:text-blue-400 transition-colors animate-fade-in-down">Teams</Link>
            <Link to="#pricing" className="hover:text-blue-400 transition-colors animate-fade-in-down">Pricing</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-blue-400 transition-colors animate-fade-in">Login</Link>
            <Link to="/signup" className="animate-fade-in">
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center relative z-10">
        <div className="space-y-4 mb-4">
          <div className="text-reveal-container">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent text-reveal-item animate text-reveal-delay-1">
              Just manage it
            </h1>
          </div>
          <div className="text-reveal-container">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent text-reveal-item animate text-reveal-delay-2">
              with TasuMana
            </h1>
          </div>
        </div>
        <div className="text-reveal-container">
          <p className="text-xl md:text-2xl mb-12 text-gray-300 text-reveal-item animate text-reveal-delay-3">
            The best tool to manage your tasks and projects
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up">
          <Button className="text-base px-8 py-6 bg-blue-600 hover:bg-blue-700 hover:text-white">
            Start for free
          </Button>
          <Button 
            variant="outline" 
            className="text-base px-8 py-6 border-white/60 text-white hover:bg-white/10"
          >
            Sign in
          </Button>
        </div>
      </section>

      {/* Announcement Tag */}
      <div className="flex justify-center relative z-10 mb-12">
        <div className="bg-blue-900/50 backdrop-blur-sm text-sm py-2 px-6 rounded-full border border-blue-700/50 animate-fade-in-up">
          May 2, 2025: TasuMana
        </div>
      </div>

      {/* Video Preview */}
      <section className="container mx-auto px-6 pb-24 relative z-10 animate-fade-in-up">
        <div className="relative mx-auto max-w-5xl">
          {/* Blue gradient background effect */}
          <div className="absolute -z-10 w-full h-full max-w-[80rem] max-h-[80rem] blur-3xl rounded-full bg-gradient-to-br from-blue-600 to-purple-800 opacity-30 -translate-x-1/2 -translate-y-1/4"></div>
          
          {/* Video Container */}
          <div className="rounded-lg overflow-hidden border border-gray-800 bg-gray-900/50 shadow-2xl">
            <div className="aspect-video w-full bg-gray-800">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
