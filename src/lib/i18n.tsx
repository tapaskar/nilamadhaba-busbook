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
 * Pragmatic i18n for NilaMadhaba's public surface.
 *
 * Languages: English, Hindi, Bengali, Tamil, Telugu, Odia — ~75% of India's
 * intercity-bus user base. Strings cover the home page, header, footer,
 * search card, seat map, trip cards, support hub, and pickers.
 *
 * Missing keys fall back to English. Choice persists to localStorage.
 *
 * Translations are reasonable approximations — for a production release,
 * have a native speaker review the non-English dictionaries.
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

// ─── English (source) ────────────────────────────────────────────────

const en: Dict = {
  // Nav + auth
  "nav.search":                  "Search",
  "nav.myTrips":                 "My Trips",
  "nav.help":                    "Help",
  "nav.login":                   "Login",

  // Hero
  "hero.title1":                 "Travel in Comfort,",
  "hero.title2":                 "Arrive in Style",
  "hero.subtitle":               "Premium intercity bus travel across India. Volvo & Scania coaches, live tracking, and an on-time guarantee — or your money back.",
  "hero.rated":                  "Rated",
  "hero.travellers":             "Travellers",
  "hero.dailyTrips":             "Daily trips",
  "hero.onTime":                 "On-time guarantee",

  // Search card
  "search.from":                 "From",
  "search.to":                   "To",
  "search.date":                 "Travel Date",
  "search.cta":                  "Search Buses",
  "search.today":                "TODAY",
  "search.tomorrow":             "TOMORROW",
  "search.trust":                "256-bit SSL · Zero booking fees · Instant refunds",
  "search.trustSsl":             "256-bit SSL",
  "search.trustFee":             "Zero booking fees",
  "search.trustRefund":          "Instant refunds",

  // City picker
  "city.selectFrom":             "Select from city",
  "city.selectTo":               "Select to city",
  "city.searchCity":             "Search city...",
  "city.popularCities":          "Popular Cities",
  "city.noCities":               "No cities found",

  // Date picker
  "date.title":                  "TRAVEL DATE",
  "date.pickFromCalendar":       "Pick from calendar",

  // Stats bar
  "stats.travellers":            "Happy travellers",
  "stats.dailyTrips":            "Daily trips",
  "stats.cities":                "Cities connected",
  "stats.onTime":                "On-time performance",

  // How it works
  "howworks.badge":              "How it works",
  "howworks.heading":            "Three taps from here to there",
  "howworks.subtitle":           "No account required. No hidden fees. No surprise stopovers.",
  "howworks.step1Title":         "Pick your route",
  "howworks.step1Desc":          "From Bengaluru to Chennai at 9 PM? Tap a postcard below.",
  "howworks.step2Title":         "Choose your seat",
  "howworks.step2Desc":          "See the bus layout in one tap — window, aisle, ladies-only.",
  "howworks.step3Title":         "Pay & board",
  "howworks.step3Desc":          "UPI in 2 taps. E-ticket arrives on WhatsApp instantly.",

  // Popular routes
  "routes.section":              "Popular routes",
  "routes.heading":              "Where are you headed?",
  "routes.subtitle":             "Most loved routes across South & West India — each runs multiple times a day.",
  "routes.seeAll":               "See all routes",
  "routes.from":                 "From",

  // Inside the bus
  "inside.badge":                "Inside every NilaMadhaba bus",
  "inside.headingPre":           "Your seat on the",
  "inside.headingAccent":        "most comfortable",
  "inside.headingPost":          "ride in India.",
  "inside.subtitle":             "Volvo B11R & Scania Multi-Axle coaches. Every bus gets a 48-point safety & hygiene check before each departure.",
  "inside.onRoute":              "On route",
  "inside.amenityAC":            "AC Sleeper",
  "inside.amenityWifi":          "Wi-Fi",
  "inside.amenityCharge":        "Charging Port",
  "inside.amenitySnack":         "Snacks",
  "inside.amenityWake":          "Wake-up Call",
  "inside.amenityTrack":         "Live Track",

  // Why NilaMadhaba
  "why.badge":                   "Why travellers choose us",
  "why.heading":                 "Built for the way India travels",
  "why.subtitle":                "The reliability of an airline, the value of a bus ticket.",
  "why.onTime":                  "On-Time Guarantee",
  "why.onTimeDesc":              "95% on-time across all routes. Cash back if we're more than 45 minutes late.",
  "why.cancel":                  "Free Cancellation",
  "why.cancelDesc":              "100% refund up to 12 hours before departure. Instant credit to your wallet.",
  "why.tracking":                "Live GPS Tracking",
  "why.trackingDesc":            "Watch your bus move in real time. Share the live link with family.",
  "why.comfort":                 "Premium Comfort",
  "why.comfortDesc":             "Volvo & Scania coaches — AC, blankets, charging ports, reading lights.",

  // Testimonials
  "testimonials.badge":          "4.8 / 5 on 50,000+ trips",
  "testimonials.heading":        "Travellers love the journey",
  "testimonials.subtitle":       "Real stories from people who swapped last-minute chaos for a smoother ride.",

  // Loyalty
  "loyalty.badge":               "NilaMadhaba RideClub",
  "loyalty.heading":             "Your 6th trip is on us.",
  "loyalty.subtitle":            "Earn 5% back as RideCoins on every booking. Redeem them on future trips, seat upgrades, or meals. Members also get priority boarding and 24×7 dedicated support.",
  "loyalty.joinFree":            "Join free",
  "loyalty.howItWorks":          "How it works →",
  "loyalty.tripsLabel":          "trips",

  // App download
  "app.badge":                   "Get the app",
  "app.headingPre":              "Book faster on the",
  "app.headingAccent":           "NilaMadhaba app.",
  "app.subtitle":                "One-tap rebook · offline boarding pass · push notifications when your bus is 5 km away.",
  "app.appStoreTag":             "Download on the",
  "app.appStore":                "App Store",
  "app.playStoreTag":            "GET IT ON",
  "app.playStore":               "Google Play",
  "app.ratings":                 "★ 4.9 on both stores · 500k+ downloads",

  // Footer
  "footer.newsletterHeading":    "Be the first to know about deals",
  "footer.newsletterSubtitle":   "Flash sales, new routes, and travel tips — no spam, unsubscribe anytime.",
  "footer.emailPlaceholder":     "your@email.com",
  "footer.subscribe":            "Subscribe",
  "footer.subscribing":          "Subscribing…",
  "footer.subscribed":           "Subscribed!",
  "footer.tagline":              "India's most comfortable intercity bus service. Safe, reliable, and built for the modern traveller.",
  "footer.company":              "Company",
  "footer.support":              "Support",
  "footer.popularRoutes":        "Popular routes",
  "footer.bookOnGo":             "Book on the go",
  "footer.securePayments":       "Secure payments via",
  "footer.copyright":            "All rights reserved.",
  "footer.compliance":           "PCI-DSS compliant",

  // Seat map
  "seat.colourGuide":            "Seat colour guide",
  "seat.available":              "Available",
  "seat.selected":               "Selected",
  "seat.booked":                 "Booked",
  "seat.ladies":                 "Ladies Only",
  "seat.driver":                 "DRIVER",
  "seat.lowerDeck":              "LOWER DECK",
  "seat.upperDeck":              "UPPER DECK",
  "seat.mainDeck":               "MAIN DECK",

  // Trip card
  "trip.onTime":                 "On-time",
  "trip.bookedToday":            "booked today",
  "trip.onlyLeft":               "Only",
  "trip.left":                   "left!",
  "trip.seatsLeft":              "seats left",
  "trip.seatLeft":               "seat left",
  "trip.selectSeats":            "Select Seats",
  "trip.hide":                   "Hide",
  "trip.boardingPoint":          "Boarding Point",
  "trip.droppingPoint":          "Dropping Point",
  "trip.getDirections":          "Get directions",
  "trip.verified":               "Verified operator",
  "trip.baseFare":               "Base fare",
  "trip.gst":                    "GST (5%)",
  "trip.convenience":            "Convenience fee",
  "trip.free":                   "FREE",
  "trip.total":                  "Total",

  // Support hub
  "support.needHand":            "Need a hand?",
  "support.pickChat":            "We're here to help — pick how you'd like to chat.",
  "support.nilaAssist":          "Nila Assist",
  "support.aiBadge":             "AI",
  "support.instantAI":           "Instant answers, always online",
  "support.whatsapp":            "WhatsApp",
  "support.repsReply":           "Our reps reply in minutes",
  "support.preferCall":          "Prefer a call?",
};

// ─── Hindi ────────────────────────────────────────────────────────────

