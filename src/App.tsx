import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Battery,
  Check,
  Copy,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
  RotateCcw,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import {
  SITE_INFO,
  USED_IPHONES_BUYBACK,
  BATTERY_RULES,
  BATTERY_PRESETS,
  BODY_CONDITIONS,
  EXTRAS_OPTIONS,
  BLOCKED_REASON,
  getEsimDeduction,
  UsedGeneration,
  BodyOption
} from './data/prices';

// Formatting helpers
const formatTenge = (val: number) =>
  val.toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₸';

const formatStorage = (gb: number) =>
  gb >= 1024 ? `${gb / 1024} ТБ` : `${gb} ГБ`;

const NAV_LINKS = [
  { id: 'calc', label: 'Оценка iPhone' },
  { id: 'how', label: 'Как это работает' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contacts', label: 'Контакты' },
];

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bylance_theme');
      return saved ? saved === 'dark' : false;
    }
    return false;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('bylance_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('bylance_theme', 'light');
    }
  }, [isDark]);

  // Smooth scroll handler with sticky header offset
  const scrollToSection = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 76;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      try {
        window.history.pushState(null, '', `#${id}`);
      } catch {
        // ignore in iframe
      }
    }
  }, []);

  // Calculator State (Used iPhones)
  const [selectedGen, setSelectedGen] = useState<UsedGeneration>(USED_IPHONES_BUYBACK[1]); // iPhone 17
  const [selectedModel, setSelectedModel] = useState<UsedGeneration['models'][0]>(
    USED_IPHONES_BUYBACK[1].models[0]
  );
  const [selectedStorage, setSelectedStorage] = useState<number>(128);
  const [batteryPct, setBatteryPct] = useState<number>(90);
  const [selectedBody, setSelectedBody] = useState<BodyOption>(BODY_CONDITIONS[0]); // Идеальное
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const logoSrc = `${baseUrl.replace(/\/$/, '')}/logo.svg`;

  // Calculator model selection
  const handleSelectGen = useCallback((gen: UsedGeneration) => {
    setSelectedGen(gen);
    const firstModel = gen.models[0];
    setSelectedModel(firstModel);
    if (firstModel) {
      const storages = Object.keys(firstModel.prices).map(Number);
      setSelectedStorage(storages[0]);
    }
  }, []);

  const handleSelectModel = useCallback((model: UsedGeneration['models'][0]) => {
    setSelectedModel(model);
    const storages = Object.keys(model.prices).map(Number);
    if (!model.prices[selectedStorage]) {
      setSelectedStorage(storages[0]);
    }
  }, [selectedStorage]);

  const toggleExtra = useCallback((id: string) => {
    setSelectedExtras((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === 'replaced_screen_orig' && next[id]) {
        next.replaced_screen = false;
      } else if (id === 'replaced_screen' && next[id]) {
        next.replaced_screen_orig = false;
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    const defaultGen = USED_IPHONES_BUYBACK[1];
    setSelectedGen(defaultGen);
    setSelectedModel(defaultGen.models[0]);
    setSelectedStorage(128);
    setBatteryPct(90);
    setSelectedBody(BODY_CONDITIONS[0]);
    setSelectedExtras({});
    setIsBlocked(false);
  }, []);

  // Calculation Logic
  const calculation = useMemo(() => {
    if (isBlocked) {
      return {
        price: 0,
        canBuy: false,
        reason: 'Телефоны с блокировкой iCloud или чужим Apple ID мы не покупаем.',
        activeExtrasLabels: [],
      };
    }

    const basePrice = selectedModel.prices[selectedStorage] || 0;

    let batteryCut = 0;
    for (const rule of BATTERY_RULES) {
      if (batteryPct >= rule.min) {
        batteryCut = rule.cut;
        break;
      }
    }

    const bodyCut = selectedBody.cut;

    let extrasCut = 0;
    let fixedExtraCut = 0;
    const activeExtrasLabels: string[] = [];
    EXTRAS_OPTIONS.forEach((extra) => {
      if (selectedExtras[extra.id]) {
        if (extra.isEsimOnly) {
          const esimCut = getEsimDeduction(selectedModel.name);
          fixedExtraCut += esimCut;
          activeExtrasLabels.push(`только eSIM (-${formatTenge(esimCut)})`);
        } else {
          extrasCut += extra.cut;
          activeExtrasLabels.push(extra.label.toLowerCase());
        }
      }
    });

    const totalCut = Math.min(batteryCut + bodyCut + extrasCut, 90);
    const priceAfterPct = Math.max(0, basePrice * (1 - totalCut / 100));
    const price = Math.max(
      0,
      Math.round((priceAfterPct - fixedExtraCut) / SITE_INFO.roundTo) * SITE_INFO.roundTo
    );

    return {
      price,
      canBuy: true,
      activeExtrasLabels,
    };
  }, [selectedModel, selectedStorage, batteryPct, selectedBody, selectedExtras, isBlocked]);

  // WhatsApp prefilled URL for Used Phone
  const waUrlSell = useMemo(() => {
    if (!calculation.canBuy) {
      return `https://wa.me/${SITE_INFO.whatsapp}`;
    }

    const msg = [
      `Здравствуйте! Хочу продать iPhone в ${SITE_INFO.shopName}.`,
      `• Модель: ${selectedModel.name} (${formatStorage(selectedStorage)})`,
      `• Аккумулятор: ${batteryPct}%`,
      `• Корпус: ${selectedBody.label} (${selectedBody.hint})`,
      calculation.activeExtrasLabels.length > 0
        ? `• Особенности: ${calculation.activeExtrasLabels.join(', ')}`
        : null,
      `• Оценка на сайте: ${formatTenge(calculation.price)}`,
      `\nКогда можно приехать на проверку?`,
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/${SITE_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;
  }, [calculation, selectedModel, selectedStorage, batteryPct, selectedBody]);

  const copySummary = useCallback(() => {
    const summary = `${selectedModel.name} ${formatStorage(selectedStorage)}, АКБ ${batteryPct}%, ${selectedBody.label}. Расчет: ${formatTenge(calculation.price)}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedModel, selectedStorage, batteryPct, selectedBody, calculation.price]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8f9fb] dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3 focus-visible:outline-none">
            <img
              src={logoSrc}
              alt={SITE_INFO.shopName}
              className="h-10 sm:h-11 w-auto object-contain rounded-lg shadow-sm"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </a>

          <nav className="hidden md:flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {NAV_LINKS.map((link, idx) => (
              <React.Fragment key={link.id}>
                {idx > 0 && <span className="text-slate-300 dark:text-slate-700 select-none">·</span>}
                <a
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className="hover:text-[#5B0601] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Сменить тему"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#5B0601]" />}
            </button>

            <a
              href={`https://wa.me/${SITE_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Меню навигации"
              className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/10"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-md px-4 py-3 space-y-1 shadow-lg transition-all">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="block px-3 py-2.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#181d2a] hover:text-[#5B0601] dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">

        {/* 2. HERO SECTION */}
        <section className="text-center py-6 sm:py-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Узнайте, за сколько мы купим ваш iPhone
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Нажмите на модель, память и состояние. Цена выкупа появится сразу, а заявку можно отправить в WhatsApp.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#calc"
              onClick={(e) => scrollToSection(e, 'calc')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-[#5B0601] hover:bg-[#780c05] transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              Рассчитать стоимость онлайн
            </a>
          </div>
        </section>

        {/* 3. MESSENGERS & CHANNELS BAR */}
        <section className="bg-white dark:bg-[#121622] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Прямая связь и каталог Б/У телефонов
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Быстрый ответ в WhatsApp по выкупу или каталог поступивших Б/У iPhone в Telegram.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={`https://wa.me/${SITE_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://t.me/${SITE_INFO.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#229ED9] hover:bg-[#1e8ec3] transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Каталог Б/У в Telegram ↗</span>
            </a>

            <a
              href={SITE_INFO.gis}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#181d2a] dark:hover:bg-[#202738] transition-all border border-slate-200 dark:border-white/10"
            >
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>2ГИС Алматы</span>
            </a>
          </div>
        </section>

        {/* 4. ОЦЕНКА Б/У IPHONE (КАЛЬКУЛЯТОР) */}
        <section id="calc" className="space-y-6 pt-2 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 bg-white dark:bg-[#121622] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Оценка iPhone
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Выберите поколение, память и состояние — расчёт появится мгновенно.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white self-start sm:self-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181d2a] hover:bg-slate-100 dark:hover:bg-[#202738] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить параметры</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-5">
              {/* STEP 1: GENERATION */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#5B0601] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Поколение iPhone
                  </h3>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
                  {USED_IPHONES_BUYBACK.map((g) => {
                    const isSelected = selectedGen.gen === g.gen;
                    return (
                      <button
                        key={g.gen}
                        type="button"
                        onClick={() => handleSelectGen(g)}
                        className={`py-3 px-2 rounded-xl text-center font-bold text-sm transition-all border ${
                          isSelected
                            ? 'bg-[#5B0601] text-white border-[#5B0601] shadow-md dark:bg-white dark:text-slate-900 dark:border-white'
                            : 'bg-slate-50 dark:bg-[#181d2a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#202738] hover:border-slate-300 dark:hover:border-white/20 dark:hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] block opacity-60 font-medium">iPhone</span>
                        <span className="text-base font-extrabold">{g.gen}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: MODEL */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#5B0601] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Версия модели
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {selectedGen.models.map((m) => {
                    const isSelected = selectedModel.name === m.name;
                    return (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => handleSelectModel(m)}
                        className={`py-3 px-3 rounded-xl text-center font-bold text-sm transition-all border ${
                          isSelected
                            ? 'bg-[#5B0601] text-white border-[#5B0601] shadow-md dark:bg-white dark:text-slate-900 dark:border-white'
                            : 'bg-slate-50 dark:bg-[#181d2a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#202738] hover:border-slate-300 dark:hover:border-white/20 dark:hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: STORAGE */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#5B0601] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Объём памяти
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.keys(selectedModel.prices).map((s) => {
                    const storageNum = Number(s);
                    const isSelected = selectedStorage === storageNum;
                    return (
                      <button
                        key={storageNum}
                        type="button"
                        onClick={() => setSelectedStorage(storageNum)}
                        className={`py-3 px-3 rounded-xl text-center font-bold text-sm transition-all border ${
                          isSelected
                            ? 'bg-[#5B0601] text-white border-[#5B0601] shadow-md dark:bg-white dark:text-slate-900 dark:border-white'
                            : 'bg-slate-50 dark:bg-[#181d2a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#202738] hover:border-slate-300 dark:hover:border-white/20 dark:hover:text-white'
                        }`}
                      >
                        {formatStorage(storageNum)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: BATTERY (REVERSED PRESETS: 75% -> 100%) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5B0601] text-white text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Ёмкость аккумулятора (АКБ)
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#181d2a] px-3 py-1 rounded-full">
                    <Battery className="w-4 h-4 text-emerald-500" />
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {batteryPct}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-6">
                  Настройки → Аккумулятор → Состояние аккумулятора
                </p>

                <div className="space-y-3">
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={batteryPct}
                    onChange={(e) => setBatteryPct(Number(e.target.value))}
                    className="slider-battery"
                    aria-label="Ёмкость аккумулятора"
                  />

                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>50%</span>
                    <span>75%</span>
                    <span>85%</span>
                    <span>100%</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Быстрый выбор:</span>
                    {BATTERY_PRESETS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setBatteryPct(pct)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                          batteryPct === pct
                            ? 'bg-[#5B0601] text-white border-[#5B0601] shadow-sm dark:bg-white dark:text-slate-900 dark:border-white'
                            : 'bg-slate-50 dark:bg-[#181d2a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#202738] dark:hover:text-white'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 5: BODY (4 OPTIONS ONLY) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5B0601] text-white text-xs font-bold flex items-center justify-center">
                      5
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Состояние корпуса
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">4 градации</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BODY_CONDITIONS.map((b) => {
                    const isSelected = selectedBody.id === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBody(b)}
                        className={`p-3.5 rounded-xl flex flex-col items-center text-center transition-all border ${
                          isSelected
                            ? 'bg-[#5B0601] text-white border-[#5B0601] shadow-md dark:bg-white dark:text-slate-900 dark:border-white'
                            : 'bg-slate-50 dark:bg-[#181d2a] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#202738] hover:border-slate-300 dark:hover:border-white/20 dark:hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full mb-2 border border-black/20 dark:border-white/20"
                          style={{ backgroundColor: b.color }}
                        />
                        <span className="font-bold text-sm mb-1">{b.label}</span>
                        <span className={`text-[11px] leading-tight ${isSelected ? 'text-amber-100 dark:text-slate-600' : 'text-slate-400'}`}>
                          {b.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 6: EXTRAS */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#5B0601] text-white text-xs font-bold flex items-center justify-center">
                    6
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Дополнительные параметры
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {EXTRAS_OPTIONS.map((extra) => {
                    const isChecked = !!selectedExtras[extra.id];
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra.id)}
                        className={`p-3 rounded-xl text-left flex items-center gap-3 transition-all border text-xs sm:text-sm font-semibold ${
                          isChecked
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/60'
                            : 'bg-slate-50 dark:bg-[#181d2a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#202738] dark:hover:text-white'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 ${
                            isChecked ? 'bg-amber-600 text-white' : 'border border-slate-300 dark:border-white/20'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="flex-1">{extra.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsBlocked(!isBlocked)}
                  className={`w-full p-3.5 rounded-xl text-left flex items-center gap-3 transition-all border text-xs sm:text-sm font-semibold ${
                    isBlocked
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700'
                      : 'bg-slate-50 dark:bg-[#181d2a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#202738] dark:hover:text-white'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 ${
                      isBlocked ? 'bg-rose-600 text-white' : 'border border-slate-300 dark:border-white/20'
                    }`}
                  >
                    {isBlocked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <span>{BLOCKED_REASON}</span>
                    {isBlocked && (
                      <p className="text-xs text-rose-600 dark:text-rose-300 mt-1 font-normal">
                        Внимание: устройства с чужим Apple ID или блокировкой активации не выкупаются.
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* STICKY RESULT CARD */}
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <div className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#121826] text-slate-900 dark:text-white shadow-xl border border-slate-200/90 dark:border-white/10 relative overflow-hidden transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#5B0601] dark:text-amber-400 uppercase tracking-wider">
                    Предварительный расчет
                  </span>
                  <button
                    onClick={copySummary}
                    disabled={!calculation.canBuy}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-40"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>

                <div className="mb-4">
                  {calculation.canBuy ? (
                    <div>
                      <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#5B0601] dark:text-emerald-400 font-mono">
                        {formatTenge(calculation.price)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Окончательная сумма после 5-минутного осмотра в офисе
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                        Выкуп невозможен
                      </div>
                      <p className="text-xs text-rose-500 dark:text-rose-300 mt-1">
                        {calculation.reason}
                      </p>
                    </div>
                  )}
                </div>

                {calculation.canBuy && (
                  <div className="py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-[#182033] border border-slate-200/70 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 space-y-1.5 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Модель:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedModel.name} · {formatStorage(selectedStorage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">АКБ:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{batteryPct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Корпус:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedBody.label}</span>
                    </div>
                    {calculation.activeExtrasLabels.length > 0 && (
                      <div className="flex items-start justify-between pt-1 border-t border-slate-200/60 dark:border-white/10">
                        <span className="text-slate-500 dark:text-slate-400">Нюансы:</span>
                        <span className="font-medium text-[#5B0601] dark:text-amber-300 text-right max-w-[65%]">
                          {calculation.activeExtrasLabels.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <a
                  href={waUrlSell}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                    calculation.canBuy
                      ? 'bg-[#25D366] hover:bg-[#20ba59] text-white active:scale-[0.99]'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 pointer-events-none opacity-60'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Отправить оценку в WhatsApp</span>
                </a>

                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/10 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Деньги сразу: наличные или на Kaspi Gold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Диагностика за 5–10 минут при вас</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Быстрый выкуп с моментальной оплатой</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section id="how" className="py-10 bg-white dark:bg-[#121622] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-sm scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-8">
            Как это работает
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181d2a] border border-slate-200/70 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-[#5B0601] text-white flex items-center justify-center font-black text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Оцените онлайн
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ответьте на несколько вопросов о телефоне. Это занимает минуту.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181d2a] border border-slate-200/70 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-[#5B0601] text-white flex items-center justify-center font-black text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Отправьте заявку
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Готовое сообщение с вашей оценкой откроется в WhatsApp.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181d2a] border border-slate-200/70 dark:border-white/5">
              <div className="w-9 h-9 rounded-xl bg-[#5B0601] text-white flex items-center justify-center font-black text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Приезжайте с телефоном
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Проверим устройство, подтвердим цену и сразу заплатим наличными или на Kaspi.
              </p>
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="space-y-4 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center">
            Частые вопросы
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'Когда я получу деньги?',
                a: 'Сразу после 5-минутного осмотра и подтверждения цены, наличными или переводом на Kaspi Gold.',
              },
              {
                q: 'Что нужно взять с собой?',
                a: 'Телефон, удостоверение личности и, если есть, коробку с зарядкой. Перед визитом выйдите из iCloud и сбросьте данные.',
              },
              {
                q: 'Почему итоговая цена может отличаться?',
                a: 'Оценка на сайте основана на ваших ответах. Если состояние телефона отличается от описания, мы объясним, что изменилось.',
              },
              {
                q: 'Покупаете телефоны с заблокированным iCloud?',
                a: 'Нет. Телефон должен быть отвязан от Apple ID.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="group bg-white dark:bg-[#121622] rounded-xl border border-slate-200/80 dark:border-white/10 p-4 transition-all [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white cursor-pointer select-none text-sm sm:text-base">
                  <span>{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/10 pt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 7. CONTACTS & LOCATION */}
        <section id="contacts" className="py-4 scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-[#5B0601] dark:text-amber-400 uppercase tracking-wider">
                Контакты
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4">
                Как нас найти
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#181d2a] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#5B0601] dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {SITE_INFO.address}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Центр города, удобная парковка
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#181d2a] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-[#5B0601] dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      График: {SITE_INFO.hours}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Работаем ежедневно без выходных
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={SITE_INFO.gis}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-[#121622] hover:bg-slate-50 dark:hover:bg-[#181d2a] transition-colors border border-slate-200 dark:border-white/10"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Открыть в 2ГИС</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                <a
                  href={`https://wa.me/${SITE_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20ba59] transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Написать в WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Map Card */}
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121622] flex flex-col items-center justify-center p-6 text-center shadow-sm relative">
              <MapPin className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2 opacity-90" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
                г. Алматы · {SITE_INFO.shopName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                Постройте удобный автомобильный или пеший маршрут прямо в приложении 2ГИС
              </p>
              <a
                href={SITE_INFO.gis}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 dark:hover:text-slate-900 font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Построить маршрут</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-[#07090e] border-t border-slate-200/80 dark:border-white/10 py-8 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt={SITE_INFO.shopName} className="h-6 w-auto rounded" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {SITE_INFO.shopName} · Онлайн-оценка и выкуп iPhone в Алматы
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} {SITE_INFO.shopName}. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
