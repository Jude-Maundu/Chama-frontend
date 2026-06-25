<template>
  <div class="landing-page">
    <!-- Hero Section with Dynamic Gradient -->
    <section class="hero-section">
      <div class="container">
        <!-- Floating Glass Navigation -->
        <nav class="navbar navbar-expand-lg navbar-dark fixed-top px-4 pt-3">
          <div class="container-fluid py-2 px-4 rounded-pill shadow-sm" 
               style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);">
            <a class="navbar-brand fw-bold" href="#">
              <div class="logo d-flex align-items-center gap-2">
                <div class="logo-icon">💰</div>
                <span class="logo-text">Chama<span>System</span></span>
              </div>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <div class="ms-auto d-flex align-items-center flex-column flex-lg-row">
                <a href="#features" class="nav-link text-white me-lg-4 opacity-75">Features</a>
                <a href="#benefits" class="nav-link text-white me-lg-4 opacity-75">Benefits</a>
                <a href="#testimonials" class="nav-link text-white me-lg-4 opacity-75">Testimonials</a>
                <a href="#contact" class="nav-link text-white me-lg-4 opacity-75">Contact</a>
                <router-link to="/login" class="btn btn-outline-light rounded-pill px-4 me-2">Login</router-link>
                <router-link to="/register" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm">Join Chama</router-link>
              </div>
            </div>
          </div>
        </nav>

        <!-- Hero Content -->
        <div class="hero-content text-center">
          <div class="hero-badge mb-4">
            <span class="badge-glass">
              <i class="bi bi-people-fill me-1"></i> Together We Grow
            </span>
          </div>
          
          <h1 class="hero-title">
            Empowering Communities,
            <span class="highlight-text">One Contribution at a Time</span>
          </h1>
          
          <p class="hero-subtitle mx-auto">
            Join thousands of Chama groups using our platform to save together, 
            access loans easily, and achieve financial freedom as a community.
          </p>
          
          <div class="hero-buttons d-flex gap-3 justify-content-center mt-4">
            <router-link to="/register" class="btn btn-warning btn-lg rounded-pill px-5 py-3 fw-bold shadow">
              <i class="bi bi-rocket-takeoff me-2"></i>Start Your Chama
            </router-link>
            <router-link to="/login" class="btn btn-outline-light btn-lg rounded-pill px-5 py-3">
              <i class="bi bi-box-arrow-in-right me-2"></i>Sign In
            </router-link>
          </div>
          
          <!-- Modern Stats Section - No Container -->
          <div class="hero-stats mt-5 pt-5">
            <div class="row g-4 text-center">
              <div class="col-md-4">
                <i class="bi bi-people-fill stat-icon"></i>
                <h2 class="fw-bold mb-0 text-white display-5">10,000+</h2>
                <p class="text-white-50 small text-uppercase fw-bold mt-2">Active Members</p>
              </div>
              <div class="col-md-4">
                <i class="bi bi-cash-stack stat-icon"></i>
                <h2 class="fw-bold mb-0 text-white display-5">KES 500M+</h2>
                <p class="text-white-50 small text-uppercase fw-bold mt-2">Total Savings</p>
              </div>
              <div class="col-md-4">
                <i class="bi bi-grid-3x3-gap-fill stat-icon"></i>
                <h2 class="fw-bold mb-0 text-white display-5">5,000+</h2>
                <p class="text-white-50 small text-uppercase fw-bold mt-2">Chama Groups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scroll Hint -->
      <div class="scroll-hint">
        <div class="mouse">
          <div class="wheel"></div>
        </div>
        <p class="mt-2 small text-white-50">Scroll to explore</p>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-badge glass-badge-dark">Why Choose Us</span>
          <h2>Everything You Need to Run Your Chama</h2>
          <p>Powerful tools to manage contributions, loans, and member engagement</p>
        </div>

        <div class="row g-4">
          <div class="col-md-6 col-lg-4">
            <div class="feature-card glass-card">
              <div class="feature-icon">
                <i class="bi bi-cash-stack"></i>
              </div>
              <h4>Easy Contributions</h4>
              <p>Track member contributions automatically with M-Pesa integration. Get real-time updates and receipts.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card glass-card">
              <div class="feature-icon">
                <i class="bi bi-bank"></i>
              </div>
              <h4>Instant Loans</h4>
              <p>Members can apply for loans, and treasurers can approve and disburse funds directly to M-Pesa.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card glass-card">
              <div class="feature-icon">
                <i class="bi bi-phone"></i>
              </div>
              <h4>M-Pesa Integration</h4>
              <p>Seamless M-Pesa payments for contributions, loan repayments, and dividend distributions.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card glass-card">
              <div class="feature-icon">
                <i class="bi bi-calendar-event"></i>
              </div>
              <h4>Meeting Management</h4>
              <p>Schedule meetings, track attendance, share minutes, and conduct virtual meetings with ease.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card glass-card">
              <div class="feature-icon">
                <i class="bi bi-graph-up"></i>
              </div>
              <h4>Financial Reports</h4>
              <p>Generate detailed financial statements, member statements, and audit trails instantly.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="feature-card glass-card">
              <div class="feature-icon">
                <i class="bi bi-bell"></i>
              </div>
              <h4>Smart Notifications</h4>
              <p>Automatic SMS and email reminders for payments, meetings, and loan approvals.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section id="benefits" class="benefits-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <div class="benefits-image">
              <div class="image-wrapper glass-card-deep">
                <i class="bi bi-people-fill"></i>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="benefits-content">
              <span class="section-badge glass-badge-dark">Community First</span>
              <h2>Together We Achieve More</h2>
              <p>Our platform is built on the principle that communities thrive when they save and invest together.</p>
              
              <div class="benefit-list">
                <div class="benefit-item glass-item">
                  <div class="benefit-icon"><i class="bi bi-shield-check"></i></div>
                  <div>
                    <h5>Secure & Transparent</h5>
                    <p>All transactions are recorded and auditable. Every member can view their contributions and loan status.</p>
                  </div>
                </div>
                <div class="benefit-item glass-item">
                  <div class="benefit-icon"><i class="bi bi-clock-history"></i></div>
                  <div>
                    <h5>24/7 Access</h5>
                    <p>Access your Chama information anytime, anywhere from any device.</p>
                  </div>
                </div>
                <div class="benefit-item glass-item">
                  <div class="benefit-icon"><i class="bi bi-graph-up"></i></div>
                  <div>
                    <h5>Financial Growth</h5>
                    <p>Watch your savings grow with competitive interest rates and investment opportunities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-badge glass-badge-dark">Simple Process</span>
          <h2>How ChamaSystem Works</h2>
          <p>Get started in three easy steps</p>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <div class="step-card glass-card">
              <div class="step-number">1</div>
              <div class="step-icon"><i class="bi bi-person-plus"></i></div>
              <h4>Join a Chama</h4>
              <p>Register as a member and join an existing Chama or create your own group.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="step-card glass-card">
              <div class="step-number">2</div>
              <div class="step-icon"><i class="bi bi-cash-stack"></i></div>
              <h4>Make Contributions</h4>
              <p>Pay your monthly contributions via M-Pesa and track your savings in real-time.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="step-card glass-card">
              <div class="step-number">3</div>
              <div class="step-icon"><i class="bi bi-gift"></i></div>
              <h4>Grow Together</h4>
              <p>Access loans, earn dividends, and watch your community prosper together.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="testimonials-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-badge glass-badge-dark">Testimonials</span>
          <h2>What Our Community Says</h2>
          <p>Trusted by thousands of Chama members across Africa</p>
        </div>

        <div class="row g-4">
          <div class="col-md-6 col-lg-4">
            <div class="testimonial-card glass-card">
              <div class="testimonial-rating">
                <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
              </div>
              <p class="testimonial-text">"ChamaSystem has transformed how our group operates. No more manual record-keeping! M-Pesa integration is a game-changer."</p>
              <div class="testimonial-author">
                <div class="author-avatar">JW</div>
                <div>
                  <div class="author-name">Jane Wanjiku</div>
                  <div class="author-role">Chairperson, Umoja Chama</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="testimonial-card glass-card">
              <div class="testimonial-rating">
                <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
              </div>
              <p class="testimonial-text">"Applying for loans is now so easy! The approval process is fast, and funds are sent directly to my M-Pesa. Highly recommend!"</p>
              <div class="testimonial-author">
                <div class="author-avatar">MO</div>
                <div>
                  <div class="author-name">Michael Otieno</div>
                  <div class="author-role">Member, Tujenge Chama</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="testimonial-card glass-card">
              <div class="testimonial-rating">
                <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
              </div>
              <p class="testimonial-text">"The reporting feature saves us hours of work. We can generate financial statements instantly and share with all members."</p>
              <div class="testimonial-author">
                <div class="author-avatar">SK</div>
                <div>
                  <div class="author-name">Sarah Kariuki</div>
                  <div class="author-role">Treasurer, Maendeleo Chama</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content glass-cta text-center">
          <h2>Ready to Transform Your Chama?</h2>
          <p>Join thousands of groups already using ChamaSystem to manage their finances better.</p>
          <div class="cta-buttons d-flex gap-3 justify-content-center mt-4">
            <router-link to="/register" class="btn btn-warning btn-lg rounded-pill px-5 py-3 fw-bold shadow">
              <i class="bi bi-person-plus me-2"></i>Start Free Trial
            </router-link>
            <button class="btn btn-outline-light btn-lg rounded-pill px-5 py-3" @click="scrollToContact">
              <i class="bi bi-chat-dots me-2"></i>Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer glass-footer">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-4 mb-md-0">
            <div class="logo mb-3 d-flex align-items-center gap-2">
              <div class="logo-icon">💰</div>
              <span class="logo-text">Chama<span>System</span></span>
            </div>
            <p class="text-muted">Empowering communities through smart financial management.</p>
            <div class="social-links">
              <a href="#"><i class="bi bi-twitter-x"></i></a>
              <a href="#"><i class="bi bi-facebook"></i></a>
              <a href="#"><i class="bi bi-linkedin"></i></a>
              <a href="#"><i class="bi bi-instagram"></i></a>
            </div>
          </div>
          <div class="col-md-2 mb-4 mb-md-0">
            <h6>Product</h6>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div class="col-md-2 mb-4 mb-md-0">
            <h6>Company</h6>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h6>Contact Us</h6>
            <ul>
              <li><i class="bi bi-envelope me-2"></i> info@chamasystem.com</li>
              <li><i class="bi bi-telephone me-2"></i> +254 700 000 000</li>
              <li><i class="bi bi-geo-alt me-2"></i> Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom text-center pt-4 mt-4">
          <p class="mb-0 text-muted">&copy; 2024 ChamaSystem. All rights reserved. Together We Grow.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const scrollToContact = () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}

