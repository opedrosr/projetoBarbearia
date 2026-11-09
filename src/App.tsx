import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowUpRight, Check, Clock3, Heart, MapPin, Menu, MessageCircle, Minus, Plus, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Part } from '@/components/Configurator3D';
import { brl, store, waLink, type Category, type Product } from '@/data/store';

const Configurator3D = lazy(() => import('@/components/Configurator3D'));

const ease = [0.22, 1, 0.36, 1] as const;

// Imagens institucionais genéricas. Fotos reais de projetos devem ser cadastradas
// separadamente; não associamos uma imagem aleatória a um produto sem foto.
const atelierPhotos = [
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80',
];

const projectPhotos = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
];

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, delay, ease }}>
      {children}
    </motion.div>
  );
}

/** Imagem com fallback visual estável: nunca troca o produto por uma foto de outro móvel. */
function Photo({ src, alt, className = '', loading = 'lazy' }: { src?: string; alt: string; className?: string; loading?: 'lazy' | 'eager' }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`photo ${className} ${failed || !src ? 'photo-fallback' : ''}`}>
      {src && !failed ? (
        <img src={src} alt={alt} loading={loading} decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span className="photo-placeholder" aria-label={`Imagem indisponível: ${alt}`}>Imagem indisponível</span>
      )}
    </div>
  );
}

type QuoteMap = Record<string, number>;

function readQuote(): QuoteMap {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('quote') || '[]');
    // Migração compatível: versões anteriores salvavam apenas uma lista de IDs.
    if (Array.isArray(parsed)) {
      return Object.fromEntries(parsed.filter((id): id is string => typeof id === 'string').map((id) => [id, 1]));
    }
    if (parsed && typeof parsed === 'object') {
      return Object.fromEntries(Object.entries(parsed as Record<string, unknown>)
        .filter(([id, qty]) => typeof id === 'string' && Number.isInteger(qty) && Number(qty) > 0)
        .map(([id, qty]) => [id, Math.min(Number(qty), 99)]));
    }
  } catch {
    // Armazenamento indisponível ou conteúdo inválido.
  }
  return {};
}

function useQuote() {
  const [items, setItems] = useState<QuoteMap>(readQuote);

  useEffect(() => {
    try {
      localStorage.setItem('quote', JSON.stringify(items));
    } catch {
      /* Navegação privada ou armazenamento cheio. */
    }
  }, [items]);

  return {
    items,
    count: Object.values(items).reduce((sum, qty) => sum + qty, 0),
    has: (id: string) => Boolean(items[id]),
    quantity: (id: string) => items[id] || 0,
    toggle: (id: string) => setItems((current) => {
      if (current[id]) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: 1 };
    }),
    increment: (id: string) => setItems((current) => ({ ...current, [id]: Math.min((current[id] || 0) + 1, 99) })),
    decrement: (id: string) => setItems((current) => {
      const nextQty = (current[id] || 0) - 1;
      if (nextQty <= 0) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: nextQty };
    }),
    remove: (id: string) => setItems((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    }),
    clear: () => setItems({}),
  };
}

const nav = [
  ['#colecao', 'Coleção'],
  ['#atelie', 'Ateliê'],
  ['#projetos', 'Projetos'],
  ['#visita', 'Visita'],
] as const;

const marquee = ['sob medida', 'bespoke', 'feito à mão', 'bespoke'];

