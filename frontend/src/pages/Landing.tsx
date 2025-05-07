
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">MindTask</div>
          <nav className="hidden md:flex space-x-8">
            <Link to="#features" className="hover:text-gray-300 transition-colors">Features</Link>
            <Link to="#resources" className="hover:text-gray-300 transition-colors">Resources</Link>
            <Link to="#help" className="hover:text-gray-300 transition-colors">Help</Link>
            <Link to="/teams" className="hover:text-gray-300 transition-colors">Teams</Link>
            <Link to="#pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
            <Link to="/signup">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Just publish it<br />with MindTask
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-gray-300">
          The task manager loved by designers.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/signup">
            <Button className="text-base px-8 py-6">Start for free</Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-base px-8 py-6 border-white text-white hover:bg-white hover:text-black"
          >
            <Video className="mr-2" size={20} />
            Watch video
          </Button>
        </div>
      </section>

      {/* Editor Preview */}
      <section className="container mx-auto px-6 pb-24 relative">
        <div className="relative mx-auto max-w-5xl">
          {/* Blue gradient background effect */}
          <div className="absolute -z-10 w-full h-full max-w-[80rem] max-h-[80rem] blur-3xl rounded-full bg-gradient-to-br from-blue-600 to-purple-800 opacity-30 -translate-x-1/2 -translate-y-1/4"></div>
          
          {/* Editor Interface */}
          <div className="rounded-lg overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl">
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-lg font-medium">MindTask Editor</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300">
                  Invite
                </Button>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  Publish
                </Button>
              </div>
            </div>
            
            {/* Youtube Placeholder */}
            <div className="aspect-video w-full bg-gray-800 flex items-center justify-center">
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