// Navbar scroll effect
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar')
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled')
      } else {
        nav.classList.remove('scrolled')
      }
    }
  })
}
</script>

<style scoped>
.landing-page {
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Hero Section with Dynamic Gradient - Fixed Contrast */
.hero-section {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(to bottom, rgba(0, 30, 0, 0.85), rgba(0, 30, 0, 0.3), rgba(0, 30, 0, 0.9)),
              url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  overflow: hidden;
}

/* Floating Navigation - Glass Effect */
.navbar {
  transition: all 0.3s ease;
  padding-top: 1rem !important;
}

.navbar.scrolled .container-fluid {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.navbar.scrolled .nav-link {
  color: #1a1a2e !important;
}

.navbar.scrolled .navbar-brand .logo-text {
  color: #1a1a2e !important;
}

.navbar.scrolled .btn-outline-light {
  border-color: #2E7D32;
  color: #2E7D32;
}

.navbar.scrolled .btn-outline-light:hover {
  background: #2E7D32;
  color: white;
}

.logo-icon {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #FFD700, #FFA000);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.logo-text span {
  color: #FFD700;
}

.nav-link {
  transition: all 0.3s;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.nav-link:hover {
  opacity: 1 !important;
  transform: translateY(-1px);
}

/* Hero Content */
.hero-content {
  padding: 150px 0 80px;
  position: relative;
  z-index: 1;
}

.hero-badge {
  margin-bottom: 24px;
}

.badge-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 8px 24px;
  border-radius: 50px;
  color: white;
  font-weight: 500;
  letter-spacing: 0.5px;
  font-size: 14px;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.2;
  color: white;
  letter-spacing: -1px;
}

.highlight-text {
  color: #FFC107;
  display: inline-block;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
}

/* Button Styles */
.btn-warning {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  border: none;
  transition: all 0.3s;
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  background: linear-gradient(135deg, #FFE000, #FFB300);
}

.btn-outline-light {
  border-width: 2px;
  transition: all 0.3s;
}

.btn-outline-light:hover {
  transform: translateY(-2px);
  background: white;
  color: #1a1a2e;
  border-color: white;
}

/* Stats Section - Clean, No Container */
.hero-stats {
  margin-top: 80px;
}

.stat-icon {
  font-size: 32px;
  color: #FFC107;
  margin-bottom: 16px;
  display: inline-block;
}

/* Scroll Hint */
.scroll-hint {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
  cursor: pointer;
  animation: bounce 2s infinite;
}

.mouse {
  width: 26px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  position: relative;
  margin: 0 auto;
}

.wheel {
  width: 4px;
  height: 8px;
  background: white;
  border-radius: 2px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  animation: scroll 1.5s infinite;
}

@keyframes scroll {
  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(15px); }
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

/* Features Section */
.features-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
}

.section-header {
  margin-bottom: 60px;
}

.section-badge {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.glass-badge-dark {
  background: rgba(46, 125, 50, 0.15);
  backdrop-filter: blur(4px);
  color: #2E7D32;
  border: 1px solid rgba(46, 125, 50, 0.2);
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a2e;
}

.section-header p {
  color: #4a5568;
  font-size: 18px;
}

/* Glass Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(46, 125, 50, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(46, 125, 50, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
.glass-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(46, 125, 50, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-card {
  padding: 32px;
  text-align: center;
  height: 100%;
}

.feature-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.feature-icon i {
  font-size: 32px;
  color: white;
}

.feature-card h4 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.feature-card p {
  color: #4a5568;
  line-height: 1.6;
}

/* Benefits Section */
.benefits-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.benefits-image .image-wrapper {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.glass-card-deep {
  background: rgba(46, 125, 50, 0.15);
  backdrop-filter: blur(16px);
  border-radius: 32px;
  border: 1px solid rgba(46, 125, 50, 0.2);
}

.benefits-image i {
  font-size: 120px;
  color: #2E7D32;
  opacity: 0.8;
  position: relative;
  z-index: 1;
}

.benefits-content h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a2e;
}

.benefits-content > p {
  color: #4a5568;
  margin-bottom: 32px;
}

.benefit-item {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.glass-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(46, 125, 50, 0.1);
  transition: all 0.3s ease;
}

.glass-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(8px);
}

.benefit-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-icon i {
  font-size: 24px;
  color: white;
}

.benefit-item h5 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a2e;
}

.benefit-item p {
  color: #4a5568;
  font-size: 14px;
}

/* How It Works */
.how-it-works {
  padding: 80px 0;
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
}

.step-card {
  padding: 40px 24px;
  text-align: center;
  position: relative;
  height: 100%;
}

.step-number {
  position: absolute;
  top: -20px;
  left: 20px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: #1a1a2e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.step-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.step-icon i {
  font-size: 40px;
  color: white;
}

.step-card h4 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.step-card p {
  color: #4a5568;
}

/* Testimonials */
.testimonials-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #a5d6a7 0%, #81c784 100%);
}

