import React from 'react';

function About() {
  return (
    <section id="about" className="section about-section">
      <h2 className="section-title animate-on-scroll">About Me</h2>

      <div className="about-container glass-card animate-on-scroll stagger-1">
        <div className="about-avatar">
          <div className="avatar-placeholder">
            <span>SS</span>
          </div>
        </div>

        <div className="about-text">
          <p>
            I'm a final-year Electronics and Communication Engineering student
            at RMK College of Engineering, Chennai. I enjoy learning by building 
            things — whether that's experimenting with ESP32 sensors for basic 
            monitoring or exploring how foundational Node.js backends can tie 
            everything together.
          </p>
          <p>
            I got into IoT during my internship at Eazythings, where I was
            designing PCBs and pushing live data to ThingsBoard. That experience
            made me realize I enjoy the full loop — hardware to software to
            deployment.
          </p>
          <p>
            Outside of college, I've competed in SIH 2025 as a finalist,
            participated in Google Buildathon, and earned my NPTEL IoT
            certification. I'm always looking for projects that let me connect
            hardware and code in meaningful ways.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
