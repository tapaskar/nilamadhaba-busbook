"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Minimal i18n for the most-visible strings on the home page + header.
 *
 * Supports English, Hindi, Tamil, Telugu — the four languages covering
 * roughly 70% of India's intercity-bus user base. Persisted to
 * localStorage so the choice survives navigation.
 *
 * Strings that haven't been localised fall back to English automatically.
 * This is pragmatic scaffolding, not a full i18n framework — swap in
 * next-intl / i18next when translation volume grows beyond ~50 strings.
 */

export type Locale = "en" | "hi" | "ta" | "te" | "or" | "bn";

export const locales: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English",  native: "English"  },
  { code: "hi", label: "Hindi",    native: "हिन्दी"   },
  { code: "bn", label: "Bengali",  native: "বাংলা"    },
  { code: "ta", label: "Tamil",    native: "தமிழ்"   },
  { code: "te", label: "Telugu",   native: "తెలుగు"  },
  { code: "or", label: "Odia",     native: "ଓଡ଼ିଆ"    },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.search":          "Search",
  "nav.myTrips":         "My Trips",
  "nav.help":            "Help",
  "nav.login":           "Login",

  "hero.title1":         "Travel in Comfort,",
  "hero.title2":         "Arrive in Style",
  "hero.subtitle":       "Premium intercity bus travel across India. Volvo & Scania coaches, live tracking, and an on-time guarantee — or your money back.",
  "hero.rated":          "Rated",
  "hero.travellers":     "Travellers",
  "hero.dailyTrips":     "Daily trips",
  "hero.onTime":         "On-time guarantee",

  "search.from":         "From",
  "search.to":           "To",
  "search.date":         "Travel Date",
  "search.cta":          "Search Buses",
  "search.today":        "TODAY",
  "search.tomorrow":     "TOMORROW",
  "search.trust":        "256-bit SSL · Zero booking fees · Instant refunds",

  "routes.section":      "Popular routes",
  "routes.heading":      "Where are you headed?",
  "routes.subtitle":     "Most loved routes across South & West India — each runs multiple times a day.",

  "why.heading":         "Built for the way India travels",
  "why.onTime":          "On-Time Guarantee",
  "why.cancel":          "Free Cancellation",
  "why.tracking":        "Live GPS Tracking",
  "why.comfort":         "Premium Comfort",
};

const hi: Dict = {
  "nav.search":          "खोजें",
  "nav.myTrips":         "मेरी यात्राएँ",
  "nav.help":            "सहायता",
  "nav.login":           "लॉगिन",

  "hero.title1":         "आराम से यात्रा करें,",
  "hero.title2":         "ठाठ से पहुँचें",
  "hero.subtitle":       "भारत भर में प्रीमियम इंटरसिटी बस यात्रा। वोल्वो और स्कैनिया कोच, लाइव ट्रैकिंग, और समय पर पहुँचने की गारंटी — या आपका पैसा वापस।",
  "hero.rated":          "रेटेड",
  "hero.travellers":     "यात्री",
  "hero.dailyTrips":     "दैनिक यात्राएँ",
  "hero.onTime":         "समय की गारंटी",

  "search.from":         "से",
  "search.to":           "तक",
  "search.date":         "यात्रा की तारीख",
  "search.cta":          "बसें खोजें",
  "search.today":        "आज",
  "search.tomorrow":     "कल",
  "search.trust":        "256-बिट SSL · कोई बुकिंग शुल्क नहीं · तुरंत रिफंड",

  "routes.section":      "लोकप्रिय रूट",
  "routes.heading":      "कहाँ जाना है?",
  "routes.subtitle":     "दक्षिण और पश्चिम भारत के सबसे पसंदीदा रूट — हर एक दिन में कई बार चलता है।",

  "why.heading":         "भारत की यात्रा के लिए बना",
  "why.onTime":          "समय पर गारंटी",
  "why.cancel":          "फ्री कैंसिलेशन",
  "why.tracking":        "लाइव GPS ट्रैकिंग",
  "why.comfort":         "प्रीमियम आराम",
};

