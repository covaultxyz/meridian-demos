/* ============================================
   Amazon Appeal Generator — Landing Page JS
   CoVault 2026
   ============================================ */

(function () {
  'use strict';

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var navHeight = document.querySelector('.nav').offsetHeight;
      var targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
      // Close mobile nav if open
      var navLinks = document.getElementById('navLinks');
      var navToggle = document.getElementById('navToggle');
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });
  });

  // --- Nav scroll state ---
  var nav = document.getElementById('nav');
  function updateNavScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();

  // --- Mobile nav toggle ---
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // --- FAQ accordion ---
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      // Close all others
      faqItems.forEach(function (other) {
        other.classList.remove('active');
      });
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- Pricing card hover/select ---
  var pricingCards = document.querySelectorAll('.pricing-card');
  var planSelect = document.getElementById('plan');

  pricingCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var plan = card.getAttribute('data-plan');
      // Update form plan select
      if (planSelect && plan) {
        planSelect.value = plan;
        // Scroll to form
        var generateSection = document.getElementById('generate');
        if (generateSection) {
          var navHeight = document.querySelector('.nav').offsetHeight;
          var targetPos = generateSection.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      }
    });
  });

  // --- Animated counters on scroll ---
  var counters = document.querySelectorAll('.trust-number[data-target]');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    var metricsSection = document.querySelector('.trust-metrics');
    if (!metricsSection) return;

    var rect = metricsSection.getBoundingClientRect();
    var windowHeight = window.innerHeight;

    if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
      countersAnimated = true;

      counters.forEach(function (counter) {
        var target = parseInt(counter.getAttribute('data-target'), 10);
        var duration = 2000; // ms
        var startTime = null;
        var startVal = 0;

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var easedProgress = easeOutCubic(progress);
          var current = Math.round(startVal + (target - startVal) * easedProgress);

          // Format with commas for large numbers
          if (target >= 1000) {
            counter.textContent = current.toLocaleString();
          } else {
            counter.textContent = current;
          }

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
      });
    }
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  // Check on load in case already in view
  animateCounters();

  // --- Form validation and submission ---
  var form = document.getElementById('intakeForm');
  var submitBtn = document.getElementById('submitBtn');
  var formSuccess = document.getElementById('formSuccess');

  if (form) {
    var requiredFields = [
      { id: 'sellerName', errorId: 'sellerNameError', type: 'text' },
      { id: 'email', errorId: 'emailError', type: 'email' },
      { id: 'violationType', errorId: 'violationTypeError', type: 'select' },
      { id: 'plan', errorId: 'planError', type: 'select' },
      { id: 'description', errorId: 'descriptionError', type: 'textarea' }
    ];

    function validateField(field) {
      var el = document.getElementById(field.id);
      if (!el) return true;
      var value = el.value.trim();
      var isValid = true;

      if (!value) {
        isValid = false;
      } else if (field.type === 'email') {
        // Basic email regex
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRe.test(value);
      }

      if (!isValid) {
        el.classList.add('error');
      } else {
        el.classList.remove('error');
      }

      return isValid;
    }

    // Live validation on blur
    requiredFields.forEach(function (field) {
      var el = document.getElementById(field.id);
      if (el) {
        el.addEventListener('blur', function () {
          validateField(field);
        });
        el.addEventListener('input', function () {
          if (el.classList.contains('error')) {
            validateField(field);
          }
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = true;
      requiredFields.forEach(function (field) {
        if (!validateField(field)) {
          allValid = false;
        }
      });

      if (!allValid) {
        // Scroll to first error
        var firstError = form.querySelector('.error');
        if (firstError) {
          firstError.focus();
        }
        return;
      }

      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Generating...';

      // Collect form data
      var formData = {
        sellerName: document.getElementById('sellerName').value.trim(),
        email: document.getElementById('email').value.trim(),
        violationType: document.getElementById('violationType').value,
        plan: document.getElementById('plan').value,
        asin: document.getElementById('asin').value.trim(),
        description: document.getElementById('description').value.trim(),
        amazonEmail: document.getElementById('amazonEmail').value.trim()
      };

      // POST to API (placeholder endpoint)
      fetch('/appeals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(function (response) {
          // Show success regardless for now (placeholder)
          showSuccess();
        })
        .catch(function () {
          // Show success in demo mode (no backend yet)
          showSuccess();
        });
    });

    function showSuccess() {
      var formGrid = form.querySelector('.form-grid');
      var formSubmit = form.querySelector('.form-submit');
      if (formGrid) formGrid.style.display = 'none';
      if (formSubmit) formSubmit.style.display = 'none';
      if (formSuccess) formSuccess.classList.add('visible');
    }
  }
})();