const hi: Dict = {
  "nav.search":                  "खोजें",
  "nav.myTrips":                 "मेरी यात्राएँ",
  "nav.help":                    "सहायता",
  "nav.login":                   "लॉगिन",

  "hero.title1":                 "आराम से यात्रा करें,",
  "hero.title2":                 "ठाठ से पहुँचें",
  "hero.subtitle":               "भारत भर में प्रीमियम इंटरसिटी बस यात्रा। वोल्वो और स्कैनिया कोच, लाइव ट्रैकिंग, और समय पर पहुँचने की गारंटी — या आपका पैसा वापस।",
  "hero.rated":                  "रेटेड",
  "hero.travellers":             "यात्री",
  "hero.dailyTrips":             "दैनिक यात्राएँ",
  "hero.onTime":                 "समय की गारंटी",

  "search.from":                 "से",
  "search.to":                   "तक",
  "search.date":                 "यात्रा की तारीख",
  "search.cta":                  "बसें खोजें",
  "search.today":                "आज",
  "search.tomorrow":             "कल",
  "search.trustSsl":             "256-बिट SSL",
  "search.trustFee":             "कोई बुकिंग शुल्क नहीं",
  "search.trustRefund":          "तुरंत रिफंड",

  "city.selectFrom":             "शहर चुनें",
  "city.selectTo":               "शहर चुनें",
  "city.searchCity":             "शहर खोजें...",
  "city.popularCities":          "लोकप्रिय शहर",
  "city.noCities":               "कोई शहर नहीं मिला",

  "date.title":                  "यात्रा की तारीख",
  "date.pickFromCalendar":       "कैलेंडर से चुनें",

  "stats.travellers":            "खुश यात्री",
  "stats.dailyTrips":            "दैनिक यात्राएँ",
  "stats.cities":                "जुड़े शहर",
  "stats.onTime":                "समय पर प्रदर्शन",

  "howworks.badge":              "कैसे काम करता है",
  "howworks.heading":            "यहाँ से वहाँ, बस तीन टैप में",
  "howworks.subtitle":           "खाता ज़रूरी नहीं। कोई छुपा शुल्क नहीं। कोई अप्रत्याशित रुकावट नहीं।",
  "howworks.step1Title":         "रूट चुनें",
  "howworks.step1Desc":          "बेंगलुरु से चेन्नई रात 9 बजे? नीचे एक पोस्टकार्ड टैप करें।",
  "howworks.step2Title":         "सीट चुनें",
  "howworks.step2Desc":          "एक टैप में बस का लेआउट देखें — खिड़की, गलियारा, महिला-विशेष।",
  "howworks.step3Title":         "भुगतान करें और चढ़ें",
  "howworks.step3Desc":          "2 टैप में UPI। ई-टिकट तुरंत WhatsApp पर।",

  "routes.section":              "लोकप्रिय रूट",
  "routes.heading":              "कहाँ जाना है?",
  "routes.subtitle":             "दक्षिण और पश्चिम भारत के सबसे पसंदीदा रूट — हर एक दिन में कई बार चलता है।",
  "routes.seeAll":               "सभी रूट देखें",
  "routes.from":                 "से",

  "inside.badge":                "हर NilaMadhaba बस के अंदर",
  "inside.headingPre":           "भारत की",
  "inside.headingAccent":        "सबसे आरामदायक",
  "inside.headingPost":          "सवारी में आपकी सीट।",
  "inside.subtitle":             "वोल्वो B11R और स्कैनिया मल्टी-एक्सल कोच। हर बस को प्रत्येक प्रस्थान से पहले 48-पॉइंट सुरक्षा और स्वच्छता जाँच मिलती है।",
  "inside.onRoute":              "रास्ते में",
  "inside.amenityAC":            "AC स्लीपर",
  "inside.amenityWifi":          "वाई-फ़ाई",
  "inside.amenityCharge":        "चार्जिंग पॉइंट",
  "inside.amenitySnack":         "नाश्ता",
  "inside.amenityWake":          "वेक-अप कॉल",
  "inside.amenityTrack":         "लाइव ट्रैक",

  "why.badge":                   "यात्री हमें क्यों चुनते हैं",
  "why.heading":                 "भारत की यात्रा के लिए बना",
  "why.subtitle":                "एयरलाइन की विश्वसनीयता, बस टिकट की कीमत।",
  "why.onTime":                  "समय पर गारंटी",
  "why.onTimeDesc":              "सभी रूट पर 95% समय पर। 45 मिनट से ज़्यादा देरी हो तो पैसा वापस।",
  "why.cancel":                  "फ्री कैंसिलेशन",
  "why.cancelDesc":              "प्रस्थान से 12 घंटे पहले तक 100% रिफंड। तुरंत आपके वॉलेट में।",
  "why.tracking":                "लाइव GPS ट्रैकिंग",
  "why.trackingDesc":            "अपनी बस को रियल-टाइम में देखें। परिवार के साथ लाइव लिंक शेयर करें।",
  "why.comfort":                 "प्रीमियम आराम",
  "why.comfortDesc":             "वोल्वो और स्कैनिया कोच — AC, कंबल, चार्जिंग पोर्ट, रीडिंग लाइट्स।",

  "testimonials.badge":          "50,000+ यात्राओं पर 4.8/5",
  "testimonials.heading":        "यात्री इस सफ़र से प्यार करते हैं",
  "testimonials.subtitle":       "आखिरी-मिनट की अफ़रातफ़री छोड़कर आराम से सफ़र चुनने वालों की असली कहानियाँ।",

  "loyalty.badge":                "NilaMadhaba RideClub",
  "loyalty.heading":              "आपकी 6वीं यात्रा हम पर।",
  "loyalty.subtitle":             "हर बुकिंग पर 5% RideCoins कमाएँ। अगली यात्रा, सीट अपग्रेड, या भोजन पर भुनाएँ। सदस्यों को प्राथमिकता बोर्डिंग और 24×7 सहायता भी मिलती है।",
  "loyalty.joinFree":             "मुफ़्त जुड़ें",
  "loyalty.howItWorks":           "कैसे काम करता है →",
  "loyalty.tripsLabel":           "यात्राएँ",

  "app.badge":                   "ऐप पाएँ",
  "app.headingPre":              "NilaMadhaba ऐप पर",
  "app.headingAccent":           "तेज़ी से बुक करें।",
  "app.subtitle":                "एक टैप में रीबुक · ऑफ़लाइन बोर्डिंग पास · बस 5 किमी दूर होने पर सूचना।",
  "app.appStoreTag":             "डाउनलोड करें",
  "app.appStore":                "App Store",
  "app.playStoreTag":            "पाएँ इस पर",
  "app.playStore":               "Google Play",
  "app.ratings":                 "★ दोनों स्टोर पर 4.9 · 5 लाख+ डाउनलोड",

  "footer.newsletterHeading":    "ऑफ़र जानने वाले पहले बनें",
  "footer.newsletterSubtitle":   "फ्लैश सेल, नए रूट, और यात्रा सुझाव — कोई स्पैम नहीं, कभी भी अनसब्सक्राइब करें।",
  "footer.emailPlaceholder":     "your@email.com",
  "footer.subscribe":            "सब्सक्राइब",
  "footer.subscribing":          "सब्सक्राइब हो रहा है…",
  "footer.subscribed":           "सब्सक्राइब्ड!",
  "footer.tagline":              "भारत की सबसे आरामदायक इंटरसिटी बस सेवा। सुरक्षित, विश्वसनीय, और आधुनिक यात्री के लिए बनाई गई।",
  "footer.company":              "कंपनी",
  "footer.support":              "सहायता",
  "footer.popularRoutes":        "लोकप्रिय रूट",
  "footer.bookOnGo":             "चलते-फिरते बुक करें",
  "footer.securePayments":       "सुरक्षित भुगतान",
  "footer.copyright":            "सर्वाधिकार सुरक्षित।",
  "footer.compliance":           "PCI-DSS अनुरूप",

  "seat.colourGuide":            "सीट रंग गाइड",
  "seat.available":              "उपलब्ध",
  "seat.selected":               "चयनित",
  "seat.booked":                 "बुक्ड",
  "seat.ladies":                 "महिला-विशेष",
  "seat.driver":                 "चालक",
  "seat.lowerDeck":              "निचली डेक",
  "seat.upperDeck":              "ऊपरी डेक",
  "seat.mainDeck":               "मुख्य डेक",

  "trip.onTime":                 "समय पर",
  "trip.bookedToday":            "ने आज बुक किया",
  "trip.onlyLeft":               "केवल",
  "trip.left":                   "बची!",
  "trip.seatsLeft":              "सीटें बची",
  "trip.seatLeft":               "सीट बची",
  "trip.selectSeats":            "सीट चुनें",
  "trip.hide":                   "छुपाएँ",
  "trip.boardingPoint":          "बोर्डिंग पॉइंट",
  "trip.droppingPoint":          "ड्रॉपिंग पॉइंट",
  "trip.getDirections":          "दिशा-निर्देश",
  "trip.verified":               "सत्यापित ऑपरेटर",
  "trip.baseFare":               "मूल किराया",
  "trip.gst":                    "GST (5%)",
  "trip.convenience":            "सुविधा शुल्क",
  "trip.free":                   "मुफ़्त",
  "trip.total":                  "कुल",

  "support.needHand":            "मदद चाहिए?",
  "support.pickChat":            "हम यहाँ मदद के लिए हैं — चुनें आप कैसे चैट करना चाहेंगे।",
  "support.nilaAssist":          "Nila Assist",
  "support.aiBadge":             "AI",
  "support.instantAI":           "तुरंत उत्तर, हमेशा ऑनलाइन",
  "support.whatsapp":            "WhatsApp",
  "support.repsReply":           "हमारे प्रतिनिधि मिनटों में जवाब देते हैं",
  "support.preferCall":          "कॉल करना चाहें?",
};

