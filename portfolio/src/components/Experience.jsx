import React from 'react';

const experiences = [
  {
    role: 'IoT Intern',
    company: 'Embessy Intelligence',
    duration: 'Nov 2024 – May 2025',
    points: [
      'Built real-time IoT solutions with sensor integration and embedded systems',
      'Worked on intelligent monitoring and deployment-ready systems',
    ],
  },
  {
    role: 'IoT Intern',
    company: 'Eazythings Technology Pvt. Ltd.',
    duration: 'Jun 2024 – Jul 2024',
    points: [
      'Prototyped real-time IoT applications with sensors and actuators',
      'Designed 2-layer PCB layouts, visualized data on ThingsBoard',
    ],
  },
];

const achievements = [
  'SIH 2025 Finalist (Top teams nationwide)',
  'Google Buildathon participant',
  'NPTEL IoT Certificate (83%)',
  'Full Stack Web Dev — Udemy (Angela Yu)',
];

function Experience() {
  return (
    <section id="experience" className="section experience-section">
      <h2 className="section-title animate-on-scroll">Experience</h2>

      <div className="timeline">
        {experiences.map((exp, i) => (
          <div
            key={exp.company}
            className={`timeline-entry glass-card animate-on-scroll stagger-${i + 1}`}
          >
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3 className="timeline-role">{exp.role}</h3>
              <p className="timeline-company">{exp.company}</p>
              <span className="timeline-duration">{exp.duration}</span>
              <ul className="timeline-points">
                {exp.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="achievements-section animate-on-scroll stagger-3">
        <h3 className="achievements-title">Achievements</h3>
        <ul className="achievements-list">
          {achievements.map((ach, i) => (
            <li key={i} className="achievement-item">
              <span className="achievement-icon">✦</span>
              {ach}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Experience;
