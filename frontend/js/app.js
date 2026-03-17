/* ═══════════════════════════════════════════════════
   AI RESUME ANALYZER — APP LOGIC
   Three.js 3D Background + Drag-Drop + API + Results
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── DOM References ──
    const canvas = document.getElementById('bg-canvas');
    const navbar = document.getElementById('navbar');
    const dropZone = document.getElementById('drop-zone');
    const resumeInput = document.getElementById('resume-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileRemove = document.getElementById('file-remove');
    const jdInput = document.getElementById('jd-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const resultsSection = document.getElementById('results-section');
    const uploadSection = document.getElementById('upload-section');
    const toastContainer = document.getElementById('toast-container');
    const analyzeAgainBtn = document.getElementById('analyze-again-btn');
    const copySummaryBtn = document.getElementById('copy-summary-btn');

    let selectedFile = null;

    // ═══════════════════════════════════════════════════
    // THREE.JS 3D PARTICLE BACKGROUND
    // ═══════════════════════════════════════════════════

    function initThreeBackground() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        camera.position.z = 50;

        // ── Particles ──
        const particleCount = 800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const colorPalette = [
            new THREE.Color(0x00f0ff), // cyan
            new THREE.Color(0xb44aff), // purple
            new THREE.Color(0xff4a8d), // pink
            new THREE.Color(0x00e87b), // green
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 160;
            positions[i3 + 1] = (Math.random() - 0.5) * 160;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 1.5 + 0.3;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(geometry, particleMaterial);
        scene.add(particles);

        // ── Floating Geometries ──
        const geometries = [];

        // Torus
        const torusGeo = new THREE.TorusGeometry(6, 0.3, 16, 100);
        const torusMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.07 });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.position.set(35, 12, -35);
        scene.add(torus);
        geometries.push({ mesh: torus, rotSpeed: { x: 0.002, y: 0.003, z: 0 }, floatSpeed: 0.3, floatAmp: 2 });

        // Icosahedron
        const icoGeo = new THREE.IcosahedronGeometry(3.5, 0);
        const icoMat = new THREE.MeshBasicMaterial({ color: 0xb44aff, wireframe: true, transparent: true, opacity: 0.06 });
        const ico = new THREE.Mesh(icoGeo, icoMat);
        ico.position.set(-35, -18, -30);
        scene.add(ico);
        geometries.push({ mesh: ico, rotSpeed: { x: 0.003, y: 0.002, z: 0.001 }, floatSpeed: 0.25, floatAmp: 3 });

        // Octahedron
        const octGeo = new THREE.OctahedronGeometry(3, 0);
        const octMat = new THREE.MeshBasicMaterial({ color: 0xff4a8d, wireframe: true, transparent: true, opacity: 0.06 });
        const oct = new THREE.Mesh(octGeo, octMat);
        oct.position.set(-25, 22, -35);
        scene.add(oct);
        geometries.push({ mesh: oct, rotSpeed: { x: 0.002, y: 0.003, z: 0.002 }, floatSpeed: 0.35, floatAmp: 2 });

        // ── Mouse Parallax ──
        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;

        document.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // ── Resize ──
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // ── Animation Loop ──
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            // Smooth mouse follow
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Particles rotation + mouse influence
            particles.rotation.y = elapsed * 0.03 + mouseX * 0.15;
            particles.rotation.x = elapsed * 0.015 + mouseY * 0.1;

            // Float geometries
            geometries.forEach((g) => {
                g.mesh.rotation.x += g.rotSpeed.x;
                g.mesh.rotation.y += g.rotSpeed.y;
                g.mesh.rotation.z += g.rotSpeed.z;
                g.mesh.position.y += Math.sin(elapsed * g.floatSpeed) * 0.02 * g.floatAmp;
            });

            // Camera subtle shift
            camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
            camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        animate();
    }

    // ═══════════════════════════════════════════════════
    // SCROLL REVEAL
    // ═══════════════════════════════════════════════════

    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        reveals.forEach((el) => observer.observe(el));
    }

    // ═══════════════════════════════════════════════════
    // NAVBAR SCROLL
    // ═══════════════════════════════════════════════════

    function initNavbarScroll() {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ═══════════════════════════════════════════════════
    // DRAG & DROP
    // ═══════════════════════════════════════════════════

    function initDragDrop() {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        const validExtensions = ['.pdf', '.docx'];

        // Click to browse
        dropZone.addEventListener('click', () => resumeInput.click());

        // File input change
        resumeInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleFile(e.target.files[0]);
        });

        // Drag events
        dropZone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        });

        // Remove file
        fileRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            clearFile();
        });

        function handleFile(file) {
            const ext = '.' + file.name.split('.').pop().toLowerCase();

            if (!validExtensions.includes(ext)) {
                showToast('Please upload a PDF or DOCX file only.', 'error');
                return;
            }

            selectedFile = file;
            fileName.textContent = file.name;
            fileInfo.classList.remove('hidden');
            dropZone.style.display = 'none';
            updateAnalyzeBtn();
        }

        function clearFile() {
            selectedFile = null;
            resumeInput.value = '';
            fileInfo.classList.add('hidden');
            dropZone.style.display = 'flex';
            updateAnalyzeBtn();
        }
    }

    // ═══════════════════════════════════════════════════
    // FORM VALIDATION & SUBMIT
    // ═══════════════════════════════════════════════════

    function updateAnalyzeBtn() {
        const hasFile = !!selectedFile;
        const hasJD = jdInput.value.trim().length > 10;
        analyzeBtn.disabled = !(hasFile && hasJD);
    }

    function initForm() {
        jdInput.addEventListener('input', updateAnalyzeBtn);

        analyzeBtn.addEventListener('click', async () => {
            if (analyzeBtn.disabled) return;

            // Set loading state
            setLoading(true);

            const formData = new FormData();
            formData.append('resume', selectedFile);
            formData.append('job_description', jdInput.value.trim());

            try {
                const response = await fetch('/analyse', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Something went wrong');
                }

                if (data.success && data.report) {
                    renderResults(data.report);
                    showToast('Analysis complete! Scroll down to see your report.', 'success');
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err) {
                showToast(err.message || 'Failed to analyze resume. Please try again.', 'error');
            } finally {
                setLoading(false);
            }
        });

        // Analyze Again
        analyzeAgainBtn.addEventListener('click', () => {
            resultsSection.classList.add('hidden');
            uploadSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function setLoading(loading) {
        analyzeBtn.disabled = loading;
        btnText.textContent = loading ? 'Analyzing...' : 'Analyze Resume';
        btnSpinner.classList.toggle('hidden', !loading);
    }

    // ═══════════════════════════════════════════════════
    // RESULTS RENDERER
    // ═══════════════════════════════════════════════════

    function renderResults(report) {
        // Show section
        resultsSection.classList.remove('hidden');

        // Add SVG gradient for score ring
        ensureScoreGradient();

        // ── Overall Score ──
        animateScore(report.overall_score || 0);

        // ── Score Label ──
        const score = report.overall_score || 0;
        const label = document.getElementById('score-label');
        if (score >= 80) label.textContent = 'Excellent Match!';
        else if (score >= 60) label.textContent = 'Good Match';
        else if (score >= 40) label.textContent = 'Moderate Match';
        else label.textContent = 'Needs Improvement';

        // ── ATS Check ──
        const atsBadge = document.getElementById('ats-badge');
        const atsStatus = document.getElementById('ats-status');
        const atsReason = document.getElementById('ats-reason');

        if (report.ats_check?.passes) {
            atsBadge.className = 'ats-badge ats-pass';
            atsStatus.textContent = 'ATS Compatible';
        } else {
            atsBadge.className = 'ats-badge ats-fail';
            atsStatus.textContent = 'ATS Risk Detected';
        }
        atsReason.textContent = report.ats_check?.reason || '';

        // ── Section Scores ──
        const sections = report.section_scores || {};
        setTimeout(() => {
            animateBar('bar-skills', 'bar-skills-val', sections.skills || 0);
            animateBar('bar-experience', 'bar-experience-val', sections.experience || 0);
            animateBar('bar-education', 'bar-education-val', sections.education || 0);
            animateBar('bar-formatting', 'bar-formatting-val', sections.formatting || 0);
        }, 400);

        // ── Strengths ──
        const strengthsList = document.getElementById('strengths-list');
        strengthsList.innerHTML = '';
        (report.strengths || []).forEach((s, i) => {
            const li = document.createElement('li');
            li.textContent = s;
            li.style.animationDelay = `${i * 0.15}s`;
            strengthsList.appendChild(li);
        });

        // ── Tips ──
        const tipsList = document.getElementById('tips-list');
        tipsList.innerHTML = '';
        (report.improvement_tips || []).forEach((t, i) => {
            const li = document.createElement('li');
            li.textContent = t;
            li.style.animationDelay = `${i * 0.15}s`;
            tipsList.appendChild(li);
        });

        // ── Keywords ──
        const keywordsContainer = document.getElementById('keywords-container');
        keywordsContainer.innerHTML = '';
        (report.missing_keywords || []).forEach((kw) => {
            const chip = document.createElement('span');
            chip.className = 'keyword-chip';
            chip.textContent = kw;
            keywordsContainer.appendChild(chip);
        });

        // ── Rewritten Summary ──
        const summaryEl = document.getElementById('rewritten-summary');
        summaryEl.textContent = report.rewritten_summary || 'No summary generated.';

        // Scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth' });

            // Re-observe reveals inside results
            const reveals = resultsSection.querySelectorAll('.reveal');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            }, { threshold: 0.05 });
            reveals.forEach((el) => {
                el.classList.remove('visible');
                observer.observe(el);
            });
        }, 100);
    }

    function ensureScoreGradient() {
        if (document.getElementById('score-gradient')) return;
        const svg = document.querySelector('.score-ring');
        if (!svg) return;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', 'score-gradient');
        grad.setAttribute('x1', '0%');
        grad.setAttribute('y1', '0%');
        grad.setAttribute('x2', '100%');
        grad.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#00f0ff');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:#b44aff');

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
        svg.insertBefore(defs, svg.firstChild);
    }

    function animateScore(targetScore) {
        const scoreNumber = document.getElementById('score-number');
        const scoreFill = document.getElementById('score-ring-fill');

        // Ring animation
        const circumference = 2 * Math.PI * 85; // r=85
        const offset = circumference - (targetScore / 100) * circumference;
        scoreFill.style.strokeDasharray = circumference;
        scoreFill.style.strokeDashoffset = circumference;

        requestAnimationFrame(() => {
            scoreFill.style.strokeDashoffset = offset;
        });

        // Number counter
        let current = 0;
        const duration = 1500;
        const start = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            current = Math.round(eased * targetScore);
            scoreNumber.textContent = current;

            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function animateBar(barId, valId, value) {
        const bar = document.getElementById(barId);
        const val = document.getElementById(valId);

        bar.style.width = value + '%';
        val.textContent = value + '%';
    }

    // ═══════════════════════════════════════════════════
    // COPY SUMMARY
    // ═══════════════════════════════════════════════════

    function initCopySummary() {
        copySummaryBtn.addEventListener('click', async () => {
            const text = document.getElementById('rewritten-summary').textContent;
            try {
                await navigator.clipboard.writeText(text);
                showToast('Summary copied to clipboard!', 'success');
            } catch {
                showToast('Failed to copy. Please select and copy manually.', 'error');
            }
        });
    }

    // ═══════════════════════════════════════════════════
    // TOAST NOTIFICATIONS
    // ═══════════════════════════════════════════════════

    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon"></div>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
    }

    // ═══════════════════════════════════════════════════
    // SMOOTH LINK SCROLL
    // ═══════════════════════════════════════════════════

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // ═══════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════

    function init() {
        initThreeBackground();
        initScrollReveal();
        initNavbarScroll();
        initDragDrop();
        initForm();
        initCopySummary();
        initSmoothScroll();
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