.testimonial-card {
  padding: 32px;
  height: 100%;
}

.testimonial-rating {
  margin-bottom: 20px;
  color: #FFD700;
}

.testimonial-text {
  font-size: 16px;
  line-height: 1.6;
  color: #2d3748;
  margin-bottom: 24px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.author-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #1a1a2e;
}

.author-role {
  font-size: 12px;
  color: #4a5568;
}

/* CTA Section */
.cta-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.glass-cta {
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.95), rgba(27, 94, 32, 0.95));
  backdrop-filter: blur(10px);
  border-radius: 48px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 60px 40px;
  color: white;
}

.glass-cta h2 {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 16px;
}

.glass-cta p {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.95;
}

/* Footer */
.glass-footer {
  background: rgba(10, 25, 15, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 60px 0 30px;
}

.glass-footer .logo-text {
  color: white;
}

.glass-footer h6 {
  margin-bottom: 20px;
  font-weight: 600;
  color: white;
}

.glass-footer ul {
  list-style: none;
  padding: 0;
}

.glass-footer ul li {
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.glass-footer ul li a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s;
}

.glass-footer ul li a:hover {
  color: #FFD700;
}

.social-links {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.social-links a {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}

.social-links a:hover {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  transform: translateY(-3px);
  color: #1a1a2e;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 16px;
    padding: 0 20px;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
    gap: 16px !important;
  }
  
  .hero-buttons .btn {
    width: 80%;
  }
  
  .section-header h2 {
    font-size: 28px;
  }
  
  .benefits-image {
    margin-bottom: 32px;
  }
  
  .glass-cta {
    padding: 40px 24px;
  }
  
  .glass-cta h2 {
    font-size: 28px;
  }
  
  .hero-stats {
    margin-top: 50px;
  }
  
  .stat-icon {
    font-size: 28px;
  }
  
  .hero-stats h2 {
    font-size: 28px !important;
  }
}
</style>