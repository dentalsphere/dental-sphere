// Dental Sphere - Main JS

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation & Scroll Effects
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 100) {
                el.classList.add('revealed');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // 3. Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Mobile Menu Toggle
    const navToggle = document.createElement('div');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    const navContent = document.querySelector('.nav-content');
    const navLinks = document.querySelector('.nav-links');
    
    if (navContent && navLinks) {
        navContent.insertBefore(navToggle, navLinks);
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.innerHTML = navLinks.classList.contains('active') ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });
    }

    // 5. Floating Action Buttons
    const callBtn = document.createElement('a');
    callBtn.href = 'tel:+919901994170';
    callBtn.className = 'call-float';
    callBtn.innerHTML = '<i class="fa-solid fa-phone"></i>';
    document.body.appendChild(callBtn);

    const waBtn = document.createElement('a');
    waBtn.href = 'https://wa.me/919901994170';
    waBtn.className = 'whatsapp-float';
    waBtn.target = '_blank';
    waBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    document.body.appendChild(waBtn);

    // 6. Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Client-side validation
            if (!data.name || data.name.trim().length < 2) {
                alert('Please enter a valid name (at least 2 characters).');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            if (!data.phone || data.phone.trim().length < 7) {
                alert('Please enter a valid phone number.');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    btn.innerHTML = 'Appointment Requested!';
                    btn.style.background = '#4CAF5A';
                    contactForm.reset();
                    alert('Thank you! Your appointment request has been sent successfully. We will contact you shortly.');
                } else {
                    let errorMsg = 'Failed to Send';
                    try {
                        const errorData = await response.json();
                        if (errorData.error) errorMsg = errorData.error;
                    } catch (e) {
                        // ignore JSON parse error
                    }
                    console.error('Appointment request failed:', response.status, errorMsg);
                    btn.innerHTML = 'Failed';
                    btn.style.background = '#D32F2F';
                    alert('Error: ' + errorMsg);
                }
            } catch (err) {
                console.error(err);
                btn.innerHTML = 'Network Error';
                btn.style.background = '#D32F2F';
                alert('Network Error. Please check your connection and try again.');
            }

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        });
    }
});
