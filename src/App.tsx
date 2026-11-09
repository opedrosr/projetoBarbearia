import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import type * as THREE from 'three';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  CreditCard,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Plus,
  Quote,
  X,
} from 'lucide-react';

/**
 * FERRO & FIO — template de site para barbearia (um único App.tsx + index.css).
 * Dependências: react, lucide-react, three (+ @types/three).
 * Todo o conteúdo editável está na seção "DADOS". Para revender: troque a marca,
 * os serviços, os barbeiros, os horários, o WhatsApp e as fotos. O resto se ajusta sozinho.
 */


// ==========================================================================
// DADOS (edite aqui)
// ==========================================================================

const brand = {
  /** Aparece no topo, rodapé, título da aba e mensagens do WhatsApp. */
  name: 'Ferro & Fio',
  first: 'ferro',
  second: 'fio',
  city: 'Belo Horizonte',
  since: 2019,
  title: 'Ferro & Fio · Barbearia em Belo Horizonte',
};

const contact = {
  // PLACEHOLDER — número com DDI+DDD, só dígitos
  whatsapp: '5531999999999',
  instagram: 'ferroefio.barbearia',
  email: 'contato@ferroefio.com.br',
  address: {
    line: 'Rua dos Aimorés, 1450 · loja 2',
    district: 'Savassi',
    city: 'Belo Horizonte – MG',
    zip: '30140-072',
    note: 'Estacionamento conveniado na porta. Sem fila: só com hora marcada.',
  },
  payments: ['Pix', 'Cartão em até 3x', 'Dinheiro'],
  cancellation: 'Remarcação ou cancelamento até 3 horas antes.',
  perks: ['Cerveja gelada e café', 'Wi-Fi', 'Ar-condicionado', 'Ambiente climatizado e silencioso'],
};

/**
 * FOTOS — use um número (id do Pexels) ou um caminho/URL.
 * Coloque as fotos reais da barbearia em  public/fotos/  com estes nomes (ou troque aqui).
 * Se uma foto não existir, o bloco mostra um espaço reservado elegante em vez de quebrar.
 * Dica: o CSS aplica preto e branco em tudo, então fotos de origens diferentes ficam coerentes.
 */
type Img = number | string;

const photos: Record<'hero' | 'space' | 'ritual', Img> = {
  hero: 1813272,
  space: '/fotos/espaco.jpg',
  ritual: '/fotos/ritual.jpg',
};

/** 0 = domingo … 6 = sábado. null = fechado. */
const hours: Record<number, { open: string; close: string } | null> = {
  0: null,
  1: null,
  2: { open: '10:00', close: '20:00' },
  3: { open: '10:00', close: '20:00' },
  4: { open: '10:00', close: '20:00' },
  5: { open: '10:00', close: '20:00' },
  6: { open: '09:00', close: '18:00' },
};

/** Intervalo entre horários oferecidos, em minutos. */
const slotStep = 30;
/** Antecedência mínima para agendar no mesmo dia, em minutos. */
const leadMinutes = 60;

type Category = 'cabelo' | 'barba' | 'combo' | 'extra';

interface Service {
  id: string;
  category: Category;
  name: string;
  desc: string;
  minutes: number;
  price: number;
  includes: string[];
}

const categories: { id: Category; label: string }[] = [
  { id: 'cabelo', label: 'cabelo' },
  { id: 'barba', label: 'barba' },
  { id: 'combo', label: 'combos' },
  { id: 'extra', label: 'extras' },
];

const services: Service[] = [
  {
    id: 'corte-classico',
    category: 'cabelo',
    name: 'corte',
    desc: 'Tesoura e máquina, com consulta antes: o corte nasce do formato do seu rosto e da sua rotina.',
    minutes: 45,
    price: 75,
    includes: ['Consulta de estilo', 'Lavagem e finalização', 'Acabamento na navalha'],
  },
  {
    id: 'degrade-navalhado',
    category: 'cabelo',
    name: 'degradê navalhado',
    desc: 'Transição limpa, sem marcas, finalizada na navalha. O tipo de corte que dura as duas semanas.',
    minutes: 55,
    price: 90,
    includes: ['Degradê baixo, médio ou alto', 'Desenho e contorno na navalha', 'Finalização com pomada'],
  },
  {
    id: 'corte-infantil',
    category: 'cabelo',
    name: 'corte infantil',
    desc: 'Para os pequenos, com paciência e sem choro. Até 10 anos.',
    minutes: 40,
    price: 60,
    includes: ['Corte na máquina ou tesoura', 'Acabamento'],
  },
  {
    id: 'barba-navalha',
    category: 'barba',
    name: 'barba na navalha',
    desc: 'O clássico: toalha quente, óleo pré-barba, navalha e toalha fria. Dá para fechar os olhos.',
    minutes: 40,
    price: 65,
    includes: ['Toalha quente', 'Barba na navalha', 'Loção pós-barba'],
  },
  {
    id: 'design-barba',
    category: 'barba',
    name: 'design de barba',
    desc: 'Contorno, volume e linhas pensados para equilibrar o rosto. Máquina e navalha.',
    minutes: 30,
    price: 55,
    includes: ['Modelagem e contorno', 'Hidratação com óleo', 'Orientação de manutenção'],
  },
  {
    id: 'sobrancelha',
    category: 'barba',
    name: 'sobrancelha',
    desc: 'Limpeza discreta na navalha, mantendo o formato natural.',
    minutes: 15,
    price: 25,
    includes: ['Limpeza e alinhamento'],
  },
  {
    id: 'cabelo-barba',
    category: 'combo',
    name: 'cabelo + barba',
    desc: 'Corte e barba na mesma cadeira, no mesmo horário. Sai pronto.',
    minutes: 80,
    price: 135,
    includes: ['Corte ou degradê', 'Barba na navalha', 'Toalha quente'],
  },
  {
    id: 'ritual-completo',
    category: 'combo',
    name: 'ritual completo',
    desc: 'A experiência inteira, sem pressa: corte, barba, sobrancelha, massagem e uma bebida da casa.',
    minutes: 110,
    price: 195,
    includes: ['Corte ou degradê', 'Barba na navalha', 'Sobrancelha', 'Massagem capilar', 'Bebida da casa'],
  },
  {
    id: 'pai-e-filho',
    category: 'combo',
    name: 'pai & filho',
    desc: 'Dois cortes em sequência, para quem quer resolver a semana de uma vez.',
    minutes: 80,
    price: 125,
    includes: ['Um corte adulto', 'Um corte infantil'],
  },
  {
    id: 'pigmentacao',
    category: 'extra',
    name: 'pigmentação',
    desc: 'Cobre falhas e dá densidade ao cabelo ou à barba, de forma natural.',
    minutes: 30,
    price: 60,
    includes: ['Pigmento do tom certo', 'Aplicação e finalização'],
  },
  {
    id: 'hidratacao',
    category: 'extra',
    name: 'hidratação capilar',
    desc: 'Máscara e massagem para couro cabeludo e fios, ideal pós-sol ou químicas.',
    minutes: 20,
    price: 45,
    includes: ['Máscara de hidratação', 'Massagem no couro cabeludo'],
  },
  {
    id: 'engraxate',
    category: 'extra',
    name: 'engraxate',
    desc: 'Tradição de barbearia: sapato lustrado enquanto você espera ou depois do corte.',
    minutes: 20,
    price: 35,
    includes: ['Limpeza e hidratação do couro', 'Graxa e lustro'],
  },
];

interface Barber {
  id: string;
  name: string;
  role: string;
  /** 0 = domingo … 6 = sábado: dias em que atende */
  days: number[];
  tags: string[];
  bio: string;
  photo: Img;
}

/** PLACEHOLDER — troque pelos barbeiros reais e coloque as fotos em public/fotos/. */
const barbers: Barber[] = [
  {
    id: 'rafael',
    name: 'Rafael Duarte',
    role: 'barbeiro e sócio',
    days: [2, 3, 4, 5, 6],
    tags: ['degradê', 'navalhado', 'visagismo'],
    bio: 'Quinze anos de cadeira. Meticuloso com transição e com horário.',
    photo: '/fotos/barbeiro-1.jpg',
  },
  {
    id: 'diego',
    name: 'Diego Menezes',
    role: 'especialista em barba',
    days: [2, 3, 4, 5],
    tags: ['barba na navalha', 'design de barba'],
    bio: 'Dá forma a barba como poucos. Toalha quente é a especialidade da casa.',
    photo: '/fotos/barbeiro-2.jpg',
  },
  {
    id: 'leo',
    name: 'Léo Andrade',
    role: 'barbeiro',
    days: [3, 4, 5, 6],
    tags: ['clássicos', 'tesoura', 'infantil'],
    bio: 'Corte social e tesoura. Ótimo com crianças e com quem tem cabelo difícil.',
    photo: '/fotos/barbeiro-3.jpg',
  },
];

