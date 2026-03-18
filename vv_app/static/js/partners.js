document.addEventListener('DOMContentLoaded', () => {
  initPartnerShowcase();
  initPartnerDetailGallery();
});

function initPartnerShowcase() {
  const presenter = document.getElementById('vvPartnerPresenter');
  const sourceNodes = Array.from(document.querySelectorAll('.vv-partner-source'));
  const scroller = document.getElementById('vvPartnerSelectorScroller');
  const selectorTrack = document.getElementById('vvPartnerSelectorTrack');
  const searchInput = document.getElementById('vvPartnerSearch');
  const searchEmpty = document.getElementById('vvPartnerSearchEmpty');

  if (!presenter || !sourceNodes.length || !scroller || !selectorTrack) return;

  const image = document.getElementById('vvPartnerPresenterImage');
  const name = document.getElementById('vvPartnerPresenterName');
  const description = document.getElementById('vvPartnerPresenterDescription');
  const perks = document.getElementById('vvPartnerPresenterPerks');
  const ctaWrap = document.getElementById('vvPartnerPresenterCtaWrap');
  const current = document.getElementById('vvPartnerPresenterCurrent');
  const total = document.getElementById('vvPartnerPresenterTotal');
  const progress = document.getElementById('vvPartnerPresenterProgress');
  const prevBtn = document.getElementById('vvPartnerPrev');
  const nextBtn = document.getElementById('vvPartnerNext');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rawSlides = sourceNodes.map((node) => ({
    name: node.dataset.name || '',
    description: node.dataset.description || '',
    image: node.dataset.image || '',
    ctaUrl: node.dataset.ctaUrl || '',
    ctaLabel: node.dataset.ctaLabel || 'View Partner',
    detailUrl: node.dataset.detailUrl || '',
    perks: Array.from(node.querySelectorAll('[data-perk]')).map((perk) => perk.dataset.perk || '')
  }));

  const seen = new Set();
  const slides = rawSlides.filter((slide) => {
    const key = `${slide.name}||${slide.image}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const duration = 5000;
  let activeIndex = 0;
  let timeoutId = null;
  let rafId = null;
  let startTime = 0;
  let remaining = duration;
  let paused = false;

  function getVisibleSlideIndexes() {
    return Array.from(selectorTrack.querySelectorAll('.vv-partner-selector-card:not(.d-none)'))
      .map((button) => Number(button.dataset.slideIndex));
  }

  function getVisiblePosition(index) {
    const visibleIndexes = getVisibleSlideIndexes();
    const position = visibleIndexes.indexOf(index);

    return {
      current: position >= 0 ? position + 1 : 1,
      total: visibleIndexes.length || slides.length || 1
    };
  }

  function setProgress(ratio) {
    if (!progress) return;
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
  }

  function clearTimers() {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function getRelativeVisibleIndex(step) {
    const visibleIndexes = getVisibleSlideIndexes();

    if (!visibleIndexes.length) return activeIndex;

    const currentPosition = visibleIndexes.indexOf(activeIndex);

    if (currentPosition === -1) {
      return visibleIndexes[0];
    }

    return visibleIndexes[
      (currentPosition + step + visibleIndexes.length) % visibleIndexes.length
    ];
  }

  function animateProgress(now) {
    const elapsed = now - startTime;
    const done = duration - remaining + elapsed;
    setProgress(done / duration);

    if (elapsed < remaining && !paused) {
      rafId = window.requestAnimationFrame(animateProgress);
    }
  }

  function scheduleRotation() {
    const visibleIndexes = getVisibleSlideIndexes();

    if (reduceMotion || visibleIndexes.length <= 1) {
      setProgress(visibleIndexes.length <= 1 ? 1 : 0);
      return;
    }

    startTime = performance.now();

    timeoutId = window.setTimeout(() => {
      goToSlide(getRelativeVisibleIndex(1));
    }, remaining);

    rafId = window.requestAnimationFrame(animateProgress);
  }

  function buildPerks(slide) {
    if (!perks) return;
    perks.innerHTML = '';

    (slide.perks || []).forEach((perkText) => {
      const chip = document.createElement('span');
      chip.className = 'vv-partner-chip rounded-pill';
      chip.textContent = perkText;
      perks.appendChild(chip);
    });
  }

  function buildCta(slide) {
    if (!ctaWrap) return;
    ctaWrap.innerHTML = '';

    if (slide.ctaUrl) {
      const websiteLink = document.createElement('a');
      websiteLink.href = slide.ctaUrl;
      websiteLink.target = '_blank';
      websiteLink.rel = 'noopener noreferrer';
      websiteLink.className = 'btn btn-primary px-4 vv-partner-action-btn';
      websiteLink.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 5H19V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 14L19 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 14V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>${slide.ctaLabel || 'View Partner'}</span>
      `;
      ctaWrap.appendChild(websiteLink);
    }

    if (slide.detailUrl) {
      const detailLink = document.createElement('a');
      detailLink.href = slide.detailUrl;
      detailLink.className = 'btn btn-outline-dark px-4 vv-partner-action-btn';
      detailLink.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2 12C3.73 7.61 7.52 5 12 5C16.48 5 20.27 7.61 22 12C20.27 16.39 16.48 19 12 19C7.52 19 3.73 16.39 2 12Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>See partner</span>
      `;
      ctaWrap.appendChild(detailLink);
    }
  }

  function centerActiveCard() {
    const activeCard = selectorTrack.querySelector(`.vv-partner-selector-card[data-slide-index="${activeIndex}"]:not(.d-none)`);
    if (!activeCard) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();
    const currentScroll = scroller.scrollLeft;

    const targetLeft =
      currentScroll +
      (cardRect.left - scrollerRect.left) -
      ((scroller.clientWidth / 2) - (activeCard.offsetWidth / 2));

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const finalLeft = Math.max(0, Math.min(targetLeft, maxScroll));

    scroller.scrollTo({
      left: finalLeft,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  function updateSelectorActive() {
    selectorTrack.querySelectorAll('.vv-partner-selector-card').forEach((button) => {
      const isActive = Number(button.dataset.slideIndex) === activeIndex;
      button.classList.toggle('is-active', isActive);
    });

    centerActiveCard();
  }

  function renderCounters(index) {
    if (!current || !total) return;
    const visibleData = getVisiblePosition(index);
    current.textContent = String(visibleData.current).padStart(2, '0');
    total.textContent = String(visibleData.total).padStart(2, '0');
  }

  function renderSlide(index) {
    const slide = slides[index];
    if (!slide) return;

    if (image) {
      image.src = slide.image;
      image.alt = slide.name;
    }

    if (name) name.textContent = slide.name;
    if (description) description.textContent = slide.description;

    buildPerks(slide);
    buildCta(slide);
    renderCounters(index);
    updateSelectorActive();
  }

  function startPopIn() {
    presenter.classList.add('is-entering');

    window.setTimeout(() => {
      presenter.classList.remove('is-entering');
    }, 360);
  }

  function goToSlide(index) {
    if (typeof index !== 'number' || !slides[index]) return;

    clearTimers();
    remaining = duration;
    setProgress(0);

    if (index === activeIndex) {
      renderSlide(activeIndex);

      if (!paused && !reduceMotion && getVisibleSlideIndexes().length > 1) {
        scheduleRotation();
      } else {
        setProgress(getVisibleSlideIndexes().length <= 1 ? 1 : 0);
      }
      return;
    }

    presenter.classList.add('is-switching');

    window.setTimeout(() => {
      activeIndex = index;
      renderSlide(activeIndex);
      presenter.classList.remove('is-switching');
      startPopIn();

      if (!paused && !reduceMotion && getVisibleSlideIndexes().length > 1) {
        scheduleRotation();
      } else {
        setProgress(getVisibleSlideIndexes().length <= 1 ? 1 : 0);
      }
    }, 240);
  }

  function pauseRotation() {
    if (paused || reduceMotion || getVisibleSlideIndexes().length <= 1) return;

    paused = true;
    const elapsed = performance.now() - startTime;
    remaining = Math.max(0, remaining - elapsed);
    clearTimers();
  }

  function resumeRotation() {
    if (!paused || reduceMotion || getVisibleSlideIndexes().length <= 1) return;

    paused = false;

    if (remaining <= 0) {
      remaining = duration;
      setProgress(0);
    }

    scheduleRotation();
  }

  function buildSelector() {
    selectorTrack.innerHTML = '';

    slides.forEach((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vv-partner-selector-card text-center';
      button.dataset.slideIndex = index;

      const media = document.createElement('span');
      media.className = 'vv-partner-selector-media d-flex align-items-center justify-content-center overflow-hidden';

      const mediaImg = document.createElement('img');
      mediaImg.src = slide.image;
      mediaImg.alt = slide.name;
      mediaImg.className = 'vv-partner-selector-image';

      const title = document.createElement('span');
      title.className = 'vv-partner-selector-name';
      title.textContent = slide.name;

      media.appendChild(mediaImg);
      button.appendChild(media);
      button.appendChild(title);

      button.addEventListener('click', () => {
        goToSlide(index);
      });

      selectorTrack.appendChild(button);
    });
  }

  function filterSelectorCards(query = '') {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = [];

    clearTimers();
    remaining = duration;
    setProgress(0);

    selectorTrack.querySelectorAll('.vv-partner-selector-card').forEach((button) => {
      const slideIndex = Number(button.dataset.slideIndex);
      const slide = slides[slideIndex];
      const isMatch = !normalizedQuery || slide.name.toLowerCase().includes(normalizedQuery);

      button.classList.toggle('d-none', !isMatch);

      if (isMatch) {
        matches.push(slideIndex);
      }
    });

    if (searchEmpty) {
      searchEmpty.classList.toggle('d-none', !normalizedQuery || matches.length > 0);
    }

    if (!matches.length) {
      renderCounters(activeIndex);
      setProgress(1);
      return;
    }

    if (!matches.includes(activeIndex)) {
      goToSlide(matches[0]);
      return;
    }

    renderCounters(activeIndex);
    updateSelectorActive();

    if (!paused && !reduceMotion && matches.length > 1) {
      scheduleRotation();
    } else {
      setProgress(matches.length <= 1 ? 1 : 0);
    }
  }

  buildSelector();
  renderSlide(activeIndex);
  filterSelectorCards(searchInput ? searchInput.value : '');

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      filterSelectorCards(event.target.value);
    });
  }

  presenter.addEventListener('mouseenter', pauseRotation);
  presenter.addEventListener('mouseleave', resumeRotation);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(getRelativeVisibleIndex(-1));
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(getRelativeVisibleIndex(1));
    });
  }
}

function initPartnerDetailGallery() {
  const gallery = document.getElementById('vvPartnerGalleryCarousel');
  const copyPanel = document.getElementById('vvPartnerGalleryCopyPanel');
  const copyText = document.getElementById('vvPartnerGalleryDescription');
  const prevBtn = document.getElementById('vvPartnerGalleryPrev');
  const nextBtn = document.getElementById('vvPartnerGalleryNext');
  const dots = Array.from(document.querySelectorAll('[data-gallery-dot]'));
  const progressBar = copyPanel?.querySelector('.vv-partner-progress span');

  if (!gallery) return;

  const items = Array.from(gallery.querySelectorAll('.carousel-item'));
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 5000;

  let activeIndex = items.findIndex((item) => item.classList.contains('active'));
  let timeoutId = null;
  let rafId = null;
  let startTime = 0;
  let remaining = duration;
  let paused = false;
  let isAnimating = false;

  if (activeIndex < 0) activeIndex = 0;

  function setProgress(ratio) {
    if (!progressBar) return;
    progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
  }

  function clearTimer() {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function clearClasses(element, classNames) {
    if (!element) return;
    classNames.forEach((name) => element.classList.remove(name));
  }

  function updateDots(index) {
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle('active', isActive);

      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  function updateCopy(index) {
    if (!copyText) return;
    copyText.textContent = items[index].dataset.galleryCopy || '';
  }

  function animateProgress(now) {
    const elapsed = now - startTime;
    const done = duration - remaining + elapsed;

    setProgress(done / duration);

    if (elapsed < remaining && !paused) {
      rafId = window.requestAnimationFrame(animateProgress);
    }
  }

  function scheduleNext() {
    clearTimer();

    if (reduceMotion || items.length <= 1) {
      setProgress(items.length <= 1 ? 1 : 0);
      return;
    }

    startTime = performance.now();

    timeoutId = window.setTimeout(() => {
      goToIndex((activeIndex + 1) % items.length);
    }, remaining);

    rafId = window.requestAnimationFrame(animateProgress);
  }

  function pauseRotation() {
    if (paused || reduceMotion || items.length <= 1) return;

    paused = true;

    if (isAnimating) {
      clearTimer();
      return;
    }

    const elapsed = performance.now() - startTime;
    remaining = Math.max(0, remaining - elapsed);
    clearTimer();
  }

  function resumeRotation() {
    if (!paused || reduceMotion || items.length <= 1) return;

    paused = false;

    if (isAnimating) return;

    if (remaining <= 0) {
      remaining = duration;
      setProgress(0);
    }

    scheduleNext();
  }

  function playCopyEntry() {
    if (!copyPanel) return;

    clearClasses(copyPanel, [
      'is-switching-next',
      'is-switching-prev',
      'is-entering-next',
      'is-entering-prev'
    ]);

    void copyPanel.offsetWidth;
    copyPanel.classList.add('is-entering-next');

    window.setTimeout(() => {
      copyPanel.classList.remove('is-entering-next');
    }, 420);
  }

  function playShellEntry(shell) {
    if (!shell) return;

    clearClasses(shell, [
      'is-switching-next',
      'is-switching-prev',
      'is-entering-next',
      'is-entering-prev'
    ]);

    void shell.offsetWidth;
    shell.classList.add('is-entering-next');

    window.setTimeout(() => {
      shell.classList.remove('is-entering-next');
    }, 420);
  }

  function goToIndex(nextIndex) {
    if (isAnimating || nextIndex === activeIndex || !items[nextIndex]) return;

    clearTimer();
    remaining = duration;
    setProgress(0);
    isAnimating = true;

    const currentItem = items[activeIndex];
    const nextItem = items[nextIndex];
    const currentShell = currentItem.querySelector('.vv-partner-gallery-shell');
    const nextShell = nextItem.querySelector('.vv-partner-gallery-shell');

    clearClasses(currentShell, [
      'is-entering-next',
      'is-entering-prev',
      'is-switching-next',
      'is-switching-prev'
    ]);

    if (currentShell) {
      currentShell.classList.add('is-switching-next');
    }

    if (copyPanel) {
      clearClasses(copyPanel, [
        'is-entering-next',
        'is-entering-prev',
        'is-switching-next',
        'is-switching-prev'
      ]);
      copyPanel.classList.add('is-switching-next');
    }

    const outDuration = reduceMotion ? 0 : 220;

    window.setTimeout(() => {
      currentItem.classList.remove('active');
      nextItem.classList.add('active');
      activeIndex = nextIndex;

      updateDots(activeIndex);
      updateCopy(activeIndex);

      if (copyPanel) {
        copyPanel.classList.remove('is-switching-next', 'is-switching-prev');
      }

      playShellEntry(nextShell);
      playCopyEntry();

      const inDuration = reduceMotion ? 0 : 420;

      window.setTimeout(() => {
        clearClasses(nextShell, [
          'is-entering-next',
          'is-entering-prev',
          'is-switching-next',
          'is-switching-prev'
        ]);

        if (copyPanel) {
          clearClasses(copyPanel, [
            'is-entering-next',
            'is-entering-prev',
            'is-switching-next',
            'is-switching-prev'
          ]);
        }

        isAnimating = false;

        if (!paused) {
          scheduleNext();
        } else {
          setProgress(0);
        }
      }, inDuration);
    }, outDuration);
  }

  updateDots(activeIndex);
  updateCopy(activeIndex);
  setProgress(0);

  playShellEntry(items[activeIndex].querySelector('.vv-partner-gallery-shell'));
  playCopyEntry();

  if (!reduceMotion && items.length > 1) {
    scheduleNext();
  } else {
    setProgress(items.length <= 1 ? 1 : 0);
  }

  prevBtn?.addEventListener('click', () => {
    goToIndex((activeIndex - 1 + items.length) % items.length);
  });

  nextBtn?.addEventListener('click', () => {
    goToIndex((activeIndex + 1) % items.length);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = Number(dot.dataset.galleryDot);
      if (Number.isNaN(targetIndex) || targetIndex === activeIndex) return;
      goToIndex(targetIndex);
    });
  });

  gallery.addEventListener('mouseenter', pauseRotation);
  gallery.addEventListener('mouseleave', resumeRotation);
}