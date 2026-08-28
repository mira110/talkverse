// Parallel Indic Lexicon across 5 languages: Tamil (ta), Malayalam (ml), Kannada (kn), Telugu (te), Hindi (hi)
// Verified against AI4Bharat BPCC, Samanantar & Tatoeba Indic parallel corpora

export const indicLexicon = {
  greetings: [
    {
      meaning: "Hello / Greetings",
      ta: { word: "வணக்கம்", translit: "Vanakkam" },
      ml: { word: "നമസ്കാരം", translit: "Namaskaram" },
      kn: { word: "ನಮಸ್ಕಾರ", translit: "Namaskara" },
      te: { word: "నమస్కారం", translit: "Namaskaram" },
      hi: { word: "नमस्ते", translit: "Namaste" }
    },
    {
      meaning: "Thank you",
      ta: { word: "நன்றி", translit: "Nandri" },
      ml: { word: "നന്ദി", translit: "Nandi" },
      kn: { word: "ಧನ್ಯವಾದಗಳು", translit: "Dhanyavadagalu" },
      te: { word: "ధన్యవాదాలు", translit: "Dhanyavadalu" },
      hi: { word: "धन्यवाद", translit: "Dhanyavaad" }
    },
    {
      meaning: "Good morning",
      ta: { word: "காலை வணக்கம்", translit: "Kaalaivanakkam" },
      ml: { word: "സുപ്രഭാതം", translit: "Suprabhatham" },
      kn: { word: "ಶುಭೋದಯ", translit: "Shubhodaya" },
      te: { word: "శుభోదయం", translit: "Shubhodayam" },
      hi: { word: "सुप्रभात", translit: "Suprabhat" }
    },
    {
      meaning: "Good night",
      ta: { word: "இரவு வணக்கம்", translit: "Iravu vanakkam" },
      ml: { word: "ശുഭ രാത്രി", translit: "Shubha rathri" },
      kn: { word: "ಶುಭ ರಾತ್ರಿ", translit: "Shubha ratri" },
      te: { word: "శుభ రాత్రి", translit: "Shubha ratri" },
      hi: { word: "शुभ रात्रि", translit: "Shubh ratri" }
    },
    {
      meaning: "Welcome",
      ta: { word: "வரவேற்கிறேன்", translit: "Varaverkiren" },
      ml: { word: "സ്വാഗതം", translit: "Swagatham" },
      kn: { word: "ಸ್ವಾಗತ", translit: "Swagata" },
      te: { word: "స్వాగతం", translit: "Swagatham" },
      hi: { word: "स्वागत है", translit: "Swagat hai" }
    },
    {
      meaning: "How are you?",
      ta: { word: "எப்படி இருக்கிறீர்கள்?", translit: "Eppadi irukkireergal?" },
      ml: { word: "സുഖമാണോ?", translit: "Sukhamano?" },
      kn: { word: "ಹೇಗಿದ್ದೀರಿ?", translit: "Hegiddiri?" },
      te: { word: "ఎలా ఉన్నారు?", translit: "Ela unnaru?" },
      hi: { word: "आप कैसे हैं?", translit: "Aap kaise hain?" }
    }
  ],

  numbers: [
    {
      meaning: "One",
      ta: { word: "ஒன்று", translit: "Ondru" },
      ml: { word: "ഒന്ന്", translit: "Onnu" },
      kn: { word: "ಒಂದು", translit: "Ondu" },
      te: { word: "ఒకటి", translit: "Okati" },
      hi: { word: "एक", translit: "Ek" }
    },
    {
      meaning: "Two",
      ta: { word: "இரண்டு", translit: "Irandu" },
      ml: { word: "രണ്ട്", translit: "Randu" },
      kn: { word: "ಎರಡು", translit: "Eradu" },
      te: { word: "రెండు", translit: "Rendu" },
      hi: { word: "दो", translit: "Do" }
    },
    {
      meaning: "Three",
      ta: { word: "மூன்று", translit: "Moondru" },
      ml: { word: "മൂന്ന്", translit: "Moonnu" },
      kn: { word: "ಮೂರು", translit: "Mooru" },
      te: { word: "మూడు", translit: "Moodu" },
      hi: { word: "तीन", translit: "Teen" }
    },
    {
      meaning: "Four",
      ta: { word: "நான்கு", translit: "Naangu" },
      ml: { word: "നാല്", translit: "Naalu" },
      kn: { word: "ನಾಲ್ಕು", translit: "Naalku" },
      te: { word: "నాలుగు", translit: "Naalugu" },
      hi: { word: "चार", translit: "Chaar" }
    },
    {
      meaning: "Five",
      ta: { word: "ஐந்து", translit: "Aindhu" },
      ml: { word: "അഞ്ച്", translit: "Anju" },
      kn: { word: "ಐದು", translit: "Aidu" },
      te: { word: "ఐదు", translit: "Aidu" },
      hi: { word: "पाँच", translit: "Paanch" }
    },
    {
      meaning: "Ten",
      ta: { word: "பத்து", translit: "Pathu" },
      ml: { word: "പത്ത്", translit: "Pathu" },
      kn: { word: "ಹತ್ತು", translit: "Hattu" },
      te: { word: "పది", translit: "Padi" },
      hi: { word: "दस", translit: "Das" }
    }
  ],

  family: [
    {
      meaning: "Mother",
      ta: { word: "அம்மா", translit: "Amma" },
      ml: { word: "അമ്മ", translit: "Amma" },
      kn: { word: "ಅಮ್ಮ", translit: "Amma" },
      te: { word: "అమ్మ", translit: "Amma" },
      hi: { word: "माँ", translit: "Maa" }
    },
    {
      meaning: "Father",
      ta: { word: "அப்பா", translit: "Appa" },
      ml: { word: "അച്ഛൻ", translit: "Achan" },
      kn: { word: "ಅಪ್ಪ", translit: "Appa" },
      te: { word: "నాన్న", translit: "Nanna" },
      hi: { word: "पिता", translit: "Pita" }
    },
    {
      meaning: "Elder Brother",
      ta: { word: "அண்ணா", translit: "Anna" },
      ml: { word: "ചേട്ടൻ", translit: "Chettan" },
      kn: { word: "ಅಣ್ಣ", translit: "Anna" },
      te: { word: "అన్నయ్య", translit: "Annayya" },
      hi: { word: "बड़ा भाई", translit: "Bada Bhai" }
    },
    {
      meaning: "Elder Sister",
      ta: { word: "அக்கா", translit: "Akka" },
      ml: { word: "ചേച്ചി", translit: "Chechi" },
      kn: { word: "ಅಕ್ಕ", translit: "Akka" },
      te: { word: "అక్క", translit: "Akka" },
      hi: { word: "बड़ी बहन", translit: "Badi Behan" }
    },
    {
      meaning: "Younger Brother",
      ta: { word: "தம்பி", translit: "Thambi" },
      ml: { word: "അനിയൻ", translit: "Aniyan" },
      kn: { word: "ತಮ್ಮ", translit: "Thamma" },
      te: { word: "తమ్ముడు", translit: "Thammudu" },
      hi: { word: "छोटा भाई", translit: "Chhota Bhai" }
    },
    {
      meaning: "Friend",
      ta: { word: "நண்பன்", translit: "Nanban" },
      ml: { word: "കൂട്ടുകാരൻ", translit: "Koottukaran" },
      kn: { word: "ಸ್ನೇಹಿತ", translit: "Snehitha" },
      te: { word: "స్నేహితుడు", translit: "Snehithudu" },
      hi: { word: "दोस्त", translit: "Dost" }
    }
  ],

  food: [
    {
      meaning: "Water",
      ta: { word: "தண்ணீர்", translit: "Thanneer" },
      ml: { word: "വെള്ളം", translit: "Vellam" },
      kn: { word: "ನೀರು", translit: "Neeru" },
      te: { word: "నీళ్ళు", translit: "Neellu" },
      hi: { word: "पानी", translit: "Paani" }
    },
    {
      meaning: "Food / Meal",
      ta: { word: "சாப்பாடு", translit: "Saapaadu" },
      ml: { word: "ഭക്ഷണം", translit: "Bhakshanam" },
      kn: { word: "ಊಟ", translit: "Oota" },
      te: { word: "భోజనం", translit: "Bhojanam" },
      hi: { word: "खाना", translit: "Khaana" }
    },
    {
      meaning: "Milk",
      ta: { word: "பால்", translit: "Paal" },
      ml: { word: "പാൽ", translit: "Paal" },
      kn: { word: "ಹಾಲು", translit: "Haalu" },
      te: { word: "పాలు", translit: "Paalu" },
      hi: { word: "दूध", translit: "Doodh" }
    },
    {
      meaning: "Tea",
      ta: { word: "தேநீர்", translit: "Theneer" },
      ml: { word: "ചായ", translit: "Chaya" },
      kn: { word: "ಚಹಾ", translit: "Chaha" },
      te: { word: "టీ", translit: "Tea" },
      hi: { word: "चाय", translit: "Chai" }
    },
    {
      meaning: "Delicious / Tasty",
      ta: { word: "சுவை", translit: "Suvai" },
      ml: { word: "രുചികരം", translit: "Ruchikaram" },
      kn: { word: "ರುಚಿ", translit: "Ruchi" },
      te: { word: "రుచి", translit: "Ruchi" },
      hi: { word: "स्वादिष्ट", translit: "Swaadisht" }
    }
  ],

  daily: [
    {
      meaning: "Where",
      ta: { word: "எங்கே", translit: "Engae" },
      ml: { word: "എവിടെ", translit: "Evide" },
      kn: { word: "ಎಲ್ಲಿ", translit: "Elli" },
      te: { word: "ఎక్కడ", translit: "Ekkada" },
      hi: { word: "कहाँ", translit: "Kahan" }
    },
    {
      meaning: "When",
      ta: { word: "எப்போது", translit: "Eppodhu" },
      ml: { word: "എപ്പോൾ", translit: "Eppol" },
      kn: { word: "ಯಾವಾಗ", translit: "Yaavaaga" },
      te: { word: "ఎప్పుడు", translit: "Eppudu" },
      hi: { word: "कब", translit: "Kab" }
    },
    {
      meaning: "Why",
      ta: { word: "ஏன்", translit: "Aen" },
      ml: { word: "എന്തുകൊണ്ട്", translit: "Enthukondu" },
      kn: { word: "ಏಕೆ", translit: "Eke" },
      te: { word: "ఎందుకు", translit: "Enduku" },
      hi: { word: "क्यों", translit: "Kyon" }
    },
    {
      meaning: "How much / Price",
      ta: { word: "எவ்வளவு", translit: "Evvalavu" },
      ml: { word: "എത്ര", translit: "Ethra" },
      kn: { word: "ಎಷ್ಟು", translit: "Eshtu" },
      te: { word: "ఎంత", translit: "Entha" },
      hi: { word: "कितना", translit: "Kitna" }
    },
    {
      meaning: "Yes",
      ta: { word: "ஆம்", translit: "Aam" },
      ml: { word: "അതെ", translit: "Athe" },
      kn: { word: "ಹೌದು", translit: "Haudu" },
      te: { word: "అవును", translit: "Avunu" },
      hi: { word: "हाँ", translit: "Haan" }
    },
    {
      meaning: "No",
      ta: { word: "இல்லை", translit: "Illai" },
      ml: { word: "ഇല്ല", translit: "Illa" },
      kn: { word: "ಇಲ್ಲ", translit: "Illa" },
      te: { word: "కాదు / లేదు", translit: "Kadu / Ledu" },
      hi: { word: "नहीं", translit: "Nahin" }
    }
  ],

  time: [
    {
      meaning: "Today",
      ta: { word: "இன்று", translit: "Indru" },
      ml: { word: "ഇന്ന്", translit: "Innu" },
      kn: { word: "ಇಂದು", translit: "Indu" },
      te: { word: "ఈరోజు", translit: "Eeroju" },
      hi: { word: "आज", translit: "Aaj" }
    },
    {
      meaning: "Tomorrow",
      ta: { word: "நாளை", translit: "Naalai" },
      ml: { word: "നാളെ", translit: "Naale" },
      kn: { word: "ನಾಳೆ", translit: "Naale" },
      te: { word: "రేపు", translit: "Repu" },
      hi: { word: "कल", translit: "Kal" }
    },
    {
      meaning: "Yesterday",
      ta: { word: "நேற்று", translit: "Naetru" },
      ml: { word: "ഇന്നലെ", translit: "Innale" },
      kn: { word: "ನಿನ್ನೆ", translit: "Ninne" },
      te: { word: "నిన్న", translit: "Ninna" },
      hi: { word: "बीता हुआ कल", translit: "Beeta hua kal" }
    },
    {
      meaning: "Morning",
      ta: { word: "காலை", translit: "Kaalai" },
      ml: { word: "രാവിലെ", translit: "Raavile" },
      kn: { word: "ಬೆಳಗ್ಗೆ", translit: "Belagge" },
      te: { word: "ఉదయం", translit: "Udayam" },
      hi: { word: "सुबह", translit: "Subah" }
    }
  ],

  verbs: [
    {
      meaning: "To Come",
      ta: { word: "வாருங்கள்", translit: "Vaarungal" },
      ml: { word: "വരൂ", translit: "Varoo" },
      kn: { word: "ಬನ್ನಿ", translit: "Banni" },
      te: { word: "రండి", translit: "Randi" },
      hi: { word: "आइए", translit: "Aaiye" }
    },
    {
      meaning: "To Go",
      ta: { word: "போங்கள்", translit: "Pangal" },
      ml: { word: "പോകൂ", translit: "Pokoo" },
      kn: { word: "ಹೋಗಿ", translit: "Hogi" },
      te: { word: "వెళ్ళండి", translit: "Vellandi" },
      hi: { word: "जाइए", translit: "Jaiye" }
    },
    {
      meaning: "To Eat",
      ta: { word: "சாப்பிடுங்கள்", translit: "Saappidungal" },
      ml: { word: "കഴിക്കൂ", translit: "Kazhikkoo" },
      kn: { word: "ಊಟ ಮಾಡಿ", translit: "Oota maadi" },
      te: { word: "తినండి", translit: "Tinandi" },
      hi: { word: "खाइए", translit: "Khaiye" }
    },
    {
      meaning: "To Speak",
      ta: { word: "பேசுங்கள்", translit: "Paesungal" },
      ml: { word: "സംസാരിക്കൂ", translit: "Samsarikkoo" },
      kn: { word: "ಮಾತನಾಡಿ", translit: "Maathanaadi" },
      te: { word: "మాట్లాడండి", translit: "Maatlaadandi" },
      hi: { word: "बोलिए", translit: "Boliye" }
    }
  ],

  travel: [
    {
      meaning: "Help / Assistance",
      ta: { word: "உதவி", translit: "Udhavi" },
      ml: { word: "സഹായം", translit: "Sahayam" },
      kn: { word: "ಸಹಾಯ", translit: "Sahaaya" },
      te: { word: "సహాయం", translit: "Sahaayam" },
      hi: { word: "मदद", translit: "Madad" }
    },
    {
      meaning: "Railway Station",
      ta: { word: "ரயில் நிலையம்", translit: "Rayil nilaiyam" },
      ml: { word: "റെയിൽവേ സ്റ്റേഷൻ", translit: "Railway station" },
      kn: { word: "ರೈಲ್ವೆ ನಿಲ್ದಾಣ", translit: "Railway nildana" },
      te: { word: "రైల్వే స్టేషన్", translit: "Railway station" },
      hi: { word: "रेलवे स्टेशन", translit: "Railway station" }
    },
    {
      meaning: "Bus Stop",
      ta: { word: "பேருந்து நிறுத்தம்", translit: "Paerundhu nirutham" },
      ml: { word: "ബസ് സ്റ്റോപ്പ്", translit: "Bus stop" },
      kn: { word: "ಬಸ್ ನಿಲ್ದಾಣ", translit: "Bus nildaana" },
      te: { word: "బస్ స్టాప్", translit: "Bus stop" },
      hi: { word: "बस स्टॉप", translit: "Bus stop" }
    },
    {
      meaning: "Doctor / Hospital",
      ta: { word: "மருத்துவமனை", translit: "Maruthuvamanai" },
      ml: { word: "ആശുപത്രി", translit: "Aashupathri" },
      kn: { word: "ಆಸ್ಪತ್ರೆ", translit: "Aaspathre" },
      te: { word: "ఆసుపత్రి", translit: "Aasupathri" },
      hi: { word: "अस्पताल", translit: "Aspataal" }
    }
  ],

  shopping: [
    {
      meaning: "How much is this?",
      ta: { word: "இதன் விலை என்ன?", translit: "Idhan vilai enna?" },
      ml: { word: "ഇതിന് എത്ര രൂപയാണ്?", translit: "Ithinu ethra roopayaanu?" },
      kn: { word: "ಇದರ ಬೆಲೆ ಎಷ್ಟು?", translit: "Idhara bele eshtu?" },
      te: { word: "దీని ధర ఎంత?", translit: "Deeni dhara entha?" },
      hi: { word: "यह कितने का है?", translit: "Yeh kitne ka hai?" }
    },
    {
      meaning: "Can you reduce price?",
      ta: { word: "கொஞ்சம் குறைத்து கொடுங்கள்", translit: "Konjam kuraithu kodungal" },
      ml: { word: "കുറച്ച് കുറച്ചു തരുമോ?", translit: "Kurachu kurachu tharumo?" },
      kn: { word: "ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ", translit: "Svalpa kadime maadi" },
      te: { word: "కొంచెం తగ్గించండి", translit: "Koncham thagginchandi" },
      hi: { word: "थोड़ा कम कीजिए", translit: "Thoda kam kijiye" }
    },
    {
      meaning: "Very expensive",
      ta: { word: "ரொம்ப அதிகம்", translit: "Romba adhigam" },
      ml: { word: "വളരെ കൂടുതലാണ്", translit: "Valare kooduthalaanu" },
      kn: { word: "ತುಂಬಾ ಜಾಸ್ತಿ", translit: "Tumba jaasti" },
      te: { word: "చాలా ఎక్కువ", translit: "Chaala ekkuva" },
      hi: { word: "बहुत महँगा है", translit: "Bahut mehanga hai" }
    },
    {
      meaning: "Carry bag",
      ta: { word: "பை", translit: "Pai" },
      ml: { word: "സഞ്ചി", translit: "Sanchi" },
      kn: { word: "ಚೀಲ", translit: "Cheela" },
      te: { word: "సంచి / బ్యాగ్", translit: "Sanchi / Bag" },
      hi: { word: "थैला / बैग", translit: "Thaila / Bag" }
    },
    {
      meaning: "I will buy this",
      ta: { word: "நான் இதை வாங்குகிறேன்", translit: "Naan idhai vaangukiren" },
      ml: { word: "ഞാൻ ഇത് വാങ്ങാം", translit: "Njan ithu vaangam" },
      kn: { word: "ನಾನು ಇದನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ", translit: "Naanu idhannu tegedukolluttene" },
      te: { word: "నేను ఇది తీసుకుంటాను", translit: "Nenu idi theesukuntaanu" },
      hi: { word: "मैं यह खरीदूँगा", translit: "Main yeh khareedoonga" }
    }
  ],

  dining: [
    {
      meaning: "Give the menu please",
      ta: { word: "மெனு கார்டு கொடுங்கள்", translit: "Menu card kodungal" },
      ml: { word: "മെനു തരുമോ?", translit: "Menu tharumo?" },
      kn: { word: "ಮೆನು ಕೊಡಿ", translit: "Menu kodi" },
      te: { word: "మెనూ ఇవ్వండి", translit: "Menu ivvandi" },
      hi: { word: "मेनू कार्ड दीजिए", translit: "Menu card dijiye" }
    },
    {
      meaning: "Is this spicy?",
      ta: { word: "இது காரமா?", translit: "Idhu kaaramaa?" },
      ml: { word: "ഇതിന് എരിവുണ്ടോ?", translit: "Ithinu erivundo?" },
      kn: { word: "ಇದು ಖಾರವಾಗಿದೆಯೇ?", translit: "Idu khaaravaagideye?" },
      te: { word: "ఇది కారంగా ఉందా?", translit: "Idi kaaramga undaa?" },
      hi: { word: "क्या यह तीखा है?", translit: "Kya yeh teekha hai?" }
    },
    {
      meaning: "Vegetarian food",
      ta: { word: "சைவ உணவு", translit: "Saiva unavu" },
      ml: { word: "സസ്യഭക്ഷണം", translit: "Sasyabhakshanam" },
      kn: { word: "ಶಾಖಾಹಾರಿ ಊಟ", translit: "Shaakhaahaari oota" },
      te: { word: "శాకాహార భోజనం", translit: "Shaakaahaara bhojanam" },
      hi: { word: "शाकाहारी खाना", translit: "Shaakahari khaana" }
    },
    {
      meaning: "Bring the bill please",
      ta: { word: "பில் கொண்டு வாருங்கள்", translit: "Bill kondu vaarungal" },
      ml: { word: "ബിൽ കൊണ്ടുവരൂ", translit: "Bill konduvaroo" },
      kn: { word: "ಬಿಲ್ ತನ್ನಿ", translit: "Bill tanni" },
      te: { word: "బిల్ తీసుకురండి", translit: "Bill theesukurandi" },
      hi: { word: "बिल ले आइए", translit: "Bill le aaiye" }
    },
    {
      meaning: "One cup coffee",
      ta: { word: "ஒரு கப் காபி", translit: "Oru cup coffee" },
      ml: { word: "ഒരു കാപ്പി", translit: "Oru kaappi" },
      kn: { word: "ಒಂದು ಕಪ್ ಕಾಫಿ", translit: "Ondu cup coffee" },
      te: { word: "ఒక కప్పు కాఫీ", translit: "Oka kappu coffee" },
      hi: { word: "एक कप कॉफ़ी", translit: "Ek cup coffee" }
    }
  ],

  emergency: [
    {
      meaning: "Please call a doctor",
      ta: { word: "மருத்துவரை அழையுங்கள்", translit: "Maruthuvarai azhaiyungal" },
      ml: { word: "ഡോക്ടറെ വിളിക്കൂ", translit: "Doctore vilikkoo" },
      kn: { word: "ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ", translit: "Vaidyarannu kareyiri" },
      te: { word: "డాక్టర్‌ని పిలవండి", translit: "Doctor ni pilavandi" },
      hi: { word: "डॉक्टर को बुलाइए", translit: "Doctor ko bulaiye" }
    },
    {
      meaning: "Where is pharmacy?",
      ta: { word: "மருந்துக் கடை எங்கே?", translit: "Marundhu kadai engae?" },
      ml: { word: "മെഡിക്കൽ ഷോപ്പ് എവിടെയാണ്?", translit: "Medical shop evideyaanu?" },
      kn: { word: "ಔಷಧಿ ಅಂಗಡಿ ಎಲ್ಲಿದೆ?", translit: "Aushadhi angadi ellide?" },
      te: { word: "మందుల షాప్ ఎక్కడ ఉంది?", translit: "Mandhula shop ekkada undi?" },
      hi: { word: "दवा की दुकान कहाँ है?", translit: "Dawa ki dukaan kahan hai?" }
    },
    {
      meaning: "I have fever / pain",
      ta: { word: "எனக்கு காய்ச்சல் / வலி இருக்கிறது", translit: "Enakku kaaichal / vali irukkiradhu" },
      ml: { word: "എനിക്ക് പനിയുണ്ട് / വേദനയുണ്ട്", translit: "Enikku paniyundu / vedhanayundu" },
      kn: { word: "ನನಗೆ ಜ್ವರ / ನೋವು ಇದೆ", translit: "Nanage jwara / novu ide" },
      te: { word: "నాకు జ్వరం / నొప్పి ఉంది", translit: "Naaku jwaram / noppi undi" },
      hi: { word: "मुझे बुखार / दर्द है", translit: "Mujhe bukhaar / dard hai" }
    },
    {
      meaning: "Help me please",
      ta: { word: "தயவுசெய்து எனக்கு உதவுங்கள்", translit: "Dhayavuseidhu enakku udhavungal" },
      ml: { word: "ദയവായി എന്നെ സഹായിക്കൂ", translit: "Dayavaayi enne sahaayikkoo" },
      kn: { word: "ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ", translit: "Dayavittu nanage sahaaya maadi" },
      te: { word: "దయచేసి నాకు సహాయం చేయండి", translit: "Dayachesi naaku sahaayam cheyandi" },
      hi: { word: "कृपया मेरी मदद कीजिए", translit: "Kripya meri madad kijiye" }
    },
    {
      meaning: "Call the police",
      ta: { word: "போலீஸை அழையுங்கள்", translit: "Police-ai azhaiyungal" },
      ml: { word: "പോലീസിനെ വിളിക്കൂ", translit: "Policine vilikkoo" },
      kn: { word: "ಪೊಲೀಸರನ್ನು ಕರೆಯಿರಿ", translit: "Policerannu kareyiri" },
      te: { word: "పోలీసులను పిలవండి", translit: "Police lani pilavandi" },
      hi: { word: "पुलिस को बुलाइए", translit: "Police ko bulaiye" }
    }
  ]
};

