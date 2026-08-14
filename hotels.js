document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-slider]').forEach(initSlider);
});

function initSlider(slider) {
    const wrapper = slider.querySelector('.slides-wrapper');
    const slides = slider.querySelectorAll('.slide');
    const dotsContainer = slider.querySelector('.slider-dots');
    let current = 0;
    let autoPlay;

    // Build dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    function goTo(index) {
        current = (index + slides.length) % slides.length;
        wrapper.style.transform = `translateX(-${current * 100}%)`;
        dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) =>
            d.classList.toggle('active', i === current)
        );
    }

    function startAutoPlay() {
        autoPlay = setInterval(() => goTo(current + 1), 4000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlay);
    }

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    // Store goTo on slider element so slideHotel() can call it
    slider._goTo = goTo;

    startAutoPlay();
}

function slideHotel(btn, direction) {
    const slider = btn.closest('[data-slider]');
    const slides = slider.querySelectorAll('.slide');
    const current = parseInt(slider.querySelector('.slider-dot.active')?.dataset.index ?? 0);
    const dots = slider.querySelectorAll('.slider-dot');
    let currentIndex = Array.from(dots).findIndex(d => d.classList.contains('active'));
    slider._goTo(currentIndex + direction);
}
