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

function Experience() {
  return (
    <section id="experience" className="section experience-section">
      <h2 className="section-title animate-on-scroll">Experience</h2>
      <p className="section-subtitle animate-on-scroll">
        Professional experience building real products.
      </p>

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
    </section>
  );
}

export default Experience;
