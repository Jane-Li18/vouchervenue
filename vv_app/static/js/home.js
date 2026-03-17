(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHero() {
    const heroImage = document.getElementById('vvHeroImage');
    if (!heroImage) return;

    const heroImages = [
      heroImage.getAttribute('data-image-1'),
      heroImage.getAttribute('data-image-2'),
      heroImage.getAttribute('data-image-3')
    ].filter(Boolean);

    if (!reduceMotion) {
      document.querySelectorAll('.vv-hero-turn').forEach(el => el.classList.add('vv-float-a'));
      document.querySelectorAll('.vv-hero-traffic').forEach(el => el.classList.add('vv-float-b'));
      document.querySelectorAll('.vv-hero-into').forEach(el => el.classList.add('vv-float-a'));
      document.querySelectorAll('.vv-hero-trusted').forEach(el => el.classList.add('vv-float-b'));
      document.querySelectorAll('.vv-hero-revenue').forEach(el => el.classList.add('vv-float-a'));
    }

    if (heroImages.length < 2 || reduceMotion) return;

    let currentIndex = 0;

    window.setInterval(() => {
      currentIndex = (currentIndex + 1) % heroImages.length;
      heroImage.src = heroImages[currentIndex];
    }, 5000);
  }

  function initAbout() {
    const aboutSection = document.querySelector('.vv-about-animate');
    if (!aboutSection) return;

    if (reduceMotion) {
      aboutSection.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        aboutSection.classList.add('is-visible');

        window.setTimeout(() => {
          aboutSection.querySelectorAll('.vv-about-title-line-1').forEach(el => el.classList.add('vv-about-float-a'));
          aboutSection.querySelectorAll('.vv-about-title-line-2').forEach(el => el.classList.add('vv-about-float-b'));
          aboutSection.querySelectorAll('.vv-about-title-line-3').forEach(el => el.classList.add('vv-about-float-a'));
        }, 3000);

        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.28
    });

    observer.observe(aboutSection);
  }

  function initPartners() {
    const partnersSection = document.querySelector('.vv-partners-animate');
    if (!partnersSection) return;

    if (reduceMotion) {
      partnersSection.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        partnersSection.classList.add('is-visible');

        window.setTimeout(() => {
          partnersSection.querySelectorAll('.vv-partners-title-line-1').forEach(el => el.classList.add('vv-partners-float-a'));
          partnersSection.querySelectorAll('.vv-partners-title-line-2').forEach(el => el.classList.add('vv-partners-float-b'));
          partnersSection.querySelectorAll('.vv-partners-title-line-3').forEach(el => el.classList.add('vv-partners-float-a'));
        }, 3000);

        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.18
    });

    observer.observe(partnersSection);
  }

  function initPage() {
    initHero();
    initAbout();
    initPartners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage, { once: true });
  } else {
    initPage();
  }
})();