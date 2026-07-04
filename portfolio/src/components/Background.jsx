import React, { useEffect, useRef } from 'react';
import './Background.css';

function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let particles = [];
    
    // Mouse interaction state
    let mouse = { x: null, y: null, radius: 150 };
    
    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    
    const handleMouseOut = () => {
      mouse.x = undefined;
      mouse.y = undefined;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    class Particle {
      constructor(x, y, vx, vy, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.density = (Math.random() * 30) + 1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        // Base movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x > width || this.x < 0) this.vx = -this.vx;
        if (this.y > height || this.y < 0) this.vy = -this.vy;

        // Mouse push effect
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = forceDirectionX * force * this.density;
            const directionY = forceDirectionY * force * this.density;
            
            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }
    }

    const init = () => {
      particles = [];
      const particleCount = Math.min((width * height) / 10000, 150); // Scale with screen size
      
      for (let i = 0; i < particleCount; i++) {
        let size = (Math.random() * 2) + 1.5;
        let x = Math.random() * (width - size * 2) + size;
        let y = Math.random() * (height - size * 2) + size;
        let vx = (Math.random() - 0.5) * 1.2;
        let vy = (Math.random() - 0.5) * 1.2;
        
        let color = 'rgba(139, 92, 246, 0.8)'; // Violet
        if (Math.random() > 0.5) color = 'rgba(6, 182, 212, 0.8)'; // Cyan
        if (Math.random() > 0.8) color = 'rgba(236, 72, 153, 0.8)'; // Pink
        
        particles.push(new Particle(x, y, vx, vy, size, color));
      }
    }

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = dx * dx + dy * dy;
          
          if (distance < 20000) {
            opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacityValue * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    }
  }, []);

  return (
    <div className="water-morphism-bg">
      {/* Slow moving color gradients in the back */}
      <div className="water-blob water-blob-1"></div>
      <div className="water-blob water-blob-2"></div>
      
      {/* Frosted glass overlay */}
      <div className="glass-overlay"></div>
      
      {/* Highly dynamic interactive particle network on top */}
      <canvas ref={canvasRef} className="live-canvas"></canvas>
    </div>
  );
}

export default Background;
