
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const menu = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');

    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '✕' : '☰';
});

nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.textContent = '☰';
    })
);

const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        }),
        { threshold: .12 }
    );

    reveals.forEach(el => observer.observe(el));
} else {
    reveals.forEach(el => el.classList.add('visible'));
}

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.project-card');

filters.forEach(button =>
    button.addEventListener('click', () => {
        const category = button.dataset.filter;

        filters.forEach(f => {
            const active = f === button;

            f.classList.toggle('active', active);
            f.setAttribute('aria-pressed', String(active));
        });

        let count = 0;

        cards.forEach(card => {
            const show = category === 'all' ||
                card.dataset.category === category;

            card.hidden = !show;

            if (show) count++;
        });

        document.querySelector('.empty').hidden = count !== 0;
    })
);

const progress = document.querySelector('.scroll-progress');
let scrollPending = false;

function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;

    progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';

    scrollPending = false;
}

window.addEventListener('scroll', () => {
    if (!scrollPending) {
        requestAnimationFrame(updateProgress);
        scrollPending = true;
    }
}, { passive: true });

updateProgress();

if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    const aura = document.querySelector('.cursor-aura');
    const scene = document.querySelector('#hero-scene');

    window.addEventListener('pointermove', e => {
        aura.style.left = e.clientX + 'px';
        aura.style.top = e.clientY + 'px';
        aura.style.opacity = '1';
    }, { passive: true });

    scene.addEventListener('pointermove', e => {
        const r = scene.getBoundingClientRect();

        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;

        scene.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });

    scene.addEventListener('pointerleave', () => scene.style.transform = '');
}

const magic = document.querySelector('.magic-button');

magic.addEventListener('click', () => {
    if (reduceMotion) return;

    const rect = magic.getBoundingClientRect();

    for (let i = 0; i < 25; i++) {
        const p = document.createElement('span');

        p.className = 'particle';
        p.textContent = ['✦', '✧', '✳', '❧'][i % 4];

        p.style.color = [
            '#dee693',
            '#8fc07c',
            '#45997e',
            '#93c9c4'
        ][i % 4];

        p.style.left = (rect.left + rect.width / 2) + 'px';
        p.style.top = (rect.top + rect.height / 2) + 'px';

        p.style.setProperty(
            '--dx',
            (Math.random() * 440 - 220) + 'px'
        );

        p.style.setProperty(
            '--dy',
            (Math.random() * -370 - 40) + 'px'
        );

        p.style.setProperty(
            '--rot',
            (Math.random() * 720 - 360) + 'deg'
        );

        document.body.appendChild(p);

        p.addEventListener('animationend', () => p.remove(), {
            once: true
        });
    }
});
