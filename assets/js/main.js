/* 鼎富家族辦公室 · 微動效與導覽
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

  /* =====================================================================
     7. 預約表單
     ---------------------------------------------------------------------
     兩種送出模式，由下列設定決定。靜態站沒有後端，因此：

       模式 A（預設）mailto  —  開啟訪客本機郵件軟體，內容預先填好。
                              零設定即可用，但依賴訪客裝了郵件軟體。
       模式 B endpoint       —  POST 到表單服務（Web3Forms / Formspree /
                              自建 API），真正在伺服器端收件。

     要切換到模式 B：把 endpoint 填上服務給的網址即可，其餘不用改。
     Web3Forms 為例：
       provider: 'web3forms',
       endpoint: 'https://api.web3forms.com/submit',
       accessKey: '<你的 access key>'
     ===================================================================== */
  var ENQUIRY = {
    provider: 'mailto',
    endpoint: '',
    accessKey: '',
    subject: '【尊榮預約】家族辦公室諮詢申請',
    subjectEn: 'Private Enquiry — Apex Wealth Family Office',
    successMsg: '已送出。我們將於三個工作日內與您聯繫。',
    successMsgEn: 'Sent. We will contact you within three business days.',
    errorMsg: '送出未成功，請稍後再試，或直接來信。',
    errorMsgEn: 'Submission failed. Please retry, or write to us directly.'
  };

  var form = document.querySelector('[data-enquiry-form]');
  if (form) {
    var isEn = document.body.classList.contains('lang-en');
    var statusEl = document.createElement('p');
    statusEl.className = 'form__status';
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');
    form.appendChild(statusEl);

    var collect = function () {
      var out = [];
      new FormData(form).forEach(function (v, k) {
        if (String(v).trim()) out.push([k, String(v)]);
      });
      return out;
    };

    /* 模式 A：mailto */
    var sendViaMail = function (pairs) {
      var to = form.getAttribute('data-mailto') || 'office@apex-wealth.com.tw';
      var body = pairs.map(function (p) { return p[0] + '：' + p[1]; }).join('\n');
      window.location.href =
        'mailto:' + to +
        '?subject=' + encodeURIComponent(isEn ? ENQUIRY.subjectEn : ENQUIRY.subject) +
        '&body=' + encodeURIComponent(body);
      statusEl.textContent = '';
      statusEl.className = 'form__status';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var pairs = collect();

      /* 未設定 endpoint → 走 mailto（不假造後端） */
      if (!ENQUIRY.endpoint) {
        sendViaMail(pairs);
        return;
      }

      /* 模式 B：POST 到表單服務 */
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      statusEl.textContent = '';
      statusEl.className = 'form__status';

      var payload = {};
      pairs.forEach(function (p) { payload[p[0]] = p[1]; });
      if (ENQUIRY.accessKey) payload.access_key = ENQUIRY.accessKey;
      payload.subject = isEn ? ENQUIRY.subjectEn : ENQUIRY.subject;
      payload.from_name = 'Apex Wealth Family Office Website';

      fetch(ENQUIRY.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (res) {
          if (res && res.success) {
            form.reset();
            statusEl.textContent = isEn ? ENQUIRY.successMsgEn : ENQUIRY.successMsg;
            statusEl.className = 'form__status is-ok';
          } else {
            throw new Error((res && res.message) || 'failed');
          }
        })
        .catch(function () {
          statusEl.textContent = isEn ? ENQUIRY.errorMsgEn : ENQUIRY.errorMsg;
          statusEl.className = 'form__status is-error';
        })
        .then(function () {
          if (btn) btn.disabled = false;
        });
    });
  }
})();
