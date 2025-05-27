
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, Users, Shield, CheckCircle, Code, BarChart } from 'lucide-react';

const Landing = () => {
  const scrollToVideo = () => {
    const videoSection = document.getElementById('video-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };  
  useEffect(() => {
    // Intersection Observer for smooth animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-up');
        }
      });
    }, observerOptions);

    // Observe all animate-in elements
    const animatedElements = document.querySelectorAll('.animate-in');
    animatedElements.forEach((element) => {
      observer.observe(element);
    });

    // Trigger hero animations immediately with staggered timing like Vue template
    setTimeout(() => {
      const heroTitle = document.querySelector('.animate-in.delay-1');
      if (heroTitle) heroTitle.classList.add('fade-up');
    }, 200);

    setTimeout(() => {
      const heroTagline = document.querySelector('.animate-in.delay-2');
      if (heroTagline) heroTagline.classList.add('fade-up');
    }, 400);

    setTimeout(() => {
      const heroButtons = document.querySelector('.animate-in.delay-3');
      if (heroButtons) heroButtons.classList.add('fade-up');
    }, 600);

    setTimeout(() => {
      const videoSection = document.querySelector('.animate-in.delay-4');
      if (videoSection) videoSection.classList.add('fade-up');
    }, 800);

    return () => {
      animatedElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a14] min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/wallpaper.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        {/* Navigation */}
        <header className="absolute top-0 left-0 right-0 z-50 py-6">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                TasuMana
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link to="#features" className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105">Features</Link>
                <Link to="#process" className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105">Process</Link>
                <Link to="#help" className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105">Help</Link>
                <Link to="/teams" className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105">Teams</Link>
              </nav>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105">Login</Link>
                <Link to="/signup">
                  <Button variant="outline" className="border-white/60 text-white hover:bg-white/10 btn-cta">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>        
        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10 flex flex-col justify-center min-h-screen mt-28">
          <div className="text-center pt-20 pb-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-in delay-1 hero-title">
                Just manage it<br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  with TasuMana
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-white/80 animate-in delay-2 hero-tagline">
                The best tool to manage your tasks and projects
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in delay-3">
                <Link to="/signup">
                  <Button className="btn-cta bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                    Start for free
                  </Button>
                </Link>
                <Button 
                  onClick={scrollToVideo}
                  className="btn-video text-white px-8 py-3 text-lg"
                >
                  Watch video
                </Button>
              </div>
            </div>
          </div>
          
          {/* Video Preview */}
          <div className="flex justify-center mb-16">
            <div className="w-full max-w-5xl">
              <div id="video-section" className="relative animate-in delay-4">
                <div className="date-badge absolute -top-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm text-white/80">
                  May 2, 2025: Introducing TasuMana
                </div>
                <div className="video-container aspect-video w-full overflow-hidden rounded-lg shadow-2xl">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0" 
                    title="TasuMana Introduction" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Features Section */}
      <div className="bg-[#0a0a14] py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-in">
            <h6 className="section-subtitle">Features</h6>
            <h2 className="section-title">Key Features</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="feature-card animate-in delay-1">
              <div className="feature-icon">
                <Rocket className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Task Creation</h3>
              <p className="text-gray-400 leading-relaxed">
                Create and organize tasks instantly with our intuitive interface. Get your projects started in seconds.
              </p>
            </div>
            
            <div className="feature-card animate-in delay-2">
              <div className="feature-icon">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Team Collaboration</h3>
              <p className="text-gray-400 leading-relaxed">
                Work seamlessly with your team members. Share tasks, track progress, and communicate effectively.
              </p>
            </div>
            
            <div className="feature-card animate-in delay-3">
              <div className="feature-icon">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure & Reliable</h3>
              <p className="text-gray-400 leading-relaxed">
                Your data is protected with enterprise-grade security. Focus on work while we handle the safety.
              </p>
            </div>
          </div>
        </div>
      </div>      {/* How It Works Section */}
      <div className="bg-gray-900/30 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-in">
            <h6 className="section-subtitle">Process</h6>
            <h2 className="section-title">How It Works</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="step-card animate-in delay-1">
              <div className="step-number">01</div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Project</h3>
              <p className="text-gray-400 leading-relaxed">
                Start by creating a new project and defining your goals and requirements clearly.
              </p>
            </div>
            
            <div className="step-card animate-in delay-2">
              <div className="step-number">02</div>
              <h3 className="text-xl font-semibold text-white mb-3">Organize Tasks</h3>
              <p className="text-gray-400 leading-relaxed">
                Break down your project into manageable tasks and assign them to team members.
              </p>
            </div>
            
            <div className="step-card animate-in delay-3">
              <div className="step-number">03</div>
              <h3 className="text-xl font-semibold text-white mb-3">Track Progress</h3>
              <p className="text-gray-400 leading-relaxed">
                Monitor progress in real-time and get insights to keep your project on track.
              </p>
            </div>
          </div>
        </div>
      </div>      {/* CTA Section */}
      <div className="cta-section bg-gray-900/50 border border-gray-800 rounded-xl mx-6 my-16 overflow-hidden relative">
        <div className="cta-glow absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto px-8 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-2/3 mb-8 lg:mb-0 animate-in delay-1">
              <h2 className="cta-title text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to boost your productivity?
              </h2>
              <p className="cta-text text-xl text-gray-400">
                Join thousands of teams already using TasuMana to manage their projects.
              </p>
            </div>
            <div className="lg:w-1/3 lg:text-right animate-in delay-2">
              <Link to="/signup">
                <Button className="btn-cta bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>        
        </div>
      </div>
    </div>
  );
};

export default Landing;