const ta: Dict = {
  "nav.search":          "தேடு",
  "nav.myTrips":         "என் பயணங்கள்",
  "nav.help":            "உதவி",
  "nav.login":           "உள்நுழை",

  "hero.title1":         "வசதியாக பயணம் செய்யுங்கள்,",
  "hero.title2":         "கம்பீரமாக வந்தடையுங்கள்",
  "hero.subtitle":       "இந்தியா முழுவதும் உயர்தர நகரங்களுக்கிடையேயான பேருந்து பயணம். வோல்வோ & ஸ்கேனியா கோச்ச்கள், நேரடி கண்காணிப்பு, சரியான நேரத்தில் வந்தடைய உத்தரவாதம் — அல்லது உங்கள் பணத்தைத் திரும்பப் பெறுங்கள்.",
  "hero.rated":          "மதிப்பீடு",
  "hero.travellers":     "பயணிகள்",
  "hero.dailyTrips":     "தினசரி பயணங்கள்",
  "hero.onTime":         "சரியான நேர உத்தரவாதம்",

  "search.from":         "இருந்து",
  "search.to":           "வரை",
  "search.date":         "பயண தேதி",
  "search.cta":          "பேருந்துகளைத் தேடு",
  "search.today":        "இன்று",
  "search.tomorrow":     "நாளை",
  "search.trust":        "256-bit SSL · பதிவு கட்டணம் இல்லை · உடனடி திரும்பப் பெறுதல்",

  "routes.section":      "பிரபல பாதைகள்",
  "routes.heading":      "எங்கே செல்கிறீர்கள்?",
  "routes.subtitle":     "தென் & மேற்கு இந்தியாவில் மிகவும் விரும்பப்படும் பாதைகள் — ஒவ்வொன்றும் ஒரு நாளில் பல முறை இயங்குகின்றன.",

  "why.heading":         "இந்தியாவின் பயண பழக்கத்திற்கு ஏற்ப உருவாக்கப்பட்டது",
  "why.onTime":          "சரியான நேர உத்தரவாதம்",
  "why.cancel":          "இலவச ரத்து",
  "why.tracking":        "நேரடி GPS கண்காணிப்பு",
  "why.comfort":         "உயர்தர வசதி",
};

const te: Dict = {
  "nav.search":          "శోధించు",
  "nav.myTrips":         "నా ప్రయాణాలు",
  "nav.help":            "సహాయం",
  "nav.login":           "లాగిన్",

  "hero.title1":         "సౌకర్యంగా ప్రయాణించండి,",
  "hero.title2":         "హుందాగా చేరుకోండి",
  "hero.subtitle":       "భారతదేశం వ్యాప్తంగా ప్రీమియం ఇంటర్సిటీ బస్ ప్రయాణం. వోల్వో & స్కానియా కోచ్‌లు, లైవ్ ట్రాకింగ్, సమయానికి చేరుకునే హామీ — లేదా మీ డబ్బు వెనక్కి.",
  "hero.rated":          "రేటింగ్",
  "hero.travellers":     "ప్రయాణీకులు",
  "hero.dailyTrips":     "రోజువారీ ప్రయాణాలు",
  "hero.onTime":         "సమయ హామీ",

  "search.from":         "నుండి",
  "search.to":           "వరకు",
  "search.date":         "ప్రయాణ తేదీ",
  "search.cta":          "బస్సులను శోధించండి",
  "search.today":        "ఈ రోజు",
  "search.tomorrow":     "రేపు",
  "search.trust":        "256-bit SSL · బుకింగ్ ఫీజు లేదు · తక్షణ రిఫండ్లు",

  "routes.section":      "జనాదరణ పొందిన మార్గాలు",
  "routes.heading":      "మీరు ఎక్కడికి వెళ్తున్నారు?",
  "routes.subtitle":     "దక్షిణ & పశ్చిమ భారతదేశంలో అత్యంత ఇష్టపడిన మార్గాలు — ప్రతి ఒక్కటి రోజులో అనేక సార్లు నడుస్తుంది.",

  "why.heading":         "భారతదేశ ప్రయాణ విధానం కోసం నిర్మించబడింది",
  "why.onTime":          "సమయ హామీ",
  "why.cancel":          "ఉచిత రద్దు",
  "why.tracking":        "లైవ్ GPS ట్రాకింగ్",
  "why.comfort":         "ప్రీమియం సౌకర్యం",
};

