// Dados completos dos personagens para a Academia
// Lista de 66 personagens do jogo Naruto Ultimate Ninja 5

export interface CharacterMove {
  id: string;
  name: string;
  type: "special" | "ultimate" | "setup" | "counter" | "projectile" | "command_grab" | "defensive" | "stance" | "buff" | "auto_guard" | "transformation" | "versatile" | "combo";
  video: string;
  description: string;
}

export interface CharacterData {
  id: string;
  name: string;
  tier: "S+" | "S" | "A+" | "A" | "B+" | "B" | "C+" | "C" | "D";
  gif: string;
  attributes: {
    strength: number;
    speed: number;
    technique: number;
    defense: number;
    mobility: number;
    versatility: number;
  };
  description: string;
  moves: CharacterMove[];
  matchups: {
    favorable_against: string[];
    unfavorable_against: string[];
  };
}

export const academyCharacters: CharacterData[] = [
  // ============ TIER S+ ============
  {
    id: "char_001",
    name: "Naruto Uzumaki",
    tier: "S+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=naruto",
    attributes: { strength: 8, speed: 7, technique: 9, defense: 6, mobility: 8, versatility: 9 },
    description: "O jovem Naruto possui um kit versátil com clones de sombra e Rasengan. Excelente em mixups e pressão constante. Ideal para jogadores que gostam de agressão controlada com múltiplas opções de ataque.",
    moves: [
      { id: "move_001", name: "Rasengan", type: "special", video: "", description: "Golpe especial de médio alcance com ótimo dano. Startup moderado mas seguro em block. Excelente para finalizar combos ou punir dashes." },
      { id: "move_002", name: "Kage Bunshin", type: "setup", video: "", description: "Cria clones para mixup e pressure. Versátil para high/low e esquerda/direita. Gasta chakra mas abre muitas possibilidades." },
      { id: "move_003", name: "Uzumaki Barrage", type: "combo", video: "", description: "Combo aéreo devastador usando clones. Excelente dano e corner carry." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Gaara", "Neji Hyuuga"],
      unfavorable_against: ["Itachi Uchiha", "Sasuke Shippūden", "Minato Namikaze"]
    }
  },
  {
    id: "char_002",
    name: "Naruto Shippūden",
    tier: "S+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=naruto-shippuden",
    attributes: { strength: 9, speed: 8, technique: 10, defense: 7, mobility: 9, versatility: 10 },
    description: "Naruto mais maduro com Rasen Shuriken e modo Sennin. Arsenal completo para todas as situações. Top tier absoluto nas mãos certas.",
    moves: [
      { id: "move_004", name: "Rasen Shuriken", type: "ultimate", video: "", description: "Ultimate devastador de longo alcance. Requer setup mas causa dano massivo. Melhor usado após knockdown." },
      { id: "move_005", name: "Modo Sennin", type: "buff", video: "", description: "Aumenta todos os atributos temporariamente. Permite combos estendidos e dano adicional." },
      { id: "move_006", name: "Oodama Rasengan", type: "special", video: "", description: "Rasengan gigante com mais dano e range. Ótimo para punishes pesados." }
    ],
    matchups: {
      favorable_against: ["Sasuke Uchiha", "Orochimaru", "Kabuto Yakushi"],
      unfavorable_against: ["Itachi Uchiha", "Minato Namikaze", "Hashirama Senju"]
    }
  },

  // ============ TIER S ============
  {
    id: "char_003",
    name: "Sasuke Uchiha",
    tier: "S",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sasuke",
    attributes: { strength: 7, speed: 9, technique: 9, defense: 5, mobility: 9, versatility: 8 },
    description: "O último dos Uchiha combina velocidade mortal com técnicas poderosas. Sharingan permite counters precisos. Chidori oferece alto dano em punishes.",
    moves: [
      { id: "move_007", name: "Chidori", type: "special", video: "", description: "Rush elétrico devastador. Alto risco, alto retorno. Punishável em miss mas garantido em vários setups." },
      { id: "move_008", name: "Sharingan Counter", type: "counter", video: "", description: "Counter de precisão que vira o jogo. Timing perfeito necessário." },
      { id: "move_009", name: "Fireball Jutsu", type: "projectile", video: "", description: "Projétil clássico para controle de espaço. Bom em neutral." }
    ],
    matchups: {
      favorable_against: ["Sakura Haruno", "Hinata Hyuuga", "Shikamaru Nara"],
      unfavorable_against: ["Naruto Shippūden", "Itachi Uchiha", "Minato Namikaze"]
    }
  },
  {
    id: "char_004",
    name: "Sasuke Shippūden",
    tier: "S+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sasuke-shippuden",
    attributes: { strength: 8, speed: 10, technique: 10, defense: 6, mobility: 10, versatility: 9 },
    description: "Sasuke no auge com Mangekyo Sharingan. Amaterasu, Susanoo e Kirin formam arsenal devastador. Mobilidade extrema e dano consistente.",
    moves: [
      { id: "move_010", name: "Kirin", type: "ultimate", video: "", description: "Relâmpago massivo do céu. Lento mas imbloquável. Setup específico necessário." },
      { id: "move_011", name: "Chidori Nagashi", type: "defensive", video: "", description: "Chidori em área. Ótimo para escapar de pressão e reset neutral." },
      { id: "move_012", name: "Susanoo", type: "transformation", video: "", description: "Armadura temporária com ataques poderosos. Gasta chakra mas domina rounds." }
    ],
    matchups: {
      favorable_against: ["Orochimaru", "Deidara", "Kabuto Yakushi"],
      unfavorable_against: ["Naruto Shippūden", "Itachi Uchiha", "Hashirama Senju"]
    }
  },
  {
    id: "char_005",
    name: "Itachi Uchiha",
    tier: "S",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=itachi",
    attributes: { strength: 6, speed: 8, technique: 10, defense: 6, mobility: 7, versatility: 9 },
    description: "Gênio tático com arsenal devastador. Tsukuyomi controla mente, Amaterasu queima tudo, Susanoo protege. Domina através de leitura e timing perfeito.",
    moves: [
      { id: "move_013", name: "Tsukuyomi", type: "command_grab", video: "", description: "Genjutsu que paralisa. Funciona como command grab. Quebra turtle." },
      { id: "move_014", name: "Amaterasu", type: "projectile", video: "", description: "Chamas negras imbloquáveis. Lento mas constante chip damage." },
      { id: "move_015", name: "Susanoo", type: "defensive", video: "", description: "Armadura massiva. Absorve hits e permite counters." }
    ],
    matchups: {
      favorable_against: ["Naruto Uzumaki", "Jiraiya", "Orochimaru"],
      unfavorable_against: ["Sasuke Shippūden", "Minato Namikaze", "Hashirama Senju"]
    }
  },
  {
    id: "char_006",
    name: "Minato Namikaze",
    tier: "S",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=minato",
    attributes: { strength: 7, speed: 10, technique: 10, defense: 5, mobility: 10, versatility: 9 },
    description: "O Relâmpago Amarelo de Konoha. Velocidade incomparável com Hiraishin. Rasengan preciso e teleporte constante. Domina neutral e punishes.",
    moves: [
      { id: "move_016", name: "Hiraishin", type: "special", video: "", description: "Teleporte instantâneo para kunai marcada. Mixup e escape supremos." },
      { id: "move_017", name: "Rasengan", type: "special", video: "", description: "Rasengan original. Rápido, seguro e versátil." },
      { id: "move_018", name: "Flying Thunder God Slash", type: "ultimate", video: "", description: "Combo devastador usando teleporte. Difícil de reagir." }
    ],
    matchups: {
      favorable_against: ["Sasuke Uchiha", "Orochimaru", "Kisame Hoshigaki"],
      unfavorable_against: ["Hashirama Senju", "Tobirama Senju", "Itachi Uchiha"]
    }
  },

  // ============ TIER A+ ============
  {
    id: "char_007",
    name: "Kakashi Hatake",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kakashi",
    attributes: { strength: 7, speed: 8, technique: 10, defense: 7, mobility: 7, versatility: 10 },
    description: "O Ninja Copiador possui toolkit mais versátil do jogo. Sharingan, Raikiri e diversos jutsus copiados. Excelente em neutral e footsies.",
    moves: [
      { id: "move_019", name: "Raikiri", type: "special", video: "", description: "Versão aprimorada do Chidori. Mais rápido e seguro." },
      { id: "move_020", name: "Kamui", type: "special", video: "", description: "Teleporte dimensional. Esquiva projéteis e cria mixup." },
      { id: "move_021", name: "Sharingan Copy", type: "versatile", video: "", description: "Usa o último jutsu do oponente. Alta skill cap." }
    ],
    matchups: {
      favorable_against: ["Deidara", "Sasori", "Hidan"],
      unfavorable_against: ["Itachi Uchiha", "Minato Namikaze", "Hashirama Senju"]
    }
  },
  {
    id: "char_008",
    name: "Jiraiya",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=jiraiya",
    attributes: { strength: 8, speed: 6, technique: 9, defense: 7, mobility: 6, versatility: 9 },
    description: "O Sannin Sapo com arsenal massivo. Rasengan, invocações e modo Sennin. Excelente em zoning e setups elaborados. Recompensa paciência.",
    moves: [
      { id: "move_022", name: "Rasengan", type: "special", video: "", description: "Rasengan versátil para combos e punishes." },
      { id: "move_023", name: "Toad Oil Bullet", type: "projectile", video: "", description: "Projétil que desacelera oponente. Ótimo para setup." },
      { id: "move_024", name: "Sage Mode", type: "buff", video: "", description: "Aumenta poder drasticamente. Permite combos devastadores." }
    ],
    matchups: {
      favorable_against: ["Orochimaru", "Kabuto Yakushi", "Kisame Hoshigaki"],
      unfavorable_against: ["Itachi Uchiha", "Minato Namikaze", "Naruto Shippūden"]
    }
  },
  {
    id: "char_009",
    name: "Tsunade",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=tsunade",
    attributes: { strength: 10, speed: 6, technique: 8, defense: 9, mobility: 5, versatility: 7 },
    description: "A Sannin Médica com força monstruosa. Golpes devastadores que quebram guarda. Regeneração permite trades favoráveis. Tank com explosão.",
    moves: [
      { id: "move_025", name: "Cherry Blossom Impact", type: "special", video: "", description: "Soco que quebra guarda e causa stun. Ótimo para abrir defesas." },
      { id: "move_026", name: "Healing Jutsu", type: "buff", video: "", description: "Recupera vida gradualmente. Permite jogar mais agressivo." },
      { id: "move_027", name: "Mitotic Regeneration", type: "transformation", video: "", description: "Cura massiva e boost de stats. Vira partidas." }
    ],
    matchups: {
      favorable_against: ["Orochimaru", "Kabuto Yakushi", "Kimimaro"],
      unfavorable_against: ["Itachi Uchiha", "Minato Namikaze", "Deidara"]
    }
  },
  {
    id: "char_010",
    name: "Orochimaru",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=orochimaru",
    attributes: { strength: 6, speed: 7, technique: 10, defense: 6, mobility: 8, versatility: 10 },
    description: "O Sannin das Cobras com kit único. Alcance extremo, invocações e jutsus proibidos. Zoning master que frustra approach.",
    moves: [
      { id: "move_028", name: "Kusanagi", type: "special", video: "", description: "Espada extensível com range massivo. Controla espaço." },
      { id: "move_029", name: "Snake Hands", type: "command_grab", video: "", description: "Grab de longo alcance. Pega oponentes desprevenidos." },
      { id: "move_030", name: "Edo Tensei", type: "setup", video: "", description: "Invoca aliados temporários. Pressão constante." }
    ],
    matchups: {
      favorable_against: ["Sakura Haruno", "Rock Lee", "Kiba Inuzuka"],
      unfavorable_against: ["Jiraiya", "Tsunade", "Naruto Shippūden"]
    }
  },
  {
    id: "char_011",
    name: "Hashirama Senju",
    tier: "S",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=hashirama",
    attributes: { strength: 10, speed: 7, technique: 10, defense: 9, mobility: 6, versatility: 10 },
    description: "O Deus dos Shinobi. Wood Release domina o cenário com controle de área incomparável. Força bruta combinada com versatilidade técnica.",
    moves: [
      { id: "move_031", name: "Wood Dragon", type: "ultimate", video: "", description: "Dragão de madeira massivo. Dano e controle extremos." },
      { id: "move_032", name: "Deep Forest Emergence", type: "setup", video: "", description: "Cria floresta no stage. Limita movimento e cria vantagem." },
      { id: "move_033", name: "Wood Clone", type: "setup", video: "", description: "Clones duráveis para pressão e mixup." }
    ],
    matchups: {
      favorable_against: ["Minato Namikaze", "Itachi Uchiha", "Orochimaru"],
      unfavorable_against: ["Tobirama Senju", "Naruto Shippūden"]
    }
  },
  {
    id: "char_012",
    name: "Tobirama Senju",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=tobirama",
    attributes: { strength: 8, speed: 9, technique: 10, defense: 7, mobility: 9, versatility: 9 },
    description: "O Segundo Hokage. Water Release devastador e Hiraishin original. Técnico com excelente controle de espaço e mobilidade.",
    moves: [
      { id: "move_034", name: "Water Dragon", type: "special", video: "", description: "Dragão de água poderoso. Bom dano e knockback." },
      { id: "move_035", name: "Flying Thunder God", type: "special", video: "", description: "Teleporte que inventou. Rápido e versátil." },
      { id: "move_036", name: "Tandem Paper Bombs", type: "setup", video: "", description: "Armadilhas explosivas. Controle de área." }
    ],
    matchups: {
      favorable_against: ["Hashirama Senju", "Orochimaru", "Kisame Hoshigaki"],
      unfavorable_against: ["Minato Namikaze", "Itachi Uchiha"]
    }
  },
  {
    id: "char_013",
    name: "Hiruzen Sarutobi",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=hiruzen",
    attributes: { strength: 7, speed: 6, technique: 10, defense: 7, mobility: 6, versatility: 10 },
    description: "O Professor. Conhece todos os jutsus de Konoha. Kit extremamente versátil mas requer alto conhecimento. Jack of all trades.",
    moves: [
      { id: "move_037", name: "Enma Staff", type: "special", video: "", description: "Bastão transformado. Range e dano sólidos." },
      { id: "move_038", name: "Fire Dragon", type: "projectile", video: "", description: "Projétil de fogo massivo. Excelente zoning." },
      { id: "move_039", name: "Reaper Death Seal", type: "ultimate", video: "", description: "Selo suicida. Alto risco, mata garantido." }
    ],
    matchups: {
      favorable_against: ["Orochimaru", "Kabuto Yakushi", "Sound Four"],
      unfavorable_against: ["Itachi Uchiha", "Minato Namikaze", "Hashirama Senju"]
    }
  },

  // ============ TIER A ============
  {
    id: "char_014",
    name: "Rock Lee",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=rocklee",
    attributes: { strength: 9, speed: 10, technique: 6, defense: 5, mobility: 10, versatility: 5 },
    description: "Velocidade pura e taijutsu devastador. Não usa ninjutsu mas compensa com agilidade extrema. Rushdown implacável que não dá respiro.",
    moves: [
      { id: "move_040", name: "Primary Lotus", type: "special", video: "", description: "Combo aéreo devastador. Requer setup mas dano garantido." },
      { id: "move_041", name: "Leaf Hurricane", type: "combo", video: "", description: "Série de chutes rápidos. Excelente pressão." },
      { id: "move_042", name: "Eight Gates", type: "buff", video: "", description: "Power-up temporário massivo. Drena vida mas poder extremo." }
    ],
    matchups: {
      favorable_against: ["Tenten", "Kiba Inuzuka", "Chouji Akimichi"],
      unfavorable_against: ["Gaara", "Neji Hyuuga", "Temari"]
    }
  },
  {
    id: "char_015",
    name: "Rock Lee Modo Punho Zonzo",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=rocklee-drunk",
    attributes: { strength: 8, speed: 10, technique: 8, defense: 4, mobility: 10, versatility: 7 },
    description: "Lee bêbado com movimentos imprevisíveis. Stance única que confunde oponentes. Alta skill cap mas extremamente recompensador.",
    moves: [
      { id: "move_043", name: "Drunken Fist", type: "stance", video: "", description: "Stance imprevisível. Movimento errático confunde." },
      { id: "move_044", name: "Staggering Strike", type: "special", video: "", description: "Golpe cambaleante. Hitbox estranho dificulta defesa." },
      { id: "move_045", name: "Bottle Smash", type: "special", video: "", description: "Ataque com garrafa. Startup enganoso." }
    ],
    matchups: {
      favorable_against: ["Neji Hyuuga", "Shikamaru Nara", "Gaara"],
      unfavorable_against: ["Itachi Uchiha", "Kakashi Hatake", "Minato Namikaze"]
    }
  },
  {
    id: "char_016",
    name: "Rock Lee Shippūden",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=rocklee-shippuden",
    attributes: { strength: 9, speed: 10, technique: 7, defense: 6, mobility: 10, versatility: 6 },
    description: "Lee mais maduro com taijutsu refinado. Velocidade mantida com mais consistência. Menos volátil que versões anteriores.",
    moves: [
      { id: "move_046", name: "Hidden Lotus", type: "ultimate", video: "", description: "Lotus oculta. Devastador mas requer setup." },
      { id: "move_047", name: "Dynamic Entry", type: "special", video: "", description: "Entrada explosiva. Ótimo gap closer." },
      { id: "move_048", name: "Konoha Whirlwind", type: "combo", video: "", description: "Combo de chutes versátil. Bom em neutral." }
    ],
    matchups: {
      favorable_against: ["Deidara", "Sasori", "Kankurou"],
      unfavorable_against: ["Gaara Shippūden", "Neji Hyuuga Shippūden", "Temari Shippūden"]
    }
  },
  {
    id: "char_017",
    name: "Neji Hyuuga",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=neji",
    attributes: { strength: 7, speed: 8, technique: 9, defense: 8, mobility: 7, versatility: 7 },
    description: "Gênio Hyuuga com Byakugan. Gentle Fist fecha tenketsu e drena chakra. Rotation oferece defesa perfeita. Técnico e preciso.",
    moves: [
      { id: "move_049", name: "64 Palms", type: "special", video: "", description: "Série de golpes que fecha tenketsu. Alto dano e drena chakra." },
      { id: "move_050", name: "Rotation", type: "defensive", video: "", description: "Defesa giratória. Reflete projéteis e afasta rushdown." },
      { id: "move_051", name: "Air Palm", type: "projectile", video: "", description: "Projétil de ar. Bom para zoning." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Kiba Inuzuka", "Naruto Uzumaki"],
      unfavorable_against: ["Itachi Uchiha", "Kakashi Hatake", "Sasuke Shippūden"]
    }
  },
  {
    id: "char_018",
    name: "Neji Hyuuga Shippūden",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=neji-shippuden",
    attributes: { strength: 8, speed: 8, technique: 10, defense: 8, mobility: 7, versatility: 8 },
    description: "Neji amadurecido com técnicas refinadas. Gentle Fist mais poderoso e Rotation melhorado. Mais completo que versão original.",
    moves: [
      { id: "move_052", name: "128 Palms", type: "special", video: "", description: "Versão estendida do 64 Palms. Mais dano e reach." },
      { id: "move_053", name: "Eight Trigrams Vacuum Palm", type: "projectile", video: "", description: "Projétil de alcance maior. Melhor zoning." },
      { id: "move_054", name: "Gentle Fist Art", type: "combo", video: "", description: "Combo preciso. Maximiza dano de tenketsu." }
    ],
    matchups: {
      favorable_against: ["Rock Lee Shippūden", "Kiba Inuzuka Shippūden", "Hinata Hyuuga Shippūden"],
      unfavorable_against: ["Itachi Uchiha", "Sasuke Shippūden", "Naruto Shippūden"]
    }
  },
  {
    id: "char_019",
    name: "Gaara",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=gaara",
    attributes: { strength: 6, speed: 5, technique: 8, defense: 10, mobility: 6, versatility: 8 },
    description: "Mestre da defesa absoluta. Areia protege automaticamente e contra-ataca. Excelente em zoning e controle de espaço.",
    moves: [
      { id: "move_055", name: "Sand Shield", type: "auto_guard", video: "", description: "Bloqueio automático. Protege de certos ataques." },
      { id: "move_056", name: "Sand Coffin", type: "command_grab", video: "", description: "Grab à distância. Lento mas devastador." },
      { id: "move_057", name: "Shukaku Transformation", type: "transformation", video: "", description: "Forma bijuu. Aumenta poder massivamente." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Kiba Inuzuka", "Sakura Haruno"],
      unfavorable_against: ["Deidara", "Sasuke Uchiha", "Naruto Shippūden"]
    }
  },
  {
    id: "char_020",
    name: "Gaara Shippūden",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=gaara-shippuden",
    attributes: { strength: 7, speed: 6, technique: 9, defense: 10, mobility: 7, versatility: 9 },
    description: "Kazekage com controle de areia refinado. Mais versátil e técnico. Defesa mantida com mais opções ofensivas.",
    moves: [
      { id: "move_058", name: "Sand Tsunami", type: "ultimate", video: "", description: "Onda massiva de areia. Controle de área devastador." },
      { id: "move_059", name: "Third Eye", type: "setup", video: "", description: "Olho de areia para visão. Ajuda em reads." },
      { id: "move_060", name: "Desert Layered Imperial Funeral", type: "special", video: "", description: "Ataque de área. Excelente dano." }
    ],
    matchups: {
      favorable_against: ["Rock Lee Shippūden", "Kiba Inuzuka Shippūden", "Deidara"],
      unfavorable_against: ["Sasuke Shippūden", "Naruto Shippūden", "Itachi Uchiha"]
    }
  },
  {
    id: "char_021",
    name: "Might Guy",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=guy",
    attributes: { strength: 10, speed: 9, technique: 7, defense: 6, mobility: 9, versatility: 6 },
    description: "Mestre do Taijutsu e dos 8 Portões. Lee mais forte e consistente. Explosivo com dano absurdo quando ativa portões.",
    moves: [
      { id: "move_061", name: "Morning Peacock", type: "special", video: "", description: "Socos em chamas. Dano massivo em área." },
      { id: "move_062", name: "Noon Tiger", type: "ultimate", video: "", description: "Tigre de ar comprimido. Devastador." },
      { id: "move_063", name: "Dynamic Entry", type: "special", video: "", description: "Entrada explosiva clássica. Gap closer." }
    ],
    matchups: {
      favorable_against: ["Kisame Hoshigaki", "Deidara", "Sasori"],
      unfavorable_against: ["Itachi Uchiha", "Minato Namikaze", "Hashirama Senju"]
    }
  },

  // ============ TIER B+ ============
  {
    id: "char_022",
    name: "Sakura Haruno",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sakura",
    attributes: { strength: 6, speed: 6, technique: 7, defense: 5, mobility: 6, versatility: 6 },
    description: "Sakura jovem com kit básico. Socos fortes mas kit limitado. Boa para iniciantes aprenderem fundamentos.",
    moves: [
      { id: "move_064", name: "Cherry Blossom Clash", type: "special", video: "", description: "Soco carregado. Bom dano se conectar." },
      { id: "move_065", name: "Inner Sakura", type: "buff", video: "", description: "Boost temporário de força." },
      { id: "move_066", name: "Kunai Throw", type: "projectile", video: "", description: "Projétil básico. Ferramenta de neutral." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Tenten", "Konohamaru"],
      unfavorable_against: ["Sasuke Uchiha", "Naruto Uzumaki", "Rock Lee"]
    }
  },
  {
    id: "char_023",
    name: "Sakura Haruno Shippūden",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sakura-shippuden",
    attributes: { strength: 9, speed: 7, technique: 8, defense: 7, mobility: 6, versatility: 7 },
    description: "Sakura treinada por Tsunade. Força monstruosa com cura. Mais completa e viável competitivamente.",
    moves: [
      { id: "move_067", name: "Heaven Kick of Pain", type: "special", video: "", description: "Chute devastador do alto. Ótimo anti-air." },
      { id: "move_068", name: "Medical Ninjutsu", type: "buff", video: "", description: "Cura que permite trades favoráveis." },
      { id: "move_069", name: "Ground Shatter", type: "special", video: "", description: "Soco no chão. Área de efeito." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka Shippūden", "Sasori", "Kabuto Yakushi"],
      unfavorable_against: ["Sasuke Shippūden", "Naruto Shippūden", "Itachi Uchiha"]
    }
  },
  {
    id: "char_024",
    name: "Shikamaru Nara",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=shikamaru",
    attributes: { strength: 4, speed: 5, technique: 10, defense: 5, mobility: 5, versatility: 8 },
    description: "Gênio estratégico com Shadow Possession. Baixo dano mas controle extremo. Recompensa paciência e leitura.",
    moves: [
      { id: "move_070", name: "Shadow Possession", type: "command_grab", video: "", description: "Paralisa oponente. Setup para combos." },
      { id: "move_071", name: "Shadow Strangle", type: "special", video: "", description: "Estrangula com sombra. Dano gradual." },
      { id: "move_072", name: "Shadow Sewing", type: "setup", video: "", description: "Múltiplas sombras. Controle de área." }
    ],
    matchups: {
      favorable_against: ["Hidan", "Temari", "Ino Yamanaka"],
      unfavorable_against: ["Rock Lee", "Naruto Uzumaki", "Kiba Inuzuka"]
    }
  },
  {
    id: "char_025",
    name: "Shikamaru Nara Shippūden",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=shikamaru-shippuden",
    attributes: { strength: 5, speed: 6, technique: 10, defense: 6, mobility: 6, versatility: 9 },
    description: "Shikamaru mais experiente. Sombras mais versáteis e estratégias refinadas. Melhor em todos os aspectos.",
    moves: [
      { id: "move_073", name: "Shadow Imitation Shuriken", type: "projectile", video: "", description: "Projétil que conecta sombras. Zoning." },
      { id: "move_074", name: "Shadow Gathering", type: "setup", video: "", description: "Prepara múltiplas sombras. Setup poderoso." },
      { id: "move_075", name: "Shadow–Neck Binding", type: "ultimate", video: "", description: "Estrangulamento garantido. Alto dano." }
    ],
    matchups: {
      favorable_against: ["Hidan", "Deidara", "Temari Shippūden"],
      unfavorable_against: ["Naruto Shippūden", "Rock Lee Shippūden", "Might Guy"]
    }
  },
  {
    id: "char_026",
    name: "Chouji Akimichi",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=chouji",
    attributes: { strength: 9, speed: 4, technique: 5, defense: 8, mobility: 4, versatility: 5 },
    description: "Tank pesado com expansão corporal. Lento mas forte. Bom para quem gosta de trades e pressão física.",
    moves: [
      { id: "move_076", name: "Human Boulder", type: "special", video: "", description: "Rola como bola. Armadura e dano." },
      { id: "move_077", name: "Expansion Jutsu", type: "buff", video: "", description: "Aumenta tamanho. Mais dano e alcance." },
      { id: "move_078", name: "Partial Expansion", type: "special", video: "", description: "Expande partes. Ataques de longo alcance." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Shino Aburame", "Hinata Hyuuga"],
      unfavorable_against: ["Rock Lee", "Naruto Uzumaki", "Sasuke Uchiha"]
    }
  },
  {
    id: "char_027",
    name: "Chouji Akimichi Shippūden",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=chouji-shippuden",
    attributes: { strength: 10, speed: 5, technique: 6, defense: 9, mobility: 5, versatility: 6 },
    description: "Chouji mais forte com Butterfly Mode. Ainda lento mas dano compensar. Tank que pode virar partidas.",
    moves: [
      { id: "move_079", name: "Butterfly Bullet Bombing", type: "ultimate", video: "", description: "Soco devastador em Butterfly Mode." },
      { id: "move_080", name: "Super Expansion", type: "transformation", video: "", description: "Forma gigante. Controle de área." },
      { id: "move_081", name: "Meat Tank", type: "special", video: "", description: "Boulder aprimorado. Mais rápido e forte." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka Shippūden", "Shino Aburame Shippūden", "Kankurou Shippūden"],
      unfavorable_against: ["Rock Lee Shippūden", "Naruto Shippūden", "Sasuke Shippūden"]
    }
  },
  {
    id: "char_028",
    name: "Ino Yamanaka",
    tier: "C+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=ino",
    attributes: { strength: 4, speed: 6, technique: 7, defense: 4, mobility: 6, versatility: 6 },
    description: "Especialista em jutsu mental. Mind Transfer arriscado mas devastador. Tier baixo mas gimmick forte.",
    moves: [
      { id: "move_082", name: "Mind Transfer", type: "command_grab", video: "", description: "Controla oponente. Alto risco, alto retorno." },
      { id: "move_083", name: "Mind Destruction", type: "special", video: "", description: "Confunde oponente. Inverte controles." },
      { id: "move_084", name: "Flower Ninja Art", type: "setup", video: "", description: "Pétalas que distraem." }
    ],
    matchups: {
      favorable_against: ["Tenten", "Konohamaru", "Hanabi Hyuuga"],
      unfavorable_against: ["Shikamaru Nara", "Sakura Haruno", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_029",
    name: "Ino Yamanaka Shippūden",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=ino-shippuden",
    attributes: { strength: 5, speed: 7, technique: 8, defense: 5, mobility: 7, versatility: 7 },
    description: "Ino melhorada com habilidades médicas. Mind Transfer mais seguro. Mais viável que versão original.",
    moves: [
      { id: "move_085", name: "Mind Transfer Clone", type: "special", video: "", description: "Transfer mais seguro usando clone." },
      { id: "move_086", name: "Medical Ninjutsu", type: "buff", video: "", description: "Cura básica. Sustain em lutas longas." },
      { id: "move_087", name: "Sensory Perception", type: "setup", video: "", description: "Detecta movimento. Ajuda em reads." }
    ],
    matchups: {
      favorable_against: ["Tenten Shippūden", "Konohamaru", "Shino Aburame"],
      unfavorable_against: ["Shikamaru Nara Shippūden", "Sakura Haruno Shippūden", "Chouji Akimichi Shippūden"]
    }
  },
  {
    id: "char_030",
    name: "Asuma Sarutobi",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=asuma",
    attributes: { strength: 8, speed: 7, technique: 7, defense: 7, mobility: 6, versatility: 7 },
    description: "Jounin equilibrado com chakra blades. Sólido em todas as áreas sem brilhar em nenhuma. Bom para fundamentos.",
    moves: [
      { id: "move_088", name: "Flying Swallow", type: "special", video: "", description: "Lâminas de chakra. Bom dano e range." },
      { id: "move_089", name: "Fire Style: Ash Pile Burning", type: "projectile", video: "", description: "Projétil de cinzas. Controle de área." },
      { id: "move_090", name: "Wind Release", type: "buff", video: "", description: "Aumenta dano das lâminas." }
    ],
    matchups: {
      favorable_against: ["Hidan", "Shikamaru Nara", "Ino Yamanaka"],
      unfavorable_against: ["Itachi Uchiha", "Kakashi Hatake", "Minato Namikaze"]
    }
  },
  {
    id: "char_031",
    name: "Shino Aburame",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=shino",
    attributes: { strength: 5, speed: 5, technique: 8, defense: 6, mobility: 5, versatility: 7 },
    description: "Controlador de insetos único. Drena chakra e cria armadilhas. Jogo paciênte de atrito.",
    moves: [
      { id: "move_091", name: "Parasitic Insects", type: "setup", video: "", description: "Libera insetos. Drenam chakra do oponente." },
      { id: "move_092", name: "Bug Clone", type: "special", video: "", description: "Clone de insetos. Bait e mixup." },
      { id: "move_093", name: "Insect Swarm", type: "projectile", video: "", description: "Enxame direcionado. Zoning." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Tenten", "Konohamaru"],
      unfavorable_against: ["Rock Lee", "Sasuke Uchiha", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_032",
    name: "Shino Aburame Shippūden",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=shino-shippuden",
    attributes: { strength: 6, speed: 6, technique: 9, defense: 7, mobility: 6, versatility: 8 },
    description: "Shino mais poderoso. Insetos mais versáteis e controle aprimorado. Melhor em zoning.",
    moves: [
      { id: "move_094", name: "Nano-Sized Venomous Insects", type: "special", video: "", description: "Insetos venenosos. Dano over time." },
      { id: "move_095", name: "Insect Jar Technique", type: "setup", video: "", description: "Cria zona de insetos. Área de perigo." },
      { id: "move_096", name: "Secret Technique: Insect Sphere", type: "ultimate", video: "", description: "Esfera de insetos. Alto dano." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka Shippūden", "Tenten Shippūden", "Kankurou Shippūden"],
      unfavorable_against: ["Rock Lee Shippūden", "Sasuke Shippūden", "Naruto Shippūden"]
    }
  },
  {
    id: "char_033",
    name: "Kiba Inuzuka",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kiba",
    attributes: { strength: 7, speed: 8, technique: 5, defense: 5, mobility: 8, versatility: 5 },
    description: "Rushdown com Akamaru. Rápido mas previsível. Bom para iniciantes que gostam de agressão.",
    moves: [
      { id: "move_097", name: "Fang Over Fang", type: "special", video: "", description: "Ataque giratório com Akamaru. Multi-hit." },
      { id: "move_098", name: "Man Beast Clone", type: "buff", video: "", description: "Akamaru vira clone. Dobra ataques." },
      { id: "move_099", name: "Tunneling Fang", type: "special", video: "", description: "Rotação solo. Gap closer rápido." }
    ],
    matchups: {
      favorable_against: ["Shino Aburame", "Ino Yamanaka", "Tenten"],
      unfavorable_against: ["Neji Hyuuga", "Gaara", "Shikamaru Nara"]
    }
  },
  {
    id: "char_034",
    name: "Kiba Inuzuka Shippūden",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kiba-shippuden",
    attributes: { strength: 8, speed: 9, technique: 6, defense: 6, mobility: 9, versatility: 6 },
    description: "Kiba mais forte com técnicas aprimoradas. Akamaru maior e mais poderoso. Rushdown melhorado.",
    moves: [
      { id: "move_100", name: "Wolf Fang Over Fang", type: "special", video: "", description: "Versão mais forte do Fang Over Fang." },
      { id: "move_101", name: "Three-Headed Wolf", type: "transformation", video: "", description: "Forma combinada. Poder massivo." },
      { id: "move_102", name: "Tail Chasing Fang Fang Rotating Fang", type: "ultimate", video: "", description: "Combo devastador com Akamaru." }
    ],
    matchups: {
      favorable_against: ["Shino Aburame Shippūden", "Ino Yamanaka Shippūden", "Tenten Shippūden"],
      unfavorable_against: ["Neji Hyuuga Shippūden", "Gaara Shippūden", "Shikamaru Nara Shippūden"]
    }
  },
  {
    id: "char_035",
    name: "Hinata Hyuuga",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=hinata",
    attributes: { strength: 5, speed: 6, technique: 8, defense: 6, mobility: 6, versatility: 6 },
    description: "Gentle Fist tímido. Técnica boa mas menos agressiva que Neji. Defensiva com contra-ataques.",
    moves: [
      { id: "move_103", name: "Gentle Fist", type: "combo", video: "", description: "Série de golpes em tenketsu. Drena chakra." },
      { id: "move_104", name: "Protection of the Eight Trigrams", type: "defensive", video: "", description: "Versão defensiva da Rotation." },
      { id: "move_105", name: "Twin Lion Fists", type: "special", video: "", description: "Chakra em forma de leões. Alto dano." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Tenten", "Konohamaru"],
      unfavorable_against: ["Neji Hyuuga", "Sasuke Uchiha", "Rock Lee"]
    }
  },
  {
    id: "char_036",
    name: "Hinata Hyuuga Shippūden",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=hinata-shippuden",
    attributes: { strength: 6, speed: 7, technique: 9, defense: 7, mobility: 7, versatility: 7 },
    description: "Hinata mais confiante. Gentle Fist aprimorado com Twin Lions. Mais viável competitivamente.",
    moves: [
      { id: "move_106", name: "Eight Trigrams Sixty-Four Palms", type: "special", video: "", description: "64 Palms aprendida. Alto dano." },
      { id: "move_107", name: "Gentle Step Twin Lion Fists", type: "ultimate", video: "", description: "Ultimate devastador. Requer setup." },
      { id: "move_108", name: "Byakugan", type: "buff", video: "", description: "Ativa visão 360°. Melhora defense." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka Shippūden", "Tenten Shippūden", "Kankurou Shippūden"],
      unfavorable_against: ["Neji Hyuuga Shippūden", "Sasuke Shippūden", "Rock Lee Shippūden"]
    }
  },
  {
    id: "char_037",
    name: "Kurenai Yuuhi",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kurenai",
    attributes: { strength: 5, speed: 6, technique: 9, defense: 5, mobility: 6, versatility: 7 },
    description: "Especialista em genjutsu. Ilusões confundem e controlam. Técnica mas frágil.",
    moves: [
      { id: "move_109", name: "Demonic Illusion: Tree Binding Death", type: "command_grab", video: "", description: "Prende em árvore ilusória. Setup para combo." },
      { id: "move_110", name: "Genjutsu: Flower Petal Escape", type: "defensive", video: "", description: "Escapa em pétalas. Invulnerabilidade momentânea." },
      { id: "move_111", name: "Vine Bind", type: "setup", video: "", description: "Videiras que prendem. Zoning." }
    ],
    matchups: {
      favorable_against: ["Kiba Inuzuka", "Shino Aburame", "Hinata Hyuuga"],
      unfavorable_against: ["Itachi Uchiha", "Sasuke Uchiha", "Kakashi Hatake"]
    }
  },
  {
    id: "char_038",
    name: "Tenten",
    tier: "C",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=tenten",
    attributes: { strength: 6, speed: 6, technique: 7, defense: 5, mobility: 6, versatility: 6 },
    description: "Especialista em armas. Muitos projéteis mas dano baixo. Zoning fraco comparado a outros.",
    moves: [
      { id: "move_112", name: "Rising Twin Dragons", type: "ultimate", video: "", description: "Chuva de armas. Muitos hits." },
      { id: "move_113", name: "Weapon Scroll", type: "projectile", video: "", description: "Lança várias armas. Zoning básico." },
      { id: "move_114", name: "Ninja Tool Barrage", type: "special", video: "", description: "Série de armas arremessadas." }
    ],
    matchups: {
      favorable_against: ["Konohamaru", "Hanabi Hyuuga"],
      unfavorable_against: ["Gaara", "Temari", "Rock Lee"]
    }
  },
  {
    id: "char_039",
    name: "Tenten Shippūden",
    tier: "C+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=tenten-shippuden",
    attributes: { strength: 7, speed: 7, technique: 8, defense: 6, mobility: 6, versatility: 7 },
    description: "Tenten com mais arsenal. Armas melhoradas mas ainda tier baixo. Mais opções de zoning.",
    moves: [
      { id: "move_115", name: "Bashōsen", type: "special", video: "", description: "Leque lendário com elementos. Versátil." },
      { id: "move_116", name: "Tensasai", type: "ultimate", video: "", description: "Chuva de armas aprimorada. Mais dano." },
      { id: "move_117", name: "Chain Binding", type: "setup", video: "", description: "Correntes que prendem. Setup." }
    ],
    matchups: {
      favorable_against: ["Konohamaru", "Hanabi Hyuuga", "Ino Yamanaka"],
      unfavorable_against: ["Gaara Shippūden", "Temari Shippūden", "Rock Lee Shippūden"]
    }
  },
  {
    id: "char_040",
    name: "Kankurou",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kankurou",
    attributes: { strength: 6, speed: 5, technique: 8, defense: 6, mobility: 5, versatility: 8 },
    description: "Marionetista com Crow. Controle à distância único. Curva de aprendizado alta.",
    moves: [
      { id: "move_118", name: "Crow", type: "setup", video: "", description: "Controla marionete Crow. Ataques à distância." },
      { id: "move_119", name: "Black Secret Technique", type: "special", video: "", description: "Combo com marionete. Alto dano." },
      { id: "move_120", name: "Poison Smoke Bomb", type: "projectile", video: "", description: "Bomba venenosa. Controle de área." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Shino Aburame", "Tenten"],
      unfavorable_against: ["Sasori", "Rock Lee", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_041",
    name: "Kankurou Shippūden",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kankurou-shippuden",
    attributes: { strength: 7, speed: 6, technique: 9, defense: 7, mobility: 6, versatility: 9 },
    description: "Kankurou com múltiplas marionetes. Sasori's puppets adicionam versatilidade. Melhor controle.",
    moves: [
      { id: "move_121", name: "Scorpion", type: "setup", video: "", description: "Marionete Sasori. Ataques venenosos." },
      { id: "move_122", name: "Black Ant", type: "special", video: "", description: "Marionete de captura. Command grab." },
      { id: "move_123", name: "Salamander", type: "ultimate", video: "", description: "Marionete defensiva. Shield e counter." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka Shippūden", "Shino Aburame Shippūden", "Tenten Shippūden"],
      unfavorable_against: ["Sasori", "Rock Lee Shippūden", "Naruto Shippūden"]
    }
  },
  {
    id: "char_042",
    name: "Temari",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=temari",
    attributes: { strength: 6, speed: 6, technique: 8, defense: 6, mobility: 6, versatility: 7 },
    description: "Controladora de vento com leque gigante. Zoning de longo alcance. Anti-air forte.",
    moves: [
      { id: "move_124", name: "Wind Scythe Jutsu", type: "projectile", video: "", description: "Rajada de vento. Excelente zoning." },
      { id: "move_125", name: "Great Sickle Weasel Technique", type: "special", video: "", description: "Versão mais forte. Knockback." },
      { id: "move_126", name: "Summoning: Kamatari", type: "ultimate", video: "", description: "Invoca doninha de vento. Devastador." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Kiba Inuzuka", "Tenten"],
      unfavorable_against: ["Shikamaru Nara", "Gaara", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_043",
    name: "Temari Shippūden",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=temari-shippuden",
    attributes: { strength: 7, speed: 7, technique: 9, defense: 7, mobility: 7, versatility: 8 },
    description: "Temari mais poderosa. Ventos mais fortes e controle de área melhorado. Zoning top tier.",
    moves: [
      { id: "move_127", name: "Wind Release: Cast Net", type: "setup", video: "", description: "Rede de vento. Prende oponentes." },
      { id: "move_128", name: "Dust Wind Technique", type: "projectile", video: "", description: "Vento com areia. Mais dano." },
      { id: "move_129", name: "Great Task of the Dragon", type: "ultimate", video: "", description: "Tornado massivo. Controle de área." }
    ],
    matchups: {
      favorable_against: ["Rock Lee Shippūden", "Kiba Inuzuka Shippūden", "Tenten Shippūden"],
      unfavorable_against: ["Shikamaru Nara Shippūden", "Gaara Shippūden", "Naruto Shippūden"]
    }
  },

  // ============ TIER B / SAND CHARACTERS ============
  {
    id: "char_044",
    name: "Vovó Chiyo",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=chiyo",
    attributes: { strength: 5, speed: 5, technique: 9, defense: 6, mobility: 5, versatility: 8 },
    description: "Anciã marionetista lendária. Kit técnico com marionetes e antídotos. Requer paciência.",
    moves: [
      { id: "move_130", name: "White Secret Technique", type: "setup", video: "", description: "Marionetes para controle." },
      { id: "move_131", name: "Chikamatsu Collection", type: "special", video: "", description: "Múltiplas marionetes. Pressão." },
      { id: "move_132", name: "One's Own Life Reincarnation", type: "ultimate", video: "", description: "Revive aliado com chakra próprio." }
    ],
    matchups: {
      favorable_against: ["Sasori", "Kankurou", "Ino Yamanaka"],
      unfavorable_against: ["Rock Lee", "Naruto Shippūden", "Sasuke Shippūden"]
    }
  },
  {
    id: "char_045",
    name: "Vovó Chiyo Taijutsu",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=chiyo-taijutsu",
    attributes: { strength: 6, speed: 6, technique: 7, defense: 6, mobility: 6, versatility: 6 },
    description: "Chiyo focada em combate corpo-a-corpo. Menos marionetes, mais socos envenenados.",
    moves: [
      { id: "move_133", name: "Poison Fist", type: "special", video: "", description: "Socos envenenados. DOT." },
      { id: "move_134", name: "Antidote", type: "buff", video: "", description: "Remove debuffs. Sustain." },
      { id: "move_135", name: "Lion Closing Roar", type: "command_grab", video: "", description: "Grab seguido de veneno." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Shino Aburame", "Tenten"],
      unfavorable_against: ["Rock Lee", "Kiba Inuzuka", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_046",
    name: "Vovó Chiyo Mestre das Marionetes",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=chiyo-master",
    attributes: { strength: 5, speed: 5, technique: 10, defense: 7, mobility: 5, versatility: 10 },
    description: "Chiyo no auge do controle de marionetes. Arsenal completo com 10 marionetes.",
    moves: [
      { id: "move_136", name: "Ten Puppets of Chikamatsu", type: "ultimate", video: "", description: "10 marionetes lendárias. Devastador." },
      { id: "move_137", name: "Mother and Father", type: "special", video: "", description: "Marionetes parentais. Combos." },
      { id: "move_138", name: "Puppet Transfer", type: "setup", video: "", description: "Controla marionete inimiga temporariamente." }
    ],
    matchups: {
      favorable_against: ["Sasori", "Kankurou Shippūden", "Deidara"],
      unfavorable_against: ["Rock Lee Shippūden", "Naruto Shippūden", "Sasuke Shippūden"]
    }
  },

  // ============ AKATSUKI ============
  {
    id: "char_047",
    name: "Kisame Hoshigaki",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kisame",
    attributes: { strength: 9, speed: 6, technique: 7, defense: 8, mobility: 6, versatility: 7 },
    description: "O Monstro da Névoa. Samehada drena chakra e força bruta massiva. Tank agressivo.",
    moves: [
      { id: "move_139", name: "Samehada Slash", type: "special", video: "", description: "Corte que drena chakra. Sustain." },
      { id: "move_140", name: "Water Prison", type: "command_grab", video: "", description: "Prisão de água. Imobiliza." },
      { id: "move_141", name: "Great Shark Bullet", type: "ultimate", video: "", description: "Tubarão de água massivo. Alto dano." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Might Guy", "Asuma Sarutobi"],
      unfavorable_against: ["Itachi Uchiha", "Minato Namikaze", "Naruto Shippūden"]
    }
  },
  {
    id: "char_048",
    name: "Deidara",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=deidara",
    attributes: { strength: 7, speed: 7, technique: 9, defense: 5, mobility: 8, versatility: 8 },
    description: "Artista explosivo com argila. Zoning extremo e mobilidade aérea. Glass cannon técnico.",
    moves: [
      { id: "move_142", name: "C1", type: "projectile", video: "", description: "Explosivos básicos. Spam de zoning." },
      { id: "move_143", name: "C2 Dragon", type: "setup", video: "", description: "Dragão de argila. Plataforma e ataques." },
      { id: "move_144", name: "C4 Karura", type: "ultimate", video: "", description: "Nano-explosivos. Dano massivo em área." }
    ],
    matchups: {
      favorable_against: ["Gaara", "Kankurou", "Vovó Chiyo"],
      unfavorable_against: ["Sasuke Shippūden", "Itachi Uchiha", "Kakashi Hatake"]
    }
  },
  {
    id: "char_049",
    name: "Sasori",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sasori",
    attributes: { strength: 6, speed: 6, technique: 10, defense: 7, mobility: 5, versatility: 9 },
    description: "Marionetista supremo. 100 marionetes e corpo próprio de madeira. Controle de área extremo.",
    moves: [
      { id: "move_145", name: "Iron Sand", type: "special", video: "", description: "Areia de ferro magnética. Controle." },
      { id: "move_146", name: "Hundred Puppets", type: "ultimate", video: "", description: "100 marionetes. Pressão absurda." },
      { id: "move_147", name: "Core Transfer", type: "defensive", video: "", description: "Transfere núcleo. Sobrevive dano fatal." }
    ],
    matchups: {
      favorable_against: ["Kankurou", "Shino Aburame", "Ino Yamanaka"],
      unfavorable_against: ["Vovó Chiyo Mestre das Marionetes", "Sakura Haruno Shippūden", "Naruto Shippūden"]
    }
  },
  {
    id: "char_050",
    name: "Hiruko",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=hiruko",
    attributes: { strength: 7, speed: 4, technique: 8, defense: 9, mobility: 4, versatility: 6 },
    description: "Armadura marionete de Sasori. Tanky mas lento. Caudas venenosas para controle.",
    moves: [
      { id: "move_148", name: "Poison Tail", type: "special", video: "", description: "Cauda venenosa. Range e DOT." },
      { id: "move_149", name: "Hidden Weapon", type: "projectile", video: "", description: "Armas escondidas. Surpresa." },
      { id: "move_150", name: "Shell Defense", type: "defensive", video: "", description: "Carapaça protetora. Tanking." }
    ],
    matchups: {
      favorable_against: ["Tenten", "Ino Yamanaka", "Konohamaru"],
      unfavorable_against: ["Sakura Haruno Shippūden", "Rock Lee", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_051",
    name: "Terceiro Kazekage",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kazekage",
    attributes: { strength: 8, speed: 6, technique: 10, defense: 7, mobility: 6, versatility: 9 },
    description: "Marionete do Kazekage mais forte. Iron Sand devastador. Controle magnético supremo.",
    moves: [
      { id: "move_151", name: "Iron Sand World Method", type: "ultimate", video: "", description: "Espinhos de ferro em todas direções." },
      { id: "move_152", name: "Iron Sand Drizzle", type: "projectile", video: "", description: "Chuva de ferro. Zoning." },
      { id: "move_153", name: "Magnetic Control", type: "setup", video: "", description: "Controla armas metálicas inimigas." }
    ],
    matchups: {
      favorable_against: ["Tenten", "Kankurou", "Temari"],
      unfavorable_against: ["Gaara Shippūden", "Sakura Haruno Shippūden", "Naruto Shippūden"]
    }
  },

  // ============ KONOHA SUPPORT ============
  {
    id: "char_052",
    name: "Sai",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sai",
    attributes: { strength: 6, speed: 7, technique: 8, defense: 5, mobility: 8, versatility: 8 },
    description: "Artista ninja da ROOT. Desenhos ganham vida para ataques. Kit único de zoning.",
    moves: [
      { id: "move_154", name: "Super Beast Imitating Drawing", type: "setup", video: "", description: "Cria bestas de tinta. Pressão." },
      { id: "move_155", name: "Ink Bird", type: "special", video: "", description: "Pássaro para mobilidade aérea." },
      { id: "move_156", name: "Sealing Technique", type: "command_grab", video: "", description: "Sela oponente temporariamente." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Tenten", "Kankurou"],
      unfavorable_against: ["Sasuke Shippūden", "Naruto Shippūden", "Rock Lee"]
    }
  },
  {
    id: "char_053",
    name: "Yamato",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=yamato",
    attributes: { strength: 7, speed: 6, technique: 9, defense: 8, mobility: 6, versatility: 9 },
    description: "Wood Release artificial. Controle de área com madeira. Versátil e defensivo.",
    moves: [
      { id: "move_157", name: "Wood Release: Great Forest", type: "setup", video: "", description: "Floresta de madeira. Controle de área." },
      { id: "move_158", name: "Wood Clone", type: "special", video: "", description: "Clone durável. Bait e mixup." },
      { id: "move_159", name: "Wood Prison", type: "command_grab", video: "", description: "Prisão de madeira. Imobiliza." }
    ],
    matchups: {
      favorable_against: ["Naruto Uzumaki", "Sai", "Deidara"],
      unfavorable_against: ["Hashirama Senju", "Itachi Uchiha", "Sasuke Shippūden"]
    }
  },
  {
    id: "char_054",
    name: "Shizune",
    tier: "C+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=shizune",
    attributes: { strength: 4, speed: 6, technique: 8, defense: 5, mobility: 6, versatility: 7 },
    description: "Assistente médica com venenos. Suporte com debuffs. Fraca mas útil em matchups específicos.",
    moves: [
      { id: "move_160", name: "Poison Needle", type: "projectile", video: "", description: "Agulhas venenosas. DOT." },
      { id: "move_161", name: "Medical Ninjutsu", type: "buff", video: "", description: "Cura básica. Sustain." },
      { id: "move_162", name: "Ninja Art: Poison Fog", type: "setup", video: "", description: "Névoa venenosa. Área de dano." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Konohamaru", "Hanabi Hyuuga"],
      unfavorable_against: ["Tsunade", "Sakura Haruno Shippūden", "Rock Lee"]
    }
  },
  {
    id: "char_055",
    name: "Kabuto Yakushi",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kabuto",
    attributes: { strength: 6, speed: 7, technique: 9, defense: 6, mobility: 7, versatility: 9 },
    description: "Ninja médico traidor. Chakra Scalpel e regeneração. Kit técnico de counter-play.",
    moves: [
      { id: "move_163", name: "Chakra Scalpel", type: "special", video: "", description: "Corta tendões. Desabilita temporariamente." },
      { id: "move_164", name: "Dead Soul Technique", type: "setup", video: "", description: "Controla corpo morto. Distração." },
      { id: "move_165", name: "Healing Technique", type: "buff", video: "", description: "Regeneração. Sustain forte." }
    ],
    matchups: {
      favorable_against: ["Naruto Uzumaki", "Shino Aburame", "Kiba Inuzuka"],
      unfavorable_against: ["Tsunade", "Jiraiya", "Orochimaru"]
    }
  },

  // ============ SOUND FOUR ============
  {
    id: "char_056",
    name: "Jiroubou",
    tier: "C",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=jiroubou",
    attributes: { strength: 9, speed: 3, technique: 4, defense: 9, mobility: 3, versatility: 4 },
    description: "Tank do Sound Four. Força bruta mas muito lento. Curse Mark aumenta poder.",
    moves: [
      { id: "move_166", name: "Earth Dome Prison", type: "setup", video: "", description: "Domo que drena chakra." },
      { id: "move_167", name: "Rising Stone", type: "special", video: "", description: "Pilares de pedra. Anti-air." },
      { id: "move_168", name: "Curse Mark Level 2", type: "transformation", video: "", description: "Forma amaldiçoada. Boost massivo." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Tenten", "Konohamaru"],
      unfavorable_against: ["Chouji Akimichi", "Rock Lee", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_057",
    name: "Kidoumaru",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kidomaru",
    attributes: { strength: 6, speed: 6, technique: 8, defense: 5, mobility: 7, versatility: 8 },
    description: "Arqueiro aranha do Sound Four. Zoning com teias e flechas. Kit de controle.",
    moves: [
      { id: "move_169", name: "Spider Web", type: "setup", video: "", description: "Teias que prendem. Zoning." },
      { id: "move_170", name: "Spider War Bow", type: "projectile", video: "", description: "Flecha precisa. Alto dano." },
      { id: "move_171", name: "Curse Mark Level 2", type: "transformation", video: "", description: "Forma amaldiçoada. Mais braços." }
    ],
    matchups: {
      favorable_against: ["Tenten", "Ino Yamanaka", "Shino Aburame"],
      unfavorable_against: ["Neji Hyuuga", "Rock Lee", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_058",
    name: "Sakon e Ukon",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sakon",
    attributes: { strength: 7, speed: 7, technique: 7, defense: 6, mobility: 7, versatility: 7 },
    description: "Gêmeos fundidos. Ataques coordenados e fusão corporal. Kit único de pressão.",
    moves: [
      { id: "move_172", name: "Parasite Demon", type: "command_grab", video: "", description: "Funde com oponente. Dano gradual." },
      { id: "move_173", name: "Multiple Connected Fists", type: "combo", video: "", description: "Socos coordenados. Multi-hit." },
      { id: "move_174", name: "Curse Mark Level 2", type: "transformation", video: "", description: "Forma amaldiçoada. Separação." }
    ],
    matchups: {
      favorable_against: ["Shino Aburame", "Ino Yamanaka", "Hinata Hyuuga"],
      unfavorable_against: ["Kiba Inuzuka", "Rock Lee", "Naruto Uzumaki"]
    }
  },
  {
    id: "char_059",
    name: "Tayuya",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=tayuya",
    attributes: { strength: 5, speed: 6, technique: 9, defense: 5, mobility: 6, versatility: 8 },
    description: "Flautista do Sound Four. Genjutsu sonoro e invocações. Controle mental único.",
    moves: [
      { id: "move_175", name: "Demonic Flute", type: "setup", video: "", description: "Melodia que controla. Genjutsu." },
      { id: "move_176", name: "Doki Summoning", type: "special", video: "", description: "Invoca demônios. Pressão." },
      { id: "move_177", name: "Curse Mark Level 2", type: "transformation", video: "", description: "Forma amaldiçoada. Melodias mais fortes." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Shino Aburame", "Hinata Hyuuga"],
      unfavorable_against: ["Shikamaru Nara", "Rock Lee", "Temari"]
    }
  },
  {
    id: "char_060",
    name: "Kimimaro",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kimimaro",
    attributes: { strength: 8, speed: 8, technique: 8, defense: 7, mobility: 8, versatility: 7 },
    description: "Último do clã Kaguya. Manipulação óssea devastadora. Rushdown com defesa integrada.",
    moves: [
      { id: "move_178", name: "Digital Shrapnel", type: "projectile", video: "", description: "Ossos como projéteis. Zoning." },
      { id: "move_179", name: "Dance of the Camellia", type: "special", video: "", description: "Espada óssea. Combos elegantes." },
      { id: "move_180", name: "Bracken Dance", type: "ultimate", video: "", description: "Campo de ossos. Controle de área." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Naruto Uzumaki", "Gaara"],
      unfavorable_against: ["Gaara Shippūden", "Tsunade", "Itachi Uchiha"]
    }
  },

  // ============ OUTROS ============
  {
    id: "char_061",
    name: "Hanabi Hyuuga",
    tier: "C",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=hanabi",
    attributes: { strength: 5, speed: 7, technique: 7, defense: 5, mobility: 7, versatility: 5 },
    description: "Jovem Hyuuga. Gentle Fist básico mas promissor. Versão mais fraca de Hinata.",
    moves: [
      { id: "move_181", name: "Gentle Fist", type: "combo", video: "", description: "Combo básico em tenketsu." },
      { id: "move_182", name: "Byakugan", type: "buff", video: "", description: "Ativa visão. Melhora reação." },
      { id: "move_183", name: "Palm Strike", type: "special", video: "", description: "Golpe de palma. Knockback." }
    ],
    matchups: {
      favorable_against: ["Konohamaru", "Tenten"],
      unfavorable_against: ["Hinata Hyuuga", "Neji Hyuuga", "Rock Lee"]
    }
  },
  {
    id: "char_062",
    name: "Konohamaru",
    tier: "C",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=konohamaru",
    attributes: { strength: 4, speed: 6, technique: 5, defense: 4, mobility: 6, versatility: 5 },
    description: "Neto do Terceiro Hokage. Kit básico com Rasengan em desenvolvimento. Low tier mas divertido.",
    moves: [
      { id: "move_184", name: "Sexy Jutsu", type: "special", video: "", description: "Distração. Abre para ataque." },
      { id: "move_185", name: "Rasengan (Weak)", type: "special", video: "", description: "Rasengan fraco mas funcional." },
      { id: "move_186", name: "Shadow Clone", type: "setup", video: "", description: "Clones básicos. Mixup simples." }
    ],
    matchups: {
      favorable_against: [],
      unfavorable_against: ["Naruto Uzumaki", "Hanabi Hyuuga", "Rock Lee"]
    }
  },
  {
    id: "char_063",
    name: "Anko Mitarashi",
    tier: "B",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=anko",
    attributes: { strength: 6, speed: 7, technique: 8, defense: 5, mobility: 7, versatility: 7 },
    description: "Ex-aluna de Orochimaru. Invocação de cobras e jutsus proibidos. Kit agressivo com setups.",
    moves: [
      { id: "move_187", name: "Twin Snakes", type: "special", video: "", description: "Cobra dupla. Ataque surpresa." },
      { id: "move_188", name: "Hidden Shadow Snake", type: "command_grab", video: "", description: "Grab com cobra. Rápido." },
      { id: "move_189", name: "Cursed Seal Pain", type: "buff", video: "", description: "Ativa selo. Boost temporário." }
    ],
    matchups: {
      favorable_against: ["Ino Yamanaka", "Tenten", "Shino Aburame"],
      unfavorable_against: ["Orochimaru", "Jiraiya", "Itachi Uchiha"]
    }
  },
  {
    id: "char_064",
    name: "Haku",
    tier: "B+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=haku",
    attributes: { strength: 5, speed: 9, technique: 9, defense: 4, mobility: 9, versatility: 7 },
    description: "Kekkei Genkai do gelo. Crystal Ice Mirrors para mobilidade extrema. Glass cannon rápido.",
    moves: [
      { id: "move_190", name: "Crystal Ice Mirrors", type: "setup", video: "", description: "Espelhos para teleporte. Mobilidade." },
      { id: "move_191", name: "Thousand Needles of Death", type: "projectile", video: "", description: "Senbon de gelo. Multi-hit." },
      { id: "move_192", name: "Ice Prison", type: "command_grab", video: "", description: "Prisão de gelo. Imobiliza." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Kiba Inuzuka", "Tenten"],
      unfavorable_against: ["Sasuke Uchiha", "Naruto Uzumaki", "Kakashi Hatake"]
    }
  },
  {
    id: "char_065",
    name: "Zabuza Momochi",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=zabuza",
    attributes: { strength: 9, speed: 7, technique: 7, defense: 7, mobility: 6, versatility: 6 },
    description: "Demônio da Névoa Oculta. Kubikiribōchō devastadora e Silent Killing. Rushdown pesado.",
    moves: [
      { id: "move_193", name: "Silent Killing", type: "special", video: "", description: "Ataque na névoa. Invisível." },
      { id: "move_194", name: "Hidden Mist", type: "setup", video: "", description: "Cria névoa. Esconde movimentos." },
      { id: "move_195", name: "Water Dragon", type: "ultimate", video: "", description: "Dragão de água. Alto dano." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Tenten", "Konohamaru"],
      unfavorable_against: ["Kakashi Hatake", "Naruto Uzumaki", "Sasuke Uchiha"]
    }
  }
];

export const tierColors: Record<string, string> = {
  "S+": "bg-gradient-to-r from-ninja-kage via-yellow-500 to-ninja-kage text-white",
  "S": "bg-ninja-kage/20 text-ninja-kage border-ninja-kage",
  "A+": "bg-ninja-sannin/20 text-ninja-sannin border-ninja-sannin",
  "A": "bg-ninja-anbu/20 text-ninja-anbu border-ninja-anbu",
  "B+": "bg-ninja-jounin/20 text-ninja-jounin border-ninja-jounin",
  "B": "bg-ninja-chunin/20 text-ninja-chunin border-ninja-chunin",
  "C+": "bg-ninja-genin/20 text-ninja-genin border-ninja-genin",
  "C": "bg-muted/50 text-muted-foreground border-muted",
  "D": "bg-muted/30 text-muted-foreground/70 border-muted/50"
};