// ─── Bengali ──────────────────────────────────────────────────────────

const bn: Dict = {
  "nav.search":                  "খুঁজুন",
  "nav.myTrips":                 "আমার ভ্রমণ",
  "nav.help":                    "সাহায্য",
  "nav.login":                   "লগ ইন",

  "hero.title1":                 "আরামে ভ্রমণ করুন,",
  "hero.title2":                 "স্টাইলে পৌঁছান",
  "hero.subtitle":               "সারা ভারতে প্রিমিয়াম আন্তঃনগর বাস ভ্রমণ। ভলভো ও স্ক্যানিয়া কোচ, লাইভ ট্র্যাকিং এবং সময়মতো পৌঁছানোর গ্যারান্টি — অথবা আপনার টাকা ফেরত।",
  "hero.rated":                  "রেটেড",
  "hero.travellers":             "যাত্রী",
  "hero.dailyTrips":             "দৈনিক যাত্রা",
  "hero.onTime":                 "সময়ের গ্যারান্টি",

  "search.from":                 "থেকে",
  "search.to":                   "পর্যন্ত",
  "search.date":                 "ভ্রমণের তারিখ",
  "search.cta":                  "বাস খুঁজুন",
  "search.today":                "আজ",
  "search.tomorrow":             "আগামীকাল",
  "search.trustSsl":             "256-বিট SSL",
  "search.trustFee":             "কোনো বুকিং ফি নেই",
  "search.trustRefund":          "তাত্ক্ষণিক রিফান্ড",

  "city.selectFrom":             "শহর নির্বাচন",
  "city.selectTo":               "শহর নির্বাচন",
  "city.searchCity":             "শহর খুঁজুন...",
  "city.popularCities":          "জনপ্রিয় শহর",
  "city.noCities":               "কোনো শহর পাওয়া যায়নি",

  "date.title":                  "ভ্রমণের তারিখ",
  "date.pickFromCalendar":       "ক্যালেন্ডার থেকে বাছুন",

  "stats.travellers":            "সুখী যাত্রী",
  "stats.dailyTrips":            "দৈনিক যাত্রা",
  "stats.cities":                "সংযুক্ত শহর",
  "stats.onTime":                "সময়মতো পারফরম্যান্স",

  "howworks.badge":              "যেভাবে কাজ করে",
  "howworks.heading":            "তিনটি ট্যাপে এখান থেকে সেখানে",
  "howworks.subtitle":           "অ্যাকাউন্ট দরকার নেই। কোনো লুকানো ফি নেই। কোনো অপ্রত্যাশিত থামা নেই।",
  "howworks.step1Title":         "আপনার রুট বাছুন",
  "howworks.step1Desc":          "বেঙ্গালুরু থেকে চেন্নাই রাত ৯টায়? নিচে একটি পোস্টকার্ড ট্যাপ করুন।",
  "howworks.step2Title":         "আসন বাছুন",
  "howworks.step2Desc":          "এক ট্যাপে বাসের লেআউট দেখুন — জানালা, পথ, মহিলা-মাত্র।",
  "howworks.step3Title":         "পেমেন্ট করুন ও বোর্ড করুন",
  "howworks.step3Desc":          "২ ট্যাপে UPI। ই-টিকিট সঙ্গে সঙ্গে WhatsApp-এ।",

  "routes.section":              "জনপ্রিয় রুট",
  "routes.heading":              "কোথায় যাচ্ছেন?",
  "routes.subtitle":             "দক্ষিণ ও পশ্চিম ভারতের সবচেয়ে প্রিয় রুট — প্রতিটি দিনে কয়েকবার চলে।",
  "routes.seeAll":               "সব রুট দেখুন",
  "routes.from":                 "থেকে",

  "inside.badge":                "প্রতিটি NilaMadhaba বাসের ভিতরে",
  "inside.headingPre":           "ভারতের",
  "inside.headingAccent":        "সবচেয়ে আরামদায়ক",
  "inside.headingPost":          "যাত্রায় আপনার আসন।",
  "inside.subtitle":             "ভলভো B11R ও স্ক্যানিয়া মাল্টি-অ্যাক্সেল কোচ। প্রতিটি বাস প্রতিটি যাত্রার আগে ৪৮-পয়েন্ট নিরাপত্তা ও পরিচ্ছন্নতা পরীক্ষা পায়।",
  "inside.onRoute":              "পথে",
  "inside.amenityAC":            "AC স্লিপার",
  "inside.amenityWifi":          "ওয়াই-ফাই",
  "inside.amenityCharge":        "চার্জিং পয়েন্ট",
  "inside.amenitySnack":         "স্ন্যাকস",
  "inside.amenityWake":          "ওয়েক-আপ কল",
  "inside.amenityTrack":         "লাইভ ট্র্যাক",

  "why.badge":                   "যাত্রীরা কেন আমাদের বাছেন",
  "why.heading":                 "ভারতের ভ্রমণের জন্য তৈরি",
  "why.subtitle":                "এয়ারলাইন্সের নির্ভরযোগ্যতা, বাস টিকিটের দাম।",
  "why.onTime":                  "সময়ের গ্যারান্টি",
  "why.onTimeDesc":              "সব রুটে ৯৫% সময়মতো। ৪৫ মিনিটের বেশি দেরি হলে টাকা ফেরত।",
  "why.cancel":                  "বিনামূল্যে বাতিলকরণ",
  "why.cancelDesc":              "যাত্রার ১২ ঘণ্টা আগে পর্যন্ত ১০০% রিফান্ড। তাৎক্ষণিক আপনার ওয়ালেটে।",
  "why.tracking":                "লাইভ GPS ট্র্যাকিং",
  "why.trackingDesc":            "আপনার বাস রিয়েল-টাইমে দেখুন। পরিবারের সাথে লাইভ লিঙ্ক শেয়ার করুন।",
  "why.comfort":                 "প্রিমিয়াম আরাম",
  "why.comfortDesc":             "ভলভো ও স্ক্যানিয়া কোচ — AC, কম্বল, চার্জিং পোর্ট, রিডিং লাইট।",

  "testimonials.badge":          "৫০,০০০+ যাত্রায় ৪.৮/৫",
  "testimonials.heading":        "যাত্রীরা এই ভ্রমণ ভালোবাসেন",
  "testimonials.subtitle":       "যারা শেষ-মুহূর্তের বিশৃঙ্খলা ছেড়ে মসৃণ যাত্রা বেছেছেন তাদের সত্যিকারের গল্প।",

  "loyalty.badge":                "NilaMadhaba RideClub",
  "loyalty.heading":              "আপনার ৬ষ্ঠ যাত্রা আমাদের পক্ষ থেকে।",
  "loyalty.subtitle":             "প্রতিটি বুকিংয়ে ৫% RideCoins অর্জন করুন। ভবিষ্যৎ ভ্রমণ, আসন আপগ্রেড বা খাবারে ব্যবহার করুন। সদস্যরা অগ্রাধিকার বোর্ডিং ও ২৪×৭ সহায়তাও পান।",
  "loyalty.joinFree":             "বিনামূল্যে যোগ দিন",
  "loyalty.howItWorks":           "যেভাবে কাজ করে →",
  "loyalty.tripsLabel":           "যাত্রা",

  "app.badge":                   "অ্যাপ পান",
  "app.headingPre":              "NilaMadhaba অ্যাপে",
  "app.headingAccent":           "দ্রুত বুক করুন।",
  "app.subtitle":                "এক ট্যাপে রিবুক · অফলাইন বোর্ডিং পাস · বাস ৫ কিমি দূরে পৌঁছালে পুশ নোটিফিকেশন।",
  "app.appStoreTag":             "ডাউনলোড করুন",
  "app.appStore":                "App Store",
  "app.playStoreTag":            "এটা পান",
  "app.playStore":               "Google Play",
  "app.ratings":                 "★ উভয় স্টোরে ৪.৯ · ৫ লক্ষ+ ডাউনলোড",

  "footer.newsletterHeading":    "অফার সম্পর্কে সবার আগে জানুন",
  "footer.newsletterSubtitle":   "ফ্ল্যাশ সেল, নতুন রুট, ও ভ্রমণ টিপস — কোনো স্প্যাম নেই, যেকোনো সময় আনসাবস্ক্রাইব করুন।",
  "footer.emailPlaceholder":     "your@email.com",
  "footer.subscribe":            "সাবস্ক্রাইব",
  "footer.subscribing":          "সাবস্ক্রাইব হচ্ছে…",
  "footer.subscribed":           "সাবস্ক্রাইব হয়েছে!",
  "footer.tagline":              "ভারতের সবচেয়ে আরামদায়ক আন্তঃনগর বাস পরিষেবা। নিরাপদ, নির্ভরযোগ্য, আধুনিক যাত্রীর জন্য তৈরি।",
  "footer.company":              "কোম্পানি",
  "footer.support":              "সহায়তা",
  "footer.popularRoutes":        "জনপ্রিয় রুট",
  "footer.bookOnGo":             "চলতে চলতে বুক করুন",
  "footer.securePayments":       "নিরাপদ পেমেন্ট",
  "footer.copyright":            "সর্বস্বত্ব সংরক্ষিত।",
  "footer.compliance":           "PCI-DSS সম্মত",

  "seat.colourGuide":            "আসন রঙ নির্দেশিকা",
  "seat.available":              "উপলব্ধ",
  "seat.selected":               "নির্বাচিত",
  "seat.booked":                 "বুক করা",
  "seat.ladies":                 "মহিলা-মাত্র",
  "seat.driver":                 "চালক",
  "seat.lowerDeck":              "নিচের ডেক",
  "seat.upperDeck":              "উপরের ডেক",
  "seat.mainDeck":               "প্রধান ডেক",

  "trip.onTime":                 "সময়মতো",
  "trip.bookedToday":            "আজ বুক করেছেন",
  "trip.onlyLeft":               "মাত্র",
  "trip.left":                   "বাকি!",
  "trip.seatsLeft":              "আসন বাকি",
  "trip.seatLeft":               "আসন বাকি",
  "trip.selectSeats":            "আসন বাছুন",
  "trip.hide":                   "লুকান",
  "trip.boardingPoint":          "বোর্ডিং পয়েন্ট",
  "trip.droppingPoint":          "ড্রপিং পয়েন্ট",
  "trip.getDirections":          "দিকনির্দেশ",
  "trip.verified":               "যাচাইকৃত অপারেটর",
  "trip.baseFare":               "মূল ভাড়া",
  "trip.gst":                    "GST (5%)",
  "trip.convenience":            "সুবিধা ফি",
  "trip.free":                   "বিনামূল্যে",
  "trip.total":                  "মোট",

  "support.needHand":            "সাহায্য দরকার?",
  "support.pickChat":            "আমরা সাহায্যের জন্য আছি — বাছুন কীভাবে চ্যাট করবেন।",
  "support.nilaAssist":          "Nila Assist",
  "support.aiBadge":             "AI",
  "support.instantAI":           "তাৎক্ষণিক উত্তর, সর্বদা অনলাইন",
  "support.whatsapp":            "WhatsApp",
  "support.repsReply":           "আমাদের প্রতিনিধিরা মিনিটে উত্তর দেন",
  "support.preferCall":          "কল করতে চান?",
};

