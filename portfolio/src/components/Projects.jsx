import React, { useRef, useCallback } from 'react';

const projects = [
  {
    name: 'Heritage Sentinel',
    slug: 'heritage',
    description:
      'Real-time IoT environmental monitoring for heritage sites. Used ESP32, temperature/humidity/gas sensors, Node.js dashboard, and SMS alerts to protect monuments.',
    tech: ['ESP32', 'Node.js', 'Express', 'Sensors', 'Twilio SMS', 'Web Dashboard'],
  },
  {
    name: 'TailMate',
    slug: 'tailmate',
    description:
      'A pet matchmaking app where dog owners find compatible playmates. Built with React Native and Supabase for real-time chat and profile matching.',
    tech: ['React Native', 'Supabase', 'Node.js', 'Expo', 'Real-time Chat'],
  },
  {
    name: 'Farmer Services',
    slug: 'farmer',
    description:
      'A rural workflow platform connecting farmers to tools, market prices, and local services. Built with Node.js and Express.',
    tech: ['Node.js', 'Express', 'Firebase', 'HTML/CSS', 'REST APIs'],
  },
  {
    name: 'RFID Dashboard',
    slug: 'rfid',
    description:
      'An access control system using RFID cards and ESP32. Tracks entries on a live web dashboard with authentication.',
    tech: ['ESP32', 'RFID RC522', 'Node.js', 'Firebase', 'Web Frontend'],
  },
  {
    name: 'Dual Axis Solar Tracker',
    slug: 'solar',
    description:
      'Hardware project that aligns solar panels to sunlight using LDR sensors and servo motors for maximum energy capture.',
    tech: ['Arduino', 'LDR Sensors', 'Servo Motors', 'Embedded C', 'PCB Design'],
  },
  {
    name: 'CuraBot',
    slug: 'curabot',
    description:
      'An AI-powered differential diagnosis chatbot for TCS hackathon. Analyzes symptoms and suggests possible conditions with confidence scores.',
    tech: ['Python', 'FastAPI', 'Vite', 'React', 'AI/ML', 'Supabase'],
  },
];

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  const handleLaunch = async (slug) => {
    try {
      const res = await fetch(`/api/launch/${slug}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Launching ${project.name} locally...`);
      } else {
        alert(`Could not launch: ${data.error || 'Unknown error'}`);
      }
    } catch {
      alert('Server not reachable. Make sure the backend is running on port 3001.');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`project-card glass-card animate-on-scroll stagger-${index + 1}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="project-card-content">
        <h3 className="project-name">{project.name}</h3>
        <p className="project-description">{project.description}</p>
        <div className="tech-pills">
          {project.tech.map((t) => (
            <span key={t} className="tech-pill">
              {t}
            </span>
          ))}
        </div>
        <div className="project-actions">
          <a href={`/projects/${project.slug}`} className="btn btn-small btn-primary">
            View Details
          </a>
          <button
            className="btn btn-small btn-outline"
            onClick={() => handleLaunch(project.slug)}
          >
            Launch Locally
          </button>
        </div>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section id="projects" className="section projects-section">
      <h2 className="section-title animate-on-scroll">Projects</h2>
      <p className="section-subtitle animate-on-scroll">
        Things I've actually built and shipped.
      </p>

      <div className="projects-grid">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}

export default Projects;
