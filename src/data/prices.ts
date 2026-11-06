/**
 * ============================================================================
 * 📱 BYLANCE — ЕДИНЫЙ ФАЙЛ НАСТРОЕК И ЦЕН
 * ============================================================================
 * Все цены на новые и Б/У телефоны, точные цвета по спецификации и контакты.
 */

// 1. ОСНОВНЫЕ ДАННЫЕ МАГАЗИНА
export const SITE_INFO = {
  shopName: "Bylance",
  city: "Алматы",
  logoPath: "/logo.svg",
  whatsapp: "77765293916",
  whatsappFormatted: "+7 (776) 529-39-16",
  telegram: "bylance",
  gis: "https://2gis.kz/almaty",
  address: "г. Алматы, пр. Абылай хана (точный адрес уточняйте в WhatsApp)",
  hours: "Ежедневно 10:00–20:00",
  roundTo: 1000,
};

// ============================================================================
// 2. ⭐️ НОВЫЕ IPHONE — ТОЧНЫЕ ЦВЕТА И ХАРАКТЕРИСТИКИ ОТ ПОЛЬЗОВАТЕЛЯ
// ============================================================================
export interface ColorOption {
  name: string;
  hex: string;
}

export interface NewIphoneItem {
  id: string;
  name: string;
  series: "18" | "17";
  badge?: string;
  colors: ColorOption[];
  warranty: string;
  prices: Record<number, number>; // Память в ГБ : цена в ₸
}

export const NEW_IPHONES_LIST: NewIphoneItem[] = [
  // --- ЛИНЕЙКА IPHONE 18 (ТОЛЬКО 18 PRO И 18 PRO MAX) ---
  {
    id: "ip18pm",
    name: "iPhone 18 Pro Max",
    series: "18",
    badge: "Флагман",
    warranty: "1 год официальной гарантии",
    colors: [
      { name: "Burgundy", hex: "#4D1821" },
      { name: "Glacier", hex: "#E8F2FF" },
      { name: "Black", hex: "#3C3C3C" },
      { name: "Silver", hex: "#E2E2E2" },
    ],
    prices: {
      256: 780000,
      512: 890000,
      1024: 990000,
    },
  },
  {
    id: "ip18p",
    name: "iPhone 18 Pro",
    series: "18",
    badge: "Pro серия",
    warranty: "1 год официальной гарантии",
    colors: [
      { name: "Burgundy", hex: "#4D1821" },
      { name: "Glacier", hex: "#E8F2FF" },
      { name: "Black", hex: "#3C3C3C" },
      { name: "Silver", hex: "#E2E2E2" },
    ],
    prices: {
      256: 690000,
      512: 790000,
      1024: 890000,
    },
  },

  // --- ЛИНЕЙКА IPHONE 17 ---
  {
    id: "ip17pm",
    name: "iPhone 17 Pro Max",
    series: "17",
    badge: "Хит продаж",
    warranty: "1 год официальной гарантии",
    colors: [
      { name: "Cosmic Orange", hex: "#F07832" },
      { name: "Silver", hex: "#BFC0C0" },
      { name: "Deep Blue", hex: "#263B58" },
    ],
    prices: {
      256: 650000,
      512: 750000,
      1024: 850000,
    },
  },
  {
    id: "ip17p",
    name: "iPhone 17 Pro",
    series: "17",
    badge: "Pro серия",
    warranty: "1 год официальной гарантии",
    colors: [
      { name: "Cosmic Orange", hex: "#F07832" },
      { name: "Silver", hex: "#BFC0C0" },
      { name: "Deep Blue", hex: "#263B58" },
    ],
    prices: {
      256: 580000,
      512: 670000,
      1024: 760000,
    },
  },
  {
    id: "ip17air",
    name: "iPhone Air (17)",
    series: "17",
    badge: "Тонкий корпус",
    warranty: "1 год официальной гарантии",
    colors: [
      { name: "Sky Blue", hex: "#A9CFE9" },
      { name: "Light Gold", hex: "#DCC6A2" },
      { name: "Cloud White", hex: "#F1F1EC" },
      { name: "Space Black", hex: "#292929" },
    ],
    prices: {
      256: 470000,
      512: 550000,
      1024: 630000,
    },
  },
  {
    id: "ip17",
    name: "iPhone 17",
    series: "17",
    badge: "Оптимальный",
    warranty: "1 год официальной гарантии",
    colors: [
      { name: "Black", hex: "#252525" },
      { name: "White", hex: "#F5F5F0" },
      { name: "Sage", hex: "#A5B99B" },
      { name: "Mist Blue", hex: "#A5C8DE" },
      { name: "Lavender", hex: "#B9A5D5" },
    ],
    prices: {
      128: 410000,
      256: 460000,
      512: 540000,
    },
  },
];

