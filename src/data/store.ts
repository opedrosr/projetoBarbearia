// Tudo que muda de uma loja para outra fica aqui.
// Para vender o template: troque este arquivo, as fotos (campo `image`) e pronto.

export type Category = 'Sala' | 'Quarto' | 'Jantar' | 'Escritório';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  material: string;
  dimensions: string;
  description: string;
  image: string;
}

export type FabricKind = 'boucle' | 'linho' | 'veludo' | 'couro';

export interface Fabric {
  id: string;
  name: string;
  hex: string;
  kind: FabricKind;
  extra: number;
}

export interface Wood {
  id: string;
  name: string;
  hex: string;
  extra: number;
}

export const store = {
  name: 'Atelier Norte',
  short: 'Norte',
  heroWord: 'norte',
  tagline: 'Mobiliário autoral',
  whatsapp: '5531999999999',
  instagram: 'https://instagram.com',
  city: 'Belo Horizonte',
  address: 'Rua da Bahia, 1200 — Lourdes, Belo Horizonte, MG',
  mapsQuery: 'Rua+da+Bahia+1200+Belo+Horizonte',
  hours: ['Seg a sex — 09h às 19h', 'Sáb — 10h às 16h'],
  founded: 2009,
  heroImage: '',

  categories: ['Sala', 'Quarto', 'Jantar', 'Escritório'] as Category[],

  stats: [
    { value: '15+', label: 'anos de ateliê' },
    { value: '4.800', label: 'peças entregues' },
    { value: '100%', label: 'sob medida' },
  ],

  products: [
    {
      id: 'p1',
      name: 'Poltrona Alba',
      category: 'Sala',
      price: 4890,
      material: 'Bouclé e nogueira',
      dimensions: '82 × 78 × 74 cm',
      description: 'Assento profundo, encosto levemente inclinado e pés em madeira maciça torneada à mão.',
      image: 'https://images.unsplash.com/photo-1741970713181-667de4c4b938?auto=format&fit=crop&w=1400&q=85',
    },
    {
      id: 'p2',
      name: 'Sofá Cais 3 lugares',
      category: 'Sala',
      price: 12900,
      material: 'Linho belga',
      dimensions: '240 × 98 × 72 cm',
      description: 'Estrutura em eucalipto, espuma de densidade dupla e capa totalmente removível.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85',
    },
    {
      id: 'p3',
      name: 'Mesa de centro Arco',
      category: 'Sala',
      price: 3290,
      material: 'Travertino e latão',
      dimensions: 'Ø 90 × 34 cm',
      description: 'Tampo em travertino romano com base em latão escovado.',
      image: 'https://www.thenewhouse.fr/cdn/shop/files/table-basse-pierre-travertin-ronde.jpg?v=1708394026&width=1445',
    },
    {
      id: 'p4',
      name: 'Cama Dune',
      category: 'Quarto',
      price: 8450,
      material: 'Veludo e carvalho',
      dimensions: 'Queen 168 × 210 cm',
      description: 'Cabeceira alta estofada em veludo, com base em carvalho e ripas ventiladas.',
      image: 'https://hamuq.com/cdn/shop/products/DELORIOUSBED_beige-01_2200x.jpg?v=1680881571',
    },
    {
      id: 'p5',
      name: 'Criado-mudo Faixa',
      category: 'Quarto',
      price: 1980,
      material: 'Carvalho natural',
      dimensions: '45 × 38 × 50 cm',
      description: 'Gaveta com corrediça oculta e puxador esculpido na própria madeira.',
      image: 'https://tshop.r10s.jp/mirara520/cabinet/yeswood3/yeswood-y28a02_1.jpg?fitin=720%3A720',
    },
    {
      id: 'p6',
      name: 'Mesa Orla 8 lugares',
      category: 'Jantar',
      price: 9800,
      material: 'Nogueira maciça',
      dimensions: '240 × 100 × 75 cm',
      description: 'Tampo de lâmina única, com bordas suavizadas e pés em chanfro.',
      image: 'https://craftsmill.in/cdn/shop/files/dining-table-175-cm-x-90-cm-x-76-cm-natural-polish-on-sheesham-wood-roma-luxury-dining-table-6-8-seater-175-cm-46586003456291_2048x.jpg?v=1725051382',
    },
    {
      id: 'p7',
      name: 'Cadeira Verso',
      category: 'Jantar',
      price: 1450,
      material: 'Couro e freijó',
      dimensions: '48 × 54 × 82 cm',
      description: 'Encosto curvo que abraça a lombar, assento em couro vegetal.',
      image: 'https://img2.kenayhome.com/eu/159748-large_default/tall-upholstered-gray-chair.jpg',
    },
    {
      id: 'p8',
      name: 'Escrivaninha Prumo',
      category: 'Escritório',
      price: 5600,
      material: 'Carvalho e aço',
      dimensions: '160 × 70 × 74 cm',
      description: 'Tampo amplo, passagem de cabos embutida e gaveta com chave.',
      image: 'https://standard-trade.co.jp/cdn/shop/files/DSK-01D-4LD_main_bg.jpg?v=1738547581&width=2560',
    },
  ] as Product[],

  configurator: {
    basePrice: 3900,

    fabrics: [
      { id: 'nevoa', name: 'Bouclé Névoa', hex: '#A8A59F', kind: 'boucle', extra: 0 },
      { id: 'areia', name: 'Bouclé Areia', hex: '#D8CCB8', kind: 'boucle', extra: 0 },
      { id: 'grafite', name: 'Linho Grafite', hex: '#4B4A47', kind: 'linho', extra: 0 },
      { id: 'oliva', name: 'Veludo Oliva', hex: '#5D6247', kind: 'veludo', extra: 420 },
      { id: 'terracota', name: 'Veludo Terracota', hex: '#A5573A', kind: 'veludo', extra: 420 },
      { id: 'caramelo', name: 'Couro Caramelo', hex: '#9A6334', kind: 'couro', extra: 1350 },
    ] as Fabric[],

    woods: [
      { id: 'carvalho', name: 'Carvalho natural', hex: '#B98F5E', extra: 0 },
      { id: 'nogueira', name: 'Nogueira', hex: '#5B3C27', extra: 260 },
      { id: 'ebano', name: 'Ébano tingido', hex: '#1E1A17', extra: 340 },
    ] as Wood[],
  },

  craft: [
    {
      title: 'Madeira de origem',
      text: 'Carvalho e nogueira certificados, secos em estufa por 60 dias antes de chegar à marcenaria.',
    },
    {
      title: 'Estofado artesanal',
      text: 'Espuma de densidade dupla, molas ensacadas e acabamento costurado à mão em cada peça.',
    },
    {
      title: 'Medida sua',
      text: 'Qualquer peça pode ser alterada em largura, altura e profundidade, sem custo de projeto.',
    },
  ],

  steps: [
    { n: '01', title: 'Conversa', text: 'Você conta sobre o ambiente por WhatsApp ou no showroom.' },
    { n: '02', title: 'Projeto', text: 'Enviamos proposta com medidas, materiais e prazo.' },
    { n: '03', title: 'Produção', text: 'Fabricação no ateliê, com fotos do andamento.' },
    { n: '04', title: 'Entrega', text: 'Entrega e montagem por nossa equipe, em até 45 dias.' },
  ],

  testimonials: [
    {
      quote: 'A poltrona chegou exatamente como imaginei. O acabamento é de outro nível.',
      name: 'Marina A.',
      detail: 'Apartamento em Lourdes',
    },
    {
      quote: 'Refizeram a mesa de jantar na medida da nossa sala. Atendimento impecável do início ao fim.',
      name: 'Rafael e Júlia',
      detail: 'Casa em Nova Lima',
    },
    {
      quote: 'Fiz o projeto do quarto inteiro com eles. Tudo conversa, nada parece comprado separado.',
      name: 'Carolina M.',
      detail: 'Cobertura na Savassi',
    },
  ],

  faqs: [
    ['Qual o prazo de entrega?', 'Peças de pronta entrega saem em até 7 dias. Peças sob medida levam de 30 a 45 dias.'] as [string, string],
    ['Vocês entregam e montam?', 'Sim. Entregamos e montamos em Belo Horizonte e região metropolitana. Para outros estados, consulte frete.'] as [string, string],
    ['Posso escolher outro tecido ou madeira?', 'Sim. Temos mais de 60 tecidos e 6 madeiras. Você pode ver as amostras no showroom ou receber em casa.'] as [string, string],
    ['Como funciona o pagamento?', 'Entrada de 50% na aprovação e o restante na entrega. Parcelamos no cartão em até 10x.'] as [string, string],
    ['Existe garantia?', 'Garantia de 5 anos na estrutura e 1 ano no estofado e ferragens.'] as [string, string],
  ],
};

export const brl = (n: number) =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

export const waLink = (text: string) =>
  `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text)}`;