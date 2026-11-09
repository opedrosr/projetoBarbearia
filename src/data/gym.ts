export const gym = {
  name: 'Áurea',
  city: 'Pinheiros, São Paulo',
  whatsapp: '5511999999999',
  images: {
    hero: 'https://images.pexels.com/photos/4065511/pexels-photo-4065511.jpeg?auto=compress&cs=tinysrgb&h=1400&w=2000',
    training: 'https://images.pexels.com/photos/13965872/pexels-photo-13965872.jpeg?auto=compress&cs=tinysrgb&h=1000&w=800',
    interior: 'https://images.pexels.com/photos/6739958/pexels-photo-6739958.jpeg?auto=compress&cs=tinysrgb&h=1000&w=1400',
    studio: 'https://images.pexels.com/photos/36833355/pexels-photo-36833355.jpeg?auto=compress&cs=tinysrgb&h=1000&w=1400',
    boxing: 'https://images.pexels.com/photos/4753993/pexels-photo-4753993.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
    coach: 'https://images.pexels.com/photos/12890804/pexels-photo-12890804.jpeg?auto=compress&cs=tinysrgb&h=900&w=700',
  },
  stats: [
    { value: '2.000+', label: 'alunos em movimento' },
    { value: '4,9', label: 'nota no Google' },
    { value: '06', label: 'anos de consistência' },
  ],
  plans: [
    { name: 'Mensal', price: 'R$ 289', period: '/mês', detail: 'para quem quer testar a rotina', features: ['Acesso livre à musculação', 'Avaliação inicial', 'App Áurea'], featured: false },
    { name: 'Trimestral', price: 'R$ 249', period: '/mês', detail: 'para quem já tem rotina', features: ['Tudo do Mensal', '2 aulas coletivas / semana', 'Reavaliação a cada 60 dias'], featured: true },
    { name: 'Anual', price: 'R$ 199', period: '/mês', detail: 'para quem quer treinar o ano todo', features: ['Tudo do Trimestral', 'Aulas ilimitadas', 'Consultoria de treino'], featured: false },
  ],
  modalities: [
    { number: '01', name: 'Musculação', description: 'Treino de força com equipamentos e orientação do professor.', image: 'https://images.pexels.com/photos/9944900/pexels-photo-9944900.jpeg?auto=compress&cs=tinysrgb&h=1000&w=800' },
    { number: '02', name: 'Funcional', description: 'Treino dinâmico para força, mobilidade e condicionamento.', image: 'https://images.pexels.com/photos/4761349/pexels-photo-4761349.jpeg?auto=compress&cs=tinysrgb&h=1000&w=800' },
    { number: '03', name: 'Boxe', description: 'Treino de boxe para melhorar condicionamento, coordenação e ritmo.', image: 'https://images.pexels.com/photos/38508793/pexels-photo-38508793.jpeg?auto=compress&cs=tinysrgb&h=1000&w=800' },
    { number: '04', name: 'Pilates', description: 'Trabalho de controle, mobilidade e força com baixa intensidade.', image: 'https://images.pexels.com/photos/36833355/pexels-photo-36833355.jpeg?auto=compress&cs=tinysrgb&h=1000&w=800' },
  ],
  testimonials: [
    { quote: 'Eu não tinha rotina de academia. Comecei aos poucos e hoje já faz parte da minha semana.', name: 'Marina S.', detail: 'aluna há 14 meses' },
    { quote: 'O que mais gostei foi da orientação. Eu sei o que fazer e não fico perdido durante o treino.', name: 'Rafael M.', detail: 'aluno há 2 anos' },
    { quote: 'Os professores acompanham de perto e isso faz diferença. Você não fica largado treinando sozinho.', name: 'Camila R.', detail: 'aluna há 8 meses' },
  ],
  faqs: [
    ['Preciso saber treinar?', 'Não. Você pode começar do zero. Um professor explica os exercícios e acompanha seus primeiros treinos.'],
    ['O que acontece na aula experimental?', 'Você escolhe um horário, conhece a academia e faz uma aula acompanhada por um professor.'],
    ['Quais são os planos disponíveis?', 'Temos planos mensal, trimestral e anual. A equipe pode explicar as diferenças antes da matrícula.'],
    ['Posso treinar todos os dias?', 'Sim, de acordo com seu plano e os horários da academia. A frequência ideal depende do seu objetivo e da sua rotina.'],
    ['Tem estacionamento?', 'Sim. Há um estacionamento conveniado ao lado da academia.'],
    ['Qual é o horário de funcionamento?', 'De segunda a sexta, das 6h às 23h. Aos sábados, das 8h às 14h.'],
    ['Quais modalidades vocês têm?', 'Musculação, funcional, boxe, pilates e sessões especiais de mobilidade.'],
    ['O que preciso levar?', 'Roupa confortável e uma garrafa de água já resolvem. Para o primeiro treino, o professor orienta o restante.'],
    ['Como faço a matrícula?', 'Fale com a equipe pelo WhatsApp ou venha conhecer a academia antes de decidir.'],
  ],
};

export type Modality = (typeof gym.modalities)[number];
