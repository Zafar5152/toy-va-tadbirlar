// Basic Interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });


    // Force Loader Hide (Backup)
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.querySelector('.loader-wrapper');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 1000);
            }
        }, 3000); // 3 seconds max wait
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth Scrolling for Safari/Edge without css scroll-behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });// Reveal on Scroll Animation
    const sections = document.querySelectorAll('section');
    const options = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-up');
                // stop observing once revealed (optional)
                // observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Booking Modal Logic ---
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-modal');
    const bookBtns = document.querySelectorAll('.open-booking');
    const bookingForm = document.getElementById('bookingForm');

    // UI Elements for Calculation
    const venueNameSpan = document.getElementById('selectedVenueName');
    const venueBasePriceInput = document.getElementById('venueBasePrice');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeSelect = document.getElementById('bookingTime');

    const basePriceDisplay = document.getElementById('basePriceDisplay');
    const discountDisplay = document.getElementById('discountDisplay');
    const discountPercentSpan = document.getElementById('discountPercent');
    const timeSurchargeDisplay = document.getElementById('timeSurcharge');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const alertBox = document.getElementById('dateAlert');

    // Open Modal
    bookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const venueName = btn.getAttribute('data-venue');
            const basePrice = parseInt(btn.getAttribute('data-price'));

            venueNameSpan.textContent = venueName;
            venueBasePriceInput.value = basePrice;

            // Set min date to today
            const today = new Date().toISOString().split('T')[0];
            bookingDateInput.setAttribute('min', today);

            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);

            calculatePrice(); // Initial calc logic
        });
    });

    // Close Modal
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            bookingForm.reset();
            alertBox.innerHTML = '<i class="fas fa-info-circle"></i> Sanani tanlang';
            alertBox.style.backgroundColor = '#fff3cd';
            alertBox.style.color = '#856404';
        }, 300);
    }

    // Calculation Logic
    function calculatePrice() {
        const basePrice = parseInt(venueBasePriceInput.value) || 0;
        const dateVal = bookingDateInput.value;
        const timeVal = bookingTimeSelect.value;

        if (!dateVal) {
            basePriceDisplay.textContent = `$${basePrice}`;
            discountDisplay.textContent = '-$0';
            timeSurchargeDisplay.textContent = '$0';
            totalPriceDisplay.textContent = `$${basePrice}`;
            return;
        }

        const date = new Date(dateVal);
        const day = date.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat

        let discountPercent = 0;
        let timeSurcharge = 0;
        let message = '';

        // Weekday Discount Logic
        // Monday (1) to Thursday (4): 20% Off
        // Friday (5): 10% Off
        // Saturday (6) & Sunday (0): 0% Off (Premium Days)

        if (day >= 1 && day <= 4) {
            discountPercent = 20;
            message = 'Ajoyib! Ish kunlari uchun 20% chegirma.';
        } else if (day === 5) {
            discountPercent = 10;
            message = 'Juma kuni uchun 10% maxsus chegirma.';
        } else {
            discountPercent = 0;
            message = 'Dam olish kunlari standart narxda.';
        }

        // Time Based Logic (Morning is cheaper/standard, Evening might have surcharge if demanded, usually just base)
        // Let's pretend Morning events get an extra $100 off for encouragement? 
        // Or keep it simple: No surcharge, just displaying 0 for now unless logic changes.
        if (timeVal === 'morning') {
            // Maybe small discount for morning?
            // discountPercent += 5; 
        }

        const discountAmount = (basePrice * discountPercent) / 100;
        const finalPrice = basePrice - discountAmount + timeSurcharge;

        // Render
        basePriceDisplay.textContent = `$${basePrice}`;
        discountPercentSpan.textContent = discountPercent;
        discountDisplay.textContent = `-$${discountAmount}`;
        timeSurchargeDisplay.textContent = `$${timeSurcharge}`;
        totalPriceDisplay.textContent = `$${finalPrice}`;

        // Update Alert
        alertBox.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        alertBox.style.backgroundColor = '#d4edda';
        alertBox.style.color = '#155724';
    }

    // Listen for changes
    bookingDateInput.addEventListener('change', calculatePrice);
    bookingTimeSelect.addEventListener('change', calculatePrice);

    // Confirm Booking Logic
    const confirmBtn = document.getElementById('confirmBooking');
    confirmBtn.addEventListener('click', () => {
        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const date = bookingDateInput.value;

        if (!name || !phone || !date) {
            alert("Iltimos, ism, telefon va sanani to'liq kiriting.");
            return;
        }

        // Calculate Final numbers again to be sure
        const basePrice = parseInt(venueBasePriceInput.value) || 0;
        // ... (re-use logic or grab from display) ...
        // Simpler: grab from total display (removing $ symbol)
        const totalText = totalPriceDisplay.textContent.replace('$', '').replace(',', '');
        const total = parseInt(totalText) || 0;
        const prepayment = total * 0.2;

        // Get Payment Method
        const paymentRadio = document.querySelector('input[name="payment"]:checked');
        const paymentMethod = paymentRadio ? paymentRadio.value : 'naqd';

        let paymentText = "";
        switch (paymentMethod) {
            case 'naqd': paymentText = "Naqd pul"; break;
            case 'karta': paymentText = "Karta (Uzcard/Humo)"; break;
            case 'click': paymentText = "Click"; break;
            case 'payme': paymentText = "Payme"; break;
            default: paymentText = "Naqd pul";
        }

        const message = `Hurmatli ${name}!\n\nBuyurtmangiz qabul qilindi.\n\nTanlangan sana: ${date}\nJami summa: $${total}\nTo'lov turi: ${paymentText}\n\nOldindan to'lov (20%): $${prepayment}\n\nTez orada ${phone} raqamiga menejerimiz bog'lanib, to'lov uchun hisob raqamini yuboradi.`;

        alert(message);
        closeModal();
    });

    // --- Lightbox Gallery Logic ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const captionText = document.querySelector('.lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-nav.prev');
    const nextBtn = document.querySelector('.lightbox-nav.next');

    // Expanded Gallery Images (More content as requested)
    const galleryItems = [
        {
            src: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: "Aslzodalar To'yi"
        },
        {
            src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: "Yozgi Bayram"
        },
        {
            src: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: "Korporativ Kecha"
        },
        {
            src: 'https://picsum.photos/id/883/1920/1080',
            title: "Tug'ilgan Kun (Magic City)"
        },
        // Extra images for "more info" experience
        {
            src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: "Kelin Ko'ylaklari"
        },
        {
            src: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: "Maxsus Bezaklar"
        }
    ];

    let currentImageIndex = 0;

    function openLightbox(index) {
        currentImageIndex = index;
        updateLightbox();
        lightbox.style.display = 'block';
    }

    function updateLightbox() {
        const item = galleryItems[currentImageIndex];
        lightboxImg.src = item.src;
        captionText.innerHTML = `<h3>${item.title}</h3><p>${currentImageIndex + 1} / ${galleryItems.length}</p>`;
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
        updateLightbox();
    }

    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightbox();
    }

    // Bind clicks to portfolio items (mapped to first 4 gallery items)
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') lightbox.style.display = 'none';
        }
    });

    if (closeLightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }

    // --- Video Player Logic ---
    const videoModal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    const closeVideo = document.querySelector('.close-video');
    const videoCards = document.querySelectorAll('.video-card');

    // Demo Video IDs (Reliable embeddable videos)
    const videoMap = {
        'VIDEO_ID_1': 'https://www.youtube.com/embed/LXb3EKWsInQ', // 4K Nature (Always works)
        'VIDEO_ID_2': 'https://www.youtube.com/embed/lM02vNMRRB0', // Wedding related (if available) or generic beautiful 
        'VIDEO_ID_3': 'https://www.youtube.com/embed/ysz5S6P_2_0'  // Existing one
    };

    videoCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            // cycle through demo videos
            const videoUrls = Object.values(videoMap);
            const url = videoUrls[index % videoUrls.length];

            // Adding mute=1 is critical for autoplay to work in many environments without interaction
            videoFrame.src = url + "?autoplay=1&mute=1";
            videoModal.style.display = 'flex';
            setTimeout(() => videoModal.classList.add('show'), 10);
        });
    });

    if (closeVideo) {
        closeVideo.addEventListener('click', () => {
            videoModal.classList.remove('show');
            setTimeout(() => {
                videoModal.style.display = 'none';
                videoFrame.src = ""; // Stop video
            }, 300);
        });
    }

    // Close video on outside click
    window.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideo.click(); // Reuse close logic
        }
    });

    // --- Statistics Counter Animation ---
    const statsSection = document.querySelector('.stats');
    const counters = document.querySelectorAll('.counter');
    let started = false;

    // Helper to start counting
    function startCounting(counter) {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const speed = 200; // lower is faster
        const inc = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(() => startCounting(counter), 20);
        } else {
            counter.innerText = target + "+"; // Add plus sign
        }
    }

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
            counters.forEach(counter => startCounting(counter));
            started = true;
        }
    }, { threshold: 0.1 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // --- FAQ Accordion ---
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;

            // Toggle active class
            question.classList.toggle('active');

            // Toggle max-height for smooth slide
            if (question.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = 0;
            }

            // Optional: Close other accordions
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                    otherQuestion.classList.remove('active');
                    otherQuestion.nextElementSibling.style.maxHeight = 0;
                }
            });
        });
    });

    // Smooth scroll fix repeat only for logic consistency if needed, but above block handles it.
});
