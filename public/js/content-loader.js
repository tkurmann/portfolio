/**
 * Content Loader
 * Fetches JSON data and renders page content dynamically
 */
(function () {
    'use strict';

    /**
     * Load and render the About page content
     */
    async function loadAbout() {
        try {
            const data = await fetchData('data/about.json');
            renderAbout(data);
        } catch (err) {
            console.warn('Could not load about.json:', err);
        }
    }

    /**
     * Load and render the Publications page content
     */
    async function loadPublications() {
        try {
            const data = await fetchData('data/publications.json');
            renderPublications(data);
        } catch (err) {
            console.warn('Could not load publications.json:', err);
            var container = document.getElementById('publications-container');
            if (container) {
                container.innerHTML = '<p class="loading-placeholder">Could not load publications.</p>';
            }
        }
    }

    /**
     * Load and render the Projects page content
     */
    async function loadProjects() {
        try {
            const data = await fetchData('data/projects.json');
            renderProjects(data);
        } catch (err) {
            console.warn('Could not load projects.json:', err);
            document.getElementById('projects-list').innerHTML =
                '<p class="loading-placeholder">Could not load projects.</p>';
        }
    }

    /**
     * Load and render the Resume page content
     */
    async function loadResume() {
        try {
            const data = await fetchData('data/resume.json');
            renderResume(data);
        } catch (err) {
            console.warn('Could not load resume.json:', err);
            document.getElementById('resume-content').innerHTML =
                '<p class="loading-placeholder">Could not load resume.</p>';
        }
    }

    /**
     * Generic fetch for JSON files
     */
    async function fetchData(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch ${path}`);
        return response.json();
    }

    /**
     * Render About page
     */
    function renderAbout(data) {
        const nameEl = document.getElementById('name');
        if (nameEl) nameEl.textContent = data.name || '';

        const titleEl = document.getElementById('title');
        if (titleEl) titleEl.textContent = data.title || '';

        const affiliationEl = document.getElementById('affiliation');
        if (affiliationEl) affiliationEl.textContent = data.affiliation || '';

        const interestsEl = document.getElementById('interests');
        if (interestsEl && data.researchInterests) {
            interestsEl.innerHTML = data.researchInterests
                .map(function (interest) {
                    return '<span class="badge">' + escapeHtml(interest) + '</span>';
                })
                .join('');
        }

        const bioEl = document.getElementById('bio');
        if (bioEl && data.bio) {
            const bios = Array.isArray(data.bio) ? data.bio : [data.bio];
            bioEl.innerHTML = bios.map(function (paragraph) {
                return '<p>' + escapeHtml(paragraph) + '</p>';
            }).join('');
        }

        // Update email (obfuscated to prevent bot scraping)
        const emailLink = document.getElementById('email-link');
        if (emailLink && data.socialLinks && data.socialLinks.email) {
            var rawEmail = data.socialLinks.email.replace('mailto:', '');
            var obfuscated = obfuscateEmail(rawEmail);
            emailLink.href = 'mailto:' + rawEmail;
            emailLink.textContent = obfuscated.display;
            emailLink.setAttribute('data-user', obfuscated.user);
            emailLink.setAttribute('data-domain', obfuscated.domain);
            emailLink.addEventListener('click', function(e) {
                e.preventDefault();
                var reconstructed = 'mailto:' + this.getAttribute('data-user') + '@' + this.getAttribute('data-domain');
                window.location.href = reconstructed;
            });
        }

        // Update social links in sidebar
        updateSocialLinks(data.socialLinks);
    }

    /**
     * Render publications helper function
     */
    function renderPublicationItem(pub) {
        var linksHtml = '';
        if (pub.pdf) linksHtml += '<a href="' + escapeHtml(pub.pdf) + '" target="_blank" rel="noopener" class="pub-link">PDF</a>';
        if (pub.code) linksHtml += '<a href="' + escapeHtml(pub.code) + '" target="_blank" rel="noopener" class="pub-link">Code</a>';
        if (pub.page) linksHtml += '<a href="' + escapeHtml(pub.page) + '" target="_blank" rel="noopener" class="pub-link">Page</a>';
        if (pub.dataset) linksHtml += '<a href="' + escapeHtml(pub.dataset) + '" target="_blank" rel="noopener" class="pub-link">Dataset</a>';
        if (pub.citation) linksHtml += '<a href="#" class="pub-link" onclick="alert(\'' + escapeHtml(pub.citation).replace(/'/g, "\\'") + '\'); return false;">Cite</a>';
        if (pub.type === 'patent') linksHtml += '<span class="pub-link" style="cursor:default;">Patent</span>';

        var awardHtml = pub.award ? '<span class="pub-award">' + escapeHtml(pub.award) + '</span>' : '';

        return '<div class="publication" data-year="' + (pub.year || '') + '">' +
            '<div class="pub-title">' + escapeHtml(pub.title) + '</div>' +
            '<div class="pub-authors">' + escapeHtml(pub.authors) + '</div>' +
            '<div class="pub-venue">' + escapeHtml(pub.venue) + (pub.year ? ', ' + pub.year : '') + '</div>' +
            (pub.abstract ? '<p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.5rem;">' + escapeHtml(pub.abstract) + '</p>' : '') +
            '<div class="pub-links">' + linksHtml + awardHtml + '</div>' +
            '</div>';
    }

    /**
     * Render Publications page
     */
    function renderPublications(data) {
        // Handle new two-section format
        if (data.firstAuthor && data.coAuthored) {
            // Render first author publications
            var firstAuthorList = document.getElementById('first-author-list');
            if (firstAuthorList && data.firstAuthor.length > 0) {
                var sortedFirst = data.firstAuthor.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
                firstAuthorList.innerHTML = sortedFirst.map(function (pub) {
                    return renderPublicationItem(pub);
                }).join('');
            }

            // Render co-authored publications
            var coAuthoredList = document.getElementById('co-authored-list');
            if (coAuthoredList && data.coAuthored.length > 0) {
                var sortedCo = data.coAuthored.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
                coAuthoredList.innerHTML = sortedCo.map(function (pub) {
                    return renderPublicationItem(pub);
                }).join('');
            }

            // Render patents
            var patentsList = document.getElementById('patents-list');
            if (patentsList && data.patents && data.patents.length > 0) {
                var sortedPatents = data.patents.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
                patentsList.innerHTML = sortedPatents.map(function (patent) {
                    return renderPublicationItem(patent);
                }).join('');
            }
            return;
        }

        // Legacy format (array)
        var container = document.getElementById('publications-list');
        if (!container || !data || data.length === 0) return;

        data.sort(function (a, b) { return (b.year || 0) - (a.year || 0); });

        container.innerHTML = data.map(function (pub) {
            return renderPublicationItem(pub);
        }).join('');
    }

    /**
     * Render Projects page
     */
    function renderProjects(projects) {
        var container = document.getElementById('projects-list');
        if (!container || !projects || projects.length === 0) return;

        container.innerHTML = projects.map(function (project) {
            var imageHtml = '';
            if (project.image) {
                imageHtml = '<div class="project-image"><img src="' + escapeHtml(project.image) + '" alt="' + escapeHtml(project.name) + '"></div>';
            }

            var techHtml = '';
            if (project.techStack && project.techStack.length > 0) {
                techHtml = '<div class="project-tech">' +
                    project.techStack.map(function (tech) {
                        return '<span class="badge">' + escapeHtml(tech) + '</span>';
                    }).join('') +
                    '</div>';
            }

            var linksHtml = '';
            if (project.github) linksHtml += '<a href="' + escapeHtml(project.github) + '" target="_blank" rel="noopener">GitHub</a>';
            if (project.demo) linksHtml += '<a href="' + escapeHtml(project.demo) + '" target="_blank" rel="noopener">Demo</a>';

            return '<div class="project-card">' +
                imageHtml +
                '<div class="project-body">' +
                '<h3>' + escapeHtml(project.name) + '</h3>' +
                '<p>' + escapeHtml(project.description || '') + '</p>' +
                techHtml +
                '<div class="project-links">' + linksHtml + '</div>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    /**
     * Render Resume page
     */
    function renderResume(data) {
        var container = document.getElementById('resume-content');
        if (!container) return;

        var html = '';

        // Education
        if (data.education && data.education.length > 0) {
            html += '<div class="resume-section"><h2>Education</h2><div class="timeline">';
            data.education.forEach(function (edu) {
                html += '<div class="timeline-item">' +
                    '<h3>' + escapeHtml(edu.degree) + '</h3>' +
                    '<div class="meta">' + escapeHtml(edu.institution) + ' · ' + escapeHtml(edu.year) + '</div>';
                if (edu.thesis) html += '<p>Thesis: ' + escapeHtml(edu.thesis) + '</p>';
                html += '</div>';
            });
            html += '</div></div>';
        }

        // Experience
        if (data.experience && data.experience.length > 0) {
            html += '<div class="resume-section"><h2>Experience</h2><div class="timeline">';
            data.experience.forEach(function (exp) {
                html += '<div class="timeline-item">' +
                    '<h3>' + escapeHtml(exp.role) + '</h3>' +
                    '<div class="meta">' + escapeHtml(exp.company) + ' · ' + escapeHtml(exp.period) + '</div>';
                if (exp.description) html += '<p>' + escapeHtml(exp.description) + '</p>';
                html += '</div>';
            });
            html += '</div></div>';
        }

        // Skills
        if (data.skills) {
            html += '<div class="resume-section"><h2>Skills</h2><div class="skills-grid">';
            for (var category in data.skills) {
                if (data.skills.hasOwnProperty(category)) {
                    html += '<div class="skill-category">' +
                        '<h4>' + escapeHtml(category) + '</h4>' +
                        '<ul>' +
                        data.skills[category].map(function (skill) {
                            return '<li>' + escapeHtml(skill) + '</li>';
                        }).join('') +
                        '</ul></div>';
                }
            }
            html += '</div></div>';
        }

        container.innerHTML = html;
    }

    /**
     * Update social links in sidebar
     */
    function updateSocialLinks(socialLinks) {
        if (!socialLinks) return;
        var footer = document.querySelector('.sidebar-footer');
        if (!footer) return;

        footer.innerHTML = '';
        var icons = {
            scholar: {
                path: 'M5.518 18.135c-.57 0-1.098-.19-1.516-.569-.46-.42-.69-.974-.69-1.656 0-.73.23-1.313.69-1.748.418-.38.946-.57 1.516-.57.57 0 1.098.19 1.516.57.46.435.69 1.018.69 1.748 0 .682-.23 1.236-.69 1.656-.418.38-.946.569-1.516.569zm6.482 0c-.57 0-1.098-.19-1.516-.569-.46-.42-.69-.974-.69-1.656 0-.73.23-1.313.69-1.748.418-.38.946-.57 1.516-.57.57 0 1.098.19 1.516.57.46.435.69 1.018.69 1.748 0 .682-.23 1.236-.69 1.656-.418.38-.946.569-1.516.569zm0-15.09c-2.457 0-4.59 1.47-5.418 3.636-.828-2.166-2.96-3.636-5.418-3.636C1.44 3.045 0 4.485 0 6.265c0 1.78 1.44 3.22 3.164 3.22.48 0 .94-.11 1.356-.31l.046-.023h.046c.23.115.46.184.69.23v8.19c0 .57.23 1.058.644 1.426.414.37.922.554 1.472.554h9.6c.55 0 1.058-.184 1.472-.554.414-.368.644-.856.644-1.426v-8.19c.23-.046.46-.115.69-.23h.046l.046.023c.416.2.876.31 1.356.31 1.724 0 3.164-1.44 3.164-3.22 0-1.78-1.44-3.22-3.164-3.22-2.458 0-4.59 1.47-5.418 3.636-.828-2.166-2.96-3.636-5.418-3.636z',
                title: 'Google Scholar'
            },
            github: {
                path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
                title: 'GitHub'
            },
            linkedin: {
                path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                title: 'LinkedIn'
            },
            twitter: {
                path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
                title: 'Twitter/X'
            },
            email: {
                path: 'M1.5 8.677v6.668h13.5a7.5 7.5 0 007.5-7.5V4.506l-6.75 5.063L1.5 8.677zm13.5 2.865L5.617 5.214v6.668a1.5 1.5 0 001.5 1.5h6.383zM0 20.25V3.75C0 2.784.784 2 1.75 2h16.5c.966 0 1.75.784 1.75 1.75v16.5a1.75 1.75 0 01-1.75 1.75H1.75A1.75 1.75 0 010 20.25z',
                title: 'Email'
            }
        };

        for (var platform in socialLinks) {
            if (socialLinks.hasOwnProperty(platform) && icons[platform]) {
                var link = document.createElement('a');
                link.href = socialLinks[platform];
                link.target = '_blank';
                link.rel = 'noopener';
                link.className = 'social-link';
                link.title = icons[platform].title;
                link.innerHTML = '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="' + icons[platform].path + '"/></svg>';
                footer.appendChild(link);
            }
        }
    }

    /**
     * Obfuscate email address to prevent bot scraping.
     * Splits the email into user and domain parts stored in data attributes,
     * and displays a visually obfuscated version using Unicode characters.
     */
    function obfuscateEmail(email) {
        var parts = email.split('@');
        if (parts.length !== 2) return { display: email, user: parts[0] || '', domain: '' };
        
        var user = parts[0];
        var domain = parts[1];
        
        // Create a visually obfuscated display string
        // Uses a middle dot separator and partial masking
        var mid = Math.ceil(user.length / 2);
        var maskedUser = user.substring(0, mid) + '•'.repeat(Math.max(0, user.length - mid));
        
        return {
            display: maskedUser + '\u00B7' + domain,
            user: user,
            domain: domain
        };
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Initialize content loading based on current page ---
    var currentPage = window.location.pathname.split('/').pop();
    if (!currentPage || currentPage === 'index') currentPage = 'index.html';
    if (currentPage === 'projects') currentPage = 'projects.html';
    if (currentPage === 'publications') currentPage = 'publications.html';
    if (currentPage === 'resume') currentPage = 'resume.html';

    switch (currentPage) {
        case 'index.html':
            loadAbout();
            break;
        case 'publications.html':
            loadPublications();
            break;
        case 'projects.html':
            loadProjects();
            break;
        case 'resume.html':
            loadResume();
            break;
    }
})();
