(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Menú móvil ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#menu');
  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    $('.sr-only', toggle).textContent = 'Abrir menú';
  }
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', toggle).textContent = open ? 'Cerrar menú' : 'Abrir menú';
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Idiomas de la portada ---------- */
  var heroWord = $('#hero-word');
  var orbitWord = $('#orbit-word');
  $$('.lang').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.lang').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      heroWord.classList.add('swap');
      orbitWord.classList.add('swap');
      setTimeout(function () {
        heroWord.textContent = btn.dataset.word;
        heroWord.lang = btn.dataset.lang;
        orbitWord.textContent = btn.dataset.hi;
        heroWord.classList.remove('swap');
        orbitWord.classList.remove('swap');
      }, 180);
    });
  });

  /* ---------- Recomendador de programa ---------- */
  var PROGRAMS = {
    kids: { card: 'p-kids', name: 'Kids', price: '59', unit: '€/mes en grupo',
      why: 'Clases de 45 minutos con juegos, pensadas para niños de 6 a 12 años.' },
    trabajoGrupo: { card: 'p-trabajo', name: 'Idiomas para el trabajo', price: '59', unit: '€/mes en grupo',
      why: 'Grupo de 6 personas con reuniones, emails y entrevistas, y el vocabulario de tu sector.' },
    trabajoPart: { card: 'p-trabajo', name: 'Idiomas para el trabajo, particular', price: '22', unit: '€/h',
      why: 'Clases individuales centradas en tu sector y en lo que necesitas en tu puesto.' },
    examenes: { card: 'p-examenes', name: 'Preparación de exámenes', price: '79', unit: '€/mes',
      why: 'Grupo con simulacros de examen cada mes: Cambridge, DELF, Goethe, DELE…' },
    conversacion: { card: 'p-conversacion', name: 'Conversación', price: '39', unit: '€/mes',
      why: 'Grupos de 4 con profesor nativo, una hora por sesión. Necesitas tener ya algo de base: la prueba de nivel gratis lo confirma.' },
    grupo: { card: null, name: 'Curso en grupo', price: '59', unit: '€/mes',
      why: 'Dos clases por semana en directo, con la grabación disponible si faltas.' },
    particular: { card: null, name: 'Clases particulares', price: '22', unit: '€/h',
      why: 'Atención individual, a tu ritmo y en el horario que te venga bien.' }
  };
  var STEPS = {
    quien: { n: 1, q: '¿Para quién son las clases?', options: [
      { t: 'Para mí', s: 'Adulto o joven a partir de 13 años', next: 'objetivo' },
      { t: 'Para un niño o una niña', s: 'De 6 a 12 años', result: 'kids' }
    ] },
    objetivo: { n: 2, q: '¿Qué quieres conseguir?', options: [
      { t: 'Usar el idioma en el trabajo', s: 'Reuniones, emails, entrevistas', next: 'formatoTrabajo' },
      { t: 'Sacar un título oficial', s: 'Cambridge, DELF, Goethe, DELE…', result: 'examenes' },
      { t: 'Soltarme a hablar', s: 'Ya tengo base', result: 'conversacion' },
      { t: 'Aprender o mejorar en general', s: 'Desde el nivel que tenga', next: 'formatoGeneral' }
    ] },
    formatoTrabajo: { n: 3, q: '¿Cómo prefieres las clases?', options: [
      { t: 'En grupo', s: '6 personas de perfil parecido', result: 'trabajoGrupo' },
      { t: 'Particulares', s: 'Solo tú y el profesor', result: 'trabajoPart' }
    ] },
    formatoGeneral: { n: 3, q: '¿Cómo prefieres las clases?', options: [
      { t: 'En grupo', s: '2 clases por semana', result: 'grupo' },
      { t: 'Particulares', s: 'Solo tú y el profesor', result: 'particular' }
    ] }
  };
  var quiz = $('#quiz');
  var trail = [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function progress(n) {
    var p = el('div', 'quiz-progress');
    for (var i = 1; i <= 3; i++) p.appendChild(el('i', i <= n ? 'on' : ''));
    return p;
  }
  function clearPick() { $$('.program-card.is-pick').forEach(function (c) { c.classList.remove('is-pick'); }); }

  function showStep(key, focus) {
    var step = STEPS[key];
    clearPick();
    quiz.innerHTML = '';
    quiz.appendChild(progress(step.n));
    quiz.appendChild(el('p', 'quiz-step', 'Pregunta ' + step.n + ' de 3'));
    quiz.appendChild(el('h3', '', step.q));
    var list = el('div', 'quiz-options');
    step.options.forEach(function (o) {
      var b = el('button', 'quiz-option');
      b.type = 'button';
      var span = el('span', '', o.t);
      span.appendChild(el('small', '', o.s));
      b.appendChild(span);
      b.addEventListener('click', function () {
        trail.push(key);
        if (o.result) showResult(o.result); else showStep(o.next, true);
      });
      list.appendChild(b);
    });
    quiz.appendChild(list);
    if (trail.length) quiz.appendChild(backFoot());
    if (focus) $('.quiz-option', quiz).focus();
  }
  function backFoot() {
    var foot = el('div', 'quiz-foot');
    var back = el('button', 'quiz-back', '← Volver a la pregunta anterior');
    back.type = 'button';
    back.addEventListener('click', function () { showStep(trail.pop(), true); });
    foot.appendChild(back);
    return foot;
  }
  function showResult(id) {
    var p = PROGRAMS[id];
    quiz.innerHTML = '';
    quiz.appendChild(progress(3));
    var box = el('div', 'quiz-result');
    box.appendChild(el('p', 'quiz-step', 'Te recomendamos'));
    var h = el('h3', '', p.name);
    h.tabIndex = -1;
    box.appendChild(h);
    var price = el('p', 'quiz-price', p.price + ' ');
    price.appendChild(el('small', '', p.unit));
    box.appendChild(price);
    box.appendChild(el('p', '', p.why));
    box.appendChild(el('p', '', 'Sin matrícula ni permanencia, y la primera clase es gratis.'));
    var actions = el('div', 'quiz-actions');
    var a = el('a', 'button button-primary', 'Pide tu prueba de nivel gratis');
    a.href = '#preguntanos';
    actions.appendChild(a);
    var ask = el('button', 'button button-ghost', 'Pregunta al asistente');
    ask.type = 'button';
    ask.addEventListener('click', function () { askChat('Quiero saber más sobre ' + p.name.split(',')[0]); });
    actions.appendChild(ask);
    box.appendChild(actions);
    quiz.appendChild(box);
    var foot = el('div', 'quiz-foot');
    var again = el('button', 'quiz-back', 'Empezar de nuevo');
    again.type = 'button';
    again.addEventListener('click', function () { trail = []; showStep('quien', true); });
    foot.appendChild(again);
    quiz.appendChild(foot);
    clearPick();
    if (p.card) $('#' + p.card).classList.add('is-pick');
    h.focus();
  }
  showStep('quien', false);

  /* ---------- Calculadora ---------- */
  var sel = $('#calc-program');
  var hours = $('#calc-hours');
  var DETAIL = {
    grupo: 'Curso en grupo, 2 clases por semana.',
    conversacion: 'Conversación, grupos de 4 con profesor nativo.',
    examenes: 'Preparación de exámenes, con simulacros mensuales.',
    kids: 'Kids en grupo, clases de 45 minutos con juegos.'
  };
  function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '').replace('.', ','); }
  function calc() {
    var opt = sel.options[sel.selectedIndex];
    var price = Number(opt.dataset.price);
    var isPart = sel.value === 'particular';
    $('#calc-hours-field').hidden = !isPart;
    $('#calc-hours-out').textContent = hours.value;
    var base = isPart ? price * Number(hours.value) : price;
    var disc = Number($('input[name="disc"]:checked').value);
    var total = base * (1 - disc / 100);
    $('#calc-total').textContent = fmt(total);
    var detail = isPart ? hours.value + ' h de clases particulares a 22 €/h.' : DETAIL[sel.value];
    if (disc) detail += ' Ahorras ' + fmt(base - total) + ' € al mes con el ' + disc + ' % de descuento.';
    $('#calc-detail').textContent = detail;
  }
  sel.addEventListener('change', calc);
  hours.addEventListener('input', calc);
  $$('input[name="disc"]').forEach(function (r) { r.addEventListener('change', calc); });
  calc();

  /* ---------- Preguntas rápidas: abren el chat con la pregunta ---------- */
  function waitFor(fn, ms) {
    return new Promise(function (resolve) {
      var t0 = Date.now();
      (function tick() {
        var v = fn();
        if (v) return resolve(v);
        if (Date.now() - t0 > ms) return resolve(null);
        setTimeout(tick, 120);
      })();
    });
  }
  function chatInput() { return $('.chat-window textarea, .chat-inputs textarea, .n8n-chat textarea'); }
  function visible(n) { return n && n.offsetParent !== null; }
  function askChat(question) {
    var toggleBtn = $('.chat-window-toggle');
    if (!toggleBtn) { location.hash = '#preguntanos'; return; }
    if (!visible(chatInput())) toggleBtn.click();
    waitFor(function () {
      if (visible(chatInput())) return chatInput();
      var start = $$('.chat-get-started button, .chat-window button').filter(function (b) {
        return /nueva conversaci/i.test(b.textContent) && visible(b);
      })[0];
      if (start) start.click();
      return null;
    }, 6000).then(function (ta) {
      if (!ta) return;
      var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ta, question);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.focus();
      setTimeout(function () {
        var send = $('.chat-input-send-button');
        if (send && !send.disabled) send.click();
      }, 150);
    });
  }
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () { askChat(c.dataset.q); });
  });

  /* ---------- Aparición al hacer scroll ---------- */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (i) { io.observe(i); });
  } else {
    items.forEach(function (i) { i.classList.add('in'); });
  }
})();
