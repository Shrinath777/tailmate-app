import React from 'react';

const skillCategories = [
  {
    name: 'Programming',
    skills: ['JavaScript', 'Python', 'C/C++', 'HTML5', 'CSS3'],
  },
  {
    name: 'Web Development',
    skills: ['Node.js', 'Express.js', 'React', 'REST APIs', 'Bootstrap'],
  },
  {
    name: 'IoT & Embedded',
    skills: ['ESP32', 'Arduino', 'Sensors', 'PCB Design (KiCad)'],
  },
  {
    name: 'Databases',
    skills: ['Firebase', 'Supabase', 'MongoDB'],
  },
  {
    name: 'Tools & Platforms',
    skills: ['VS Code', 'GitHub', 'ThingsBoard', 'Arduino IDE', 'KiCad'],
  },
];

function Skills() {
  return (
    <section id="skills" className="section skills-section">
      <h2 className="section-title animate-on-scroll">Skills &amp; Tools</h2>

      <div className="skills-grid">
        {skillCategories.map((category, i) => (
          <div
            key={category.name}
            className={`skill-category glass-card animate-on-scroll stagger-${i + 1}`}
          >
            <h3 className="skill-category-name">{category.name}</h3>
            <div className="skill-items">
              {category.skills.map((skill) => (
                <span key={skill} className="skill-item">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
