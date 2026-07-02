import React from 'react';

const contactLinks = [
  {
    icon: '✉️',
    label: 'Email',
    value: 'shrinathsureshbabu@gmail.com',
    href: 'mailto:shrinathsureshbabu@gmail.com',
    external: false,
  },
  {
    icon: '💻',
    label: 'GitHub',
    value: 'github.com/Shrinath777',
    href: 'https://github.com/Shrinath777',
    external: true,
  },
  {
    icon: '🔗',
    label: 'LinkedIn',
    value: 'linkedin.com/in/shrinath',
    href: 'https://linkedin.com/in/',
    external: true,
  },
];

function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <h2 className="section-title animate-on-scroll">Let's Connect</h2>

      <p className="contact-intro animate-on-scroll">
        I'm always open to discussing new projects, collaboration opportunities, or roles where 
        I can contribute to building impactful products. Whether you have an idea you'd like to 
        explore, need help with IoT and embedded systems, or just want to talk tech — feel free to reach out.
      </p>

      <div className="contact-grid">
        {contactLinks.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            className={`contact-card glass-card animate-on-scroll stagger-${i + 1}`}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            <span className="contact-icon">{link.icon}</span>
            <span className="contact-label">{link.label}</span>
            <span className="contact-value">{link.value}</span>
          </a>
        ))}
      </div>

      <div className="contact-cta animate-on-scroll">
        <p className="contact-cta-text">
          Let's build something meaningful together.
        </p>
        <a
          href="mailto:shrinathsureshbabu@gmail.com"
          className="btn btn-primary"
        >
          Send Me a Message
        </a>
      </div>
    </section>
  );
}

export default Contact;
