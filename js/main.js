// Shared interactivity: FAQ accordion, scroll-spy nav, YouTube click-to-load
// facades, and the Order Inquiry form behaviour (in-page submit, messages
// below the Send button, mandatory human-verification checkbox).
document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion (with aria-expanded)
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Scroll-spy for nav highlight (nav links are /#corporate and /#yt)
  const sections = [...document.querySelectorAll('[data-spy]')];
  const links = [...document.querySelectorAll('.main-nav a[data-spy-link]')];
  if (sections.length && links.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active',
            (l.getAttribute('href') || '').endsWith('#' + e.target.id)));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // YouTube facades: load the real player only on click
  document.querySelectorAll('.yt-facade').forEach(btn => {
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
      iframe.title = btn.dataset.title || 'Balloons Lane video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  /* Order Inquiry forms.
     Submit stays on the page: the form posts into a hidden iframe targeting
     FormSubmit, which redirects that iframe to /form-sent/ on success.
     Success/error messages appear below the Send button; the form clears
     after a successful send. The "Verify you are human" checkbox is
     mandatory — unticked submissions are blocked with a message. */
  (function () {
    var forms = document.querySelectorAll('form.inquiry-form');
    if (!forms.length) return;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    forms.forEach(function (form) {
      var status = form.querySelector('.form-status');
      var btn = form.querySelector('button[type="submit"]');
      var target = form.querySelector('iframe.form-target');
      function setStatus(msg, kind) {
        if (!status) return;
        status.textContent = msg;
        status.className = 'form-status' + (kind ? ' ' + kind : '');
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var honey = form.querySelector('[name="_honey"]');
        if (honey && honey.value) return;
        var human = form.querySelector('.verify-row input[type="checkbox"]');
        if (human && !human.checked) {
          setStatus('Please verify you are human before sending.', 'error');
          human.focus();
          return;
        }
        var emailV = form.querySelector('[name="email"]');
        if (!emailV || !emailRe.test(emailV.value.trim())) {
          setStatus('Please enter a valid email address.', 'error');
          if (emailV) emailV.focus();
          return;
        }
        var dateV = form.querySelector('[name="event_date"]');
        if (!dateV || !dateV.value) {
          setStatus('Please choose your event date.', 'error');
          if (dateV) dateV.focus();
          return;
        }
        var zipV = form.querySelector('[name="delivery_zip"]');
        if (!zipV || !zipV.value.trim()) {
          setStatus('Please enter your delivery zip code.', 'error');
          if (zipV) zipV.focus();
          return;
        }
        var msgV = form.querySelector('[name="message"]');
        if (!msgV || !msgV.value.trim()) {
          setStatus('Please write your message.', 'error');
          if (msgV) msgV.focus();
          return;
        }
        var fileV = form.querySelector('[name="attachment"]');
        if (fileV && fileV.files && fileV.files[0] && fileV.files[0].size > 10 * 1024 * 1024) {
          setStatus('Please attach a file smaller than 10 MB.', 'error');
          return;
        }
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        setStatus('', '');
        var done = false;
        function finish(ok) {
          if (done) return;
          done = true;
          if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
          if (ok) {
            setStatus('Thank you! Your inquiry has been submitted successfully. We will contact you soon.', 'success');
            form.reset();
          } else {
            setStatus('Sorry, your message could not be sent. Please try again, or call us at 718.675.2820.', 'error');
          }
        }
        if (!target) { finish(false); return; }
        form.setAttribute('target', target.name);
        var timer = setTimeout(function () { finish(false); }, 30000);
        var poll = setInterval(function () {
          var href = '';
          try { href = target.contentWindow.location.href; } catch (err) { /* cross-origin while on formsubmit.co */ }
          if (href && href.indexOf('/form-sent') !== -1) {
            clearInterval(poll); clearTimeout(timer); finish(true);
          }
        }, 500);
        target.onload = function () {
          var href = '';
          try { href = target.contentWindow.location.href; } catch (err) { /* cross-origin */ }
          if (href && href.indexOf('/form-sent') !== -1) {
            clearInterval(poll); clearTimeout(timer); finish(true);
          }
        };
        form.submit();
      });
    });
  })();
});

/* Copyright year stays current automatically */
(function(){var y=document.getElementById('copy-year');if(y)y.textContent=new Date().getFullYear();})();

/* Mobile nav: hamburger toggle */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    }
  });
})();