// ============================================================================
// 3. ⭐️ ЦЕНЫ НА СКУПКУ / ВЫКУП Б/У IPHONE (В ИДЕАЛЬНОМ СОСТОЯНИИ В ₸)
// ============================================================================
export interface UsedGeneration {
  gen: string;
  models: {
    label: string;
    name: string;
    prices: Record<number, number>;
  }[];
}

export const USED_IPHONES_BUYBACK: UsedGeneration[] = [
  {
    gen: "18",
    models: [
      { label: "Обычный", name: "iPhone 18", prices: { 128: 360000, 256: 410000, 512: 480000 } },
      { label: "Air", name: "iPhone Air", prices: { 256: 410000, 512: 490000, 1024: 560000 } },
      { label: "Pro", name: "iPhone 18 Pro", prices: { 256: 520000, 512: 600000, 1024: 680000 } },
      { label: "Pro Max", name: "iPhone 18 Pro Max", prices: { 256: 600000, 512: 690000, 1024: 780000 } },
    ],
  },
  {
    gen: "17",
    models: [
      { label: "Обычный", name: "iPhone 17", prices: { 128: 280000, 256: 330000, 512: 400000 } },
      { label: "Air", name: "iPhone Air", prices: { 256: 330000, 512: 390000, 1024: 450000 } },
      { label: "Pro", name: "iPhone 17 Pro", prices: { 256: 450000, 512: 520000, 1024: 600000 } },
      { label: "Pro Max", name: "iPhone 17 Pro Max", prices: { 256: 520000, 512: 600000, 1024: 680000 } },
    ],
  },
  {
    gen: "16",
    models: [
      { label: "16e", name: "iPhone 16e", prices: { 128: 170000, 256: 200000, 512: 240000 } },
      { label: "Обычный", name: "iPhone 16", prices: { 128: 190000, 256: 225000, 512: 270000 } },
      { label: "Plus", name: "iPhone 16 Plus", prices: { 128: 210000, 256: 250000, 512: 300000 } },
      { label: "Pro", name: "iPhone 16 Pro", prices: { 128: 290000, 256: 330000, 512: 390000, 1024: 450000 } },
      { label: "Pro Max", name: "iPhone 16 Pro Max", prices: { 256: 400000, 512: 460000, 1024: 520000 } },
    ],
  },
  {
    gen: "15",
    models: [
      { label: "Обычный", name: "iPhone 15", prices: { 128: 155000, 256: 185000, 512: 225000 } },
      { label: "Plus", name: "iPhone 15 Plus", prices: { 128: 175000, 256: 205000, 512: 245000 } },
      { label: "Pro", name: "iPhone 15 Pro", prices: { 128: 230000, 256: 265000, 512: 310000, 1024: 360000 } },
      { label: "Pro Max", name: "iPhone 15 Pro Max", prices: { 256: 330000, 512: 380000, 1024: 430000 } },
    ],
  },
  {
    gen: "14",
    models: [
      { label: "Обычный", name: "iPhone 14", prices: { 128: 115000, 256: 135000, 512: 165000 } },
      { label: "Plus", name: "iPhone 14 Plus", prices: { 128: 130000, 256: 150000, 512: 180000 } },
      { label: "Pro", name: "iPhone 14 Pro", prices: { 128: 190000, 256: 215000, 512: 250000, 1024: 285000 } },
      { label: "Pro Max", name: "iPhone 14 Pro Max", prices: { 128: 230000, 256: 255000, 512: 295000, 1024: 335000 } },
    ],
  },
  {
    gen: "13",
    models: [
      { label: "mini", name: "iPhone 13 mini", prices: { 128: 85000, 256: 100000, 512: 120000 } },
      { label: "Обычный", name: "iPhone 13", prices: { 128: 100000, 256: 118000, 512: 140000 } },
      { label: "Pro", name: "iPhone 13 Pro", prices: { 128: 145000, 256: 165000, 512: 190000, 1024: 215000 } },
      { label: "Pro Max", name: "iPhone 13 Pro Max", prices: { 128: 175000, 256: 195000, 512: 225000, 1024: 255000 } },
    ],
  },
  {
    gen: "12",
    models: [
      { label: "mini", name: "iPhone 12 mini", prices: { 64: 55000, 128: 65000, 256: 75000 } },
      { label: "Обычный", name: "iPhone 12", prices: { 64: 70000, 128: 80000, 256: 92000 } },
      { label: "Pro", name: "iPhone 12 Pro", prices: { 128: 105000, 256: 118000, 512: 138000 } },
      { label: "Pro Max", name: "iPhone 12 Pro Max", prices: { 128: 125000, 256: 140000, 512: 160000 } },
    ],
  },
  {
    gen: "11",
    models: [
      { label: "Обычный", name: "iPhone 11", prices: { 64: 55000, 128: 62000, 256: 72000 } },
      { label: "Pro", name: "iPhone 11 Pro", prices: { 64: 75000, 256: 90000, 512: 105000 } },
      { label: "Pro Max", name: "iPhone 11 Pro Max", prices: { 64: 90000, 256: 105000, 512: 120000 } },
    ],
  },
  {
    gen: "X",
    models: [
      { label: "X", name: "iPhone X", prices: { 64: 45000, 256: 55000 } },
      { label: "XR", name: "iPhone XR", prices: { 64: 55000, 128: 62000, 256: 70000 } },
      { label: "XS", name: "iPhone XS", prices: { 64: 55000, 256: 65000, 512: 75000 } },
      { label: "XS Max", name: "iPhone XS Max", prices: { 64: 65000, 256: 75000, 512: 85000 } },
    ],
  },
];

