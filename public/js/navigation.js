/**
 * Navigation Controller
 * Handles SPA-like section switching and mobile menu toggle
 */
(function () {
    'use strict';

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');

    // --- Mobile menu toggle ---
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function (e) {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    // --- Active nav link highlighting ---
    const navLinks = document.querySelectorAll('.nav-link');
    let currentPage = window.location.pathname.split('/').pop();
    if (!currentPage || currentPage === 'index') currentPage = 'index.html';
    if (currentPage === 'projects') currentPage = 'projects.html';
    if (currentPage === 'publications') currentPage = 'publications.html';
    if (currentPage === 'resume') currentPage = 'resume.html';

    navLinks.forEach(function (link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- Close mobile menu on nav link click ---
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // --- Publications filter ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const filter = btn.getAttribute('data-filter');

            // Update active button
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // Filter publications
            const publications = document.querySelectorAll('.publication');
            publications.forEach(function (pub) {
                if (filter === 'all') {
                    pub.style.display = '';
                } else {
                    const year = pub.getAttribute('data-year');
                    pub.style.display = year === filter ? '' : 'none';
                }
            });
        });
    });
})();