/** PLACEHOLDER — números de exemplo, troque pelos reais. */
const stats = [
  { n: String(brand.since), l: 'na Savassi desde' },
  { n: '4,9', l: 'nota no Google' },
  { n: '3', l: 'barbeiros na casa' },
];

const marquee = ['degradê navalhado', 'barba na navalha', 'toalha quente', 'corte clássico', 'design de barba', 'ritual completo', 'hora marcada'];

const ritual = [
  { n: '01', title: 'chegou, sentou', text: 'Sem fila e sem espera longa. O horário é seu, a cadeira também.' },
  { n: '02', title: 'conversa', text: 'Antes da máquina, a gente entende o que você quer e o que combina com você.' },
  { n: '03', title: 'o trabalho', text: 'Corte e barba com calma, navalha afiada e acabamento limpo.' },
  { n: '04', title: 'a saída', text: 'Finalização, orientação de manutenção e o próximo horário já combinado.' },
];

interface Plan {
  id: string;
  name: string;
  tag: string;
  price: number;
  per?: string;
  note?: string;
  items: string[];
  featured?: boolean;
}

const plans: Plan[] = [
  {
    id: 'avulso',
    name: 'avulso',
    tag: 'sem compromisso',
    price: 75,
    per: '/corte',
    items: ['Agenda livre', 'Todos os barbeiros', 'Pague no dia'],
  },
  {
    id: 'clube',
    name: 'clube ferro',
    tag: 'mais escolhido',
    price: 189,
    per: '/mês',
    note: '4 visitas por mês · economia de 37%',
    items: ['4 cortes por mês', 'Horário fixo reservado', '10% em produtos', 'Remarcação sem custo'],
    featured: true,
  },
  {
    id: 'completo',
    name: 'clube fio',
    tag: 'cabelo e barba',
    price: 299,
    per: '/mês',
    note: '4 cabelo + barba por mês',
    items: ['4 combos cabelo + barba', 'Toalha quente em todas as visitas', 'Prioridade na agenda', 'Convite para eventos da casa'],
  },
];

/** PLACEHOLDER — troque por depoimentos reais, com autorização dos clientes. */
const testimonials = [
  { name: 'Henrique T.', detail: 'cliente desde 2021', text: 'Todo mundo corta o cabelo. Aqui eu tiro uma hora da semana para mim. O degradê aguenta duas semanas sem perder o desenho.' },
  { name: 'Marcos A.', detail: 'clube ferro', text: 'Horário fixo todo mês, chego e já sento. Nunca mais perdi tempo esperando e o resultado é sempre o mesmo.' },
  { name: 'Bruno L.', detail: 'ritual completo', text: 'A barba na navalha com toalha quente é outra coisa. Saí leve e com a barba melhor que eu mesmo consigo fazer.' },
];

/** PLACEHOLDER — fotos reais de trabalhos, em public/fotos/trabalho-1.jpg … */
const gallery: { src: Img; caption: string; alt: string }[] = [
  { src: '/fotos/trabalho-1.jpg', caption: 'degradê médio', alt: 'Degradê médio finalizado na navalha' },
  { src: '/fotos/trabalho-2.jpg', caption: 'barba desenhada', alt: 'Barba com contorno e design' },
  { src: '/fotos/trabalho-3.jpg', caption: 'corte clássico', alt: 'Corte clássico na tesoura' },
  { src: '/fotos/trabalho-4.jpg', caption: 'risco e navalha', alt: 'Detalhe de risco feito na navalha' },
  { src: '/fotos/trabalho-5.jpg', caption: 'cacheado definido', alt: 'Corte em cabelo cacheado' },
  { src: '/fotos/trabalho-6.jpg', caption: 'ritual completo', alt: 'Cliente depois do ritual completo' },
];

const faq = [
  { q: 'Preciso agendar?', a: 'Sim. Trabalhamos só com hora marcada para que você não perca tempo na espera. O agendamento leva menos de um minuto aqui no site.' },
  { q: 'Como confirmo meu horário?', a: 'Ao escolher serviço, barbeiro, dia e horário, abrimos o WhatsApp com tudo preenchido. O horário fica reservado assim que a casa confirma por lá.' },
  { q: 'Posso escolher o barbeiro?', a: 'Pode. Cada um tem suas especialidades e dias de atendimento, e você vê só os horários em que ele está na casa. Sem preferência? Escolhemos por você.' },
  { q: 'Quanto tempo dura um corte?', a: 'Entre 45 e 55 minutos para corte ou degradê com consulta e acabamento. Barba na navalha leva cerca de 40. O site já considera a duração na hora de mostrar os horários.' },
  { q: 'Como funciona o clube?', a: 'Você paga uma mensalidade, ganha um horário fixo reservado e as visitas do plano. Cancela quando quiser, sem multa.' },
  { q: 'E se eu me atrasar ou precisar remarcar?', a: 'Avise até 3 horas antes e remarcamos sem custo. Atrasos de até 10 minutos são tolerados; depois disso, ajustamos o serviço para não atrasar quem vem depois.' },
  { q: 'Atendem crianças?', a: 'Atendemos, a partir de 3 anos. Tem o corte infantil e o combo pai & filho.' },
];

/** Hotspots da cadeira 3D. anchor/normal em coordenadas do modelo. */
interface ChairSpot {
  id: string;
  label: string;
  part: string;
  title: string;
  text: string;
  services: string[];
  anchor: [number, number, number];
  normal: [number, number, number];
  focus: { yaw: number; y: number; dist: number };
}

const chairSpots: ChairSpot[] = [
  {
    id: 'cabeca',
    label: 'cabelo',
    part: 'apoio de cabeça',
    title: 'o corte começa aqui',
    text: 'Cabeça apoiada, pescoço relaxado e o barbeiro com a visão livre de todos os ângulos. É aqui que o corte e o degradê acontecem.',
    services: ['corte-classico', 'degrade-navalhado', 'corte-infantil'],
    anchor: [0, 3.14, -0.66],
    normal: [0, 0.15, 1],
    focus: { yaw: 0, y: 2.55, dist: 0.58 },
  },
  {
    id: 'encosto',
    label: 'barba',
    part: 'encosto reclinável',
    title: 'reclina, fecha os olhos',
    text: 'O encosto deita para a barba na navalha: toalha quente, óleo e a navalha no ângulo certo. O momento mais calmo da semana.',
    services: ['barba-navalha', 'design-barba', 'sobrancelha'],
    anchor: [0, 2.35, -0.56],
    normal: [0, 0.14, 1],
    focus: { yaw: 0.25, y: 2.0, dist: 0.7 },
  },
  {
    id: 'braco',
    label: 'combos',
    part: 'apoio de braço',
    title: 'sem pressa, tudo de uma vez',
    text: 'Para quem quer sentar uma vez só: corte e barba em sequência, ou o ritual completo, com massagem e bebida da casa.',
    services: ['cabelo-barba', 'ritual-completo', 'pai-e-filho'],
    anchor: [0.86, 1.9, 0.12],
    normal: [0.5, 1, 0],
    focus: { yaw: -0.85, y: 1.6, dist: 0.7 },
  },
  {
    id: 'base',
    label: 'extras',
    part: 'base hidráulica',
    title: 'o acabamento fino',
    text: 'A cadeira sobe e desce para o barbeiro trabalhar no ponto certo. Aqui entram os detalhes: pigmentação e hidratação.',
    services: ['pigmentacao', 'hidratacao'],
    anchor: [0, 0.5, 0.38],
    normal: [0, 0, 1],
    focus: { yaw: 0.3, y: 0.9, dist: 0.62 },
  },
  {
    id: 'pes',
    label: 'engraxate',
    part: 'apoio dos pés',
    title: 'tradição de barbearia',
    text: 'Pés apoiados e sapato lustrado no fim. Uma cortesia que virou serviço: aquele toque que faz você sair arrumado da cabeça aos pés.',
    services: ['engraxate'],
    anchor: [0, 0.72, 1.18],
    normal: [0, 1, 0.25],
    focus: { yaw: 0, y: 0.75, dist: 0.62 },
  },
];


// ==========================================================================
// UTILITÁRIOS
// ==========================================================================

const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brl = (value: number) => brlFmt.format(value);

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  try {
    history.replaceState(null, '', `#${id}`);
  } catch {
    /* ignore */
  }
}

const TZ = 'America/Sao_Paulo';

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

interface SPNow {
  y: number;
  m: number;
  d: number;
  wd: number;
  minutes: number;
}

