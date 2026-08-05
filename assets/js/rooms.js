document.addEventListener('DOMContentLoaded', function () {
  var lightbox = document.querySelector('.rooms-lightbox');
  var lightboxStage = document.querySelector('.rooms-lightbox__stage');
  var lightboxImage = document.querySelector('.rooms-lightbox__image');
  var closeButton = document.querySelector('.rooms-lightbox__close');
  var previousButton = document.querySelector('.rooms-lightbox__previous');
  var nextButton = document.querySelector('.rooms-lightbox__next');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-room-gallery]'));

  if (!lightbox || !lightboxStage || !lightboxImage || !closeButton || !previousButton || !nextButton || !triggers.length) return;

  var galleries = {};
  var activeGallery = [];
  var activeIndex = 0;
  var lightboxTrigger = null;

  triggers.forEach(function (trigger) {
    var galleryName = trigger.getAttribute('data-room-gallery');
    if (!galleries[galleryName]) galleries[galleryName] = [];
    galleries[galleryName].push(trigger);
  });

  Object.keys(galleries).forEach(function (galleryName) {
    galleries[galleryName].sort(function (first, second) {
      return Number(first.getAttribute('data-room-index')) - Number(second.getAttribute('data-room-index'));
    });
  });

  function showImage(index) {
    if (!activeGallery.length) return;
    activeIndex = (index + activeGallery.length) % activeGallery.length;
    var sourceImage = activeGallery[activeIndex].querySelector('img');
    if (!sourceImage) return;
    lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
    lightboxImage.alt = sourceImage.alt;
  }

  function openLightbox(trigger) {
    var galleryName = trigger.getAttribute('data-room-gallery');
    activeGallery = galleries[galleryName] || [];
    if (!activeGallery.length) return;

    lightboxTrigger = trigger;
    showImage(activeGallery.indexOf(trigger));
    lightbox.removeAttribute('inert');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-open');
    document.body.classList.add('rooms-lightbox-open');
    closeButton.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.setAttribute('inert', '');
    document.body.classList.remove('rooms-lightbox-open');
    lightboxImage.removeAttribute('src');
    lightboxImage.alt = '';

    if (lightboxTrigger && document.documentElement.contains(lightboxTrigger)) {
      lightboxTrigger.focus();
    }

    lightboxTrigger = null;
    activeGallery = [];
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openLightbox(trigger);
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  previousButton.addEventListener('click', function () { showImage(activeIndex - 1); });
  nextButton.addEventListener('click', function () { showImage(activeIndex + 1); });

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
      showImage(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(activeIndex + 1);
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
});