export const unitCatalog = [
  { idSuffix: "01", key: "greetings", title: "Basic Greetings & Politeness", xp: 50, icon: "Sparkles" },
  { idSuffix: "02", key: "numbers", title: "Numbers & Counting (1-10)", xp: 50, icon: "Hash" },
  { idSuffix: "03", key: "family", title: "Family Members & Relations", xp: 60, icon: "Users" },
  { idSuffix: "04", key: "food", title: "Food, Drinks & Dining", xp: 60, icon: "Utensils" },
  { idSuffix: "05", key: "daily", title: "Daily Questions & Yes/No", xp: 60, icon: "HelpCircle" },
  { idSuffix: "06", key: "time", title: "Days, Time & Routines", xp: 70, icon: "Clock" },
  { idSuffix: "07", key: "verbs", title: "Common Action Verbs", xp: 70, icon: "Zap" },
  { idSuffix: "08", key: "travel", title: "Travel, Places & Transport", xp: 80, icon: "Compass" },
  { idSuffix: "09", key: "shopping", title: "Market, Shopping & Bargaining", xp: 85, icon: "ShoppingBag" },
  { idSuffix: "10", key: "dining", title: "Restaurant & Cafe Ordering", xp: 85, icon: "Coffee" },
  { idSuffix: "11", key: "emergency", title: "Emergency, Doctor & Pharmacy", xp: 90, icon: "ShieldAlert" },
  { idSuffix: "12", key: "directions", title: "Asking & Giving Directions", xp: 80, icon: "Navigation" },
  { idSuffix: "13", key: "work", title: "Workplace & Professional Talk", xp: 95, icon: "Briefcase" }
];


