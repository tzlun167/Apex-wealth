/* 鼎富資本 · 微動效與導覽
   原則：緩慢漸顯、優雅位移；不閃爍、不快速飛入。 */

(function () {
  'use strict';

  /* 1. 捲動後頁首轉為實色 ------------------------------------------------ */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 2. 行動版導覽 -------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* 3. 交錯序號：標記同組子元素，讓它們依序出現（先處理，再交給 observer） */
  document.querySelectorAll('[data-stagger],[data-reveal-group]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--i', i);
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
    });
  });

  /* 4. 進場漸顯（IntersectionObserver，緩慢） ---------------------------- */
  var targets = document.querySelectorAll('[data-reveal]');

  var reveal = function (el) {
    el.classList.add('is-visible');
  };

  if (!('IntersectionObserver' in window)) {
    targets.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* 5. 首屏元素立即漸顯（避免等待 observer） ----------------------------- */
  window.addEventListener('load', function () {
    document.querySelectorAll('.hero [data-reveal]').forEach(function (el, i) {
      setTimeout(function () { reveal(el); }, 220 + i * 180);
    });
  });

  /* 6. 年份 ------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* 7. 預約表單：靜態站，改以郵件送出（不假造後端） --------------------- */
  var form = document.querySelector('[data-enquiry-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (v, k) {
        if (String(v).trim()) lines.push(k + '：' + v);
      });
      var to = form.getAttribute('data-mailto') || 'office@apex-wealth.com.tw';
      var subject = '【尊榮預約】家族辦公室諮詢申請';
      window.location.href =
        'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
