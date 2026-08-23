import { Link } from 'react-router-dom';
import { FiSearch, FiZap, FiUsers, FiMessageCircle, FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import heroIllustration from '../assets/hero-illustration.svg';
import SiriCommand from '../components/SiriCommand';

const showcaseItems = [
  {
    id: 1,
    type: 'note',
    title: 'Advanced React Patterns 2024',
    author: 'Sarah Chen',
    rating: 4.9,
    views: '2.3k',
    tags: ['React', 'JavaScript', 'Frontend'],
    preview: 'Comprehensive guide covering hooks, context API, custom patterns, and performance optimization...',
    color: 'from-blue-500/10 to-cyan-500/10',
    icon: '📝',
  },
  {
    id: 2,
    type: 'code',
    title: 'AI Chatbot API Integration',
    author: 'Dev Team',
    rating: 4.8,
    views: '1.8k',
    tags: ['Node.js', 'AI', 'API'],
    preview: 'Complete implementation of OpenAI integration with error handling, streaming, and rate limiting...',
    color: 'from-purple-500/10 to-pink-500/10',
    icon: '💻',
  },
  {
    id: 3,
    type: 'project',
    title: 'Campus Social Network Platform',
    author: 'Project Showcase',
    rating: 5.0,
    views: '3.1k',
    tags: ['Full Stack', 'React', 'Node.js', 'MongoDB'],
    preview: 'End-to-end student collaboration platform with real-time messaging, notifications, and profiles...',
    color: 'from-emerald-500/10 to-teal-500/10',
    icon: '🚀',
  },
  {
    id: 4,
    type: 'note',
    title: 'Data Structures Masterclass',
    author: 'Prof. James',
    rating: 4.7,
    views: '4.2k',
    tags: ['DSA', 'Algorithms', 'Interview Prep'],
    preview: 'Deep dive into arrays, linked lists, trees, and graphs with visual explanations and code solutions...',
    color: 'from-orange-500/10 to-amber-500/10',
    icon: '📚',
  },
  {
    id: 5,
    type: 'code',
    title: 'Machine Learning Pipeline',
    author: 'ML Club',
    rating: 4.9,
    views: '2.7k',
    tags: ['Python', 'ML', 'TensorFlow'],
    preview: 'Complete ML pipeline with data preprocessing, model training, evaluation, and deployment guide...',
    color: 'from-red-500/10 to-rose-500/10',
    icon: '🤖',
  },
  {
    id: 6,
    type: 'project',
    title: 'Mobile Weather App',
    author: 'Mobile Dev Team',
    rating: 4.8,
    views: '1.5k',
    tags: ['React Native', 'API', 'Location'],
    preview: 'Beautiful weather application with real-time updates, forecasts, and location-based services...',
    color: 'from-cyan-500/10 to-sky-500/10',
    icon: '⛅',
  },
];

// Counter animation component
const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = Date.now();
          const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(target * progress));
            if (progress === 1) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasStarted]);

  return <span ref={ref}>{count}</span>;
};

