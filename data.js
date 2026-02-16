// Portfolio Data and Functionality
document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // Mobile Menu Functionality
  // ============================================
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuToggle && mobileMenuOverlay) {
    mobileMenuToggle.addEventListener('click', function () {
      mobileMenuOverlay.classList.toggle('active');
      const isActive = mobileMenuOverlay.classList.contains('active');
      document.body.style.overflow = isActive ? 'hidden' : '';
      mobileMenuToggle.setAttribute('aria-expanded', isActive);
    });

    // Close mobile menu when clicking on overlay
    mobileMenuOverlay.addEventListener('click', function (e) {
      if (e.target === mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close mobile menu when clicking on nav links
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function () {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================
  // Smooth Scrolling
  // ============================================
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // Scroll Progress Bar
  // ============================================
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollProgress.style.width = scrolled + '%';
    });
  }

  // ============================================
  // Parallax Background
  // ============================================
  class ParallaxManager {
    constructor() {
      this.orbs = document.querySelectorAll('.parallax-orb');
      this.grid = document.querySelector('.parallax-grid');
      this.init();
    }

    init() {
      if (!this.orbs.length) return;
      window.addEventListener('scroll', () => this.handleScroll());
      window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleScroll() {
      const scrolled = window.scrollY;

      this.orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.1;
        const yPos = -(scrolled * speed);
        orb.style.transform = `translateY(${yPos}px)`;
      });

      if (this.grid) {
        this.grid.style.transform = `translateY(${scrolled * 0.05}px)`;
      }
    }

    handleMouseMove(e) {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;

      this.orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (mouseX - 0.5) * speed;
        const yOffset = (mouseY - 0.5) * speed;

        // Combine with existing scroll transform
        const currentTransform = orb.style.transform.split('translateY')[1] || '(0px)';
        const scrollY = currentTransform.replace(/[()px]/g, '');

        orb.style.transform = `translate(${xOffset}px, ${parseFloat(scrollY) + yOffset}px)`;
      });
    }
  }

  new ParallaxManager();

  // ============================================
  // 3D Tilt Effect for Cards
  // ============================================
  class TiltEffect {
    constructor(cards) {
      this.cards = cards;
      this.init();
    }

    init() {
      this.cards.forEach(card => {
        card.classList.add('tilt-card');

        // Wrap content if not already wrapped
        if (!card.querySelector('.tilt-content')) {
          const content = card.innerHTML;
          card.innerHTML = `<div class="tilt-content">${content}</div>`;
        }

        card.addEventListener('mousemove', (e) => this.handleMove(e, card));
        card.addEventListener('mouseleave', () => this.handleLeave(card));
      });
    }

    handleMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
      const rotateY = ((x - centerX) / centerX) * 5;

      const content = card.querySelector('.tilt-content');
      content.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    }

    handleLeave(card) {
      const content = card.querySelector('.tilt-content');
      content.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      content.style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        content.style.transition = '';
      }, 500);
    }
  }

  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards.length) {
    new TiltEffect(projectCards);
  }

  // ============================================
  // Staggered Animations
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  // Helper to add stagger classes
  const animateGroup = (elements) => {
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';

      // Add stagger delay
      const delay = (index % 4) * 100;
      el.style.transitionDelay = `${delay}ms`;

      observer.observe(el);
    });
  };

  animateGroup(document.querySelectorAll('.project-card'));
  animateGroup(document.querySelectorAll('.stat-item'));
  animateGroup(document.querySelectorAll('.skill-category'));
  animateGroup(document.querySelectorAll('.contact-item'));

  // ============================================
  // Navbar active state
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navigationLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navigationLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink);

  // Navbar background
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'var(--color-bg-secondary)';
        navbar.style.borderBottomColor = 'var(--color-border)';
      } else {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.8)';
        navbar.style.borderBottomColor = 'transparent';
      }
    });
  }

  // ============================================
  // Contact Form
  // ============================================
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;

      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;

      // Simulate sending (replace with actual EmailJS if needed)
      setTimeout(() => {
        alert('Thank you for your message! This is a demo portfolio, so no email was sent.');
        contactForm.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 1500);
    });
  }

  // ============================================
  // Typing Effect (Rotating Text)
  // ============================================
  const typingElement = document.querySelector('.typing-text');
  if (typingElement) {
    const words = ["Coder", "Problem Solver", "Innovator"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; // Faster when deleting
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100; // Normal typing speed
      }

      if (!isDeleting && charIndex === currentWord.length) {
        // Word complete, pause before deleting
        isDeleting = true;
        typeSpeed = 2000;
      } else if (isDeleting && charIndex === 0) {
        // Deletion complete, move to next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    // Start the typing loop
    setTimeout(type, 1000);
  }

  // ============================================
  // Spotlight Effect
  // ============================================
  const spotlightCards = document.querySelectorAll('[data-spotlight]');
  if (spotlightCards.length) {
    document.addEventListener('mousemove', (e) => {
      spotlightCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // ============================================
  // Animated Counters
  // ============================================
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps

        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.innerText = target + "+";
            clearInterval(timer);
          } else {
            counter.innerText = Math.ceil(current);
          }
        }, 16);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // ============================================
  // Scroll Reveal Animation
  // ============================================
  const revealElements = document.querySelectorAll('.reveal-text');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  console.log('Portfolio Enhancements Loaded!');
});

