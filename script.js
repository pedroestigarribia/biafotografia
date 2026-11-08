document.documentElement.classList.add('js');

const body = document.body;
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

const setMenuOpen = (open) => {
  body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (open) menuButton.focus({ preventScroll: true });
};

menuButton?.addEventListener('click', () => setMenuOpen(!body.classList.contains('menu-open')));

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (!body.classList.contains('menu-open')) return;
  if (event.key === 'Escape') {
    setMenuOpen(false);
    menuButton?.focus();
  } else if (event.key === 'Tab') {
    const links = nav?.querySelectorAll('a');
    const lastLink = links?.[links.length - 1];
    if (document.activeElement !== menuButton && !nav?.contains(document.activeElement)) {
      event.preventDefault();
      menuButton?.focus();
    } else if (event.shiftKey && document.activeElement === menuButton && lastLink) {
      event.preventDefault();
      lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      menuButton?.focus();
    }
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
const briefingWhatsApp = document.getElementById('briefing-whatsapp');
const whatsappBase = briefingWhatsApp?.href;
const initialFormNote = formNote?.textContent;
const submitButton = form?.querySelector('button[type="submit"]');
let briefingRevision = 0;
if (submitButton) submitButton.disabled = false;

const makeBriefing = () => {
  const data = new FormData(form);
  return [
    'Olá, Bia. Quero solicitar um orçamento.',
    '',
    `Nome: ${data.get('nome') || ''}`,
    `Empresa / projeto: ${data.get('empresa') || '-'}`,
    `Tipo de trabalho: ${data.get('tipo') || ''}`,
    '',
    'Sobre o projeto:',
    `${data.get('mensagem') || ''}`
  ].join('\n');
};

const updateWhatsApp = () => {
  if (!briefingWhatsApp || !whatsappBase) return;
  if (!form.checkValidity()) {
    briefingWhatsApp.href = '#contato';
    return;
  }
  const destination = new URL(whatsappBase);
  destination.searchParams.set('text', makeBriefing());
  briefingWhatsApp.href = destination.href;
};
updateWhatsApp();

form?.addEventListener('input', () => {
  briefingRevision += 1;
  formNote.textContent = initialFormNote;
  formNote.classList.remove('success');
  briefingFallback.hidden = true;
  updateWhatsApp();
});

briefingWhatsApp?.addEventListener('click', (event) => {
  if (!form.reportValidity()) {
    event.preventDefault();
    return;
  }
  updateWhatsApp();
  formNote.textContent = 'Revise e envie a mensagem no WhatsApp.';
  formNote.classList.remove('success');
  briefingFallback.hidden = true;
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;
  const briefing = makeBriefing();
  const revision = briefingRevision;
  submitButton.disabled = true;
  formNote.textContent = 'Copiando briefing...';
  formNote.classList.remove('success');
  briefingFallback.hidden = true;

  try {
    await navigator.clipboard.writeText(briefing);
    if (revision !== briefingRevision) return;
    briefingFallback.hidden = true;
    formNote.textContent = 'Briefing copiado. Agora é só colar no WhatsApp ou Instagram da Bia.';
    formNote.classList.add('success');
  } catch {
    if (revision !== briefingRevision) return;
    formNote.classList.remove('success');
    formNote.textContent = 'Não foi possível copiar automaticamente. O briefing está selecionado abaixo para você copiar e enviar.';
    briefingFallback.value = briefing;
    briefingFallback.hidden = false;
    briefingFallback.focus();
    briefingFallback.select();
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