export default function App() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState<'Todos' | Category>('Todos');
  const [open, setOpen] = useState<Product | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  const quote = useQuote();

  // configurador (fica no herói)
  const cfg = store.configurator;
  const [fabricId, setFabricId] = useState(cfg.fabrics[0].id);
  const [woodId, setWoodId] = useState(cfg.woods[0].id);
  const [part, setPart] = useState<Part>(null);
  const fabric = cfg.fabrics.find((f) => f.id === fabricId)!;
  const wood = cfg.woods.find((w) => w.id === woodId)!;
  const total = cfg.basePrice + fabric.extra + wood.extra;
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { margin: '100px' });

  const [form, setForm] = useState({ name: '', phone: '', room: 'Sala de estar', note: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lock = menu || !!open || quoteOpen;
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [menu, open, quoteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        setOpen(null);
        setQuoteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const list = useMemo(() => store.products.filter((p) => filter === 'Todos' || p.category === filter), [filter]);
  const quoteItems = store.products.filter((p) => quote.has(p.id));
  const quoteTotal = quoteItems.reduce((sum, p) => sum + p.price * quote.quantity(p.id), 0);

  const sendQuote = () => {
    const lines = quoteItems.map((p) => `• ${p.name} — ${quote.quantity(p.id)} un. × ${brl(p.price)} = ${brl(p.price * quote.quantity(p.id))}`).join('\n');
    window.open(waLink(`Olá! Montei uma lista pelo site e gostaria de um orçamento:\n\n${lines}\n\nTotal de referência: ${brl(quoteTotal)}`), '_blank', 'noopener');
  };

  const sendConfig = () =>
    window.open(
      waLink(`Olá! Montei a Poltrona Alba no site:\n• Tecido: ${fabric.name}\n• Madeira: ${wood.name}\n• Valor de referência: ${brl(total)}\n\nGostaria de falar sobre prazo e medidas.`),
      '_blank',
      'noopener',
    );

  const sendVisit = (e: FormEvent) => {
    e.preventDefault();
    window.open(
      waLink(`Olá! Me chamo ${form.name}. Gostaria de agendar uma visita ao showroom.\nAmbiente: ${form.room}\nTelefone: ${form.phone}${form.note ? `\nObservação: ${form.note}` : ''}`),
      '_blank',
      'noopener',
    );
  };

  return (
    <div className="shell">
      {/* ---------- HEADER ---------- */}
      <header className={`header ${scrolled || menu ? 'solid' : ''}`}>
        <a className="logo" href="#topo" aria-label={`${store.name} — início`}>
          <i className="logo-mark" />
          {store.short}
        </a>

        <nav className="pill-nav" aria-label="Principal">
          {nav.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="header-right">
          <button className="icon-btn" onClick={() => setQuoteOpen(true)} aria-label={`Lista de orçamento, ${quote.count} itens`}>
            <Heart size={17} strokeWidth={1.6} />
            {quote.count > 0 && <b>{quote.count}</b>}
          </button>

          <a className="pill dark hide-sm" href="#colecao">
            Explorar <Plus size={14} />
          </a>

          <button className="icon-btn menu-btn" onClick={() => setMenu((m) => !m)} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu}>
            {menu ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div className="sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <nav aria-label="Menu móvel">
              {nav.map(([href, label], i) => (
                <motion.a key={href} href={href} onClick={() => setMenu(false)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.1, duration: 0.6, ease }}>
                  {label}
                  <small>0{i + 1}</small>
                </motion.a>
              ))}
            </nav>

            <a className="pill dark big" href={waLink('Olá! Vim pelo site e gostaria de atendimento.')} target="_blank" rel="noreferrer">
              Falar no WhatsApp <ArrowUpRight size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="topo">
        {/* ---------- HERO = CONFIGURADOR 3D ---------- */}
        <section className="hero" ref={heroRef}>
          <h1 className="hero-word">
            <motion.span initial={{ y: '30%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.3, ease }}>
              {store.heroWord}
            </motion.span>
          </h1>

          <p className="hero-tag">
            {store.tagline} · {store.city}
          </p>

          <p className="hero-sub">
            Móveis desenhados e feitos no nosso ateliê, em madeira maciça e tecidos selecionados. Gire a poltrona e monte a sua.
          </p>

          <div className="hero-stage">
            <Suspense fallback={<div className="scene-fallback">Carregando…</div>}>
              <Configurator3D fabric={fabric} wood={wood} active={part} onSelect={setPart} running={heroInView} />
            </Suspense>
          </div>

          <p className="stage-hint">arraste para girar · toque nos pontos</p>

          <div className="cfg-bar">
            <div className={`cfg-group ${part === 'fabric' ? 'focus' : ''}`}>
              <span className="cfg-label">Tecido <em>{fabric.name}</em></span>

              <div className="dots-row">
                {cfg.fabrics.map((f) => (
                  <button key={f.id} className={`dot ${f.id === fabricId ? 'on' : ''}`} style={{ background: f.hex }} onClick={() => { setFabricId(f.id); setPart('fabric'); }} aria-label={f.name} aria-pressed={f.id === fabricId}>
                    {f.id === fabricId && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>

            <div className={`cfg-group ${part === 'wood' ? 'focus' : ''}`}>
              <span className="cfg-label">Madeira <em>{wood.name}</em></span>

              <div className="dots-row">
                {cfg.woods.map((w) => (
                  <button key={w.id} className={`dot ${w.id === woodId ? 'on' : ''}`} style={{ background: w.hex }} onClick={() => { setWoodId(w.id); setPart('wood'); }} aria-label={w.name} aria-pressed={w.id === woodId}>
                    {w.id === woodId && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="cfg-buy">
              <div>
                <small>Poltrona Alba</small>
                <strong>{brl(total)}</strong>
              </div>

              <button className="pill dark" onClick={sendConfig}>
                Pedir <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ---------- FAIXA ESCURA + COLEÇÃO ---------- */}
        <div className="slab">
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[0, 1].map((k) => (
                <div key={k} className="marquee-set">
                  {marquee.map((t, i) => (
                    <span key={`${k}-${i}`}>
                      {t}
                      <i>+</i>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <section className="collection pad" id="colecao">
            <Reveal className="col-head">
              <h2>coleção</h2>
              <p>Peças de pronta entrega e sob encomenda. Toque no coração para montar sua lista e pedir orçamento de uma vez.</p>
            </Reveal>

            <div className="filters" role="tablist" aria-label="Filtrar por ambiente">
              {(['Todos', ...store.categories] as const).map((c) => (
                <button key={c} role="tab" aria-selected={filter === c} className={filter === c ? 'on' : ''} onClick={() => setFilter(c)}>
                  {c}
                </button>
              ))}
            </div>

            <motion.div layout className="grid">
              <AnimatePresence mode="popLayout">
                {list.map((p) => (
                  <motion.article layout key={p.id} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }}>
                    <button className="card-media" onClick={() => setOpen(p)} aria-label={`Ver detalhes de ${p.name}`}>
                      <Photo src={p.image} alt={p.name} />
                    </button>

                    <button className={`save ${quote.has(p.id) ? 'on' : ''}`} onClick={() => quote.toggle(p.id)} aria-pressed={quote.has(p.id)} aria-label={quote.has(p.id) ? 'Remover da lista' : 'Adicionar à lista de orçamento'}>
                      <Heart size={16} strokeWidth={1.6} fill={quote.has(p.id) ? 'currentColor' : 'none'} />
                    </button>

                    <button className="card-info" onClick={() => setOpen(p)} aria-label={`Ver detalhes de ${p.name}`}>
                      <h3>{p.name}</h3>
                      <span className="price">{brl(p.price)}</span>
                    </button>

                    <p className="card-mat">{p.material}</p>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        </div>

        {/* ---------- ATELIÊ ---------- */}
        <section className="atelie pad" id="atelie">
          <Reveal className="sec-head">
            <h2>feito com tempo,<br />material e mão.</h2>
            <p>Cada peça nasce no nosso ateliê e é ajustada à medida da sua casa.</p>
          </Reveal>

          <div className="craft">
            {store.craft.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08} className="glass-card">
                <div className="glass-art">
                  <Photo src={atelierPhotos[i % atelierPhotos.length]} alt={`Referência visual: ${c.title}`} />
                </div>

                <div className="glass-foot">
                  <span className="pill-num">0{i + 1}</span>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <ol className="steps">
            {store.steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.06}>
                <li>
                  <b>{s.n}</b>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ---------- PROJETOS ---------- */}
        <section className="projects" id="projetos">
          <Reveal className="sec-head pad-x">
            <h2>projetos<br />entregues.</h2>
          </Reveal>

          <div className="proj-track">
            {store.testimonials.map((t, i) => (
              <article key={t.name} className="proj">
                <div className="proj-art">
                  <Photo src={projectPhotos[i % projectPhotos.length]} alt={`Referência de ambiente — ${t.detail}`} />
                  <span className="pill light">{t.detail}</span>
                </div>

                <blockquote>“{t.quote}”</blockquote>
                <strong>{t.name}</strong>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="faq pad">
          <Reveal className="sec-head">
            <h2>dúvidas<br />frequentes.</h2>
          </Reveal>

          <div className="faq-list">
            {store.faqs.map(([q, a], i) => (
              <div key={q} className={`faq-item ${faq === i ? 'open' : ''}`}>
                <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>
                  <span>{q}</span>
                  <i>{faq === i ? <Minus size={16} strokeWidth={1.8} /> : <Plus size={16} strokeWidth={1.8} />}</i>
                </button>

                <AnimatePresence initial={false}>
                  {faq === i && (
                    <motion.div className="faq-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }}>
                      <p>{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- VISITA ---------- */}
        <section className="visit-wrap" id="visita">
          <div className="visit">
            <Reveal className="visit-copy">
              <h2>venha sentar<br />antes de decidir.</h2>

              <ul>
                <li><MapPin size={18} strokeWidth={1.5} />{store.address}</li>
                <li><Clock3 size={18} strokeWidth={1.5} /><span>{store.hours.map((h) => <span key={h} className="block">{h}</span>)}</span></li>
              </ul>

              <a className="pill light" href={`https://www.google.com/maps/search/?api=1&query=${store.mapsQuery}`} target="_blank" rel="noreferrer">
                Abrir no mapa <ArrowUpRight size={15} />
              </a>
            </Reveal>

            <Reveal delay={0.1}>
              <form className="form" onSubmit={sendVisit}>
                <label>
                  <span>Seu nome</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                </label>

                <label>
                  <span>WhatsApp</span>
                  <input required inputMode="tel" autoComplete="tel" placeholder="(31) 9 0000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>

                <label>
                  <span>Ambiente</span>
                  <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
                    {['Sala de estar', 'Sala de jantar', 'Quarto', 'Escritório', 'Casa inteira'].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Observação (opcional)</span>
                  <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </label>

                <button className="pill light big full" type="submit">
                  Agendar pelo WhatsApp <ArrowUpRight size={16} />
                </button>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <div className="footer-top">
          <a className="logo big-logo" href="#topo">
            <i className="logo-mark" />
            {store.name}
          </a>

          <div className="footer-cols">
            <div>
              <small>Navegar</small>
              {nav.map(([href, label]) => (
                <a key={href} href={href}>{label}</a>
              ))}
            </div>

            <div>
              <small>Contato</small>
              <a href={waLink('Olá!')} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={store.instagram} target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
        </div>

        <div className="footer-row">
          <span>© {new Date().getFullYear()} {store.name} · {store.city}</span>
          <a href="#topo">Voltar ao topo ↑</a>
        </div>
      </footer>

      {/* ---------- BARRA FIXA MOBILE ---------- */}
      <div className={`dock ${scrolled ? 'show' : ''}`}>
        <button onClick={() => setQuoteOpen(true)}>
          <Heart size={17} strokeWidth={1.6} /> Lista ({quote.count})
        </button>

        <a href={waLink('Olá! Vim pelo site e gostaria de atendimento.')} target="_blank" rel="noreferrer">
          <MessageCircle size={17} strokeWidth={1.6} /> WhatsApp
        </a>
      </div>

      {/* ---------- MODAL DE PRODUTO ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div className="modal" role="dialog" aria-modal="true" aria-label={open.name} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.5, ease }} onClick={(e) => e.stopPropagation()}>
              <button className="close" onClick={() => setOpen(null)} aria-label="Fechar"><X size={19} strokeWidth={1.6} /></button>

              <Photo key={open.id} src={open.image} alt={open.name} className="modal-photo" loading="eager" />

              <div className="modal-body">
                <span className="pill light tiny">{open.category}</span>
                <h3>{open.name}</h3>
                <p className="price big">{brl(open.price)}</p>
                <p className="desc">{open.description}</p>

                <dl>
                  <div><dt>Material</dt><dd>{open.material}</dd></div>
                  <div><dt>Medidas</dt><dd>{open.dimensions}</dd></div>
                  <div><dt>Categoria</dt><dd>{open.category}</dd></div>
                </dl>

                <div className="modal-actions">
                  <a className="pill dark big" href={waLink(`Olá! Tenho interesse na peça ${open.name} (${brl(open.price)}).`)} target="_blank" rel="noreferrer">Perguntar sobre esta peça <ArrowUpRight size={16} /></a>

                  <button className="pill ghost big" onClick={() => quote.toggle(open.id)}>
                    <Heart size={15} strokeWidth={1.6} fill={quote.has(open.id) ? 'currentColor' : 'none'} /> {quote.has(open.id) ? 'Na lista' : 'Adicionar à lista'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- GAVETA DE ORÇAMENTO ---------- */}
      <AnimatePresence>
        {quoteOpen && (
          <motion.div className="overlay right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuoteOpen(false)}>
            <motion.aside className="drawer" role="dialog" aria-modal="true" aria-label="Lista de orçamento" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.5, ease }} onClick={(e) => e.stopPropagation()}>
              <div className="drawer-head">
                <h3>sua lista</h3>
                <button className="icon-btn" onClick={() => setQuoteOpen(false)} aria-label="Fechar"><X size={20} strokeWidth={1.6} /></button>
              </div>

              {quoteItems.length === 0 ? (
                <p className="empty">Toque no coração das peças que gostou para montar uma lista e pedir orçamento de uma vez.</p>
              ) : (
                <>
                  <ul className="drawer-list">
                    {quoteItems.map((p) => (
                      <li key={p.id}>
                        <Photo src={p.image} alt={p.name} className="thumb" />

                        <div>
                          <strong>{p.name}</strong>
                          <span>{p.material}</span>
                          <em>{brl(p.price)} · {brl(p.price * quote.quantity(p.id))} subtotal</em>
                          <div className="quantity-control" aria-label={`Quantidade de ${p.name}`}>
                            <button onClick={() => quote.decrement(p.id)} aria-label={`Diminuir quantidade de ${p.name}`}><Minus size={13} /></button>
                            <b>{quote.quantity(p.id)}</b>
                            <button onClick={() => quote.increment(p.id)} aria-label={`Aumentar quantidade de ${p.name}`}><Plus size={13} /></button>
                          </div>
                        </div>

                        <button onClick={() => quote.remove(p.id)} aria-label={`Remover ${p.name}`}><X size={16} strokeWidth={1.6} /></button>
                      </li>
                    ))}
                  </ul>

                  <div className="drawer-foot">
                    <div className="sum"><span>Total de referência</span><strong>{brl(quoteTotal)}</strong></div>
                    <button className="pill dark big full" onClick={sendQuote}>Pedir orçamento no WhatsApp <ArrowUpRight size={16} /></button>
                    <button className="clear" onClick={quote.clear}>Limpar lista</button>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}