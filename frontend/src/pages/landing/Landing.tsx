import React, { useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import {
  ArrowRight,
  Users,
  GitBranch,
  Shield,
  TrendingUp,
  Github,
  Heart,
  BookOpen,
  Zap,
  Target,
} from 'lucide-react';
import { Link} from 'react-router-dom';
import { 
  animations, 
  createAnimationTimeline, 
  animateOnScroll,
  DURATION,
  EASING 
} from '../../lib/animations';
import { animate, stagger } from 'animejs';

const Landing: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return; // guard for SSR

    // 1. Timeline entrance animation with new styling
    const tl = createAnimationTimeline({
      easing: EASING.smooth,
      duration: DURATION.page,
    });

    tl
      .add(titleRef.current!, { 
        translateY: [100, 0], 
        opacity: [0, 1], 
        duration: 1200, 
        delay: 300,
        scale: [0.9, 1]
      })
      .add(subtitleRef.current!, { 
        translateY: [50, 0], 
        opacity: [0, 1], 
        duration: 800 
      }, '-=600')
      .add(ctaRef.current!, { 
        translateY: [30, 0], 
        opacity: [0, 1], 
        duration: 600,
        scale: [0.95, 1]
      }, '-=400');

    // 2. Enhanced floating decorative elements
    animate('.floating-element', {
      translateY: [-20, 20],
      rotate: [-5, 5],
      duration: 3000,
      loop: true,
      direction: 'alternate',
      easing: EASING.gentle,
      delay: stagger(200),
    });

    // 3. Background orbs with more complex animation
    animate('.bg-orb', {
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.7, 0.2],
      rotate: [0, 180, 360],
      duration: 6000,
      loop: true,
      easing: EASING.gentle,
      delay: stagger(1500),
    });

    // 4. Grid items animate on scroll with better effects
    animateOnScroll('.grid-item', () => {
      animations.card.staggerIn('.grid-item', 120);
    });

    // 5. Continuous floating animation for nav
    animate('.nav-logo', {
      translateY: [-2, 2],
      duration: 2000,
      loop: true,
      direction: 'alternate',
      easing: EASING.gentle,
    });

    // 6. Sparkle effects
    animate('.sparkle', {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180],
      duration: 2000,
      delay: stagger(300),
      loop: true,
      easing: EASING.bounce,
    });

  }, []);

  const handleCTAClick = () => {
    animations.button.click('.cta-button');
  };

  const handleCardHover = (e: React.MouseEvent) => {
    animations.card.hoverScale(e.currentTarget as HTMLElement);
  };

  const handleCardLeave = (e: React.MouseEvent) => {
    animations.card.hoverReset(e.currentTarget as HTMLElement);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Enhanced Background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-orb absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="bg-orb absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="bg-orb absolute -bottom-20 left-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
      </div>

      {/* Enhanced Floating elements with sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-element absolute top-32 left-10 w-4 h-4 bg-gradient-to-r from-white to-purple-200 rounded-full opacity-30" />
        <div className="floating-element absolute top-48 right-32 w-6 h-6 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-40" />
        <div className="floating-element absolute bottom-40 left-20 w-3 h-3 bg-gradient-to-r from-pink-300 to-blue-300 rounded-full opacity-35" />
        <div className="floating-element absolute bottom-60 right-10 w-5 h-5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-30" />
        
        {/* Sparkle effects */}
        <div className="sparkle absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full" />
        <div className="sparkle absolute top-3/4 right-1/4 w-1 h-1 bg-yellow-300 rounded-full" />
        <div className="sparkle absolute top-1/2 left-3/4 w-2 h-2 bg-pink-300 rounded-full" />
      </div>

      {/* Navigation with enhanced styling */}
      <nav className="relative z-10 p-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="nav-logo flex items-center space-x-2">
            <div className="relative">
              <Shield className="w-8 h-8 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-80"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              ITss
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-purple-400 transition-all duration-300 hover:scale-105">Features</a>
            <a href="#demo" className="hover:text-purple-400 transition-all duration-300 hover:scale-105">Demo</a>
            <a href="#docs" className="hover:text-purple-400 transition-all duration-300 hover:scale-105">Documentation</a>
            <Button 
              variant="outline" 
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-400/25"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with enhanced effects */}
      <section ref={heroRef} className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold mb-8 opacity-0">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
              ITss - Project Destiny
            </span>
            <br/>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
              Student Project
            </span>
          </h1>
          <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto opacity-0 leading-relaxed drop-shadow-lg">
            Smart project management system with GitHub integration, real-time progress tracking and automatic Free-rider detection. 
            Comprehensive solution for student project management with modern technology
          </p>
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0">
            <Button
              size="lg"
              className="cta-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
              onClick={handleCTAClick}
            >
              <a href='/login'>              
              Explore Now
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-400 text-gray-300 hover:bg-white hover:text-gray-900 px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/25"
            >
              <Github className="mr-2 w-5 h-5"/> View on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section with enhanced animations */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
              Why choose ITss?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Comprehensive solution for student project management with modern technology
            </p>
          </div>
          <div ref={gridRef} className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <GitBranch className="w-6 h-6 text-white"/>, 
                title: 'GitHub Integration', 
                text: 'Automatically sync with repository, track commits and real-time contributions of each member.',
                gradient: 'from-purple-500 to-blue-500'
              },
              { 
                icon: <TrendingUp className="w-6 h-6 text-white"/>, 
                title: 'Progress Tracking', 
                text: 'Dashboard with real-time progress, timeline and performance analysis.',
                gradient: 'from-green-500 to-teal-500'
              },
              { 
                icon: <Shield className="w-6 h-6 text-white"/>, 
                title: 'Free-rider Detection', 
                text: 'AI analyzes work patterns, warns non-contributing members and ensures fairness.',
                gradient: 'from-red-500 to-pink-500'
              },
              { 
                icon: <Users className="w-6 h-6 text-white"/>, 
                title: 'Team Management', 
                text: 'Create teams, assign tasks, delegate work and track workload of each member.',
                gradient: 'from-orange-500 to-yellow-500'
              },
              { 
                icon: <Target className="w-6 h-6 text-white"/>, 
                title: 'Pressure Score', 
                text: 'Smart system to calculate stress score, balance workload and optimize performance.',
                gradient: 'from-indigo-500 to-purple-500'
              },
              { 
                icon: <BookOpen className="w-6 h-6 text-white"/>, 
                title: 'Multi-dimensional Evaluation', 
                text: 'Peer review, self-assessment and instructor evaluation with detailed reports.',
                gradient: 'from-pink-500 to-rose-500'
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="grid-item bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-400/50 transition-all duration-500 cursor-pointer group"
                onMouseEnter={handleCardHover}
                onMouseLeave={handleCardLeave}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-300 transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section with enhanced styling */}
      <section id="demo" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
            Watch ITss in action
          </h2>
          
          {/* GitHub Integration Demo with enhanced styling */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center">
                  <GitBranch className="w-5 h-5 mr-2 text-purple-400" />
                  GitHub Activity
                </h3>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              </div>
              <div className="space-y-3">
                {[
                  { user: 'Nguyễn A', action: 'pushed 3 commits', time: '2 minutes ago', task: 'TASK-001', color: 'text-green-400' },
                  { user: 'Trần B', action: 'created pull request', time: '15 minutes ago', task: 'TASK-003', color: 'text-blue-400' },
                  { user: 'Lê C', action: 'merged branch', time: '1 hour ago', task: 'TASK-002', color: 'text-purple-400' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-300">
                    <div>
                      <span className={`font-medium ${activity.color}`}>{activity.user}</span>
                      <span className="text-gray-300 ml-2">{activity.action}</span>
                      <span className="text-blue-300 ml-2 text-xs bg-blue-500/20 px-2 py-1 rounded">#{activity.task}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-400/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Team Progress
                </h3>
                <span className="text-green-400 text-sm font-medium bg-green-500/20 px-3 py-1 rounded-full">85%</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Nguyễn A', progress: 92, commits: 28, color: 'bg-green-500', bgColor: 'bg-green-500/20' },
                  { name: 'Trần B', progress: 88, commits: 24, color: 'bg-blue-500', bgColor: 'bg-blue-500/20' },
                  { name: 'Lê C', progress: 76, commits: 18, color: 'bg-purple-500', bgColor: 'bg-purple-500/20' },
                  { name: 'Phạm D', progress: 45, commits: 8, color: 'bg-red-500', bgColor: 'bg-red-500/20' },
                ].map((member, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 font-medium">{member.name}</span>
                      <span className={`text-gray-400 ${member.bgColor} px-2 py-1 rounded text-xs`}>{member.commits} commits</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full ${member.color} transition-all duration-1000 shadow-lg`}
                        style={{ width: `${member.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Free-rider Detection with enhanced styling */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/30 max-w-2xl mx-auto hover:border-yellow-400/50 transition-all duration-500">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 mr-2 text-yellow-400" />
              <h3 className="text-xl font-bold">Free-rider Detection</h3>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4 mb-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse shadow-lg shadow-yellow-400/50"></div>
                <span className="text-yellow-300">⚠️ Warning: Phạm D has low contribution (45%)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center bg-white/5 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-400">3.2</div>
                <div className="text-gray-400">Pressure Score</div>
              </div>
              <div className="text-center bg-white/5 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400">65%</div>
                <div className="text-gray-400">Compared to team</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section with enhanced styling */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
              Available for all roles
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: '🌱 Student', desc: 'Join teams, perform tasks, evaluate peers', gradient: 'from-green-500/20 to-teal-500/20' },
              { title: '🐉 Team Leader', desc: 'Manage team, assign work, track progress', gradient: 'from-blue-500/20 to-indigo-500/20' },
              { title: '🧓 Instructor', desc: 'Create projects, supervise teams, evaluate results', gradient: 'from-purple-500/20 to-pink-500/20' },
              { title: '🛡️ Admin', desc: 'System administration, authorization, overall reports', gradient: 'from-red-500/20 to-orange-500/20' },
            ].map((role, i) => (
              <div 
                key={i} 
                className={`bg-gradient-to-br ${role.gradient} backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:border-white/30 transition-all duration-500 hover:scale-105 cursor-pointer`}
              >
                <h3 className="text-xl font-bold mb-3">{role.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with enhanced styling */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="w-6 h-6 text-purple-400"/>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ITss - Project Destiny
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
              <Github className="w-5 h-5"/>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
              <BookOpen className="w-5 h-5"/>
            </a>
            <div className="flex items-center text-gray-400">
              Made with <Heart className="w-4 h-4 mx-1 text-red-400 animate-pulse"/> for students
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