// Scroll-reveal component
const ScrollReveal = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % showcaseItems.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(showcaseItems[(activeIndex + i) % showcaseItems.length]);
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="relative isolate">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.12),_transparent_30%)]" />
        
        {/* ===== ANIMATED HERO SECTION ===== */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 overflow-hidden">
          {/* Parallax background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div 
              className="absolute left-[-12rem] top-12 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
              style={{ transform: `translateY(${scrollY * 0.3}px)` }}
            />
            <div 
              className="absolute right-[-14rem] top-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
              style={{ transform: `translateY(${scrollY * 0.5}px)` }}
            />
          </div>

          <div className="text-center space-y-8 relative z-10">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300 backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                ✨ Student connections reimagined
              </div>
            </ScrollReveal>

            <ScrollReveal className="delay-100">
              <div className="space-y-6">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
                  <span className="inline-block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent animate-pulse">
                    Campus collaboration
                  </span>
                  <br />
                  for the modern student
                </h1>
                <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Find tutoring, share notes, connect with peers, and message securely in one seamless platform built for student success.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="delay-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/marketplace" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4 group">
                  <FiSearch size={20} className="group-hover:rotate-180 transition-transform" /> Start exploring
                </Link>
                <Link to="/register" className="btn-ghost inline-flex items-center justify-center gap-2 text-lg px-8 py-4 group">
                  Create account <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal className="delay-300">
              <SiriCommand />
            </ScrollReveal>
          </div>
        </div>

        {/* ===== ANIMATED STATS SECTION ===== */}
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: 1200, label: 'Active campus members', icon: '👥', color: 'text-cyan-300' },
                { value: 540, label: 'Live listings today', icon: '📊', color: 'text-violet-300' },
                { value: 4, label: 'Average rating', icon: '⭐', color: 'text-indigo-300', suffix: '.9/5' },
                { value: 1, label: 'Avg response time', icon: '⚡', color: 'text-fuchsia-300', suffix: '<1 min' },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-2 group cursor-pointer">
                  <p className={`text-4xl sm:text-5xl font-black ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.value}
                    {!stat.suffix && (stat.value === 540 ? '+' : stat.value === 1200 ? '+' : '')}
                    {stat.suffix && stat.suffix}
                  </p>
                  <p className="text-slate-400 uppercase tracking-[0.2em] text-xs">{stat.icon} {stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ===== ANIMATED CAROUSEL SHOWCASE ===== */}
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <div className="text-center space-y-4 mb-16">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-semibold">Student created content</p>
              <h2 className="text-5xl sm:text-6xl font-black text-white">Explore student work & insights</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">AI-curated notes, code snippets, and projects from your campus community</p>
            </div>

            <div className="relative">
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getVisibleItems().map((item, idx) => (
                    <div
                      key={item.id}
                      className="animate-slide-up rounded-[2rem] border border-white/10 bg-slate-900/60 overflow-hidden hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Item Header */}
                      <div 
                        className={`h-32 bg-gradient-to-br ${item.color} relative overflow-hidden`}
                        style={{ transform: `scale(${1 + scrollY * 0.0001})` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                          {item.icon}
                        </div>
                        <div className="relative h-full flex items-end p-6">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                            {item.type === 'note' && '📝 Note'}
                            {item.type === 'code' && '💻 Code'}
                            {item.type === 'project' && '🚀 Project'}
                          </div>
                        </div>
                      </div>

                      {/* Item Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                          <p className="text-sm text-slate-400 line-clamp-2">{item.preview}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {item.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 border border-white/10 hover:border-cyan-300/50 transition-colors">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 border border-white/10">
                              +{item.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-yellow-400 group-hover:scale-110 transition-transform">
                              <span>⭐</span>
                              <span className="text-sm font-semibold">{item.rating}</span>
                            </div>
                            <div className="text-sm text-slate-400">{item.views} views</div>
                          </div>
                          <div className="text-sm text-slate-500">by {item.author}</div>
                        </div>

                        {/* CTA */}
                        <Link to="/marketplace" className="block w-full text-center rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white font-semibold py-2 transition">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-between mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={prevSlide}
                    className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-white transition hover:scale-110 active:scale-95"
                    aria-label="Previous"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-white transition hover:scale-110 active:scale-95"
                    aria-label="Next"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {showcaseItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-2 rounded-full transition ${
                        idx === activeIndex ? 'w-8 bg-cyan-400 shadow-lg shadow-cyan-400/50' : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="text-sm text-slate-400">
                  {activeIndex + 1} / {showcaseItems.length}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ===== SOLUTIONS GRID ===== */}
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-5xl sm:text-6xl font-black text-white">Everything students need to collaborate</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">Integrated tools designed for campus success</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Marketplace',
                  description: 'Browse verified tutoring, study services, and academic help from trusted peers. Find exactly what you need with smart filters and honest reviews.',
                  icon: FiSearch,
                },
                {
                  title: 'Shared notes',
                  description: 'Create collaborative study materials, organize notes by course, and access shared resources whenever you need them.',
                  icon: FiZap,
                },
                {
                  title: 'Secure messaging',
                  description: 'Chat directly with tutors, study groups, and service providers. Keep conversations organized and notifications clean.',
                  icon: FiMessageCircle,
                },
                {
                  title: 'Verified trust',
                  description: 'Choose with confidence using verified profiles, ratings from peers, and achievement badges that mean something.',
                  icon: FiCheckCircle,
                },
              ].map((item, idx) => (
                <ScrollReveal key={item.title} className={`delay-${idx * 100}`}>
                  <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 hover:-translate-y-1 transition duration-300 group cursor-pointer">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300 mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all">
                      <item.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ===== USE CASES SECTION ===== */}
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-16 text-center">Built for every student</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Find tutoring help',
                  description: 'Search for tutors by subject, see their availability and rates, read what other students say, and book sessions instantly.',
                  cta: 'Browse tutors',
                  color: 'from-blue-500/10 to-cyan-500/10',
                  emoji: '🎓',
                },
                {
                  title: 'Earn by teaching',
                  description: 'List your tutoring services, set your own rates, connect with students who need help, and build your reputation.',
                  cta: 'Start teaching',
                  color: 'from-purple-500/10 to-pink-500/10',
                  emoji: '💰',
                },
                {
                  title: 'Share and collaborate',
                  description: 'Upload your study notes, contribute to shared projects, and access materials from classmates across your courses.',
                  cta: 'Share notes',
                  color: 'from-amber-500/10 to-orange-500/10',
                  emoji: '🤝',
                },
              ].map((useCase, idx) => (
                <ScrollReveal key={useCase.title} className={`delay-${idx * 100}`}>
                  <div className={`rounded-[2rem] border border-white/10 bg-gradient-to-br ${useCase.color} p-10 hover:-translate-y-2 transition-all duration-300 group cursor-pointer overflow-hidden relative`}>
                    <div className="absolute top-0 right-0 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">{useCase.emoji}</div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-4">{useCase.title}</h3>
                      <p className="text-slate-300 leading-relaxed mb-8">{useCase.description}</p>
                      <Link to="/marketplace" className="inline-flex items-center gap-2 text-cyan-300 font-semibold hover:text-white transition group">
                        {useCase.cta} <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ===== TRUST/SOCIAL PROOF ===== */}
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-12 text-center space-y-8 hover:border-cyan-300/50 transition-all">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-semibold">Trusted by students</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white">Powering campus collaboration</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                From first-year students to senior mentors, SkillSwap Campus helps thousands of students connect, learn, and succeed together every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="rounded-xl bg-white/10 px-6 py-3 text-white font-semibold hover:bg-white/15 hover:scale-105 transition-all">
                  Get started free
                </Link>
                <Link to="/marketplace" className="rounded-xl border border-white/10 px-6 py-3 text-white font-semibold hover:border-cyan-300 hover:scale-105 transition-all">
                  Explore marketplace
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ===== FEATURES SHOWCASE ===== */}
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300 font-semibold mb-4">Premium experience</p>
                  <h2 className="text-5xl font-black text-white mb-6">Built for premium collaboration</h2>
                </div>
                
                {[
                  'Verified profiles with student badges',
                  'Real-time chat notifications',
                  'Collaborative note taking',
                  'Secure payment processing',
                  'Transparent rating system',
                  'Campus community focus',
                ].map((feature, idx) => (
                  <ScrollReveal key={feature} className={`delay-${idx * 50}`}>
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/40 transition-all group-hover:scale-125">
                        <FiCheckCircle className="text-cyan-300" size={18} />
                      </div>
                      <p className="text-lg text-slate-300 group-hover:text-white transition">{feature}</p>
                    </div>
                  </ScrollReveal>
                ))}

                <Link to="/register" className="btn-primary inline-flex items-center gap-2 mt-6 group">
                  Start exploring <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <ScrollReveal>
                <div className="relative">
                  <div 
                    className="absolute inset-0 -z-10 mx-auto h-80 w-full max-w-lg rounded-[2.5rem] bg-gradient-to-br from-cyan-500/15 to-violet-500/15 blur-3xl"
                    style={{ transform: `translateY(${scrollY * 0.2}px) scale(${1 + scrollY * 0.0002})` }}
                  />
                  <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 overflow-hidden shadow-2xl shadow-black/40 group hover:shadow-cyan-500/20 transition-all">
                    <img 
                      src={heroIllustration} 
                      alt="Campus collaboration" 
                      className="w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

        {/* ===== FINAL CTA ===== */}
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
            <div className="text-center space-y-8">
              <h2 className="text-5xl sm:text-6xl font-black text-white">Ready to transform campus collaboration?</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Join thousands of students already using SkillSwap Campus to find tutoring, share knowledge, and build their network.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg group">
                  Create free account
                </Link>
                <Link to="/marketplace" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-4 text-lg group">
                  Browse now <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Home;
