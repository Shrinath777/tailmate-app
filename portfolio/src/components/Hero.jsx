import React from 'react';

function Hero() {
  const scrollTo = (e, id) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero">
      <div className="hero-content animate-on-scroll">
        <p className="hero-greeting">Hello, I'm</p>
        <h1 className="hero-name">Shrinath Sureshbabu</h1>
        <p className="hero-tagline">
          ECE student who builds things that connect the physical world to the
          digital — from sensor circuits to full-stack dashboards.
        </p>
        <div className="hero-buttons">
          <a
            href="#projects"
            className="btn btn-primary"
            onClick={(e) => scrollTo(e, '#projects')}
          >
            See My Work
          </a>
          <a
            href="#contact"
            className="btn btn-outline"
            onClick={(e) => scrollTo(e, '#contact')}
          >
            Get In Touch
          </a>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
}

export default Hero;
