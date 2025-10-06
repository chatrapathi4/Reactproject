import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

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

  const handleProductNavigation = (path) => {
    navigate(path);
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
              Experience the future of team collaboration with our comprehensive platform.
              Draw, code, chat, and innovate together from anywhere in the world.
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
                <h3>Whiteboard</h3>
              </div>
              <div className="card card-2">
                <div className="card-icon">💻</div>
                <h3>Code IDE</h3>
              </div>
              <div className="card card-3">
                <div className="card-icon">💬</div>
                <h3>Chat</h3>
              </div>
              <div className="card card-4">
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
                real-time platform that brings teams together regardless of distance. Whether you're
                designing, coding, or brainstorming, our suite of tools has you covered.
              </p>
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <div>
                    <h4>Real-time Sync</h4>
                    <p>Instant collaboration with live updates across all tools</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div>
                    <h4>Secure & Private</h4>
                    <p>Enterprise-grade security for your data and code</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌐</span>
                  <div>
                    <h4>Cross-platform</h4>
                    <p>Works seamlessly on all devices and browsers</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🚀</span>
                  <div>
                    <h4>No Installation</h4>
                    <p>Browser-based platform, ready to use instantly</p>
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
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Projects Created</span>
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

      {/* Products Section - Updated */}
      <section id="products" className="products-section">
        <div className="container">
          <h2 className="section-title">Our Collaboration Suite</h2>
          <div className="products-grid">
            {/* Whiteboard Product */}
            <div className="product-card">
              <div className="product-icon">🎨</div>
              <h3>Interactive Whiteboard</h3>
              <p>Infinite canvas for your creative ideas with advanced drawing tools and real-time collaboration</p>
              <ul className="product-features">
                <li>Real-time multi-user drawing</li>
                <li>Multiple brush types & colors</li>
                <li>Shape and text tools</li>
                <li>Save and export boards</li>
                <li>Room-based collaboration</li>
              </ul>
              <button 
                className="product-btn"
                onClick={() => handleProductNavigation('/whiteboard')}
              >
                Try Whiteboard
              </button>
            </div>

            {/* IDE Product */}
            <div className="product-card featured">
              <div className="product-badge">Developer Favorite</div>
              <div className="product-icon">💻</div>
              <h3>Collaborative IDE</h3>
              <p>Full-featured Python IDE with real-time code sharing and execution capabilities</p>
              <ul className="product-features">
                <li>Real-time code collaboration</li>
                <li>Python code execution</li>
                <li>File management system</li>
                <li>Syntax highlighting</li>
                <li>Live output sharing</li>
                <li>Multiple file support</li>
              </ul>
              <button 
                className="product-btn primary"
                onClick={() => handleProductNavigation('/ide')}
              >
                Start Coding
              </button>
            </div>

            {/* Chat Product */}
            <div className="product-card">
              <div className="product-icon">💬</div>
              <h3>Team Chat</h3>
              <p>Seamless communication platform integrated with all collaboration tools</p>
              <ul className="product-features">
                <li>Real-time messaging</li>
                <li>User presence indicators</li>
                <li>Room-based conversations</li>
                <li>Message history</li>
                <li>Typing indicators</li>
                <li>Mobile responsive</li>
              </ul>
              <button 
                className="product-btn"
                onClick={() => handleProductNavigation('/chat')}
              >
                Start Chatting
              </button>
            </div>

            {/* Complete Suite */}
            <div className="product-card premium">
              <div className="product-badge premium-badge">Complete Suite</div>
              <div className="product-icon">🚀</div>
              <h3>All-in-One Platform</h3>
              <p>Complete collaboration experience combining whiteboard, IDE, and chat in one seamless platform</p>
              <ul className="product-features">
                <li>All tools in one session</li>
                <li>Cross-tool integration</li>
                <li>Unified user management</li>
                <li>Session sharing</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
              </ul>
              <button 
                className="product-btn premium-btn"
                onClick={() => scrollToSection('contact')}
              >
                Get Started
              </button>
            </div>

            {/* File Manager - Coming Soon */}
            <div className="product-card coming-soon">
              <div className="product-badge coming-soon-badge">Coming Soon</div>
              <div className="product-icon">📂</div>
              <h3>File Manager</h3>
              <p>Centralized file management with version control and collaborative editing</p>
              <ul className="product-features">
                <li>Cloud file storage</li>
                <li>Version control</li>
                <li>File sharing</li>
                <li>Collaborative editing</li>
                <li>Access permissions</li>
              </ul>
              <button className="product-btn disabled" disabled>
                Coming Soon
              </button>
            </div>

            {/* Analytics Dashboard - Coming Soon */}
            <div className="product-card coming-soon">
              <div className="product-badge coming-soon-badge">Coming Soon</div>
              <div className="product-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Insights and analytics for your collaboration sessions and team productivity</p>
              <ul className="product-features">
                <li>Usage statistics</li>
                <li>Performance metrics</li>
                <li>Team insights</li>
                <li>Export reports</li>
                <li>Custom dashboards</li>
              </ul>
              <button className="product-btn disabled" disabled>
                Coming Soon
              </button>
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
                <p>"The IDE collaboration feature is game-changing! Our team can code together seamlessly across different locations."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">JD</div>
                <div className="author-info">
                  <h4>John Doe</h4>
                  <p>Senior Developer</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The whiteboard is perfect for our design sprints, and the integrated chat keeps everyone connected."</p>
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
                <p>"Having whiteboard, IDE, and chat in one platform eliminated the need for multiple tools. Brilliant!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">MJ</div>
                <div className="author-info">
                  <h4>Mike Johnson</h4>
                  <p>Project Manager</p>
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
                <p>You can start using CollabBoard immediately! No installation required - just open your browser and start collaborating.</p>
              </div>
              <div className="faq-item">
                <h4>Can I use the IDE for languages other than Python?</h4>
                <p>Currently our IDE supports Python with plans to add more languages soon. Stay tuned for updates!</p>
              </div>
              <div className="faq-item">
                <h4>Is my code and data secure?</h4>
                <p>Absolutely! We use enterprise-grade security measures to protect your code and collaboration data.</p>
              </div>
              <div className="faq-item">
                <h4>Can I use it on mobile devices?</h4>
                <p>Yes! CollabBoard works seamlessly on desktop, tablet, and mobile devices with responsive design.</p>
              </div>
              <div className="faq-item">
                <h4>How many people can collaborate simultaneously?</h4>
                <p>Our platform supports multiple users per session with real-time sync across all tools.</p>
              </div>
              <div className="faq-item">
                <h4>What support do you offer?</h4>
                <p>We provide comprehensive documentation, email support, and are working on 24/7 chat support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;