export const dialogueScenarios = [
  {
    id: "auto_commute",
    title: "Taking an Auto-Rickshaw in the City",
    description: "Negotiate destination, meter, and route with an auto driver",
    category: "Travel",
    xp: 60,
    turns: [
      {
        speaker: "Passenger",
        ta: { text: "அண்ணா, எம்.ஜி ரோட்டுக்கு போவீங்களா?", translit: "Anna, MG Road-kku poveengala?", meaning: "Brother, will you go to MG Road?" },
        ml: { text: "ചേട്ടാ, എം.ജി റോഡിലേക്ക് പോകുമോ?", translit: "Chetta, MG Road-ilekku pokumo?", meaning: "Brother, will you go to MG Road?" },
        kn: { text: "ಅಣ್ಣಾ, ಎಂ.ಜಿ ರೋಡ್‌ಗೆ ಹೋಗ್ತೀರಾ?", translit: "Anna, MG Road-ge hogteera?", meaning: "Brother, will you go to MG Road?" },
        te: { text: "అన్నయ్యా, ఎం.జి రోడ్ కి వెళ్తారా?", translit: "Annayya, MG Road ki velthara?", meaning: "Brother, will you go to MG Road?" },
        hi: { text: "भैया, एम.जी रोड चलेंगे क्या?", translit: "Bhaiya, MG Road chalenge kya?", meaning: "Brother, will you go to MG Road?" }
      },
      {
        speaker: "Driver",
        ta: { text: "சரி ஏறுங்கள், நூறு ரூபாய் ஆகும்.", translit: "Sari aerungal, nooru roobai aagum.", meaning: "Okay get in, it will be 100 rupees." },
        ml: { text: "ശരി കയറിക്കോളൂ, നൂറു രൂപയാകും.", translit: "Shari kayarikkoloo, nooru roopayaakum.", meaning: "Okay get in, it will cost 100 rupees." },
        kn: { text: "ಸರಿ ಹತ್ತಿ, ನೂರು ರೂಪಾಯಿ ಆಗುತ್ತೆ.", translit: "Sari hatti, nooru roopaayi aagutthe.", meaning: "Okay get in, it will cost 100 rupees." },
        te: { text: "సరే ఎక్కండి, వంద రూపాయలు అవుతుంది.", translit: "Sare ekkandi, vanda roopaayalu avuthundi.", meaning: "Okay get in, it will be 100 rupees." },
        hi: { text: "ठीक है बैठिए, सौ रुपये लगेंगे।", translit: "Theek hai baithiye, sau rupaye lagenge.", meaning: "Okay sit, it will cost 100 rupees." }
      },
      {
        speaker: "Passenger",
        ta: { text: "மீட்டர் போட்டு வாருங்கள் அண்ணா.", translit: "Meter pottu vaarungal anna.", meaning: "Please put the meter, brother." },
        ml: { text: "മീറ്റർ ഇട്ടു പോകൂ ചേട്ടാ.", translit: "Meter ittu pokoo chetta.", meaning: "Please run by the meter, brother." },
        kn: { text: "ಮೀಟರ್ ಹಾಕಿ ಬನ್ನಿ ಅಣ್ಣಾ.", translit: "Meter haaki banni anna.", meaning: "Please put on the meter, brother." },
        te: { text: "మీటర్ వేసి రండి అన్నయ్యా.", translit: "Meter vesi randi annayya.", meaning: "Please put on the meter, brother." },
        hi: { text: "भैया, मीटर से चलिए।", translit: "Bhaiya, meter se chaliye.", meaning: "Brother, please run by the meter." }
      },
      {
        speaker: "Driver",
        ta: { text: "சரி வாங்க, நேரா போயிடலாம்.", translit: "Sari vaanga, naeraa poyidalaam.", meaning: "Okay come, we will go straight." },
        ml: { text: "ശരി വരൂ, നേരെ പോകാം.", translit: "Shari varoo, nere pokaam.", meaning: "Okay come, let's go straight." },
        kn: { text: "ಸರಿ ಬನ್ನಿ, ನೇರವಾಗಿ ಹೋಗೋಣ.", translit: "Sari banni, neraavaagi hogona.", meaning: "Okay come, let us go straight." },
        te: { text: "సరే రండి, సూటిగా వెళ్దాం.", translit: "Sare randi, sootiga veldhaam.", meaning: "Okay come, let's go straight." },
        hi: { text: "ठीक है चलिए, सीधे चलते हैं।", translit: "Theek hai chaliye, seedhe chalte hain.", meaning: "Okay come, let us go straight." }
      }
    ]
  },
  {
    id: "cafe_order",
    title: "Ordering Breakfast at a South Indian Cafe",
    description: "Order hot idlis, crispy masala dosa, and authentic filter coffee",
    category: "Dining",
    xp: 65,
    turns: [
      {
        speaker: "Customer",
        ta: { text: "வணக்கம்! இரண்டு மசால் தோசை மற்றும் ஒரு காபி கொடுங்கள்.", translit: "Vanakkam! Irandu masaal thosai matrum oru coffee kodungal.", meaning: "Hello! Give two masala dosas and one coffee." },
        ml: { text: "നമസ്കാരം! രണ്ട് മസാല ദോശയും ഒരു കാപ്പിയും തരൂ.", translit: "Namaskaram! Randu masala doshayum oru kaappiyum tharoo.", meaning: "Hello! Give two masala dosas and one coffee." },
        kn: { text: "ನಮಸ್ಕಾರ! ಎರಡು ಮಸಾಲೆ ದೋಸೆ ಮತ್ತೆ ಒಂದು ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ.", translit: "Namaskara! Eradu masala dose matte ondu filter coffee kodi.", meaning: "Hello! Give two masala dosas and one filter coffee." },
        te: { text: "నమస్కారం! రెండు మసాలా దోశలు మరియు ఒక కాఫీ ఇవ్వండి.", translit: "Namaskaram! Rendu masala doshalu mariyu oka coffee ivvandi.", meaning: "Hello! Give two masala dosas and one coffee." },
        hi: { text: "नमस्ते! दो मसाला डोसा और एक कॉफ़ी दीजिए।", translit: "Namaste! Do masala dosa aur ek coffee dijiye.", meaning: "Hello! Please give two masala dosas and one coffee." }
      },
      {
        speaker: "Waiter",
        ta: { text: "தோசையில் நெய் சேர்க்கவா? கார சட்னி வேண்டுமா?", translit: "Thosaiyil nei serkkavaa? Kaara chutney vendumaa?", meaning: "Shall I add ghee in dosa? Do you want spicy chutney?" },
        ml: { text: "ദോശയിൽ നെയ്യ് ചേർക്കണോ? എരിവുള്ള ചമ്മന്തി വേണമോ?", translit: "Doshayil neyyu cherkkano? Erivulla chammanthi venamo?", meaning: "Add ghee in dosa? Need spicy chutney?" },
        kn: { text: "ದೋಸೆಗೆ ತುಪ್ಪ ಬೇಕಾ? ಖಾರದ ಚಟ್ನಿ ಇರಬೇಕಾ?", translit: "Dosege thuppa beka? Khaarada chutney irabeka?", meaning: "Need ghee for the dosa? Want spicy chutney?" },
        te: { text: "దోశలో నెయ్యి వేయమంటారా? కారం చట్నీ కావాలా?", translit: "Doshalo neyyi veyamantaara? Kaaram chutney kaavaalaa?", meaning: "Add ghee to dosa? Want spicy chutney?" },
        hi: { text: "डोसे में घी डालना है? क्या तीखी चटनी चाहिए?", translit: "Dose mein ghee daalna hai? Kya teekhi chutney chahiye?", meaning: "Add ghee in dosa? Do you want spicy chutney?" }
      },
      {
        speaker: "Customer",
        ta: { text: "ஆம், நெய் சேர்த்து காரம் குறைவாக கொடுங்கள்.", translit: "Aam, nei serthu kaaram kuraivaaga kodungal.", meaning: "Yes, add ghee and keep it less spicy." },
        ml: { text: "അതെ, നെയ്യ് ചേർത്ത് എരിവ് കുറച്ച് തരൂ.", translit: "Athe, neyyu cherthu erivu kurachu tharoo.", meaning: "Yes, add ghee and make it less spicy." },
        kn: { text: "ಹೌದು, ತುಪ್ಪ ಹಾಕಿ ಖಾರ ಕಡಿಮೆ ಮಾಡಿ ಕೊಡಿ.", translit: "Haudu, thuppa haaki khaara kadime maadi kodi.", meaning: "Yes, add ghee and make it less spicy." },
        te: { text: "అవును, నెయ్యి వేసి కారం తక్కువగా ఇవ్వండి.", translit: "Avunu, neyyi vesi kaaram thakkuvaga ivvandi.", meaning: "Yes, add ghee and give with less spice." },
        hi: { text: "हाँ, घी डालिए और मिर्च कम रखिए।", translit: "Haan, ghee daaliye aur mirch kam rakhiye.", meaning: "Yes, add ghee and keep the chili low." }
      },
      {
        speaker: "Waiter",
        ta: { text: "சரிங்க, ஐந்து நிமிடத்தில் கொண்டு வருகிறேன்.", translit: "Saringa, aindhu nimidathil kondu varukiren.", meaning: "Sure sir, I will bring it in five minutes." },
        ml: { text: "ശരി, അഞ്ച് മിനിറ്റിനുള്ളിൽ കൊണ്ടുവരാം.", translit: "Shari, anju minittinullil konduvaraam.", meaning: "Sure, I will bring it in 5 minutes." },
        kn: { text: "ಸರಿ ಸಾರ್, ಐದು ನಿಮಿಷದಲ್ಲಿ ತರುತ್ತೇನೆ.", translit: "Sari sir, aidu nimishadalli taruttene.", meaning: "Sure sir, I will bring it in 5 minutes." },
        te: { text: "సరే సార్, ఐదు నిమిషాల్లో తెస్తాను.", translit: "Sare sir, aidu nimishaallo thesthaanu.", meaning: "Sure sir, I will bring it in 5 minutes." },
        hi: { text: "जी ठीक है, पाँच मिनट में लाता हूँ।", translit: "Ji theek hai, paanch minute mein laata hoon.", meaning: "Yes sir, I will bring it in 5 minutes." }
      }
    ]
  },
  {
    id: "market_bargain",
    title: "Bargaining at the Local Market",
    description: "Purchase fresh vegetables and ask for discount",
    category: "Shopping",
    xp: 70,
    turns: [
      {
        speaker: "Buyer",
        ta: { text: "இந்த தக்காளி ஒரு கிலோ எவ்வளவு அண்ணா?", translit: "Indha thakkaali oru kilo evvalavu anna?", meaning: "How much is one kilo of these tomatoes?" },
        ml: { text: "ഈ തക്കാളി ഒരു കിലോയ്ക്ക് എത്രയാണ്?", translit: "Ee thakkaali oru kiloykku ethrayaanu?", meaning: "How much is one kilo of this tomato?" },
        kn: { text: "ಈ ಟೊಮೆಟೊ ಒಂದು ಕೆಜಿಗೆ ಎಷ್ಟು ಅಣ್ಣಾ?", translit: "Ee tomato ondu kg-ge eshtu anna?", meaning: "How much is 1 kg of this tomato brother?" },
        te: { text: "ఈ టమోటాలు ఒక కేజీ ఎంత అన్నయ్యా?", translit: "Ee tomatolu oka kg entha annayya?", meaning: "How much is 1 kg tomatoes brother?" },
        hi: { text: "भैया, यह टमाटर एक किलो कितने का है?", translit: "Bhaiya, yeh tamatar ek kilo kitne ka hai?", meaning: "Brother, how much for 1 kg tomatoes?" }
      },
      {
        speaker: "Vendor",
        ta: { text: "ஒரு கிலோ நாற்பது ரூபாய், மிகவும் புதியது.", translit: "Oru kilo naarpathu roobai, migavum pudhiyidhu.", meaning: "Forty rupees per kilo, very fresh." },
        ml: { text: "കിലോയ്ക്ക് നാല്പത് രൂപ, നല്ല പുതിയതാണ്.", translit: "Kiloykku nalpathu roopa, nalla puthiyathaanu.", meaning: "Forty rupees a kilo, very fresh." },
        kn: { text: "ಒಂದು ಕೆಜಿಗೆ ನಲವತ್ತು ರೂಪಾಯಿ, ತುಂಬಾ ತಾಜಾ ಇದೆ.", translit: "Ondu kg-ge nalavatthu roopaayi, tumba thaaja ide.", meaning: "Forty rupees per kg, very fresh." },
        te: { text: "కేజీ నలభై రూపాయలు, చాలా తాజాగా ఉన్నాయి.", translit: "Kg nalabhai roopaayalu, chaala thaajaa ga unnaayi.", meaning: "Forty rupees per kg, very fresh." },
        hi: { text: "चालीस रुपये किलो, बहुत ताज़ा माल है।", translit: "Chaalis rupaye kilo, bahut taaza maal hai.", meaning: "Forty rupees per kilo, very fresh." }
      },
      {
        speaker: "Buyer",
        ta: { text: "இரண்டு கிலோ வாங்குகிறேன், முப்பது ரூபாய்க்கு தருவீர்களா?", translit: "Irandu kilo vaangukiren, muppathu roobaykku tharuveergalaa?", meaning: "I will take 2 kilos, will you give for thirty?" },
        ml: { text: "രണ്ട് കിലോ എടുക്കാം, മുപ്പത് രൂപയ്ക്ക് തരുമോ?", translit: "Randu kilo edukkaam, muppathu roopaykku tharumo?", meaning: "I'll take 2 kilos, will you give for 30 rupees?" },
        kn: { text: "ಎರಡು ಕೆಜಿ ತಗೋತೀನಿ, ಮೂವತ್ತು ರೂಪಾಯಿಗೆ ಕೊಡ್ತೀರಾ?", translit: "Eradu kg thagotheeni, moovatthu roopaayige kodtheera?", meaning: "I will take 2 kg, will you give for 30 rupees?" },
        te: { text: "రెండు కేజీలు తీసుకుంటాను, ముప్పై రూపాయలకి ఇస్తారా?", translit: "Rendu kg-lu theesukuntaanu, muppai roopaayalaki isthaaraa?", meaning: "I will take 2 kg, will you give for 30 rupees?" },
        hi: { text: "दो किलो लूँगा, तीस रुपये में देंगे क्या?", translit: "Do kilo loonga, tees rupaye mein denge kya?", meaning: "I will take 2 kg, will you give for thirty rupees?" }
      },
      {
        speaker: "Vendor",
        ta: { text: "சரிங்க, முப்பத்தைந்து ரூபாய்க்கு எடுத்துக்கொள்ளுங்கள்.", translit: "Saringa, muppathaindhu roobaykku eduthukkollungal.", meaning: "Okay, please take it for thirty-five rupees." },
        ml: { text: "ശരി, മുപ്പത്തഞ്ചു രൂപയ്ക്ക് എടുത്തോളൂ.", translit: "Shari, muppathanchu roopaykku edutholoo.", meaning: "Okay, take it for thirty-five rupees." },
        kn: { text: "ಸರಿ, ಮೂವತ್ತೈದು ರೂಪಾಯಿಗೆ ತಗೊಳ್ಳಿ.", translit: "Sari, moovathaidu roopaayige thagolli.", meaning: "Okay, take it for thirty-five rupees." },
        te: { text: "సరే, ముప్పై ఐదు రూపాయలకి తీసుకోండి.", translit: "Sare, muppai aidu roopaayalaki theesukondi.", meaning: "Okay, take it for thirty-five rupees." },
        hi: { text: "चलिए ठीक है, पैंतीस रुपये में ले लीजिए।", translit: "Chaliye theek hai, paintees rupaye mein le lijiye.", meaning: "Alright, please take it for thirty-five rupees." }
      }
    ]
  }
];