const or: Dict = {
  "nav.search":          "ଖୋଜନ୍ତୁ",
  "nav.myTrips":         "ମୋର ଯାତ୍ରା",
  "nav.help":            "ସହାୟତା",
  "nav.login":           "ଲଗ୍ ଇନ୍",

  "hero.title1":         "ଆରାମରେ ଯାତ୍ରା କରନ୍ତୁ,",
  "hero.title2":         "ଶୈଳୀରେ ପହଞ୍ଚନ୍ତୁ",
  "hero.subtitle":       "ସମଗ୍ର ଭାରତରେ ପ୍ରିମିୟମ ଆନ୍ତଃନଗରୀ ବସ୍ ଯାତ୍ରା। ଭୋଲଭୋ ଓ ସ୍କାନିଆ କୋଚ୍, ଲାଇଭ୍ ଟ୍ରାକିଂ, ଏବଂ ସମୟରେ ପହଞ୍ଚିବାର ଗ୍ୟାରେଣ୍ଟି — କିମ୍ବା ଆପଣଙ୍କ ଟଙ୍କା ଫେରସ୍ତ।",
  "hero.rated":          "ରେଟେଡ୍",
  "hero.travellers":     "ଯାତ୍ରୀ",
  "hero.dailyTrips":     "ଦୈନିକ ଯାତ୍ରା",
  "hero.onTime":         "ସମୟ ଗ୍ୟାରେଣ୍ଟି",

  "search.from":         "ଠାରୁ",
  "search.to":           "ପର୍ଯ୍ୟନ୍ତ",
  "search.date":         "ଯାତ୍ରା ତାରିଖ",
  "search.cta":          "ବସ୍ ଖୋଜନ୍ତୁ",
  "search.today":        "ଆଜି",
  "search.tomorrow":     "ଆସନ୍ତାକାଲି",
  "search.trust":        "256-ବିଟ୍ SSL · କୌଣସି ବୁକିଂ ଶୁଳ୍କ ନାହିଁ · ତତ୍କ୍ଷଣାତ୍ ଫେରସ୍ତ",

  "routes.section":      "ଲୋକପ୍ରିୟ ମାର୍ଗ",
  "routes.heading":      "କେଉଁଠିକୁ ଯାଉଛନ୍ତି?",
  "routes.subtitle":     "ଦକ୍ଷିଣ ଓ ପଶ୍ଚିମ ଭାରତର ସବୁଠାରୁ ପ୍ରିୟ ମାର୍ଗ — ପ୍ରତ୍ୟେକଟି ଦିନରେ ଅନେକ ଥର ଚାଲେ।",

  "why.heading":         "ଭାରତର ଯାତ୍ରା ଶୈଳୀ ପାଇଁ ନିର୍ମିତ",
  "why.onTime":          "ସମୟ ଗ୍ୟାରେଣ୍ଟି",
  "why.cancel":          "ମାଗଣା କ୍ୟାନ୍ସେଲ୍",
  "why.tracking":        "ଲାଇଭ୍ GPS ଟ୍ରାକିଂ",
  "why.comfort":         "ପ୍ରିମିୟମ ଆରାମ",
};

const bn: Dict = {
  "nav.search":          "খুঁজুন",
  "nav.myTrips":         "আমার ভ্রমণ",
  "nav.help":            "সাহায্য",
  "nav.login":           "লগ ইন",

  "hero.title1":         "আরামে ভ্রমণ করুন,",
  "hero.title2":         "স্টাইলে পৌঁছান",
  "hero.subtitle":       "সারা ভারতে প্রিমিয়াম আন্তঃনগর বাস ভ্রমণ। ভলভো ও স্ক্যানিয়া কোচ, লাইভ ট্র্যাকিং এবং সময়মতো পৌঁছানোর গ্যারান্টি — অথবা আপনার টাকা ফেরত।",
  "hero.rated":          "রেটেড",
  "hero.travellers":     "যাত্রী",
  "hero.dailyTrips":     "দৈনিক যাত্রা",
  "hero.onTime":         "সময়ের গ্যারান্টি",

  "search.from":         "থেকে",
  "search.to":           "পর্যন্ত",
  "search.date":         "ভ্রমণের তারিখ",
  "search.cta":          "বাস খুঁজুন",
  "search.today":        "আজ",
  "search.tomorrow":     "আগামীকাল",
  "search.trust":        "256-বিট SSL · কোনো বুকিং ফি নেই · তাত্ক্ষণিক রিফান্ড",

  "routes.section":      "জনপ্রিয় রুট",
  "routes.heading":      "কোথায় যাচ্ছেন?",
  "routes.subtitle":     "দক্ষিণ ও পশ্চিম ভারতের সবচেয়ে প্রিয় রুট — প্রতিটি দিনে কয়েকবার চলে।",

  "why.heading":         "ভারতের ভ্রমণের জন্য তৈরি",
  "why.onTime":          "সময়ের গ্যারান্টি",
  "why.cancel":          "বিনামূল্যে বাতিলকরণ",
  "why.tracking":        "লাইভ GPS ট্র্যাকিং",
  "why.comfort":         "প্রিমিয়াম আরাম",
};

const dicts: Record<Locale, Dict> = { en, hi, bn, ta, te, or };

// ─── Context ──────────────────────────────────────────────────────────────

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_KEY = "nilamadhaba_locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load persisted locale on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && dicts[saved]) setLocaleState(saved);
    } catch {
      /* SSR / storage blocked — keep default */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* noop */
    }
  }, []);

  const t = useCallback(
    (key: string) => dicts[locale][key] ?? en[key] ?? key,
    [locale],
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Fallback outside provider — lets the app compile even if somebody
    // forgets to wrap a subtree. Returns English static strings.
    return {
      locale: "en",
      setLocale: () => {},
      t: (k) => en[k] ?? k,
    };
  }
  return v;
}

/** Convenience alias. */
export function useT() {
  return useI18n().t;
}
