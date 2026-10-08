// ========================================================= //
// THEME DETECTION & TOGGLE CONTROLLER                      //
// ========================================================= //

(function initThemeController() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeText = themeToggleBtn ? themeToggleBtn.querySelector('.theme-text') : null;
    const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Function to retrieve current active theme
    function getCurrentTheme() {
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme) {
            return savedTheme;
        }
        // Fall back to CSS media query detection
        return mediaQueryDark.matches ? 'dark' : 'light';
    }

    // Function to apply theme to document root
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeText) themeText.textContent = 'Day Mode';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            if (themeText) themeText.textContent = 'Night Mode';
        }
    }

    // Initialize theme based on preference or media query
    const initialTheme = getCurrentTheme();
    applyTheme(initialTheme);

    // Listen for manual theme toggle clicks
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || (mediaQueryDark.matches ? 'dark' : 'light');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme-preference', newTheme);
            applyTheme(newTheme);
        });
    }

    // Listen for system theme preference changes if user hasn't explicitly set an override
    mediaQueryDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme-preference')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
})();

// ========================================================= //
// VERTICAL NAVBAR CONTROLLER (RESPONSIVE & ACCESSIBILITY)  //
// ========================================================= //

(function initSidebarController() {
    const sidebar = document.getElementById('sidebar-nav');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');
    const navLinks = document.querySelectorAll('.sidebar-nav-list .nav-link');

    // Function to open drawer
    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('active');
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            mobileMenuToggle.setAttribute('aria-label', 'Close Navigation Menu');
        }
    }

    // Function to close drawer
    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'Open Navigation Menu');
        }
    }

    // Toggle button handler
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = sidebar && sidebar.classList.contains('open');
            if (isOpen) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    // Backdrop click closes drawer
    if (backdrop) {
        backdrop.addEventListener('click', closeSidebar);
    }

    // Escape key closes drawer (Accessibility)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
            if (mobileMenuToggle) mobileMenuToggle.focus();
        }
    });

    // Close mobile drawer on navigation click & update active state
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                closeSidebar();
            }
            setActiveLink(link);
        });
    });

    // Set active link helper
    function setActiveLink(activeEl) {
        navLinks.forEach((l) => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
        });
        if (activeEl) {
            activeEl.classList.add('active');
            activeEl.setAttribute('aria-current', 'page');
        }
    }

    // ScrollSpy: highlight active link as user scrolls
    const sectionIds = ['hero', 'about', 'skills', 'timeline', 'projects', 'testimonials', 'chat', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.id;
                    const matchingLink = document.querySelector(`.sidebar-nav-list .nav-link[data-section="${currentId}"]`);
                    if (matchingLink) {
                        setActiveLink(matchingLink);
                    }
                }
            });
        }, observerOptions);

        sections.forEach((sec) => observer.observe(sec));
    }
})();

// ========================================================= //
// INTERACTIVE NPC CHAT TERMINAL                             //
// ========================================================= //

(function initChatTerminal() {
    const chatForm = document.getElementById('terminal-chat-form');
    const chatInput = document.getElementById('chat-input-field');
    const chatContainer = document.getElementById('chat-messages-container');

    if (!chatForm || !chatInput || !chatContainer) return;

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Append user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user-msg';
        userMsg.innerHTML = `<span class="msg-sender" style="color: var(--pixel-neon-cyan);">[YOU]:</span> <span class="msg-text">${escapeHtml(text)}</span>`;
        chatContainer.appendChild(userMsg);
        chatInput.value = '';

        // Auto scroll to latest message
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Simulate NPC Bot Response
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-msg bot-msg';
            const responses = [
                "Quest accepted! Feel free to reach out via email or LinkedIn for full details.",
                "System Status: 100% operational. Let's build something epic together!",
                "Check out the Projects or Timeline tab for my latest work and accomplishments.",
                "Message received! Sending transmission to Prajwal's console..."
            ];
            const randomResp = responses[Math.floor(Math.random() * responses.length)];
            botMsg.innerHTML = `<span class="msg-sender">[PRAJWAL-AI]:</span> <span class="msg-text">${randomResp}</span>`;
            chatContainer.appendChild(botMsg);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 500);
    });

    function escapeHtml(string) {
        return string.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m]));
    }
})();
