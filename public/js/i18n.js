// public/js/i18n.js - Multilingual dictionary for English, Telugu, and Hindi
const translations = {
  en: {
    appName: 'AgriPool Platform',
    heroTitle: 'Turning Small Farm Lots into Stronger Market Access',
    heroSubtitle: 'Digitally aggregate, manage, move and settle fragmented agricultural produce through trusted local networks.',
    myLots: 'My Lots',
    myPools: 'My Pools',
    payments: 'Payments & Receipts',
    pickupStatus: 'Pickup Status',
    onboardFarmer: 'Onboard Farmer',
    createLot: 'Create Lot',
    weighProduce: 'Digital Weighing',
    poolProduce: 'Pooling Engine',
    settlementLedger: 'Settlement Ledger',
    grossSale: 'Gross Sale',
    netSettlement: 'Net Settlement',
    verified: 'Verified',
    paid: 'Paid Directly to Bank',
    pending: 'Pending',
    speakStatus: 'Read Status Out Loud'
  },
  te: {
    appName: 'అగ్రిపూల్ వేదిక (AgriPool)',
    heroTitle: 'చిన్న రైతు కమతాలకు మెరుగైన మార్కెట్ మరియు గిట్టుబాటు ధర',
    heroSubtitle: 'రైతుల ఉత్పత్తులను డిజిటల్ పూలింగ్ ద్వారా సమీకరించి, సురక్షిత రవాణా మరియు పారదర్శక చెల్లింపులు అందించే వేదిక.',
    myLots: 'నా పంట లాట్లు',
    myPools: 'నా పూలింగ్ గ్రూపులు',
    payments: 'బ్యాంకు జమ & రశీదులు',
    pickupStatus: 'రవాణా / పికప్ స్థితి',
    onboardFarmer: 'రైతు నమోదు',
    createLot: 'కొత్త పంట లాట్ నమోదు',
    weighProduce: 'డిజిటల్ కాటా తూకం',
    poolProduce: 'పూలింగ్ ఇంజిన్',
    settlementLedger: 'చెల్లింపుల లెక్కల పుస్తకం',
    grossSale: 'మొత్తం అమ్మకం విలువ',
    netSettlement: 'రైతుకు నికర చెల్లింపు',
    verified: 'ధృవీకరించబడింది',
    paid: 'బ్యాంకు ఖాతాలో జమ అయింది',
    pending: 'వేచి ఉంది',
    speakStatus: 'వివరాలు చదివి వినిపించు'
  },
  hi: {
    appName: 'एग्रीपूल प्लेटफॉर्म (AgriPool)',
    heroTitle: 'छोटे किसान लॉट को मजबूत बाजार पहुंच में बदलना',
    heroSubtitle: 'स्थानीय एफपीओ नेटवर्क के माध्यम से उपज को डिजिटल रूप से एकत्रित, प्रबंधित, परिवहन और पारदर्शी रूप से व्यवस्थित करें।',
    myLots: 'मेरी फसल लॉट',
    myPools: 'मेरे पूलिंग समूह',
    payments: 'भुगतान और रसीदें',
    pickupStatus: 'पिकअप और ढुलाई स्थिति',
    onboardFarmer: 'किसान पंजीकरण',
    createLot: 'नया लॉट बनाएं',
    weighProduce: 'डिजिटल वजन और ग्रेडिंग',
    poolProduce: 'पूलिंग इंजन',
    settlementLedger: 'पारदर्शी सेटलमेंट बहीखाता',
    grossSale: 'कुल बिक्री मूल्य',
    netSettlement: 'किसान का शुद्ध भुगतान',
    verified: 'सत्यापित',
    paid: 'बैंक खाते में हस्तांतरित',
    pending: 'प्रक्रियाधीन',
    speakStatus: 'विवरण बोलकर सुनाएं'
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('agripool_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang][key]) {
        el.textContent = translations[currentLang][key];
      }
    });
  }
}

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations['en'][key] || key;
}

// Web Speech API Voice synthesizer for assisted farmer accessibility
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert('Voice narration is not supported on this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  if (currentLang === 'hi') utterance.lang = 'hi-IN';
  else if (currentLang === 'te') utterance.lang = 'te-IN';
  else utterance.lang = 'en-IN';
  window.speechSynthesis.speak(utterance);
}

window.i18n = { setLanguage, t, speakText, getLang: () => currentLang };
