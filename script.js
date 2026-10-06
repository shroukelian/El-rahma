document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       PRELOADER
    ========================================= */

    const preloader = document.querySelector(".preloader");

    window.addEventListener("load", () => {

        setTimeout(() => {

            preloader.classList.add("hide");

        }, 700);

    });


    /* =========================================
       MOBILE MENU
    ========================================= */

    const menuToggle = document.getElementById("menuToggle");
    const nav = document.getElementById("nav");

    if (menuToggle && nav) {

        menuToggle.addEventListener("click", () => {

            nav.classList.toggle("open");

            const icon = menuToggle.querySelector("i");

            if (nav.classList.contains("open")) {

                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");

            } else {

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

            }

        });


        document.querySelectorAll(".nav-link").forEach(link => {

            link.addEventListener("click", () => {

                nav.classList.remove("open");

                const icon = menuToggle.querySelector("i");

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

            });

        });

    }


    /* =========================================
       HEADER SCROLL
    ========================================= */

    const header = document.getElementById("header");

    function handleHeader() {

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }

    window.addEventListener("scroll", handleHeader);

    handleHeader();


    /* =========================================
       ACTIVE NAVIGATION
    ========================================= */

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function updateActiveNav() {

        let current = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 160;

            if (window.scrollY >= sectionTop) {

                current = section.getAttribute("id");

            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === `#${current}`) {

                link.classList.add("active");

            }

        });

    }

    window.addEventListener("scroll", updateActiveNav);


    /* =========================================
       SCROLL REVEAL
    ========================================= */

    const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right"
    );


    const revealObserver = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    revealObserver.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.12
        }

    );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });


    /* =========================================
       COUNTERS
    ========================================= */

    const counters = document.querySelectorAll(".counter");

    let countersStarted = false;


    function startCounters() {

        if (countersStarted) return;

        countersStarted = true;


        counters.forEach(counter => {

            const target = Number(counter.dataset.target);

            let current = 0;

            const duration = 1800;

            const increment = target / (duration / 16);


            function updateCounter() {

                current += increment;

                if (current >= target) {

                    counter.textContent = target;

                    return;

                }

                counter.textContent = Math.floor(current);

                requestAnimationFrame(updateCounter);

            }


            updateCounter();

        });

    }


    const statsSection = document.querySelector(".stats-section");


    if (statsSection) {

        const statsObserver = new IntersectionObserver(

            entries => {

                if (entries[0].isIntersecting) {

                    startCounters();

                    statsObserver.disconnect();

                }

            },

            {
                threshold: 0.3
            }

        );


        statsObserver.observe(statsSection);

    }


    /* =========================================
       GALLERY FILTER
    ========================================= */

    const filterButtons = document.querySelectorAll(".filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter = button.dataset.filter;


            filterButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            button.classList.add("active");


            galleryItems.forEach(item => {

                const category = item.classList.contains(filter);


                if (filter === "all" || category) {

                    item.classList.remove("hide");

                    item.animate(

                        [
                            {
                                opacity: 0,
                                transform: "scale(.9)"
                            },
                            {
                                opacity: 1,
                                transform: "scale(1)"
                            }
                        ],

                        {
                            duration: 400,
                            easing: "ease"
                        }

                    );

                } else {

                    item.classList.add("hide");

                }

            });

        });

    });


    /* =========================================
       LIGHTBOX
    ========================================= */

    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxClose = document.getElementById("lightboxClose");


    document.querySelectorAll(".gallery-item img").forEach(image => {

        image.addEventListener("click", () => {

            lightboxImage.src = image.src;

            lightboxImage.alt = image.alt;

            lightbox.classList.add("active");

            document.body.classList.add("no-scroll");

        });

    });


    function closeLightbox() {

        lightbox.classList.remove("active");

        document.body.classList.remove("no-scroll");

    }


    lightboxClose.addEventListener("click", closeLightbox);


    lightbox.addEventListener("click", event => {

        if (event.target === lightbox) {

            closeLightbox();

        }

    });


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            closeLightbox();

        }

    });


    /* =========================================
       FAQ ACCORDION
    ========================================= */

    const faqItems = document.querySelectorAll(".faq-item");


    faqItems.forEach(item => {

        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");


        question.addEventListener("click", () => {

            const isActive = item.classList.contains("active");


            faqItems.forEach(otherItem => {

                otherItem.classList.remove("active");

                const otherAnswer =
                    otherItem.querySelector(".faq-answer");

                otherAnswer.style.maxHeight = null;

            });


            if (!isActive) {

                item.classList.add("active");

                answer.style.maxHeight =
                    answer.scrollHeight + "px";

            }

        });

    });


    /* =========================================
       SMOOTH SCROLL
    ========================================= */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (
                targetId === "#" ||
                !document.querySelector(targetId)
            ) {

                return;

            }


            event.preventDefault();


            const target = document.querySelector(targetId);

            const headerHeight =
                document.querySelector(".header").offsetHeight;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight;


            window.scrollTo({

                top: targetPosition,

                behavior: "smooth"

            });

        });

    });


    /* =========================================
       PARALLAX HERO
    ========================================= */

    const heroBg = document.querySelector(".hero-bg");


    window.addEventListener("scroll", () => {

        if (!heroBg) return;

        const scroll = window.scrollY;


        if (scroll < 900) {

            heroBg.style.transform =
                `scale(1.04) translateY(${scroll * 0.12}px)`;

        }

    });


    /* =========================================
       BUTTON RIPPLE
    ========================================= */

    document.querySelectorAll(".btn").forEach(button => {

        button.addEventListener("click", function (event) {

            const ripple = document.createElement("span");

            ripple.style.position = "absolute";
            ripple.style.width = "10px";
            ripple.style.height = "10px";
            ripple.style.borderRadius = "50%";
            ripple.style.background = "rgba(255,255,255,.35)";
            ripple.style.pointerEvents = "none";


            const rect = this.getBoundingClientRect();


            ripple.style.left =
                `${event.clientX - rect.left}px`;

            ripple.style.top =
                `${event.clientY - rect.top}px`;


            this.style.position = "relative";
            this.style.overflow = "hidden";


            this.appendChild(ripple);


            ripple.animate(

                [
                    {
                        transform: "translate(-50%,-50%) scale(1)",
                        opacity: 1
                    },
                    {
                        transform: "translate(-50%,-50%) scale(30)",
                        opacity: 0
                    }
                ],

                {
                    duration: 600,
                    easing: "ease-out"
                }

            ).onfinish = () => {

                ripple.remove();

            };

        });

    });


    /* =========================================
       TILT EFFECT FOR CARDS
    ========================================= */

    const tiltCards = document.querySelectorAll(
        ".service-card, .why-card"
    );


    tiltCards.forEach(card => {

        card.addEventListener("mousemove", event => {

            const rect = card.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;


            const centerX = rect.width / 2;
            const centerY = rect.height / 2;


            const rotateX =
                ((y - centerY) / centerY) * -3;

            const rotateY =
                ((x - centerX) / centerX) * 3;


            card.style.transform =
                `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-7px)`;

        });


        card.addEventListener("mouseleave", () => {

            card.style.transform = "";

        });

    });


    /* =========================================
       PHONE / WHATSAPP LOGGING
    ========================================= */

    document.querySelectorAll(
        'a[href^="tel:"], a[href*="wa.me"]'
    ).forEach(link => {

        link.addEventListener("click", () => {

            console.log(
                "Contact clicked:",
                link.getAttribute("href")
            );

        });

    });

});