// ─── Tamil ────────────────────────────────────────────────────────────

const ta: Dict = {
  "nav.search":                  "தேடு",
  "nav.myTrips":                 "என் பயணங்கள்",
  "nav.help":                    "உதவி",
  "nav.login":                   "உள்நுழை",

  "hero.title1":                 "வசதியாக பயணம் செய்யுங்கள்,",
  "hero.title2":                 "கம்பீரமாக வந்தடையுங்கள்",
  "hero.subtitle":               "இந்தியா முழுவதும் உயர்தர நகரங்களுக்கிடையேயான பேருந்து பயணம். வோல்வோ & ஸ்கேனியா கோச்ச்கள், நேரடி கண்காணிப்பு, சரியான நேரத்தில் வந்தடைய உத்தரவாதம் — அல்லது உங்கள் பணத்தைத் திரும்பப் பெறுங்கள்.",
  "hero.rated":                  "மதிப்பீடு",
  "hero.travellers":             "பயணிகள்",
  "hero.dailyTrips":             "தினசரி பயணங்கள்",
  "hero.onTime":                 "சரியான நேர உத்தரவாதம்",

  "search.from":                 "இருந்து",
  "search.to":                   "வரை",
  "search.date":                 "பயண தேதி",
  "search.cta":                  "பேருந்துகளைத் தேடு",
  "search.today":                "இன்று",
  "search.tomorrow":             "நாளை",
  "search.trustSsl":             "256-பிட் SSL",
  "search.trustFee":             "பதிவு கட்டணம் இல்லை",
  "search.trustRefund":          "உடனடி திரும்பப் பெறுதல்",

  "city.selectFrom":             "நகரத்தைத் தேர்வுசெய்க",
  "city.selectTo":               "நகரத்தைத் தேர்வுசெய்க",
  "city.searchCity":             "நகரத்தைத் தேடுக...",
  "city.popularCities":          "பிரபல நகரங்கள்",
  "city.noCities":               "எந்த நகரமும் கிடைக்கவில்லை",

  "date.title":                  "பயண தேதி",
  "date.pickFromCalendar":       "நாட்காட்டியில் இருந்து தேர்வு",

  "stats.travellers":            "மகிழ்ச்சியான பயணிகள்",
  "stats.dailyTrips":            "தினசரி பயணங்கள்",
  "stats.cities":                "இணைந்த நகரங்கள்",
  "stats.onTime":                "சரியான நேரத் திறன்",

  "howworks.badge":              "எப்படி வேலை செய்கிறது",
  "howworks.heading":            "இங்கிருந்து அங்கே மூன்று தட்டல்களில்",
  "howworks.subtitle":           "கணக்கு தேவையில்லை. மறைக்கப்பட்ட கட்டணம் இல்லை. திடீர் நிறுத்தங்கள் இல்லை.",
  "howworks.step1Title":         "உங்கள் வழித்தடத்தைத் தேர்ந்தெடுக்கவும்",
  "howworks.step1Desc":          "பெங்களூருவிலிருந்து சென்னை இரவு 9 மணிக்கு? கீழே ஒரு போஸ்ட்கார்டைத் தட்டவும்.",
  "howworks.step2Title":         "இருக்கை தேர்வுசெய்யவும்",
  "howworks.step2Desc":          "பேருந்தின் அமைப்பை ஒரே தட்டலில் காணவும் — ஜன்னல், நடைபாதை, பெண்கள் மட்டும்.",
  "howworks.step3Title":         "கட்டணம் செலுத்தி ஏறவும்",
  "howworks.step3Desc":          "2 தட்டல்களில் UPI. E-டிக்கெட் உடனே WhatsApp-இல்.",

  "routes.section":              "பிரபல பாதைகள்",
  "routes.heading":              "எங்கே செல்கிறீர்கள்?",
  "routes.subtitle":             "தென் & மேற்கு இந்தியாவில் மிகவும் விரும்பப்படும் பாதைகள் — ஒவ்வொன்றும் ஒரு நாளில் பல முறை இயங்குகின்றன.",
  "routes.seeAll":               "அனைத்து பாதைகளையும் காண்க",
  "routes.from":                 "தொடக்கம்",

  "inside.badge":                "ஒவ்வொரு NilaMadhaba பேருந்திலும்",
  "inside.headingPre":           "இந்தியாவின்",
  "inside.headingAccent":        "மிகவும் வசதியான",
  "inside.headingPost":          "பயணத்தில் உங்கள் இருக்கை.",
  "inside.subtitle":             "வோல்வோ B11R & ஸ்கேனியா மல்டி-அச்சு கோச்ச்கள். ஒவ்வொரு பேருந்தும் ஒவ்வொரு புறப்பாட்டுக்கும் முன் 48-புள்ளி பாதுகாப்பு & சுகாதார சோதனை பெறுகிறது.",
  "inside.onRoute":              "வழியில்",
  "inside.amenityAC":            "AC தூங்கும் இருக்கை",
  "inside.amenityWifi":          "வை-ஃபை",
  "inside.amenityCharge":        "சார்ஜிங் புள்ளி",
  "inside.amenitySnack":         "சிற்றுண்டி",
  "inside.amenityWake":          "எழுப்பும் அழைப்பு",
  "inside.amenityTrack":         "நேரடி கண்காணிப்பு",

  "why.badge":                   "பயணிகள் ஏன் நம்மைத் தேர்வு செய்கிறார்கள்",
  "why.heading":                 "இந்தியாவின் பயண பழக்கத்திற்கு ஏற்ப உருவாக்கப்பட்டது",
  "why.subtitle":                "விமான நிறுவனத்தின் நம்பகத்தன்மை, பேருந்து டிக்கெட்டின் மதிப்பு.",
  "why.onTime":                  "சரியான நேர உத்தரவாதம்",
  "why.onTimeDesc":              "அனைத்து பாதைகளிலும் 95% சரியான நேரத்தில். 45 நிமிடங்களுக்கு மேல் தாமதமானால் பணம் திரும்பப் பெறலாம்.",
  "why.cancel":                  "இலவச ரத்து",
  "why.cancelDesc":              "புறப்படுவதற்கு 12 மணி நேரம் முன்பு வரை 100% திரும்பப் பெறுதல். உடனே உங்கள் வாலட்டில்.",
  "why.tracking":                "நேரடி GPS கண்காணிப்பு",
  "why.trackingDesc":            "உங்கள் பேருந்தை நேரடி நேரத்தில் பாருங்கள். குடும்பத்துடன் நேரடி இணைப்பைப் பகிருங்கள்.",
  "why.comfort":                 "உயர்தர வசதி",
  "why.comfortDesc":             "வோல்வோ & ஸ்கேனியா கோச்ச்கள் — AC, போர்வை, சார்ஜிங் துறைமுகங்கள், வாசிப்பு விளக்குகள்.",

  "testimonials.badge":          "50,000+ பயணங்களில் 4.8/5",
  "testimonials.heading":        "பயணிகள் இந்தப் பயணத்தை விரும்புகிறார்கள்",
  "testimonials.subtitle":       "கடைசி நிமிட குழப்பத்தை விட்டு மென்மையான பயணத்தைத் தேர்ந்தெடுத்த மக்களின் உண்மையான கதைகள்.",

  "loyalty.badge":                "NilaMadhaba RideClub",
  "loyalty.heading":              "உங்கள் 6வது பயணம் எங்கள் பக்கம்.",
  "loyalty.subtitle":             "ஒவ்வொரு பதிவிலும் 5% RideCoins பெறுங்கள். எதிர்கால பயணங்கள், இருக்கை மேம்பாடுகள், அல்லது உணவுகளில் மீட்டெடுக்கவும். உறுப்பினர்களுக்கு முன்னுரிமை ஏற்றம் மற்றும் 24×7 ஆதரவும் கிடைக்கும்.",
  "loyalty.joinFree":             "இலவசமாக சேரவும்",
  "loyalty.howItWorks":           "எப்படி வேலை செய்கிறது →",
  "loyalty.tripsLabel":           "பயணங்கள்",

  "app.badge":                   "ஆப் பெறுங்கள்",
  "app.headingPre":              "NilaMadhaba ஆப்-ல்",
  "app.headingAccent":           "வேகமாக பதிவு செய்யுங்கள்.",
  "app.subtitle":                "ஒரே தட்டலில் மறுபதிவு · ஆஃப்லைன் ஏற்றப் பாஸ் · உங்கள் பேருந்து 5 கி.மீ. தூரத்தில் இருக்கும்போது அறிவிப்புகள்.",
  "app.appStoreTag":             "இங்கிருந்து பதிவிறக்கவும்",
  "app.appStore":                "App Store",
  "app.playStoreTag":            "இதில் பெறுங்கள்",
  "app.playStore":               "Google Play",
  "app.ratings":                 "★ இரண்டு ஸ்டோர்களிலும் 4.9 · 5 லட்சம்+ பதிவிறக்கங்கள்",

  "footer.newsletterHeading":    "ஒப்பந்தங்களைப் பற்றி முதலில் அறிந்து கொள்ளுங்கள்",
  "footer.newsletterSubtitle":   "ஃப்ளாஷ் விற்பனைகள், புதிய பாதைகள், பயண குறிப்புகள் — ஸ்பேம் இல்லை, எப்போது வேண்டுமானாலும் குழுவிலகலாம்.",
  "footer.emailPlaceholder":     "your@email.com",
  "footer.subscribe":            "சந்தா",
  "footer.subscribing":          "சந்தா செய்கிறது…",
  "footer.subscribed":           "சந்தா செய்யப்பட்டது!",
  "footer.tagline":              "இந்தியாவின் மிகவும் வசதியான நகரங்களுக்கிடையேயான பேருந்து சேவை. பாதுகாப்பான, நம்பகமான, நவீன பயணிக்கு ஏற்ப உருவாக்கப்பட்டது.",
  "footer.company":              "நிறுவனம்",
  "footer.support":              "ஆதரவு",
  "footer.popularRoutes":        "பிரபல பாதைகள்",
  "footer.bookOnGo":             "செல்லும் வழியில் பதிவு செய்யவும்",
  "footer.securePayments":       "பாதுகாப்பான கட்டணங்கள்",
  "footer.copyright":            "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
  "footer.compliance":           "PCI-DSS இணக்கம்",

  "seat.colourGuide":            "இருக்கை நிற வழிகாட்டி",
  "seat.available":              "கிடைக்கிறது",
  "seat.selected":               "தேர்ந்தெடுக்கப்பட்டது",
  "seat.booked":                 "முன்பதிவு செய்யப்பட்டது",
  "seat.ladies":                 "பெண்கள் மட்டும்",
  "seat.driver":                 "ஓட்டுநர்",
  "seat.lowerDeck":              "கீழ் மாடி",
  "seat.upperDeck":              "மேல் மாடி",
  "seat.mainDeck":               "முதன்மை மாடி",

  "trip.onTime":                 "சரியான நேரம்",
  "trip.bookedToday":            "இன்று பதிவு செய்தனர்",
  "trip.onlyLeft":               "மட்டும்",
  "trip.left":                   "மீதம்!",
  "trip.seatsLeft":              "இருக்கைகள் மீதம்",
  "trip.seatLeft":               "இருக்கை மீதம்",
  "trip.selectSeats":            "இருக்கைகளைத் தேர்வுசெய்",
  "trip.hide":                   "மறை",
  "trip.boardingPoint":          "ஏறும் இடம்",
  "trip.droppingPoint":          "இறங்கும் இடம்",
  "trip.getDirections":          "வழிகாட்டுதலைப் பெறவும்",
  "trip.verified":               "சரிபார்க்கப்பட்ட ஆபரேட்டர்",
  "trip.baseFare":               "அடிப்படை கட்டணம்",
  "trip.gst":                    "GST (5%)",
  "trip.convenience":            "வசதி கட்டணம்",
  "trip.free":                   "இலவசம்",
  "trip.total":                  "மொத்தம்",

  "support.needHand":            "உதவி வேண்டுமா?",
  "support.pickChat":            "நாங்கள் உதவ இங்கே உள்ளோம் — எப்படி அரட்டையடிக்க விரும்புகிறீர்கள் என்று தேர்வு செய்யவும்.",
  "support.nilaAssist":          "Nila Assist",
  "support.aiBadge":             "AI",
  "support.instantAI":           "உடனடி பதில்கள், எப்போதும் ஆன்லைன்",
  "support.whatsapp":            "WhatsApp",
  "support.repsReply":           "எங்கள் பிரதிநிதிகள் நிமிடங்களில் பதிலளிக்கின்றனர்",
  "support.preferCall":          "அழைக்க விரும்புகிறீர்களா?",
};