// ============================================================================
// 4. ПРАВИЛА РАСЧЕТА СКИДОК И ВЫЧЕТОВ
// ============================================================================

export const BATTERY_RULES = [
  { min: 90, cut: 0 },
  { min: 85, cut: 3 },
  { min: 80, cut: 7 },
  { min: 75, cut: 12 },
  { min: 0, cut: 18 },
];

// Быстрый выбор: в порядке возрастания (75% -> 100%)
export const BATTERY_PRESETS = [75, 80, 85, 90, 100];

// Состояние корпуса: ровно 4 градации
export interface BodyOption {
  id: string;
  label: string;
  hint: string;
  color: string;
  cut: number;
}

export const BODY_CONDITIONS: BodyOption[] = [
  {
    id: "perfect",
    label: "Идеальное",
    hint: "Как новый, без следов",
    color: "#38bdf8", // refined cyan/sky
    cut: 0,
  },
  {
    id: "good",
    label: "Хорошее",
    hint: "Еле заметные потёртости",
    color: "#34d399", // emerald
    cut: 5,
  },
  {
    id: "average",
    label: "Среднее",
    hint: "Мелкие царапины",
    color: "#fbbf24", // amber
    cut: 12,
  },
  {
    id: "poor",
    label: "Плохое",
    hint: "Заметные царапины, вмятины",
    color: "#f87171", // rose
    cut: 22,
  },
];

export interface ExtraDefect {
  id: string;
  label: string;
  cut: number;
  isEsimOnly?: boolean;
}

// Вычет за версию "Только eSIM" (США): 40 000 ₸ для Pro/Pro Max, 30 000 ₸ для остальных
export const getEsimDeduction = (modelName: string): number => {
  if (modelName.toLowerCase().includes('pro')) {
    return 40000;
  }
  return 30000;
};

export const EXTRAS_OPTIONS: ExtraDefect[] = [
  { id: "esim_only", label: "Только eSIM (США)", cut: 0, isEsimOnly: true },
  { id: "no_box", label: "Нет коробки и зарядки", cut: 3 },
  { id: "broken_biometrics", label: "Не работает Face ID / Touch ID", cut: 15 },
  { id: "replaced_glass", label: "Менялось заднее стекло", cut: 5 },
  { id: "replaced_screen_orig", label: "Менялся экран (оригинал)", cut: 5 },
  { id: "replaced_screen", label: "Менялся экран (неоригинал)", cut: 10 },
];

export const BLOCKED_REASON = "Заблокирован iCloud / чужой Apple ID";