/** Data e hora atuais no fuso de Brasília, independente do fuso do aparelho. */
function nowSP(date = new Date()): SPNow {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const y = get('year');
  const m = get('month');
  const d = get('day');
  return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay(), minutes: get('hour') * 60 + get('minute') };
}

interface DayInfo {
  iso: string;
  wd: number;
  weekday: string;
  dayNum: string;
  month: string;
  long: string;
  isToday: boolean;
}

const wdFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'short' });
const monFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'short' });
const longFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: '2-digit' });

/** Próximos dias em que a casa abre. */
function nextDays(count = 21): DayInfo[] {
  const now = nowSP();
  const out: DayInfo[] = [];
  for (let i = 0; i < count; i++) {
    const dt = new Date(Date.UTC(now.y, now.m - 1, now.d + i, 12));
    const wd = dt.getUTCDay();
    if (!hours[wd]) continue;
    out.push({
      iso: dt.toISOString().slice(0, 10),
      wd,
      weekday: wdFmt.format(dt).replace('.', ''),
      dayNum: String(dt.getUTCDate()),
      month: monFmt.format(dt).replace('.', ''),
      long: longFmt.format(dt),
      isToday: i === 0,
    });
  }
  return out;
}

/**
 * Horários possíveis: respeita duração, expediente, dias do barbeiro e antecedência.
 * TODO (versão com agenda real): trocar por uma consulta à agenda para remover horários já ocupados.
 */
function slotsFor(day: DayInfo, minutes: number, barber: Barber | null): string[] {
  const h = hours[day.wd];
  if (!h) return [];
  const works = barber ? barber.days.includes(day.wd) : barbers.some((b) => b.days.includes(day.wd));
  if (!works) return [];
  const open = toMin(h.open);
  const close = toMin(h.close);
  const now = nowSP();
  const earliest = day.isToday ? now.minutes + leadMinutes : 0;
  const out: string[] = [];
  for (let t = open; t + minutes <= close; t += slotStep) {
    if (t >= earliest) out.push(fromMin(t));
  }
  return out;
}

const period = (time: string) => {
  const m = toMin(time);
  if (m < 12 * 60) return 'manhã';
  if (m < 18 * 60) return 'tarde';
  return 'noite';
};

const waLink = (text: string) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;
const genericMessage = 'Olá! Gostaria de agendar um horário.';

interface BookingData {
  name: string;
  service: Service;
  barber: Barber | null;
  day: DayInfo;
  time: string;
  first: 'sim' | 'nao';
  note: string;
}

function buildMessage(b: BookingData): string {
  const lines = [
    `Olá! Sou ${b.name.trim()} e gostaria de agendar:`,
    '',
    `• Serviço: ${b.service.name} (${b.service.minutes} min · ${brl(b.service.price)})`,
    `• Barbeiro: ${b.barber ? b.barber.name : 'sem preferência'}`,
    `• Data: ${b.day.long}`,
    `• Horário: ${b.time}`,
    `• Primeira vez na casa: ${b.first === 'sim' ? 'sim' : 'não'}`,
  ];
  if (b.note.trim()) lines.push(`• Observação: ${b.note.trim()}`);
  lines.push('', 'Pode confirmar a disponibilidade? Obrigado!');
  return lines.join('\n');
}

function nextFree(minutes = 45): { label: string } | null {
  for (const d of nextDays(14)) {
    const s = slotsFor(d, minutes, null);
    if (s.length) return { label: `${d.isToday ? 'hoje' : d.weekday} às ${s[0]}` };
  }
  return null;
}

const priceOf = (id: string) => services.find((s) => s.id === id);


// ==========================================================================
// BLOCOS COMPARTILHADOS
// ==========================================================================

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const imgUrl = (src: Img, w: number) => (typeof src === 'number' ? `https://images.pexels.com/photos/${src}/pexels-photo-${src}.jpeg?auto=compress&cs=tinysrgb&w=${w}` : src);

interface PhotoProps {
  src: Img;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  pos?: string;
  style?: CSSProperties;
}

/** Imagem responsiva. Se não carregar, o bloco mostra o espaço reservado do CSS. */
function Photo({ src, alt, sizes = '100vw', priority, className = '', pos, style }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  const isNum = typeof src === 'number';
  return (
    <img
      className={`photo${failed ? ' photo--failed' : ''} ${className}`.trim()}
      src={imgUrl(src, 960)}
      srcSet={isNum ? `${imgUrl(src, 480)} 480w, ${imgUrl(src, 960)} 960w, ${imgUrl(src, 1600)} 1600w` : undefined}
      sizes={sizes}
      alt={failed ? '' : alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {})}
      onError={() => setFailed(true)}
      style={{ objectPosition: pos, ...style }}
    />
  );
}

function Collapse({ open, id, children }: { open: boolean; id?: string; children: ReactNode }) {
  return (
    <div className={`collapse${open ? ' collapse--open' : ''}`} id={id}>
      <div className="collapse__inner">{children}</div>
    </div>
  );
}

function SectionHead({ index, label, title, lead }: { index: string; label: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <header className="head" data-reveal>
      <p className="label">
        <b>{index}</b> {label}
      </p>
      <h2 className="h2">{title}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </header>
  );
}

function Wordmark({ large }: { large?: boolean }) {
  return (
    <span className={`mark${large ? ' mark--lg' : ''}`}>
      {brand.first}
      <i>&amp;</i>
      {brand.second}
    </span>
  );
}