// ─── Telugu ──────────────────────────────────────────────────────────

const te: Dict = {
  "nav.search":                  "శోధించు",
  "nav.myTrips":                 "నా ప్రయాణాలు",
  "nav.help":                    "సహాయం",
  "nav.login":                   "లాగిన్",

  "hero.title1":                 "సౌకర్యంగా ప్రయాణించండి,",
  "hero.title2":                 "హుందాగా చేరుకోండి",
  "hero.subtitle":               "భారతదేశం వ్యాప్తంగా ప్రీమియం ఇంటర్‌సిటీ బస్ ప్రయాణం. వోల్వో & స్కానియా కోచ్‌లు, లైవ్ ట్రాకింగ్, సమయానికి చేరుకునే హామీ — లేదా మీ డబ్బు వెనక్కి.",
  "hero.rated":                  "రేటింగ్",
  "hero.travellers":             "ప్రయాణీకులు",
  "hero.dailyTrips":             "రోజువారీ ప్రయాణాలు",
  "hero.onTime":                 "సమయ హామీ",

  "search.from":                 "నుండి",
  "search.to":                   "వరకు",
  "search.date":                 "ప్రయాణ తేదీ",
  "search.cta":                  "బస్సులను శోధించండి",
  "search.today":                "ఈ రోజు",
  "search.tomorrow":             "రేపు",
  "search.trustSsl":             "256-బిట్ SSL",
  "search.trustFee":             "బుకింగ్ ఫీజు లేదు",
  "search.trustRefund":          "తక్షణ రిఫండ్లు",

  "city.selectFrom":             "నగరాన్ని ఎంచుకోండి",
  "city.selectTo":               "నగరాన్ని ఎంచుకోండి",
  "city.searchCity":             "నగరాన్ని శోధించండి...",
  "city.popularCities":          "ప్రముఖ నగరాలు",
  "city.noCities":               "నగరాలు కనుగొనబడలేదు",

  "date.title":                  "ప్రయాణ తేదీ",
  "date.pickFromCalendar":       "క్యాలెండర్ నుండి ఎంచుకోండి",

  "stats.travellers":            "సంతోషకరమైన ప్రయాణీకులు",
  "stats.dailyTrips":            "రోజువారీ ప్రయాణాలు",
  "stats.cities":                "అనుసంధానమైన నగరాలు",
  "stats.onTime":                "సమయ పనితీరు",

  "howworks.badge":              "ఎలా పని చేస్తుంది",
  "howworks.heading":            "ఇక్కడ నుండి అక్కడికి మూడు ట్యాప్‌లలో",
  "howworks.subtitle":           "ఖాతా అవసరం లేదు. దాచిన ఫీజులు లేవు. ఆశ్చర్యకరమైన ఆగిపోవడాలు లేవు.",
  "howworks.step1Title":         "మీ మార్గాన్ని ఎంచుకోండి",
  "howworks.step1Desc":          "బెంగళూరు నుండి చెన్నై రాత్రి 9 గంటలకు? దిగువ ఒక పోస్ట్‌కార్డ్ ట్యాప్ చేయండి.",
  "howworks.step2Title":         "సీటు ఎంచుకోండి",
  "howworks.step2Desc":          "ఒక ట్యాప్‌లో బస్ లేఅవుట్ చూడండి — కిటికీ, వాక్‌వే, మహిళలకు మాత్రమే.",
  "howworks.step3Title":         "చెల్లించి బోర్డ్ చేయండి",
  "howworks.step3Desc":          "2 ట్యాప్‌లలో UPI. E-టికెట్ తక్షణమే WhatsApp-లో.",

  "routes.section":              "జనాదరణ పొందిన మార్గాలు",
  "routes.heading":              "మీరు ఎక్కడికి వెళ్తున్నారు?",
  "routes.subtitle":             "దక్షిణ & పశ్చిమ భారతదేశంలో అత్యంత ఇష్టపడిన మార్గాలు — ప్రతి ఒక్కటి రోజులో అనేక సార్లు నడుస్తుంది.",
  "routes.seeAll":               "అన్ని మార్గాలు చూడండి",
  "routes.from":                 "నుండి",

  "inside.badge":                "ప్రతి NilaMadhaba బస్‌లో",
  "inside.headingPre":           "భారతదేశంలో",
  "inside.headingAccent":        "అత్యంత సౌకర్యవంతమైన",
  "inside.headingPost":          "ప్రయాణంలో మీ సీటు.",
  "inside.subtitle":             "వోల్వో B11R & స్కానియా మల్టీ-అక్సెల్ కోచ్‌లు. ప్రతి బస్సు ప్రతి బయలుదేరే ముందు 48-పాయింట్ భద్రత & పరిశుభ్రత తనిఖీ పొందుతుంది.",
  "inside.onRoute":              "మార్గంలో",
  "inside.amenityAC":            "AC స్లీపర్",
  "inside.amenityWifi":          "వై-ఫై",
  "inside.amenityCharge":        "ఛార్జింగ్ పాయింట్",
  "inside.amenitySnack":         "స్నాక్స్",
  "inside.amenityWake":          "వేక్-అప్ కాల్",
  "inside.amenityTrack":         "లైవ్ ట్రాక్",

  "why.badge":                   "ప్రయాణీకులు మమ్మల్ని ఎందుకు ఎంచుకుంటారు",
  "why.heading":                 "భారతదేశ ప్రయాణ విధానం కోసం నిర్మించబడింది",
  "why.subtitle":                "విమాన సంస్థ యొక్క విశ్వసనీయత, బస్ టికెట్ విలువ.",
  "why.onTime":                  "సమయ హామీ",
  "why.onTimeDesc":              "అన్ని మార్గాల్లో 95% సమయానికి. 45 నిమిషాల కంటే ఆలస్యమైతే డబ్బు వెనక్కి.",
  "why.cancel":                  "ఉచిత రద్దు",
  "why.cancelDesc":              "బయలుదేరడానికి 12 గంటల ముందు వరకు 100% రిఫండ్. తక్షణమే మీ వాలెట్‌లోకి.",
  "why.tracking":                "లైవ్ GPS ట్రాకింగ్",
  "why.trackingDesc":            "మీ బస్సును రియల్-టైమ్‌లో చూడండి. కుటుంబంతో లైవ్ లింక్ షేర్ చేయండి.",
  "why.comfort":                 "ప్రీమియం సౌకర్యం",
  "why.comfortDesc":             "వోల్వో & స్కానియా కోచ్‌లు — AC, బ్లాంకెట్లు, ఛార్జింగ్ పోర్టులు, పఠన లైట్లు.",

  "testimonials.badge":          "50,000+ ప్రయాణాలలో 4.8/5",
  "testimonials.heading":        "ప్రయాణీకులు ఈ ప్రయాణాన్ని ఇష్టపడతారు",
  "testimonials.subtitle":       "చివరి-నిమిషం గందరగోళాన్ని వదిలి సున్నితమైన ప్రయాణాన్ని ఎంచుకున్న వారి నిజమైన కథలు.",

  "loyalty.badge":                "NilaMadhaba RideClub",
  "loyalty.heading":              "మీ 6వ ప్రయాణం మా పక్క నుండి.",
  "loyalty.subtitle":             "ప్రతి బుకింగ్‌పై 5% RideCoins సంపాదించండి. భవిష్యత్ ప్రయాణాలు, సీటు అప్‌గ్రేడ్‌లు, లేదా భోజనంపై రీడీమ్ చేయండి. సభ్యులకు ప్రాధాన్యత బోర్డింగ్ మరియు 24×7 మద్దతు కూడా లభిస్తుంది.",
  "loyalty.joinFree":             "ఉచితంగా చేరండి",
  "loyalty.howItWorks":           "ఎలా పని చేస్తుంది →",
  "loyalty.tripsLabel":           "ప్రయాణాలు",

  "app.badge":                   "యాప్ పొందండి",
  "app.headingPre":              "NilaMadhaba యాప్‌లో",
  "app.headingAccent":           "వేగంగా బుక్ చేయండి.",
  "app.subtitle":                "ఒక ట్యాప్‌లో రీబుక్ · ఆఫ్‌లైన్ బోర్డింగ్ పాస్ · మీ బస్సు 5 కి.మీ. దూరంలో ఉన్నప్పుడు నోటిఫికేషన్లు.",
  "app.appStoreTag":             "డౌన్‌లోడ్ చేయండి",
  "app.appStore":                "App Store",
  "app.playStoreTag":            "ఇక్కడ పొందండి",
  "app.playStore":               "Google Play",
  "app.ratings":                 "★ రెండు స్టోర్లలో 4.9 · 5 లక్షల+ డౌన్‌లోడ్లు",

  "footer.newsletterHeading":    "ఆఫర్ల గురించి ముందుగా తెలుసుకోండి",
  "footer.newsletterSubtitle":   "ఫ్లాష్ సేల్స్, కొత్త మార్గాలు, మరియు ప్రయాణ సూచనలు — స్పామ్ లేదు, ఎప్పుడైనా అన్‌సబ్‌స్క్రైబ్ చేయండి.",
  "footer.emailPlaceholder":     "your@email.com",
  "footer.subscribe":            "సబ్‌స్క్రైబ్",
  "footer.subscribing":          "సబ్‌స్క్రైబ్ అవుతోంది…",
  "footer.subscribed":           "సబ్‌స్క్రైబ్ అయింది!",
  "footer.tagline":              "భారతదేశంలో అత్యంత సౌకర్యవంతమైన ఇంటర్‌సిటీ బస్ సేవ. సురక్షితమైన, విశ్వసనీయమైన, ఆధునిక ప్రయాణీకుల కోసం నిర్మించబడింది.",
  "footer.company":              "కంపెనీ",
  "footer.support":              "మద్దతు",
  "footer.popularRoutes":        "ప్రముఖ మార్గాలు",
  "footer.bookOnGo":             "వెళ్లుతూ బుక్ చేయండి",
  "footer.securePayments":       "సురక్షిత చెల్లింపులు",
  "footer.copyright":            "అన్ని హక్కులు రిజర్వ్.",
  "footer.compliance":           "PCI-DSS అనుగుణ్యత",

  "seat.colourGuide":            "సీటు రంగు గైడ్",
  "seat.available":              "అందుబాటులో",
  "seat.selected":               "ఎంచుకోబడింది",
  "seat.booked":                 "బుక్ చేయబడింది",
  "seat.ladies":                 "మహిళలకు మాత్రమే",
  "seat.driver":                 "డ్రైవర్",
  "seat.lowerDeck":              "కింది డెక్",
  "seat.upperDeck":              "పైన డెక్",
  "seat.mainDeck":               "ప్రధాన డెక్",

  "trip.onTime":                 "సమయానికి",
  "trip.bookedToday":            "ఈ రోజు బుక్ చేశారు",
  "trip.onlyLeft":               "మాత్రమే",
  "trip.left":                   "మిగిలాయి!",
  "trip.seatsLeft":              "సీట్లు మిగిలాయి",
  "trip.seatLeft":               "సీటు మిగిలింది",
  "trip.selectSeats":            "సీట్లను ఎంచుకోండి",
  "trip.hide":                   "దాచు",
  "trip.boardingPoint":          "బోర్డింగ్ పాయింట్",
  "trip.droppingPoint":          "డ్రాపింగ్ పాయింట్",
  "trip.getDirections":          "దిశలను పొందండి",
  "trip.verified":               "ధృవీకరించిన ఆపరేటర్",
  "trip.baseFare":               "ప్రాథమిక ఛార్జీ",
  "trip.gst":                    "GST (5%)",
  "trip.convenience":            "సౌకర్య ఛార్జీ",
  "trip.free":                   "ఉచితం",
  "trip.total":                  "మొత్తం",

  "support.needHand":            "సహాయం కావాలా?",
  "support.pickChat":            "మేము సహాయానికి ఇక్కడ ఉన్నాము — మీరు ఎలా చాట్ చేయాలనుకుంటున్నారో ఎంచుకోండి.",
  "support.nilaAssist":          "Nila Assist",
  "support.aiBadge":             "AI",
  "support.instantAI":           "తక్షణ సమాధానాలు, ఎల్లప్పుడూ ఆన్‌లైన్‌లో",
  "support.whatsapp":             "WhatsApp",
  "support.repsReply":           "మా ప్రతినిధులు నిమిషాల్లో సమాధానమిస్తారు",
  "support.preferCall":          "కాల్ చేయాలని అనుకుంటున్నారా?",
};

