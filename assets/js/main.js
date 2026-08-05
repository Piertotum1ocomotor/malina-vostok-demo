document.addEventListener('DOMContentLoaded', function () {
  function setupAboutScale() {
    var frame = document.querySelector('.about-scale-frame');
    var content = document.querySelector('.about-scale-content');
    var ABOUT_BASE_WIDTH = 720;
    var previousWidth = null;

    if (!frame || !content) return;

    function updateAboutScale(force) {
      if (window.innerWidth > 767) {
        content.style.removeProperty('transform');
        content.style.removeProperty('--about-scale');
        frame.style.removeProperty('height');
        previousWidth = null;
        return;
      }

      var availableWidth = frame.clientWidth;
      if (!availableWidth || (!force && availableWidth === previousWidth)) return;

      var scale = Math.min(1, availableWidth / ABOUT_BASE_WIDTH);
      content.style.setProperty('--about-scale', scale);
      frame.style.height = Math.ceil(content.scrollHeight * scale) + 'px';
      previousWidth = availableWidth;
    }

    updateAboutScale(true);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        updateAboutScale(true);
      });
    }

    if ('ResizeObserver' in window) {
      var resizeObserver = new ResizeObserver(function () {
        updateAboutScale(false);
      });
      resizeObserver.observe(frame);
    }
  }

  setupAboutScale();

  function setupAccommodationScale() {
    var frame = document.querySelector('.accommodation-scale-frame');
    var content = document.querySelector('.accommodation-scale-content');
    var ACCOMMODATION_BASE_WIDTH_FALLBACK = 520;
    var previousWidth = null;

    if (!frame || !content) return;

    function updateAccommodationScale(force) {
      if (window.innerWidth >= 600) {
        content.style.removeProperty('transform');
        content.style.removeProperty('--accommodation-scale');
        frame.style.removeProperty('height');
        previousWidth = null;
        return;
      }

      var availableWidth = frame.clientWidth;
      if (!availableWidth || (!force && availableWidth === previousWidth)) return;

      var baseWidth = content.offsetWidth || ACCOMMODATION_BASE_WIDTH_FALLBACK;
      var scale = Math.min(1, availableWidth / baseWidth);
      content.style.setProperty('--accommodation-scale', scale);
      frame.style.height = Math.ceil(content.scrollHeight * scale) + 'px';
      previousWidth = availableWidth;
    }

    updateAccommodationScale(true);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        updateAccommodationScale(true);
      });
    }

    if ('ResizeObserver' in window) {
      var resizeObserver = new ResizeObserver(function () {
        updateAccommodationScale(false);
      });
      resizeObserver.observe(frame);
    }
  }

  setupAccommodationScale();

  var menu = document.querySelector('.mobile-menu');
  var overlay = document.querySelector('.menu-overlay');
  var toggle = document.querySelector('.menu-toggle');
  var closeControls = document.querySelectorAll('[data-menu-close]');
  var lastFocusedElement = null;
  var desktopMedia = window.matchMedia('(min-width: 960px)');

  function isMenuOpen() {
    return Boolean(menu && menu.classList.contains('is-open'));
  }

  function getMenuFocusables() {
    if (!menu) return [];
    return Array.prototype.filter.call(
      menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (element) { return !element.hasAttribute('hidden') && !element.closest('[hidden]'); }
    );
  }

  function closeMenu(restoreFocus) {
    if (!menu || !overlay || !toggle) return;
    menu.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('inert', '');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    if (restoreFocus !== false && lastFocusedElement) {
      toggle.focus();
    }
    lastFocusedElement = null;
  }

  function openMenu() {
    if (!menu || !overlay || !toggle) return;
    lastFocusedElement = document.activeElement;
    menu.removeAttribute('inert');
    menu.classList.add('is-open');
    overlay.classList.add('is-visible');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');

    var focusables = getMenuFocusables();
    if (focusables.length) focusables[0].focus();
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      if (menu && menu.classList.contains('is-open')) closeMenu(); else openMenu();
    });
  }

  closeControls.forEach(function (control) {
    control.addEventListener('click', function () { closeMenu(true); });
  });
  if (menu) {
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(true); });
    });
  }
  document.addEventListener('keydown', function (event) {
    if (!isMenuOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key !== 'Tab') return;

    var focusables = getMenuFocusables();
    if (!focusables.length) {
      event.preventDefault();
      return;
    }

    var firstFocusable = focusables[0];
    var lastFocusable = focusables[focusables.length - 1];
    if (!menu.contains(document.activeElement)) {
      event.preventDefault();
      firstFocusable.focus();
    } else if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  });

  function handleDesktopChange(event) {
    if (event.matches && isMenuOpen()) closeMenu(false);
  }

  if (desktopMedia.addEventListener) {
    desktopMedia.addEventListener('change', handleDesktopChange);
  } else {
    desktopMedia.addListener(handleDesktopChange);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  function setupGallery() {
    var section = document.querySelector('.gallery-section');
    var track = document.querySelector('.gallery-track');
    var list = document.querySelector('.gallery-list');
    var lightbox = document.querySelector('.gallery-lightbox');
    var lightboxStage = document.querySelector('.gallery-lightbox__stage');
    var lightboxImage = document.querySelector('.gallery-lightbox__image');
    var closeButton = document.querySelector('.gallery-lightbox__close');
    var previousButton = document.querySelector('.gallery-lightbox__previous');
    var nextButton = document.querySelector('.gallery-lightbox__next');

    if (!section || !track || !list || !lightbox || !lightboxStage || !lightboxImage || !closeButton || !previousButton || !nextButton) return;

    var originalCards = Array.prototype.slice.call(list.querySelectorAll('.gallery-card'));
    if (!originalCards.length) return;

    originalCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      list.appendChild(clone);
    });

    var firstClone = list.children[originalCards.length];
    var cycleWidth = 0;
    var currentIndex = 0;
    var previousTimestamp = 0;
    var animationFrame = 0;
    var sectionVisible = true;
    var autoStopped = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lightboxTrigger = null;
    var mouseDragging = false;
    var dragMoved = false;
    var suppressClick = false;
    var dragStartX = 0;
    var dragStartScroll = 0;

    function updateCycleWidth() {
      cycleWidth = firstClone.offsetLeft - originalCards[0].offsetLeft;
      if (cycleWidth > 0 && track.scrollLeft >= cycleWidth) {
        track.scrollLeft %= cycleWidth;
      }
    }

    function stopAutoScroll() {
      autoStopped = true;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }

    function autoScroll(timestamp) {
      if (autoStopped) return;

      if (!previousTimestamp) previousTimestamp = timestamp;
      var elapsed = Math.min(timestamp - previousTimestamp, 50);
      previousTimestamp = timestamp;

      if (sectionVisible && !document.hidden && cycleWidth > 0) {
        track.scrollLeft += 18 * elapsed / 1000;
        if (track.scrollLeft >= cycleWidth) track.scrollLeft -= cycleWidth;
      }

      animationFrame = window.requestAnimationFrame(autoScroll);
    }

    function showImage(index) {
      currentIndex = (index + originalCards.length) % originalCards.length;
      var sourceImage = originalCards[currentIndex].querySelector('img');
      lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
      lightboxImage.alt = sourceImage.alt;
    }

    function openLightbox(index, trigger) {
      stopAutoScroll();
      lightboxTrigger = trigger;
      showImage(index);
      lightbox.removeAttribute('inert');
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.classList.add('is-open');
      document.body.classList.add('gallery-lightbox-open');
      closeButton.focus();
    }

    function closeLightbox() {
      if (!lightbox.classList.contains('is-open')) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.setAttribute('inert', '');
      document.body.classList.remove('gallery-lightbox-open');
      if (lightboxTrigger && document.documentElement.contains(lightboxTrigger)) lightboxTrigger.focus();
      lightboxTrigger = null;
    }

    updateCycleWidth();

    if ('ResizeObserver' in window) {
      var galleryResizeObserver = new ResizeObserver(updateCycleWidth);
      galleryResizeObserver.observe(list);
    } else {
      window.addEventListener('resize', updateCycleWidth);
    }

    if ('IntersectionObserver' in window) {
      var galleryIntersectionObserver = new IntersectionObserver(function (entries) {
        sectionVisible = entries[0].isIntersecting;
        previousTimestamp = 0;
      });
      galleryIntersectionObserver.observe(section);
    }

    if (!autoStopped) animationFrame = window.requestAnimationFrame(autoScroll);

    track.addEventListener('focusin', stopAutoScroll);
    track.addEventListener('wheel', function (event) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) stopAutoScroll();
    }, { passive: true });

    track.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      stopAutoScroll();
      event.preventDefault();
      track.scrollBy({ left: event.key === 'ArrowLeft' ? -280 : 280, behavior: 'smooth' });
    });

    track.addEventListener('pointerdown', function (event) {
      stopAutoScroll();
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      mouseDragging = true;
      dragMoved = false;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });

    track.addEventListener('pointermove', function (event) {
      if (!mouseDragging) return;
      var distance = event.clientX - dragStartX;
      if (Math.abs(distance) > 4 && !dragMoved) {
        dragMoved = true;
        track.setPointerCapture(event.pointerId);
      }
      if (dragMoved) {
        event.preventDefault();
        track.scrollLeft = dragStartScroll - distance;
      }
    });

    function finishMouseDrag(event) {
      if (!mouseDragging) return;
      suppressClick = dragMoved;
      mouseDragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    }

    track.addEventListener('pointerup', finishMouseDrag);
    track.addEventListener('pointercancel', finishMouseDrag);
    track.addEventListener('dragstart', function (event) { event.preventDefault(); });

    track.addEventListener('click', function (event) {
      if (suppressClick) {
        suppressClick = false;
        event.preventDefault();
        return;
      }

      var card = event.target.closest('.gallery-card');
      if (!card) return;
      openLightbox(Number(card.getAttribute('data-gallery-index')), card);
    });

    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', function () { showImage(currentIndex - 1); });
    nextButton.addEventListener('click', function () { showImage(currentIndex + 1); });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox || event.target === lightboxStage) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showImage(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showImage(currentIndex + 1);
      } else if (event.key === 'Tab') {
        var controls = [closeButton, previousButton, nextButton];
        var firstControl = controls[0];
        var lastControl = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault();
          lastControl.focus();
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault();
          firstControl.focus();
        }
      }
    });
  }

  setupGallery();
});
