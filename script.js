document.documentElement.classList.add('js');

const body = document.body;
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

const setMenuOpen = (open) => {
  body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
};

menuButton?.addEventListener('click', () => setMenuOpen(!body.classList.contains('menu-open')));

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && body.classList.contains('menu-open')) {
    setMenuOpen(false);
    menuButton?.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980 && body.classList.contains('menu-open')) setMenuOpen(false);
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.documentElement.classList.add('has-reveal');
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox?.querySelector('img');
const closeLightbox = lightbox?.querySelector('.lightbox-close');

document.querySelectorAll('[data-lightbox]').forEach((item) => {
  const description = item.querySelector('img')?.alt || 'Fotografia';
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Ampliar fotografia: ${description}`);

  const open = () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = item.dataset.lightbox;
    lightboxImage.alt = description;
    lightbox.showModal();
  };

  item.addEventListener('click', open);
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
});

closeLightbox?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

const form = document.getElementById('briefing-form');
const formNote = document.getElementById('form-note');
const briefingFallback = document.getElementById('briefing-fallback');
const submitButton = form?.querySelector('button[type="submit"]');
if (submitButton) submitButton.disabled = false;

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const briefing = [
    'Olá, Bia. Quero solicitar um orçamento.',
    '',
    `Nome: ${data.get('nome') || ''}`,
    `Empresa / projeto: ${data.get('empresa') || '-'}`,
    `Tipo de trabalho: ${data.get('tipo') || ''}`,
    '',
    'Sobre o projeto:',
    `${data.get('mensagem') || ''}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(briefing);
    briefingFallback.hidden = true;
    formNote.textContent = 'Briefing copiado. Agora é só colar no WhatsApp ou Instagram da Bia.';
    formNote.classList.add('success');
  } catch {
    formNote.classList.remove('success');
    formNote.textContent = 'Não foi possível copiar automaticamente. O briefing está selecionado abaixo para você copiar e enviar.';
    briefingFallback.value = briefing;
    briefingFallback.hidden = false;
    briefingFallback.focus();
    briefingFallback.select();
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
