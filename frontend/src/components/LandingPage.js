import React, { useState, useEffect } from 'react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">Collaborate</span>
              <span className="highlight-text">Without Limits</span>
            </h1>
            <p className="hero-subtitle">
              Experience the future of team collaboration with our real-time whiteboard platform.
              Draw, design, and innovate together from anywhere in the world.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => scrollToSection('products')}>
                Start Creating
                <span className="btn-icon">→</span>
              </button>
              <button className="btn-secondary" onClick={() => scrollToSection('about')}>
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-cards">
              <div className="card card-1">
                <div className="card-icon">🎨</div>
                <h3>Draw</h3>
              </div>
              <div className="card card-2">
                <div className="card-icon">💬</div>
                <h3>Chat</h3>
              </div>
              <div className="card card-3">
                <div className="card-icon">🤝</div>
                <h3>Collaborate</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="cyber-grid"></div>
          <div className="floating-particles"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About CollabBoard</h2>
          <div className="about-grid">
            <div className="about-text">
              <p className="about-description">
                CollabBoard revolutionizes remote collaboration by providing an intuitive, 
                real-time whiteboard platform that brings teams together regardless of distance.
              </p>
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <div>
                    <h4>Real-time Sync</h4>
                    <p>Instant collaboration with live updates</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div>
                    <h4>Secure & Private</h4>
                    <p>Enterprise-grade security for your data</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌐</span>
                  <div>
                    <h4>Cross-platform</h4>
                    <p>Works seamlessly on all devices</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Active Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">99.9%</span>
                  <span className="stat-label">Uptime</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="products-section">
        <div className="container">
          <h2 className="section-title">Our Products</h2>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-icon">🎨</div>
              <h3>Whiteboard</h3>
              <p>Infinite canvas for your creative ideas with advanced drawing tools</p>
              <ul className="product-features">
                <li>Real-time collaboration</li>
                <li>Multiple brush types</li>
                <li>Shape tools</li>
                <li>Color palette</li>
                <li>User presence</li>
              </ul>
              <button 
                className="product-btn"
                onClick={() => window.open('/whiteboard', '_blank')}
              >
                Try Now
              </button>
            </div>
            <div className="product-card featured">
              <div className="product-badge">Most Popular</div>
              <div className="product-icon">💬</div>
              <h3>Collaboration Suite</h3>
              <p>Complete collaboration experience with chat, and whiteboard</p>
              <ul className="product-features">
                <li>Real-time chat</li>
                <li>Screen sharing</li>
                <li>File uploads</li>
              </ul>
              <button className="product-btn primary">Get Started</button>
            </div>
            <div className="product-card">
              <div className="product-icon">📊</div>
              <h3>Analytics</h3>
              <p>Insights and analytics for your collaboration sessions</p>
              <ul className="product-features">
                <li>Usage statistics</li>
                <li>Performance metrics</li>
                <li>Export reports</li>
                <li>Team insights</li>
              </ul>
              <button className="product-btn">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="feedback-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"CollabBoard has transformed how our remote team collaborates. The real-time features are incredible!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">JD</div>
                <div className="author-info">
                  <h4>John Doe</h4>
                  <p>Product Manager</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The interface is intuitive and the performance is outstanding. Highly recommended!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">SA</div>
                <div className="author-info">
                  <h4>Sarah Adams</h4>
                  <p>Design Lead</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Perfect for our design sprints. The collaboration features are exactly what we needed."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">MJ</div>
                <div className="author-info">
                  <h4>Mike Johnson</h4>
                  <p>UX Designer</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feedback Form */}
          <div className="feedback-form-container">
            <h3>Share Your Feedback</h3>
            <form className="feedback-form">
              <div className="form-row">
                <input type="text" placeholder="Your Name" className="form-input" />
                <input type="email" placeholder="Your Email" className="form-input" />
              </div>
              <textarea placeholder="Your Message" className="form-textarea"></textarea>
              <button type="submit" className="form-submit">Send Feedback</button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <p className="contact-description">
                Ready to transform your team's collaboration? Get in touch with us today!
              </p>
              
              <div className="contact-methods">
                <div className="contact-item">
                  <div className="contact-icon">📧</div>
                  <div className="contact-details">
                    <h4>Email</h4>
                    <p>hello@collabboard.com</p>
                    <p>support@collabboard.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div className="contact-details">
                    <h4>Phone</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div className="contact-details">
                    <h4>Office</h4>
                    <p>123 Innovation Street</p>
                    <p>Tech Valley, CA 94025</p>
                  </div>
                </div>
                
              </div>
              
              <div className="social-links">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  <a href="#" className="social-link">
                    <span className="social-icon">📘</span>
                    <span>Facebook</span>
                  </a>
                  <a href="#" className="social-link">
                    <span className="social-icon">🐦</span>
                    <span>Twitter</span>
                  </a>
                  <a href="#" className="social-link">
                    <span className="social-icon">💼</span>
                    <span>LinkedIn</span>
                  </a>
                  <a href="#" className="social-link">
                    <span className="social-icon">📸</span>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="contact-form-section">
              <h3>Send Us a Message</h3>
              <form className="contact-form">
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name *</label>
                  <input 
                    type="text" 
                    id="contact-name"
                    placeholder="Enter your full name" 
                    className="form-input" 
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input 
                    type="email" 
                    id="contact-email"
                    placeholder="Enter your email address" 
                    className="form-input" 
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact-company">Company</label>
                  <input 
                    type="text" 
                    id="contact-company"
                    placeholder="Your company name" 
                    className="form-input" 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject *</label>
                  <select id="contact-subject" className="form-select" required>
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact-message">Message *</label>
                  <textarea 
                    id="contact-message"
                    placeholder="Tell us how we can help you..." 
                    className="form-textarea"
                    rows="5"
                    required
                  ></textarea>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="checkmark"></span>
                    I agree to receive emails about CollabBoard updates and news
                  </label>
                </div>
                
                <button type="submit" className="contact-submit">
                  Send Message
                  <span className="btn-icon">→</span>
                </button>
              </form>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>How quickly can I get started?</h4>
                <p>You can start using CollabBoard immediately after signing up. No installation required!</p>
              </div>
              <div className="faq-item">
                <h4>Is there a free trial?</h4>
                <p>Yes! We offer a 14-day free trial with full access to all features.</p>
              </div>
              <div className="faq-item">
                <h4>Can I use it on mobile devices?</h4>
                <p>Absolutely! CollabBoard works seamlessly on desktop, tablet, and mobile devices.</p>
              </div>
              <div className="faq-item">
                <h4>What support do you offer?</h4>
                <p>We provide 24/7 chat support, email support, and comprehensive documentation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;