function useOpenNow() {
  const [now, setNow] = useState(() => nowSP());
  useEffect(() => {
    const id = window.setInterval(() => setNow(nowSP()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const h = hours[now.wd];
  const open = !!h && now.minutes >= toMin(h.open) && now.minutes < toMin(h.close);
  return { open, wd: now.wd };
}


// ==========================================================================
// TOPO
// ==========================================================================

const links = [
  { id: 'servicos', label: 'serviços' },
  { id: 'cadeira', label: 'a cadeira' },
  { id: 'barbeiros', label: 'barbeiros' },
  { id: 'agendar', label: 'agendar' },
  { id: 'clube', label: 'clube' },
  { id: 'local', label: 'local' },
];

function Header({ onBook }: { onBook: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 40));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    document.body.style.overflow = '';
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <>
      <header className={`nav${scrolled ? ' nav--solid' : ''}${open ? ' nav--open' : ''}`}>
        <div className="nav__bar">
          <a className="brand" href="#top" onClick={go('top')} aria-label={`${brand.name}, ir ao início`}>
            <Wordmark />
          </a>
          <nav className="nav__links" aria-label="Principal">
            {links.slice(0, 5).map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav__actions">
            <button type="button" className="btn btn--sm btn--light nav__book" onClick={onBook}>
              agendar <ArrowUpRight size={14} strokeWidth={1.8} />
            </button>
            <button type="button" className="nav__toggle" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      <div id="menu" className={`menu${open ? ' menu--open' : ''}`} aria-hidden={!open}>
        <nav className="menu__links" aria-label="Menu">
          {links.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} tabIndex={open ? 0 : -1} style={{ transitionDelay: `${open ? 80 + i * 45 : 0}ms` }}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <a className="btn btn--light btn--block" href={waLink(genericMessage)} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
            <WhatsAppIcon size={18} /> falar no whatsapp
          </a>
          <a className="menu__ig" href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
            @{contact.instagram}
          </a>
        </div>
      </div>
    </>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  const media = useRef<HTMLDivElement>(null);
  const { open } = useOpenNow();
  const [free, setFree] = useState<{ label: string } | null>(null);

  useEffect(() => setFree(nextFree()), []);

  // Parallax sem re-render do React.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      if (media.current && y < window.innerHeight * 1.2) media.current.style.transform = `translate3d(0, ${y * 0.1}px, 0) scale(1.08)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero__media frame frame--ph" ref={media} data-ph="foto principal">
        <Photo src={photos.hero} alt="Barbeiro trabalhando na cadeira" priority pos="center 30%" />
      </div>
      <div className="hero__shade" />

      <div className="hero__body wrap">
        <p className="hero__meta">
          <span className={`dot${open ? ' dot--on' : ''}`} aria-hidden="true" />
          {open ? 'aberto agora' : 'fechado agora'} · {brand.city}
        </p>
        <h1 className="hero__title" aria-label={`${brand.name}, seu melhor ângulo`}>
          <span aria-hidden="true">
            {brand.first}
            <i>&amp;</i>
          </span>
          <span aria-hidden="true">{brand.second}</span>
        </h1>
        <p className="hero__tag">
          seu melhor <em>ângulo.</em>
        </p>
        <p className="hero__lead">Barbearia de hora marcada. Corte, degradê e barba na navalha, feitos sem pressa por quem entende do assunto.</p>

        <div className="hero__cta">
          <button type="button" className="btn btn--light" onClick={onBook}>
            agendar horário <ArrowUpRight size={16} strokeWidth={1.8} />
          </button>
          <button type="button" className="btn btn--ghost-light" onClick={() => scrollToId('cadeira')}>
            conhecer a cadeira
          </button>
        </div>

        {free ? (
          <p className="hero__next">
            <Clock size={14} strokeWidth={1.6} /> próximo horário: <b>{free.label}</b>
          </p>
        ) : null}
      </div>

      <ul className="hero__stats wrap">
        {stats.map((s) => (
          <li key={s.l}>
            <strong>{s.n}</strong>
            <span>{s.l}</span>
          </li>
        ))}
      </ul>

      <a className="scroll-cue" href="#manifesto" onClick={(e) => (e.preventDefault(), scrollToId('manifesto'))}>
        deslize <ArrowDown size={14} strokeWidth={1.5} />
      </a>
    </section>
  );
}

function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {items.map((m, i) => (
          <span key={i}>
            {m} <i>/</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function Manifesto({ onBook }: { onBook: () => void }) {
  return (
    <section className="manifesto section" id="manifesto">
      <div className="wrap manifesto__grid">
        <div data-reveal>
          <p className="label">
            <b>01</b> a casa
          </p>
          <p className="manifesto__text">
            Não é só um corte. É a hora da semana em que <em>ninguém te pede nada</em>: cadeira confortável, navalha afiada e um barbeiro que lembra como você gosta.
          </p>
          <div className="row">
            <button type="button" className="btn btn--light" onClick={onBook}>
              agendar horário <ArrowUpRight size={16} strokeWidth={1.8} />
            </button>
            <a className="link" href="#servicos" onClick={(e) => (e.preventDefault(), scrollToId('servicos'))}>
              ver serviços e preços <ArrowUpRight size={15} strokeWidth={1.5} />
            </a>
          </div>
        </div>
        <figure className="manifesto__img frame frame--ph" data-ph="o espaço" data-reveal>
          <Photo src={photos.space} alt="Interior da barbearia" sizes="(min-width: 900px) 40vw, 100vw" pos="center 40%" />
          <figcaption className="caption">{brand.city} · desde {brand.since}</figcaption>
        </figure>
      </div>
    </section>
  );
}


// ==========================================================================
// SERVIÇOS
// ==========================================================================

function Services({ onBook }: { onBook: (opts?: { serviceId?: string }) => void }) {
  const [cat, setCat] = useState<Category>('cabelo');
  const [open, setOpen] = useState<string | null>('degrade-navalhado');
  const list = services.filter((s) => s.category === cat);

  return (
    <section className="services section section--paper" id="servicos">
      <div className="wrap">
        <SectionHead
          index="02"
          label="serviços"
          title={
            <>
              o menu da
              <br />
              <em>casa.</em>
            </>
          }
          lead="Preço fechado, duração real. Toque em um serviço para ver o que está incluído e agendar."
        />

        <div className="tabs" role="tablist" aria-label="Categorias de serviço" data-reveal>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={cat === c.id}
              className={`tab${cat === c.id ? ' tab--on' : ''}`}
              onClick={() => {
                setCat(c.id);
                setOpen(null);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <ul className="svc-list" role="tabpanel">
          {list.map((s, i) => {
            const isOpen = open === s.id;
            return (
              <li key={s.id} className={`svc${isOpen ? ' svc--open' : ''}`}>
                <button type="button" className="svc__head" aria-expanded={isOpen} aria-controls={`svc-${s.id}`} onClick={() => setOpen(isOpen ? null : s.id)}>
                  <span className="svc__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="svc__title">
                    <strong>{s.name}</strong>
                    <small>
                      <Clock size={12} strokeWidth={1.6} /> {s.minutes} min
                    </small>
                  </span>
                  <span className="svc__price">{brl(s.price)}</span>
                  <span className="svc__icon" aria-hidden="true">
                    <Plus size={18} strokeWidth={1.5} />
                  </span>
                </button>

                <Collapse open={isOpen} id={`svc-${s.id}`}>
                  <div className="svc__body">
                    <p>{s.desc}</p>
                    <ul className="ticks">
                      {s.includes.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <div className="row">
                      <button type="button" className="btn btn--ink" onClick={() => onBook({ serviceId: s.id })} tabIndex={isOpen ? 0 : -1}>
                        agendar este serviço <ArrowUpRight size={16} strokeWidth={1.8} />
                      </button>
                      <a className="btn btn--ghost-ink" href={waLink(`Olá! Tenho uma dúvida sobre ${s.name}.`)} target="_blank" rel="noopener noreferrer" tabIndex={isOpen ? 0 : -1}>
                        <WhatsAppIcon size={16} /> tirar dúvida
                      </a>
                    </div>
                  </div>
                </Collapse>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}


// ==========================================================================
// A CADEIRA (3D)
// ==========================================================================

type T3 = typeof import('three');
type RoundedBoxCtor = new (w: number, h: number, d: number, segments: number, radius: number) => THREE.BufferGeometry;

interface ChairApi {
  select: (id: string | null) => void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function makeGrain(T: T3): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      const v = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${v},${v},${v},${0.05 + Math.random() * 0.08})`;
      const r = 0.6 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 4;
  return tex;
}

/** Monta a cena: cadeira procedural com couro, cromo, reflexos de ambiente e sombras suaves. */
function setupChair(
  T: T3,
  RoundedBox: RoundedBoxCtor,
  RoomEnvironment: new () => THREE.Scene,
  el: HTMLDivElement,
  initialId: string | null,
  onSelect: (id: string) => void,
): { api: ChairApi; dispose: () => void } | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.className = 'chair__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  el.insertBefore(canvas, el.firstChild);

  const reduce = prefersReducedMotion();
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(28, 1, 0.1, 60);

  // Reflexos: ambiente de estúdio pré-filtrado.
  const pmrem = new T.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envTex = pmrem.fromScene(envScene, 0.04).texture;
  scene.environment = envTex;
  (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.85;

  const key = new T.DirectionalLight('#fff1dc', 2.6);
  key.position.set(3.2, 7, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3.5;
  key.shadow.camera.right = 3.5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -2;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  scene.add(key);

  const rim = new T.DirectionalLight('#cfd8e6', 2.2);
  rim.position.set(-4.5, 3.5, -4);
  scene.add(rim);

  const kick = new T.PointLight('#ffd9a8', 14, 9, 2);
  kick.position.set(-2.8, 1.2, 2.6);
  scene.add(kick);

  // Materiais
  const grain = makeGrain(T);
  const leatherMat = new T.MeshPhysicalMaterial({
    color: '#121211',
    roughness: 0.46,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
    bumpMap: grain,
    bumpScale: 0.8,
  });
  const metalMat = new T.MeshPhysicalMaterial({
    color: '#f2f2f0',
    metalness: 1,
    roughness: 0.07,
    clearcoat: 0.25,
    clearcoatRoughness: 0.1,
  });
  const darkMat = new T.MeshStandardMaterial({ color: '#0e0e0d', roughness: 0.5, metalness: 0.5 });
  const seamMat = new T.MeshStandardMaterial({ color: '#050505', roughness: 0.9 });
  const plinthMat = new T.MeshStandardMaterial({ color: '#111110', roughness: 0.3, metalness: 0.65 });
  const brassMat = new T.MeshStandardMaterial({ color: '#e8e8e6', roughness: 0.2, metalness: 1 });

  const disposables: { dispose: () => void }[] = [leatherMat, metalMat, darkMat, seamMat, plinthMat, brassMat, grain, envTex, pmrem];
  const geo = <G extends THREE.BufferGeometry>(g: G): G => {
    disposables.push(g);
    return g;
  };
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => {
    const x = new T.Mesh(geo(g), m);
    x.castShadow = true;
    x.receiveShadow = true;
    return x;
  };
  const rbox = (w: number, h: number, d: number, r: number) => new RoundedBox(w, h, d, 6, r);

  // Pedestal estático
  const plinth = new T.Mesh(geo(new T.CylinderGeometry(1.95, 2.0, 0.12, 96)), plinthMat);
  plinth.position.y = -0.06;
  plinth.receiveShadow = true;
  scene.add(plinth);
  const ring = new T.Mesh(geo(new T.TorusGeometry(1.95, 0.014, 12, 128)), brassMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.002;
  scene.add(ring);

  // Cadeira (gira como um todo)
  const chair = new T.Group();
  scene.add(chair);

  // base
  const profile = [
    [0.001, 0], [1.0, 0], [1.02, 0.04], [0.98, 0.08], [0.72, 0.13], [0.34, 0.2], [0.24, 0.28], [0.001, 0.3],
  ].map(([x, y]) => new T.Vector2(x, y));
  chair.add(mesh(new T.LatheGeometry(profile, 72), darkMat));
  const baseRing = mesh(new T.TorusGeometry(0.97, 0.022, 14, 96), metalMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.08;
  chair.add(baseRing);

  // coluna hidráulica
  const sleeve = mesh(new T.CylinderGeometry(0.2, 0.22, 0.36, 48), darkMat);
  sleeve.position.set(0, 0.48, 0.15);
  chair.add(sleeve);
  const rod = mesh(new T.CylinderGeometry(0.12, 0.12, 0.34, 48), metalMat);
  rod.position.set(0, 0.83, 0.15);
  chair.add(rod);
  const collar = mesh(new T.TorusGeometry(0.205, 0.016, 12, 48), metalMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.66, 0.15);
  chair.add(collar);

  // assento
  const plate = mesh(rbox(0.95, 0.08, 0.85, 0.03), darkMat);
  plate.position.set(0, 0.98, 0.15);
  chair.add(plate);
  const seat = mesh(rbox(1.25, 0.3, 1.15, 0.12), leatherMat);
  seat.position.set(0, 1.17, 0.15);
  chair.add(seat);
  [-0.3, 0, 0.3].forEach((x) => {
    const g = mesh(new T.BoxGeometry(0.016, 0.012, 0.95), seamMat);
    g.position.set(x, 0.152, 0);
    seat.add(g);
  });

  // encosto inclinado + apoio de cabeça
  const back = new T.Group();
  back.position.set(0, 1.3, -0.52);
  back.rotation.x = -0.14;
  chair.add(back);
  const backBody = mesh(rbox(1.15, 1.45, 0.3, 0.12), leatherMat);
  backBody.position.y = 0.725;
  back.add(backBody);
  [-0.3, 0, 0.3].forEach((x) => {
    const g = mesh(new T.BoxGeometry(0.016, 1.2, 0.012), seamMat);
    g.position.set(x, 0, 0.152);
    backBody.add(g);
  });
  [-0.2, 0.2].forEach((x) => {
    const stem = mesh(new T.CylinderGeometry(0.03, 0.03, 0.34, 20), metalMat);
    stem.position.set(x, 1.62, -0.05);
    back.add(stem);
  });
  const headrest = mesh(rbox(0.66, 0.4, 0.24, 0.1), leatherMat);
  headrest.position.set(0, 1.92, -0.06);
  back.add(headrest);

  // apoios de braço
  [-1, 1].forEach((s) => {
    const path = new T.CatmullRomCurve3([
      new T.Vector3(s * 0.62, 1.28, -0.08),
      new T.Vector3(s * 0.8, 1.42, -0.06),
      new T.Vector3(s * 0.86, 1.62, -0.03),
      new T.Vector3(s * 0.86, 1.76, 0),
    ]);
    chair.add(mesh(new T.TubeGeometry(path, 40, 0.034, 14, false), metalMat));
    const pad = mesh(rbox(0.22, 0.1, 0.9, 0.045), leatherMat);
    pad.position.set(s * 0.86, 1.83, 0.1);
    chair.add(pad);
  });

  // apoio de pés
  [-1, 1].forEach((s) => {
    const path = new T.CatmullRomCurve3([
      new T.Vector3(s * 0.42, 1.02, 0.7),
      new T.Vector3(s * 0.42, 0.78, 0.98),
      new T.Vector3(s * 0.42, 0.6, 1.1),
    ]);
    chair.add(mesh(new T.TubeGeometry(path, 24, 0.03, 12, false), metalMat));
  });
  const foot = new T.Group();
  foot.position.set(0, 0.56, 1.15);
  foot.rotation.x = -0.22;
  chair.add(foot);
  foot.add(mesh(rbox(1.0, 0.07, 0.52, 0.03), darkMat));
  for (let i = 0; i < 6; i++) {
    const rib = mesh(new T.BoxGeometry(0.9, 0.018, 0.024), metalMat);
    rib.position.set(0, 0.04, -0.2 + i * 0.08);
    foot.add(rib);
  }

  // Estado de câmera
  const state = {
    yaw: 0,
    yawT: 0,
    lookY: 1.55,
    lookYT: 1.55,
    dist: 11,
    distT: 11,
    baseDist: 11,
    auto: !reduce,
    selected: null as string | null,
  };
  const BASE_Y = 1.6;

  function applySelection(id: string | null) {
    state.selected = id;
    const spot = id ? chairSpots.find((s) => s.id === id) : null;
    if (!spot) {
      state.lookYT = BASE_Y;
      state.distT = state.baseDist;
      return;
    }
    state.auto = false;
    state.yawT = spot.focus.yaw;
    state.lookYT = spot.focus.y;
    state.distT = state.baseDist * spot.focus.dist;
  }

  const resize = () => {
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    state.baseDist = 11.2 * Math.max(1, 0.78 / camera.aspect);
    camera.updateProjectionMatrix();
    applySelection(state.selected);
  };

  // Hotspots HTML (posicionados por projeção a cada frame)
  const spotEls = Array.from(el.querySelectorAll<HTMLButtonElement>('[data-spot]'));
  const anchors = chairSpots.map((s) => ({
    id: s.id,
    p: new T.Vector3(...s.anchor),
    n: new T.Vector3(...s.normal).normalize(),
  }));
  const tmp = new T.Vector3();
  const tmpN = new T.Vector3();
  const toCam = new T.Vector3();

  // Interação
  let drag: { x: number; yaw: number; moved: number } | null = null;
  const hint = el.querySelector<HTMLElement>('[data-hint]');
  const fadeHint = () => {
    if (hint) hint.style.opacity = '0';
  };
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, yaw: state.yawT, moved: 0 };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    if (drag.moved > 4) {
      state.auto = false;
      fadeHint();
      state.yawT = drag.yaw + dx * 0.011;
    }
  };
  const onUp = () => {
    drag = null;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // Loop: pausa fora da tela e com a aba oculta
  let raf = 0;
  let inView = true;
  let last = performance.now();
  let t = 0;
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    const k = 1 - Math.exp(-6 * dt);
    if (state.auto) state.yawT = Math.sin(t * 0.4) * 0.55;
    state.yaw += (state.yawT - state.yaw) * k;
    state.lookY += (state.lookYT - state.lookY) * k;
    state.dist += (state.distT - state.dist) * k;
    chair.rotation.y = state.yaw;
    camera.position.set(0, state.lookY + 0.9, state.dist);
    camera.lookAt(0, state.lookY, 0);
    chair.updateMatrixWorld(true);

    const r = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    anchors.forEach((a, i) => {
      const b = spotEls[i];
      if (!b) return;
      tmp.copy(a.p).applyMatrix4(chair.matrixWorld);
      tmpN.copy(a.n).transformDirection(chair.matrixWorld);
      toCam.copy(camera.position).sub(tmp).normalize();
      const facing = tmpN.dot(toCam);
      tmp.project(camera);
      const sx = ((tmp.x + 1) / 2) * r;
      const sy = ((1 - tmp.y) / 2) * hgt;
      const vis = clamp((facing - 0.05) / 0.3, 0, 1);
      b.style.transform = `translate3d(${sx - 22}px, ${sy - 22}px, 0)`;
      b.style.opacity = String(vis);
      b.style.pointerEvents = vis > 0.5 ? 'auto' : 'none';
    });

    renderer.render(scene, camera);
    if (inView && document.visibilityState === 'visible') raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
    },
    { threshold: 0.05 },
  );
  io.observe(el);
  const onVis = () => {
    if (document.visibilityState === 'visible') start();
  };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => {
    resize();
    renderer.render(scene, camera);
  });
  ro.observe(el);

  resize();
  applySelection(initialId);
  start();

  // onSelect fica disponível para uso futuro por raycast; os hotspots já são botões HTML.
  void onSelect;

  const api: ChairApi = { select: applySelection };

  const dispose = () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    canvas.remove();
  };

  return { api, dispose };
}

function ChairStage({ selectedId, onSelect, onFail }: { selectedId: string | null; onSelect: (id: string) => void; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<ChairApi | null>(null);
  const selRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  const onFailRef = useRef(onFail);
  selRef.current = selectedId;
  onSelectRef.current = onSelect;
  onFailRef.current = onFail;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    // three.js só é baixado quando a seção está perto da tela.
    Promise.all([
      import('three'),
      import('three/examples/jsm/geometries/RoundedBoxGeometry.js'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ])
      .then(([T, rb, env]) => {
        if (cancelled) return;
        const result = setupChair(
          T,
          rb.RoundedBoxGeometry as unknown as RoundedBoxCtor,
          env.RoomEnvironment as unknown as new () => THREE.Scene,
          el,
          selRef.current,
          (id) => onSelectRef.current(id),
        );
        if (!result) {
          onFailRef.current();
          return;
        }
        api.current = result.api;
        dispose = result.dispose;
      })
      .catch(() => {
        if (!cancelled) onFailRef.current();
      });

    return () => {
      cancelled = true;
      api.current = null;
      dispose?.();
    };
  }, []);

  useEffect(() => {
    api.current?.select(selectedId);
  }, [selectedId]);

  return (
    <div className="chair__stage" ref={host}>
      <div className="chair__spots">
        {chairSpots.map((s, i) => (
          <button
            key={s.id}
            type="button"
            data-spot={s.id}
            className={`spot${selectedId === s.id ? ' spot--on' : ''}`}
            aria-label={`${s.label}: ${s.part}`}
            aria-pressed={selectedId === s.id}
            onClick={() => onSelect(s.id)}
          >
            <i />
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <p className="chair__hint" data-hint>
        arraste para girar · toque nos pontos
      </p>
    </div>
  );
}

function Chair({ onBook }: { onBook: (opts?: { serviceId?: string }) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mount, setMount] = useState(false);
  const [failed, setFailed] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMount(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const spot = chairSpots.find((s) => s.id === selectedId) ?? null;

  // No celular o resultado aparece abaixo da cadeira: leva até ele ao escolher.
  useEffect(() => {
    if (!selectedId || window.innerWidth >= 1024) return;
    const el = zoneRef.current;
    if (!el) return;
    const id = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom > window.innerHeight || r.top < 80) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    }, 350);
    return () => window.clearTimeout(id);
  }, [selectedId]);

  return (
    <section className="chair section section--ink" id="cadeira">
      <div className="wrap">
        <SectionHead
          index="03"
          label="a cadeira"
          title={
            <>
              onde tudo
              <br />
              <em>acontece.</em>
            </>
          }
          lead="Cada parte da cadeira tem um papel no atendimento. Toque em um ponto para ver o que acontece ali e o preço."
        />

        <div className="chair__grid">
          <div className="chair__view" ref={wrap} data-reveal>
            {mount && !failed ? (
              <ChairStage selectedId={selectedId} onSelect={setSelectedId} onFail={() => setFailed(true)} />
            ) : (
              <div className="chair__loading">{failed ? 'use os botões ao lado' : 'carregando a cadeira…'}</div>
            )}
          </div>

          <div className="chair__side">
            <div className="chips" role="group" aria-label="Partes da cadeira">
              {chairSpots.map((s, i) => (
                <button key={s.id} type="button" className={`chip${selectedId === s.id ? ' chip--on' : ''}`} aria-pressed={selectedId === s.id} onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}>
                  <span>{i + 1}</span> {s.label}
                </button>
              ))}
            </div>

            <div className="zone" aria-live="polite" ref={zoneRef}>
              {spot ? (
                <>
                  <p className="label label--light">{spot.part}</p>
                  <h3 className="zone__title">{spot.title}</h3>
                  <p className="body">{spot.text}</p>
                  <ul className="zone__list">
                    {spot.services.map((id) => {
                      const s = priceOf(id);
                      return s ? (
                        <li key={s.id}>
                          <div>
                            <strong>{s.name}</strong>
                            <small>
                              <Clock size={12} strokeWidth={1.6} /> {s.minutes} min · {brl(s.price)}
                            </small>
                          </div>
                          <button type="button" className="btn btn--sm btn--light" onClick={() => onBook({ serviceId: s.id })}>
                            agendar <ArrowUpRight size={14} strokeWidth={1.8} />
                          </button>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </>
              ) : (
                <div className="zone__empty">
                  <p className="zone__title">escolha uma parte</p>
                  <p className="body">Toque nos pontos numerados da cadeira ou nos botões acima. Mostramos o que acontece em cada lugar e o preço.</p>
                  <button type="button" className="btn btn--ghost-light" onClick={() => onBook()}>
                    prefiro já agendar <ArrowUpRight size={16} strokeWidth={1.8} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


// ==========================================================================
// BARBEIROS
// ==========================================================================

const dayShort = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function Barbers({ onBook }: { onBook: (opts?: { barberId?: string }) => void }) {
  return (
    <section className="barbers section" id="barbeiros">
      <div className="wrap">
        <SectionHead
          index="04"
          label="barbeiros"
          title={
            <>
              quem vai
              <br />
              <em>te atender.</em>
            </>
          }
          lead="Escolha pelo estilo de cada um. No agendamento você vê só os dias em que ele está na casa."
        />
      </div>
      <div className="barbers__rail" tabIndex={0} role="region" aria-label="Barbeiros, deslize para o lado">
        {barbers.map((b) => (
          <article key={b.id} className="barber">
            <div className="barber__img frame frame--ph" data-ph={b.name.split(' ')[0]}>
              <Photo src={b.photo} alt={`${b.name}, ${b.role}`} sizes="(min-width: 900px) 30vw, 78vw" pos="center 25%" />
            </div>
            <div className="barber__body">
              <p className="label">{b.role}</p>
              <h3 className="barber__name">{b.name}</h3>
              <p className="barber__bio">{b.bio}</p>
              <ul className="tags">
                {b.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="barber__days">{b.days.map((d) => dayShort[d]).join(' · ')}</p>
              <button type="button" className="btn btn--light btn--block" onClick={() => onBook({ barberId: b.id })}>
                agendar com {b.name.split(' ')[0]} <ArrowUpRight size={16} strokeWidth={1.8} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


// ==========================================================================
// AGENDAMENTO
// ==========================================================================

interface BookingPreset {
  serviceId?: string;
  barberId?: string;
  nonce: number;
}

const steps = ['serviço', 'barbeiro', 'data e hora', 'finalizar'];

function Booking({ preset }: { preset: BookingPreset }) {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<Category>('cabelo');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [dayIso, setDayIso] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [first, setFirst] = useState<'sim' | 'nao'>('sim');
  const [note, setNote] = useState('');

  const days = useMemo(() => nextDays(21), []);
  const service = services.find((s) => s.id === serviceId) ?? null;
  const barber = barbers.find((b) => b.id === barberId) ?? null;
  const day = days.find((d) => d.iso === dayIso) ?? null;
  const slots = useMemo(() => (day && service ? slotsFor(day, service.minutes, barber) : []), [day, service, barber]);

  const card = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  const reveal = (el: HTMLElement | null) => {
    if (!el) return;
    window.setTimeout(() => el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' }), 120);
  };

  // Escolha feita em outra seção: pula para a próxima etapa que falta.
  useEffect(() => {
    if (!preset.nonce) return;
    const s = services.find((x) => x.id === preset.serviceId);
    const b = barbers.find((x) => x.id === preset.barberId);
    if (s) {
      setServiceId(s.id);
      setCat(s.category);
    }
    if (b) setBarberId(b.id);
    setDayIso(null);
    setTime(null);
    setStep(s ? (b ? 2 : 1) : 0);
  }, [preset.nonce, preset.serviceId, preset.barberId]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const el = card.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.45) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }, [step]);

  const valid = [!!service, true, !!day && !!time, name.trim().length >= 2][step];
  const hint = ['Escolha um serviço para continuar.', '', 'Escolha um dia e um horário.', 'Informe seu nome para continuar.'][step];

  const message = service && day && time ? buildMessage({ name, service, barber, day, time, first, note }) : '';
  const list = services.filter((s) => s.category === cat);
  const periods = ['manhã', 'tarde', 'noite'].map((p) => ({ p, items: slots.filter((s) => period(s) === p) })).filter((g) => g.items.length);

  return (
    <section className="booking section section--paper" id="agendar">
      <div className="wrap">
        <SectionHead
          index="05"
          label="agendar"
          title={
            <>
              reserve sua
              <br />
              <em>cadeira.</em>
            </>
          }
          lead="Quatro toques e a conversa já abre no WhatsApp com tudo preenchido. O horário fica reservado quando a casa confirma."
        />

        <div className="bk" ref={card} data-reveal>
          <ol className="bk__steps" aria-label="Etapas do agendamento">
            {steps.map((s, i) => (
              <li key={s} className={`bk__step${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}`} aria-current={i === step ? 'step' : undefined}>
                <span>{i < step ? <Check size={13} strokeWidth={2.2} /> : i + 1}</span>
                <em>{s}</em>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="bk__panel">
              <h3 className="bk__title">o que vamos fazer?</h3>
              <div className="tabs tabs--dark" role="tablist" aria-label="Categorias">
                {categories.map((c) => (
                  <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} className={`tab${cat === c.id ? ' tab--on' : ''}`} onClick={() => setCat(c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="opts" role="radiogroup" aria-label="Serviço">
                {list.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={serviceId === s.id}
                    className={`opt${serviceId === s.id ? ' opt--on' : ''}`}
                    onClick={() => {
                      setServiceId(s.id);
                      setDayIso(null);
                      setTime(null);
                      reveal(navRef.current);
                    }}
                  >
                    <span className="opt__main">
                      <strong>{s.name}</strong>
                      <small>{s.minutes} min</small>
                    </span>
                    <span className="opt__price">{brl(s.price)}</span>
                    <span className="opt__check" aria-hidden="true">
                      <Check size={15} strokeWidth={2.2} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bk__panel">
              <h3 className="bk__title">com quem?</h3>
              <div className="opts" role="radiogroup" aria-label="Barbeiro">
                <button type="button" role="radio" aria-checked={barberId === null} className={`opt${barberId === null ? ' opt--on' : ''}`} onClick={() => { setBarberId(null); setDayIso(null); setTime(null); reveal(navRef.current); }}>
                  <span className="opt__main">
                    <strong>sem preferência</strong>
                    <small>mais horários disponíveis</small>
                  </span>
                  <span />
                  <span className="opt__check" aria-hidden="true">
                    <Check size={15} strokeWidth={2.2} />
                  </span>
                </button>
                {barbers.map((b) => (
                  <button key={b.id} type="button" role="radio" aria-checked={barberId === b.id} className={`opt${barberId === b.id ? ' opt--on' : ''}`} onClick={() => { setBarberId(b.id); setDayIso(null); setTime(null); reveal(navRef.current); }}>
                    <span className="opt__main">
                      <strong>{b.name}</strong>
                      <small>{b.tags.join(' · ')}</small>
                    </span>
                    <span />
                    <span className="opt__check" aria-hidden="true">
                      <Check size={15} strokeWidth={2.2} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && service && (
            <div className="bk__panel">
              <h3 className="bk__title">quando fica bom?</h3>
              <p className="bk__sub">
                {service.name} · {service.minutes} min · {barber ? barber.name.split(' ')[0] : 'sem preferência'}
              </p>

              <div className="days" role="radiogroup" aria-label="Dia">
                {days.map((d) => {
                  const disabled = slotsFor(d, service.minutes, barber).length === 0;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      role="radio"
                      aria-checked={dayIso === d.iso}
                      disabled={disabled}
                      className={`day${dayIso === d.iso ? ' day--on' : ''}`}
                      onClick={() => {
                        setDayIso(d.iso);
                        setTime(null);
                        reveal(slotsRef.current);
                      }}
                    >
                      <small>{d.isToday ? 'hoje' : d.weekday}</small>
                      <strong>{d.dayNum}</strong>
                      <small>{d.month}</small>
                    </button>
                  );
                })}
              </div>

              <div ref={slotsRef} />
              {day ? (
                periods.map((g) => (
                  <div key={g.p} className="slots">
                    <p className="label label--light">{g.p}</p>
                    <div className="slots__row" role="radiogroup" aria-label={`Horários da ${g.p}`}>
                      {g.items.map((t) => (
                        <button key={t} type="button" role="radio" aria-checked={time === t} className={`slot${time === t ? ' slot--on' : ''}`} onClick={() => { setTime(t); reveal(navRef.current); }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="bk__empty">Escolha um dia para ver os horários.</p>
              )}
            </div>
          )}

          {step === 3 && service && day && time && (
            <div className="bk__panel">
              <h3 className="bk__title">quase lá.</h3>

              <label className="field">
                <span>seu nome</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="como podemos te chamar?" enterKeyHint="done" />
              </label>

              <fieldset className="field">
                <legend>primeira vez na casa?</legend>
                <div className="seg" role="radiogroup">
                  {(['sim', 'nao'] as const).map((v) => (
                    <button key={v} type="button" role="radio" aria-checked={first === v} className={`seg__btn${first === v ? ' seg__btn--on' : ''}`} onClick={() => setFirst(v)}>
                      {v === 'sim' ? 'sim' : 'já sou cliente'}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="field">
                <span>
                  alguma observação? <em>opcional</em>
                </span>
                <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="referência de corte, alergia, pressa…" />
              </label>

              <dl className="sum">
                <div>
                  <dt>serviço</dt>
                  <dd>
                    {service.name} <small>{service.minutes} min · {brl(service.price)}</small>
                  </dd>
                  <button type="button" onClick={() => setStep(0)}>editar</button>
                </div>
                <div>
                  <dt>barbeiro</dt>
                  <dd>{barber ? barber.name : 'sem preferência'}</dd>
                  <button type="button" onClick={() => setStep(1)}>editar</button>
                </div>
                <div>
                  <dt>quando</dt>
                  <dd>
                    {day.long} <small>às {time}</small>
                  </dd>
                  <button type="button" onClick={() => setStep(2)}>editar</button>
                </div>
              </dl>

              {name.trim().length >= 2 ? (
                <a className="btn btn--light btn--block btn--lg" href={waLink(message)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon size={20} /> enviar pelo whatsapp
                </a>
              ) : (
                <button type="button" className="btn btn--light btn--block btn--lg" disabled>
                  <WhatsAppIcon size={20} /> enviar pelo whatsapp
                </button>
              )}
              <p className="bk__note">Ao enviar, abrimos o WhatsApp com a mensagem pronta. Nada é cobrado agora e nenhum dado fica salvo neste site.</p>
            </div>
          )}

          <div className="bk__nav" ref={navRef}>
            {step > 0 ? (
              <button type="button" className="btn btn--ghost-light" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} strokeWidth={1.8} /> voltar
              </button>
            ) : (
              <span />
            )}
            {step < 3 && (
              <button type="button" className="btn btn--light" disabled={!valid} onClick={() => setStep(step + 1)}>
                continuar <ArrowRight size={16} strokeWidth={1.8} />
              </button>
            )}
          </div>
          {!valid && hint ? <p className="bk__hint">{hint}</p> : null}
        </div>

        <p className="booking__alt" data-reveal>
          Prefere conversar?{' '}
          <a className="link" href={waLink(genericMessage)} target="_blank" rel="noopener noreferrer">
            chamar no whatsapp
          </a>
        </p>
      </div>
    </section>
  );
}


// ==========================================================================
// RITUAL, CLUBE, GALERIA, DEPOIMENTOS
// ==========================================================================

function Ritual() {
  return (
    <section className="ritual section section--ink" id="ritual">
      <div className="wrap">
        <SectionHead
          index="06"
          label="o ritual"
          title={
            <>
              da porta
              <br />
              <em>à saída.</em>
            </>
          }
        />
        <ol className="ritual__list">
          {ritual.map((r) => (
            <li key={r.n} data-reveal>
              <span className="ritual__n">{r.n}</span>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Club() {
  return (
    <section className="club section" id="clube">
      <div className="wrap">
        <SectionHead
          index="07"
          label="clube"
          title={
            <>
              cuidado com
              <br />
              <em>constância.</em>
            </>
          }
          lead="Cabelo e barba pedem rotina. No clube você paga menos, tem horário fixo e não precisa pensar nisso."
        />

        <div className="pk-grid">
          {plans.map((p) => (
            <article key={p.id} className={`pk${p.featured ? ' pk--featured' : ''}`} data-reveal>
              <p className="pk__tag">{p.tag}</p>
              <h3 className="pk__name">{p.name}</h3>
              <p className="pk__price">
                {brl(p.price)}
                {p.per ? <small>{p.per}</small> : null}
              </p>
              <p className="pk__note">{p.note ?? ' '}</p>
              <ul className="ticks">
                {p.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <a className={`btn btn--block ${p.featured ? 'btn--light' : 'btn--ghost-light'}`} href={waLink(`Olá! Tenho interesse no plano "${p.name}". Podem me explicar como funciona?`)} target="_blank" rel="noopener noreferrer">
                quero este <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="gallery section section--paper" id="trabalhos">
      <div className="wrap">
        <SectionHead
          index="08"
          label="trabalhos"
          title={
            <>
              o que sai
              <br />
              <em>da cadeira.</em>
            </>
          }
        />
        <div className="gallery__grid">
          {gallery.map((g, i) => (
            <figure key={g.caption} className={`gallery__item gallery__item--${i + 1} frame frame--ph`} data-ph={g.caption} data-reveal>
              <Photo src={g.src} alt={g.alt} sizes="(min-width: 900px) 25vw, 50vw" />
              <figcaption className="caption">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="center">
          <a className="btn btn--ghost-ink" href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer">
            <Instagram size={16} strokeWidth={1.6} /> ver mais no instagram
          </a>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="voices section section--ink" id="depoimentos">
      <div className="wrap">
        <SectionHead
          index="09"
          label="clientes"
          title={
            <>
              quem já
              <br />
              <em>sentou.</em>
            </>
          }
        />
      </div>
      <div className="voices__rail" tabIndex={0} role="region" aria-label="Depoimentos, deslize para o lado">
        {testimonials.map((t) => (
          <figure key={t.name} className="voice">
            <Quote size={22} strokeWidth={1.3} />
            <blockquote>{t.text}</blockquote>
            <figcaption>
              <strong>{t.name}</strong>
              <small>{t.detail}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}


// ==========================================================================
// FAQ, LOCAL, RODAPÉ
// ==========================================================================

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq section" id="duvidas">
      <div className="wrap faq__grid">
        <div className="faq__head" data-reveal>
          <p className="label">
            <b>10</b> dúvidas
          </p>
          <h2 className="h2">
            perguntas
            <br />
            <em>frequentes.</em>
          </h2>
        </div>
        <ul className="faq__list">
          {faq.map((f, i) => (
            <li key={f.q} className={`faq__item${open === i ? ' faq__item--open' : ''}`}>
              <button type="button" className="faq__q" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                <span>{f.q}</span>
                <Plus size={20} strokeWidth={1.4} className="faq__icon" aria-hidden="true" />
              </button>
              <Collapse open={open === i} id={`faq-${i}`}>
                <p className="faq__a">{f.a}</p>
              </Collapse>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const dayOrder = [1, 2, 3, 4, 5, 6, 0];

function Place() {
  const { open, wd } = useOpenNow();
  const a = contact.address;
  const full = `${a.line}, ${a.district}, ${a.city}`;
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(full)}`;
  const waze = `https://waze.com/ul?q=${encodeURIComponent(full)}&navigate=yes`;

  return (
    <section className="place section section--paper" id="local">
      <div className="wrap">
        <SectionHead
          index="11"
          label="local"
          title={
            <>
              venha nos
              <br />
              <em>visitar.</em>
            </>
          }
        />

        <div className="place__grid">
          <div className="place__card" data-reveal>
            <div className="place__row">
              <MapPin size={20} strokeWidth={1.4} />
              <div>
                <p className="label">endereço</p>
                <p className="place__val">
                  {a.line}
                  <br />
                  {a.district} · {a.city}
                  <br />
                  CEP {a.zip}
                </p>
                <p className="place__small">{a.note}</p>
              </div>
            </div>
            <div className="row">
              <a className="btn btn--ink" href={maps} target="_blank" rel="noopener noreferrer">
                como chegar <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
              <a className="btn btn--ghost-ink" href={waze} target="_blank" rel="noopener noreferrer">
                abrir no waze
              </a>
            </div>
          </div>

          <div className="place__card" data-reveal>
            <div className="place__row">
              <Clock size={20} strokeWidth={1.4} />
              <div className="place__hours">
                <p className="label">
                  horários <span className={`pill${open ? ' pill--on' : ''}`}>{open ? 'aberto agora' : 'fechado agora'}</span>
                </p>
                <ul>
                  {dayOrder.map((d) => {
                    const h = hours[d];
                    return (
                      <li key={d} className={d === wd ? 'is-today' : ''}>
                        <span>{dayNames[d]}</span>
                        <span>{h ? `${h.open} – ${h.close}` : 'fechado'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="place__card" data-reveal>
            <div className="place__row">
              <CreditCard size={20} strokeWidth={1.4} />
              <div>
                <p className="label">pagamento e conforto</p>
                <p className="place__val">{contact.payments.join(' · ')}</p>
                <p className="place__small">{contact.perks.join(' · ')}</p>
                <p className="place__small">{contact.cancellation}</p>
              </div>
            </div>
            <a className="btn btn--ghost-ink" href={waLink(genericMessage)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={16} /> falar com a casa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onBook }: { onBook: () => void }) {
  return (
    <section className="final section section--ink" id="contato">
      <div className="wrap final__inner" data-reveal>
        <p className="label label--light">sua vez</p>
        <h2 className="h2 h2--xl">
          a cadeira
          <br />
          <em>é sua.</em>
        </h2>
        <p className="body">Escolha o horário e chegue só para sentar.</p>
        <div className="final__cta">
          <button type="button" className="btn btn--light btn--lg" onClick={onBook}>
            agendar horário <ArrowUpRight size={18} strokeWidth={1.8} />
          </button>
          <a className="btn btn--ghost-light btn--lg" href={waLink(genericMessage)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> conversar no whatsapp
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const go = (id: string) => (e: MouseEvent) => (e.preventDefault(), scrollToId(id));
  return (
    <footer className="footer" id="rodape">
      <div className="wrap footer__grid">
        <div>
          <a className="brand" href="#top" onClick={go('top')}>
            <Wordmark large />
          </a>
          <p className="footer__tag">
            barbearia de hora marcada
            <br />
            {brand.city}
          </p>
        </div>
        <nav className="footer__col" aria-label="Rodapé">
          <p className="label label--light">navegar</p>
          <a href="#servicos" onClick={go('servicos')}>serviços</a>
          <a href="#cadeira" onClick={go('cadeira')}>a cadeira</a>
          <a href="#barbeiros" onClick={go('barbeiros')}>barbeiros</a>
          <a href="#agendar" onClick={go('agendar')}>agendar</a>
          <a href="#duvidas" onClick={go('duvidas')}>dúvidas</a>
        </nav>
        <div className="footer__col">
          <p className="label label--light">contato</p>
          <a href={waLink(genericMessage)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={15} /> whatsapp</a>
          <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer"><Instagram size={15} strokeWidth={1.5} /> @{contact.instagram}</a>
          <a href={`mailto:${contact.email}`}><Mail size={15} strokeWidth={1.5} /> {contact.email}</a>
        </div>
      </div>
      <div className="wrap footer__legal">
        <small>© {new Date().getFullYear()} {brand.name}</small>
        <small>{contact.cancellation}</small>
        <a href="#top" onClick={go('top')}><small>voltar ao topo ↑</small></a>
      </div>
    </footer>
  );
}

/** Barra de ação fixa: aparece depois da primeira dobra e some quando o próprio CTA já está na tela. */
function StickyCTA({ onBook }: { onBook: () => void }) {
  const [heroOut, setHeroOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const hiddenSet = useRef(new Set<string>());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const watch = (id: string, cb: (visible: boolean) => void) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: 0.12 });
      io.observe(el);
      observers.push(io);
    };
    watch('top', (v) => setHeroOut(!v));
    ['agendar', 'rodape', 'contato'].forEach((id) =>
      watch(id, (v) => {
        if (v) hiddenSet.current.add(id);
        else hiddenSet.current.delete(id);
        setHidden(hiddenSet.current.size > 0);
      }),
    );
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const show = heroOut && !hidden;
  return (
    <div className={`sticky${show ? ' sticky--on' : ''}`} aria-hidden={!show}>
      <button type="button" className="btn btn--light sticky__main" onClick={onBook} tabIndex={show ? 0 : -1}>
        agendar horário <ArrowUpRight size={16} strokeWidth={1.8} />
      </button>
      <a className="sticky__wa" href={waLink(genericMessage)} target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp" tabIndex={show ? 0 : -1}>
        <WhatsAppIcon size={22} />
      </a>
    </div>
  );
}


// ==========================================================================
// APP
// ==========================================================================

export default function App() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');
    document.title = brand.title;

    // Trava o zoom-out: a página nunca fica menor que a tela (só dá para ampliar).
    let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover';

    // Impede rolagem lateral (é ela que faz o navegador "encolher" o site).
    root.style.overflowX = 'clip';
    document.body.style.overflowX = 'clip';
  }, []);

  const [preset, setPreset] = useState<BookingPreset>({ nonce: 0 });

  // Todo CTA do site passa por aqui: escolhe serviço/barbeiro (se houver) e leva ao agendamento.
  const book = useCallback((opts?: { serviceId?: string; barberId?: string }) => {
    setPreset((p) => ({ serviceId: opts?.serviceId, barberId: opts?.barberId, nonce: p.nonce + 1 }));
    scrollToId('agendar');
  }, []);

  // Revelação suave dos blocos ao entrar na tela (um único observer).
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a className="skip" href="#manifesto">
        ir para o conteúdo
      </a>
      <Header onBook={() => book()} />
      <main>
        <Hero onBook={() => book()} />
        <Marquee />
        <Manifesto onBook={() => book()} />
        <Services onBook={book} />
        <Chair onBook={book} />
        <Barbers onBook={book} />
        <Booking preset={preset} />
        <Ritual />
        <Club />
        <Gallery />
        <Testimonials />
        <FAQ />
        <Place />
        <FinalCTA onBook={() => book()} />
      </main>
      <Footer />
      <StickyCTA onBook={() => book()} />
    </>
  );
}