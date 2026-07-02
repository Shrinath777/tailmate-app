import React, { useEffect, useRef } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const canvasRef = useRef(null);
  const navbarRef = useRef(null);
  const ripples = useRef([]);
  const animationFrameId = useRef(null);

  useEffect(() => {
    // --- IntersectionObserver for scroll-triggered reveals ---
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    scrollElements.forEach((el) => observer.observe(el));

    // --- Parallax effect on blobs ---
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const blob1 = document.querySelector('.blob-1');
      const blob2 = document.querySelector('.blob-2');
      const blob3 = document.querySelector('.blob-3');

      if (blob1) blob1.style.transform = `translate(${scrollY * 0.03}px, ${scrollY * 0.06}px)`;
      if (blob2) blob2.style.transform = `translate(${scrollY * -0.04}px, ${scrollY * 0.08}px)`;
      if (blob3) blob3.style.transform = `translate(${scrollY * 0.05}px, ${scrollY * -0.04}px)`;

      // --- Navbar scroll detection ---
      const nav = document.querySelector('.navbar');
      if (nav) {
        if (scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- Canvas water ripple on click ---
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      const handleClick = (e) => {
        const hero = document.getElementById('hero');
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          ripples.current.push({
            x: e.clientX,
            y: e.clientY,
            radius: 0,
            maxRadius: 300,
            opacity: 0.4,
          });
        }
      };
      window.addEventListener('click', handleClick);

      const animate = () => {
        ctx.clearRect(0, 0, width, height);

        ripples.current = ripples.current.filter((r) => r.opacity > 0.01);

        ripples.current.forEach((r) => {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139, 92, 246, ${r.opacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.closePath();

          r.radius += 3;
          r.opacity *= 0.97;
        });

        animationFrameId.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('click', handleClick);
        cancelAnimationFrame(animationFrameId.current);
        observer.disconnect();
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="app">
      {/* Decorative background blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      {/* Canvas for ripple effect */}
      <canvas ref={canvasRef} className="ripple-canvas"></canvas>

      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