// ─── Odia ────────────────────────────────────────────────────────────

const or: Dict = {
  "nav.search":                  "ଖୋଜନ୍ତୁ",
  "nav.myTrips":                 "ମୋର ଯାତ୍ରା",
  "nav.help":                    "ସହାୟତା",
  "nav.login":                   "ଲଗ୍ ଇନ୍",

  "hero.title1":                 "ଆରାମରେ ଯାତ୍ରା କରନ୍ତୁ,",
  "hero.title2":                 "ଶୈଳୀରେ ପହଞ୍ଚନ୍ତୁ",
  "hero.subtitle":               "ସମଗ୍ର ଭାରତରେ ପ୍ରିମିୟମ ଆନ୍ତଃନଗରୀ ବସ୍ ଯାତ୍ରା। ଭୋଲଭୋ ଓ ସ୍କାନିଆ କୋଚ୍, ଲାଇଭ୍ ଟ୍ରାକିଂ, ଏବଂ ସମୟରେ ପହଞ୍ଚିବାର ଗ୍ୟାରେଣ୍ଟି — କିମ୍ବା ଆପଣଙ୍କ ଟଙ୍କା ଫେରସ୍ତ।",
  "hero.rated":                  "ରେଟେଡ୍",
  "hero.travellers":             "ଯାତ୍ରୀ",
  "hero.dailyTrips":             "ଦୈନିକ ଯାତ୍ରା",
  "hero.onTime":                 "ସମୟ ଗ୍ୟାରେଣ୍ଟି",

  "search.from":                 "ଠାରୁ",
  "search.to":                   "ପର୍ଯ୍ୟନ୍ତ",
  "search.date":                 "ଯାତ୍ରା ତାରିଖ",
  "search.cta":                  "ବସ୍ ଖୋଜନ୍ତୁ",
  "search.today":                "ଆଜି",
  "search.tomorrow":             "ଆସନ୍ତାକାଲି",
  "search.trustSsl":             "256-ବିଟ୍ SSL",
  "search.trustFee":             "କୌଣସି ବୁକିଂ ଶୁଳ୍କ ନାହିଁ",
  "search.trustRefund":          "ତତ୍କ୍ଷଣାତ୍ ଫେରସ୍ତ",

  "city.selectFrom":             "ସହର ବାଛନ୍ତୁ",
  "city.selectTo":               "ସହର ବାଛନ୍ତୁ",
  "city.searchCity":             "ସହର ଖୋଜନ୍ତୁ...",
  "city.popularCities":          "ଲୋକପ୍ରିୟ ସହର",
  "city.noCities":               "କୌଣସି ସହର ମିଳିଲା ନାହିଁ",

  "date.title":                  "ଯାତ୍ରା ତାରିଖ",
  "date.pickFromCalendar":       "କ୍ୟାଲେଣ୍ଡରରୁ ବାଛନ୍ତୁ",

  "stats.travellers":            "ଖୁସି ଯାତ୍ରୀ",
  "stats.dailyTrips":            "ଦୈନିକ ଯାତ୍ରା",
  "stats.cities":                "ସଂଯୁକ୍ତ ସହର",
  "stats.onTime":                "ସମୟ ପ୍ରଦର୍ଶନ",

  "howworks.badge":              "କିପରି କାମ କରେ",
  "howworks.heading":            "ଏଠାରୁ ସେଠାକୁ ତିନି ଟ୍ୟାପ୍‌ରେ",
  "howworks.subtitle":           "ଖାତାର ଆବଶ୍ୟକତା ନାହିଁ। କୌଣସି ଲୁକ୍କାୟିତ ଶୁଳ୍କ ନାହିଁ। କୌଣସି ଅପ୍ରତ୍ୟାଶିତ ରୁକାଇବା ନାହିଁ।",
  "howworks.step1Title":         "ଆପଣଙ୍କ ମାର୍ଗ ବାଛନ୍ତୁ",
  "howworks.step1Desc":          "ବେଙ୍ଗାଲୁରୁରୁ ଚେନ୍ନାଇ ରାତି 9 ଟାରେ? ତଳେ ଏକ ପୋଷ୍ଟକାର୍ଡ ଟ୍ୟାପ୍ କରନ୍ତୁ।",
  "howworks.step2Title":         "ସୀଟ୍ ବାଛନ୍ତୁ",
  "howworks.step2Desc":          "ଗୋଟିଏ ଟ୍ୟାପ୍‌ରେ ବସ୍‌ର ଲେଆଉଟ୍ ଦେଖନ୍ତୁ — ଝରକା, ପଥ, ମହିଳା ପାଇଁ ମାତ୍ର।",
  "howworks.step3Title":         "ଦେୟ ଦେଇ ଚଢ଼ନ୍ତୁ",
  "howworks.step3Desc":          "2 ଟ୍ୟାପ୍‌ରେ UPI। E-ଟିକେଟ୍ ତତ୍କ୍ଷଣାତ୍ WhatsApp-ରେ।",

  "routes.section":              "ଲୋକପ୍ରିୟ ମାର୍ଗ",
  "routes.heading":              "କେଉଁଠିକୁ ଯାଉଛନ୍ତି?",
  "routes.subtitle":             "ଦକ୍ଷିଣ ଓ ପଶ୍ଚିମ ଭାରତର ସବୁଠାରୁ ପ୍ରିୟ ମାର୍ଗ — ପ୍ରତ୍ୟେକଟି ଦିନରେ ଅନେକ ଥର ଚାଲେ।",
  "routes.seeAll":               "ସବୁ ମାର୍ଗ ଦେଖନ୍ତୁ",
  "routes.from":                 "ଠାରୁ",

  "inside.badge":                "ପ୍ରତ୍ୟେକ NilaMadhaba ବସ୍ ଭିତରେ",
  "inside.headingPre":           "ଭାରତର",
  "inside.headingAccent":        "ସବୁଠାରୁ ଆରାମଦାୟକ",
  "inside.headingPost":          "ଯାତ୍ରାରେ ଆପଣଙ୍କ ସୀଟ୍।",
  "inside.subtitle":             "ଭୋଲଭୋ B11R ଓ ସ୍କାନିଆ ମଲ୍ଟି-ଆକ୍ସେଲ୍ କୋଚ୍। ପ୍ରତ୍ୟେକ ବସ୍ ପ୍ରତ୍ୟେକ ପ୍ରସ୍ଥାନ ପୂର୍ବରୁ 48-ପଏଣ୍ଟ୍ ସୁରକ୍ଷା ଓ ସ୍ୱଚ୍ଛତା ଯାଞ୍ଚ ପାଏ।",
  "inside.onRoute":              "ବାଟରେ",
  "inside.amenityAC":            "AC ସ୍ଲିପର୍",
  "inside.amenityWifi":          "ୱାଇ-ଫାଇ",
  "inside.amenityCharge":        "ଚାର୍ଜିଂ ପଏଣ୍ଟ୍",
  "inside.amenitySnack":         "ଖାଇବା",
  "inside.amenityWake":          "ଉଠେଇବା କଲ୍",
  "inside.amenityTrack":         "ଲାଇଭ୍ ଟ୍ରାକ୍",

  "why.badge":                   "ଯାତ୍ରୀମାନେ କାହିଁକି ଆମକୁ ବାଛନ୍ତି",
  "why.heading":                 "ଭାରତର ଯାତ୍ରା ଶୈଳୀ ପାଇଁ ନିର୍ମିତ",
  "why.subtitle":                "ଏୟାରଲାଇନ୍‌ର ବିଶ୍ୱସନୀୟତା, ବସ୍ ଟିକେଟର ମୂଲ୍ୟ।",
  "why.onTime":                  "ସମୟ ଗ୍ୟାରେଣ୍ଟି",
  "why.onTimeDesc":              "ସବୁ ମାର୍ଗରେ 95% ସମୟରେ। 45 ମିନିଟ୍‌ରୁ ଅଧିକ ବିଳମ୍ବ ହେଲେ ଟଙ୍କା ଫେରସ୍ତ।",
  "why.cancel":                  "ମାଗଣା କ୍ୟାନ୍‌ସେଲ୍",
  "why.cancelDesc":              "ପ୍ରସ୍ଥାନର 12 ଘଣ୍ଟା ପୂର୍ବରୁ 100% ଫେରସ୍ତ। ତତ୍କ୍ଷଣାତ୍ ଆପଣଙ୍କ ୱାଲେଟ୍‌ରେ।",
  "why.tracking":                "ଲାଇଭ୍ GPS ଟ୍ରାକିଂ",
  "why.trackingDesc":            "ଆପଣଙ୍କ ବସ୍‌କୁ ରିଆଲ୍-ଟାଇମ୍‌ରେ ଦେଖନ୍ତୁ। ପରିବାର ସହ ଲାଇଭ୍ ଲିଙ୍କ୍ ଶେୟାର୍ କରନ୍ତୁ।",
  "why.comfort":                 "ପ୍ରିମିୟମ ଆରାମ",
  "why.comfortDesc":             "ଭୋଲଭୋ ଓ ସ୍କାନିଆ କୋଚ୍ — AC, କମ୍ବଳ, ଚାର୍ଜିଂ ପୋର୍ଟ, ପଠନ ଆଲୁଅ।",

  "testimonials.badge":          "50,000+ ଯାତ୍ରାରେ 4.8/5",
  "testimonials.heading":        "ଯାତ୍ରୀମାନେ ଏ ଯାତ୍ରାକୁ ଭଲ ପାଆନ୍ତି",
  "testimonials.subtitle":       "ଶେଷ-ମୁହୂର୍ତର ବିଶୃଙ୍ଖଳାକୁ ଛାଡ଼ି ସୁଗମ ଯାତ୍ରା ବାଛିଥିବା ଲୋକଙ୍କ ପ୍ରକୃତ କାହାଣୀ।",

  "loyalty.badge":                "NilaMadhaba RideClub",
  "loyalty.heading":              "ଆପଣଙ୍କ 6ଷ୍ଠ ଯାତ୍ରା ଆମ ପକ୍ଷରୁ।",
  "loyalty.subtitle":             "ପ୍ରତ୍ୟେକ ବୁକିଂରେ 5% RideCoins ଅର୍ଜନ କରନ୍ତୁ। ଭବିଷ୍ୟତ ଯାତ୍ରା, ସୀଟ୍ ଅପଗ୍ରେଡ, ବା ଖାଦ୍ୟରେ ବ୍ୟବହାର କରନ୍ତୁ। ସଦସ୍ୟମାନଙ୍କୁ ପ୍ରାଥମିକତା ବୋର୍ଡିଂ ଓ 24×7 ସହାୟତା ମଧ୍ୟ ମିଳିଥାଏ।",
  "loyalty.joinFree":             "ମାଗଣା ଯୋଗ ଦିଅନ୍ତୁ",
  "loyalty.howItWorks":           "କିପରି କାମ କରେ →",
  "loyalty.tripsLabel":           "ଯାତ୍ରା",

  "app.badge":                   "ଆପ୍ ପାଆନ୍ତୁ",
  "app.headingPre":              "NilaMadhaba ଆପ୍‌ରେ",
  "app.headingAccent":           "ଶୀଘ୍ର ବୁକ୍ କରନ୍ତୁ।",
  "app.subtitle":                "ଗୋଟିଏ ଟ୍ୟାପ୍‌ରେ ପୁନର୍ବୁକ୍ · ଅଫଲାଇନ ବୋର୍ଡିଂ ପାସ୍ · ବସ୍ 5 କିମି ଦୂରରେ ଥିଲାବେଳେ ପୁଶ୍ ସୂଚନା।",
  "app.appStoreTag":             "ଡାଉନଲୋଡ୍ କରନ୍ତୁ",
  "app.appStore":                "App Store",
  "app.playStoreTag":            "ଏଠାରୁ ପାଆନ୍ତୁ",
  "app.playStore":               "Google Play",
  "app.ratings":                 "★ ଦୁଇ ଷ୍ଟୋର୍‌ରେ 4.9 · 5 ଲକ୍ଷ+ ଡାଉନଲୋଡ୍",

  "footer.newsletterHeading":    "ଅଫର ଜାଣିବାରେ ପ୍ରଥମ ହୁଅନ୍ତୁ",
  "footer.newsletterSubtitle":   "ଫ୍ଲାସ୍ ସେଲ୍, ନୂଆ ମାର୍ଗ, ଓ ଯାତ୍ରା ସୂଚନା — କୌଣସି ସ୍ପାମ ନାହିଁ, ଯେକୌଣସି ସମୟରେ ଅନସବ୍‌ସ୍କ୍ରାଇବ୍ କରନ୍ତୁ।",
  "footer.emailPlaceholder":     "your@email.com",
  "footer.subscribe":            "ସବ୍‌ସ୍କ୍ରାଇବ୍",
  "footer.subscribing":          "ସବ୍‌ସ୍କ୍ରାଇବ୍ ହେଉଛି…",
  "footer.subscribed":           "ସବ୍‌ସ୍କ୍ରାଇବ୍ ହୋଇଛି!",
  "footer.tagline":              "ଭାରତର ସବୁଠାରୁ ଆରାମଦାୟକ ଆନ୍ତଃନଗରୀ ବସ୍ ସେବା। ସୁରକ୍ଷିତ, ବିଶ୍ୱସନୀୟ, ଆଧୁନିକ ଯାତ୍ରୀଙ୍କ ପାଇଁ ନିର୍ମିତ।",
  "footer.company":              "କମ୍ପାନୀ",
  "footer.support":              "ସହାୟତା",
  "footer.popularRoutes":        "ଲୋକପ୍ରିୟ ମାର୍ଗ",
  "footer.bookOnGo":             "ଚଳୁଥିବା ସମୟରେ ବୁକ୍ କରନ୍ତୁ",
  "footer.securePayments":       "ସୁରକ୍ଷିତ ଦେୟ",
  "footer.copyright":            "ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ।",
  "footer.compliance":           "PCI-DSS ଅନୁରୂପ",

  "seat.colourGuide":            "ସୀଟ୍ ରଙ୍ଗ ଗାଇଡ୍",
  "seat.available":              "ଉପଲବ୍ଧ",
  "seat.selected":               "ଚୟନିତ",
  "seat.booked":                 "ବୁକ୍",
  "seat.ladies":                 "ମହିଳା ପାଇଁ ମାତ୍ର",
  "seat.driver":                 "ଚାଳକ",
  "seat.lowerDeck":              "ତଳ ଡେକ୍",
  "seat.upperDeck":              "ଉପର ଡେକ୍",
  "seat.mainDeck":               "ମୁଖ୍ୟ ଡେକ୍",

  "trip.onTime":                 "ସମୟରେ",
  "trip.bookedToday":            "ଆଜି ବୁକ୍ କରିଛନ୍ତି",
  "trip.onlyLeft":               "କେବଳ",
  "trip.left":                   "ଅବଶିଷ୍ଟ!",
  "trip.seatsLeft":              "ସୀଟ୍ ଅବଶିଷ୍ଟ",
  "trip.seatLeft":               "ସୀଟ୍ ଅବଶିଷ୍ଟ",
  "trip.selectSeats":            "ସୀଟ୍ ବାଛନ୍ତୁ",
  "trip.hide":                   "ଲୁଚାନ୍ତୁ",
  "trip.boardingPoint":          "ବୋର୍ଡିଂ ପଏଣ୍ଟ୍",
  "trip.droppingPoint":          "ଡ୍ରପିଂ ପଏଣ୍ଟ୍",
  "trip.getDirections":          "ଦିଗନିର୍ଦ୍ଦେଶ ପାଆନ୍ତୁ",
  "trip.verified":               "ଯାଞ୍ଚିତ ଅପରେଟର୍",
  "trip.baseFare":               "ମୂଳ ଭଡା",
  "trip.gst":                    "GST (5%)",
  "trip.convenience":            "ସୁବିଧା ଶୁଳ୍କ",
  "trip.free":                   "ମାଗଣା",
  "trip.total":                  "ମୋଟ",

  "support.needHand":            "ସାହାଯ୍ୟ ଦରକାର?",
  "support.pickChat":            "ଆମେ ସାହାଯ୍ୟ ପାଇଁ ଅଛୁ — କିପରି ଚାଟ୍ କରିବେ ବାଛନ୍ତୁ।",
  "support.nilaAssist":          "Nila Assist",
  "support.aiBadge":             "AI",
  "support.instantAI":           "ତତ୍କ୍ଷଣାତ୍ ଉତ୍ତର, ସର୍ବଦା ଅନଲାଇନ୍",
  "support.whatsapp":            "WhatsApp",
  "support.repsReply":           "ଆମ ପ୍ରତିନିଧିମାନେ ମିନିଟ୍‌ରେ ଉତ୍ତର ଦିଅନ୍ତି",
  "support.preferCall":          "କଲ୍ କରିବାକୁ ଚାହାଁନ୍ତି?",
};

const dicts: Record<Locale, Dict> = { en, hi, bn, ta, te, or };

// ─── Context ──────────────────────────────────────────────────────────

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);
const STORAGE_KEY = "nilamadhaba_locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && dicts[saved]) setLocaleState(saved);
    } catch {
      /* SSR / storage blocked */
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
    return { locale: "en", setLocale: () => {}, t: (k) => en[k] ?? k };
  }
  return v;
}

export function useT() {
  return useI18n().t;
}
