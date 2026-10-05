import { ChangeEvent, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ImagePlus, Languages, Menu, Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'kodo_landing_images';

type Locale = 'fr' | 'en';

type ImageSlots = Record<string, string>;

type LandingCopy = {
  badge: string;
  headline: string;
  text: string;
  primaryCta: string;
  secondaryCta: string;
  stats: { value: string; label: string }[];
  featuresTitle: string;
  features: { title: string; text: string }[];
  showcaseTitle: string;
  showcaseText: string;
  showcaseBullets: string[];
  builderTitle: string;
  builderText: string;
  builderBullets: string[];
  processTitle: string;
  process: { title: string; text: string }[];
  footerTitle: string;
  footerText: string;
  login: string;
  language: string;
  navFeatures: string;
  navShowcase: string;
  navProcess: string;
  featuresBadge: string;
  showcaseBadge: string;
  builderBadge: string;
  previewBadge: string;
  websitePreview: string;
  heroLabel: string;
  heroHeadline: string;
  servicesLabel: string;
  showcaseImageLabels: string[];
  selectImage: string;
  addImage: string;
  replaceImage: string;
};

const content: Record<Locale, LandingCopy> = {
  fr: {
    badge: 'Kôdo • croissance digitale',
    headline: 'Une plateforme premium pour gérer votre activité et vendre mieux.',
    text: 'Centralisez la facturation, les clients, le stock et votre présence digitale. Un espace simple, élégant et efficace pour les PME qui veulent grandir.',
    primaryCta: 'Démarrer',
    secondaryCta: 'Voir la démonstration',
    stats: [
      { value: '4.9/5', label: 'Satisfaction' },
      { value: '2x', label: 'Plus de leads' },
      { value: '24/7', label: 'Suivi' },
    ],
    featuresTitle: 'Tout ce qu’il faut pour avancer sereinement',
    features: [
      { title: 'Gestion commerciale', text: 'Clients, factures et devis en un seul tableau de bord.' },
      { title: 'Stock maîtrisé', text: 'Suivi des produits, alertes et performance opérationnelle.' },
      { title: 'Présence web', text: 'Site vitrine, landing pages et image de marque premium.' },
      { title: 'Suivi clair', text: 'Des indicateurs utiles pour piloter chaque décision.' },
    ],
    showcaseTitle: 'Un espace visuel prêt à accueillir vos images',
    showcaseText: 'Choisissez vos visuels depuis votre ordinateur et remplacez immédiatement les emplacements réservés de la landing page.',
    showcaseBullets: ['Images de produits', 'Photos d’équipe', 'Visuels de marque', 'Bannières marketing'],
    builderTitle: 'Créez votre site web en quelques minutes',
    builderText: 'Choisissez votre charte visuelle, ajoutez vos textes et vos images, puis publiez une page rapide, élégante et pensée pour convertir.',
    builderBullets: ['Création de pages vitrines', 'Mise en page responsive', 'Sections de vente et contact', 'Personnalisation rapide par l’utilisateur'],
    processTitle: 'Le parcours, sans friction',
    process: [
      { title: '1. Choisissez', text: 'Sélectionnez le style et les contenus clés de votre activité.' },
      { title: '2. Personnalisez', text: 'Ajoutez vos images et adaptez le message à votre marché.' },
      { title: '3. Lancez', text: 'Mettez votre activité en ligne et captez plus de clients.' },
    ],
    footerTitle: 'Prêt à faire grandir votre entreprise ?',
    footerText: 'Kôdo combine gestion, image de marque et conversion dans un seul outil.',
    login: 'Connexion',
    language: 'Langue',
    navFeatures: 'Fonctionnalités',
    navShowcase: 'Galerie',
    navProcess: 'Étapes',
    featuresBadge: 'Fonctionnalités',
    showcaseBadge: 'Galerie',
    builderBadge: 'Créateur de site',
    previewBadge: 'Aperçu',
    websitePreview: 'Votre site',
    heroLabel: 'Bannière',
    heroHeadline: 'Votre marque, mieux visible.',
    servicesLabel: 'Services',
    showcaseImageLabels: ['Bannière', 'Galerie 1', 'Galerie 2'],
    selectImage: 'Choisir une image',
    addImage: 'Ajouter',
    replaceImage: 'Remplacer l’image',
  },
  en: {
    badge: 'Kôdo • digital growth',
    headline: 'A premium platform to manage your business and sell better.',
    text: 'Bring billing, customers, inventory and your digital presence into one elegant workspace. Built for SMEs that want to grow with clarity.',
    primaryCta: 'Get started',
    secondaryCta: 'See demo',
    stats: [
      { value: '4.9/5', label: 'Satisfaction' },
      { value: '2x', label: 'More leads' },
      { value: '24/7', label: 'Monitoring' },
    ],
    featuresTitle: 'Everything you need to move forward with confidence',
    features: [
      { title: 'Sales management', text: 'Customers, invoices and quotes in one control room.' },
      { title: 'Inventory control', text: 'Track stock levels, alerts and operational performance.' },
      { title: 'Web presence', text: 'Premium websites, landing pages and brand storytelling.' },
      { title: 'Clear reporting', text: 'Actionable indicators to guide every business decision.' },
    ],
    showcaseTitle: 'A visual space ready for your images',
    showcaseText: 'Pick your visuals from your computer and replace the landing page placeholders instantly.',
    showcaseBullets: ['Product images', 'Team photos', 'Brand visuals', 'Marketing banners'],
    builderTitle: 'Build your website in a few minutes',
    builderText: 'Choose your visual identity, add your texts and images, then publish a fast, elegant page designed to convert visitors into customers.',
    builderBullets: ['Landing page creation', 'Responsive layouts', 'Sales and contact sections', 'Fast user customization'],
    processTitle: 'A frictionless path to launch',
    process: [
      { title: '1. Choose', text: 'Select the style and content that fit your business.' },
      { title: '2. Personalize', text: 'Upload your images and adapt the message to your market.' },
      { title: '3. Launch', text: 'Go live and start attracting more clients.' },
    ],
    footerTitle: 'Ready to grow your business?',
    footerText: 'Kôdo blends operations, branding and conversion in a single tool.',
    login: 'Login',
    language: 'Language',
    navFeatures: 'Features',
    navShowcase: 'Showcase',
    navProcess: 'Process',
    featuresBadge: 'Features',
    showcaseBadge: 'Showcase',
    builderBadge: 'Website builder',
    previewBadge: 'Preview',
    websitePreview: 'Your website',
    heroLabel: 'Hero',
    heroHeadline: 'Make your brand more visible.',
    servicesLabel: 'Services',
    showcaseImageLabels: ['Hero', 'Showcase 1', 'Showcase 2'],
    selectImage: 'Choose image',
    addImage: 'Add image',
    replaceImage: 'Replace image',
  },
};

function readStoredImages(): ImageSlots {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const locale = (i18n.language?.startsWith('en') ? 'en' : 'fr') as Locale;
  const copy = content[locale];
  const [images, setImages] = useState<ImageSlots>(() => readStoredImages());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setImages(readStoredImages());
  }, [locale]);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>, key: string) => {
    const input = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;
    input.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      const next = { ...readStoredImages(), [key]: String(reader.result) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setImages(next);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black tracking-tight">Kôdo<span className="text-emerald-500">.</span></div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">{copy.navFeatures}</a>
            <a href="#showcase" className="hover:text-slate-900">{copy.navShowcase}</a>
            <a href="#process" className="hover:text-slate-900">{copy.navProcess}</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => i18n.changeLanguage(locale === 'fr' ? 'en' : 'fr')}
              title={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
              aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 sm:inline-flex"
            >
              <Languages size={14} />
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              {copy.login}
            </button>
            <button
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="inline-flex rounded-full border border-slate-200 p-2 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-600">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>{copy.navFeatures}</a>
              <a href="#showcase" onClick={() => setMobileMenuOpen(false)}>{copy.navShowcase}</a>
              <a href="#process" onClick={() => setMobileMenuOpen(false)}>{copy.navProcess}</a>
              <button onClick={() => i18n.changeLanguage(locale === 'fr' ? 'en' : 'fr')} className="inline-flex items-center gap-2 text-left">
                <Languages size={14} />{locale === 'fr' ? 'EN' : 'FR'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              <Sparkles size={12} /> {copy.badge}
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {copy.headline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              {copy.text}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-200">
                {copy.primaryCta} <ArrowRight size={16} />
              </button>
              <a href="#showcase" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
                {copy.secondaryCta}
              </a>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
              {copy.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xl font-black text-slate-900">{stat.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
              {images.hero ? (
                <div className="relative">
                  <img src={images.hero} alt={copy.heroLabel} className="h-[440px] w-full object-cover" />
                  <label className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-lg">
                    <ImagePlus size={15} />{copy.replaceImage}
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageSelect(event, 'hero')} />
                  </label>
                </div>
              ) : (
                <div className="flex h-[440px] items-center justify-center bg-slate-100 text-center text-slate-500">
                  <div>
                    <ImagePlus className="mx-auto mb-3 text-slate-400" size={34} />
                    <div className="text-sm font-semibold">{copy.heroLabel}</div>
                    <label className="mt-3 inline-flex cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                      {copy.selectImage}
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageSelect(event, 'hero')} />
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Kôdo Dashboard</div>
                <div className="text-xs text-slate-500">Performance • Clients • Factures</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Star size={12} fill="currentColor" />
                Premium
              </span>
            </div>
          </div>
        </section>

        <section id="features" className="mt-24 scroll-mt-24">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">{copy.featuresBadge}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{copy.featuresTitle}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.features.map((feature) => (
              <div key={feature.title} className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="showcase" className="mt-24 scroll-mt-24 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600">
                {copy.showcaseBadge}
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{copy.showcaseTitle}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.showcaseText}</p>

              <ul className="mt-6 space-y-3">
                {copy.showcaseBullets.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={14} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {copy.showcaseImageLabels.map((label, index) => (
                <div key={label} className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                  {images[`showcase-${index}`] ? (
                    <div className="relative">
                      <img src={images[`showcase-${index}`]} alt={label} className="h-52 w-full object-cover" />
                      <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-[11px] font-bold text-slate-800 shadow-lg">
                        <ImagePlus size={14} />{copy.replaceImage}
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageSelect(event, `showcase-${index}`)} />
                      </label>
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center px-4 text-center text-slate-500">
                      <div>
                        <ImagePlus className="mx-auto mb-3 text-slate-400" size={28} />
                        <div className="text-sm font-semibold">{label}</div>
                        <label className="mt-3 inline-flex cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700">
                          {copy.addImage}
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageSelect(event, `showcase-${index}`)} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                {copy.builderBadge}
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{copy.builderTitle}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.builderText}</p>
              <ul className="mt-6 space-y-3">
                {copy.builderBullets.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={14} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{copy.previewBadge}</div>
                  <div className="mt-2 text-xl font-black">{copy.websitePreview}</div>
                </div>
                <div className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  Live
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{copy.heroLabel}</div>
                  <div className="mt-3 text-2xl font-black">{copy.heroHeadline}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{copy.servicesLabel}</div>
                    <div className="mt-2 text-lg font-semibold">{copy.features[2].title}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Contact</div>
                    <div className="mt-2 text-lg font-semibold">+237 6xx xxx xxx</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="mt-24 scroll-mt-24">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">{copy.navProcess}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{copy.processTitle}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {copy.process.map((step) => (
              <div key={step.title} className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {step.title.split('.')[0]}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <div className="text-2xl font-black tracking-tight">Kôdo<span className="text-emerald-500">.</span></div>
            <h3 className="mt-3 text-2xl font-black text-slate-900">{copy.footerTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{copy.footerText}</p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center">
            <button onClick={() => navigate('/login')} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              {copy.login}
            </button>
            <a href="#features" className="text-sm font-medium text-slate-700 hover:text-slate-900">{copy.navFeatures}</a>
            <a href="#showcase" className="text-sm font-medium text-slate-700 hover:text-slate-900">{copy.navShowcase}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
