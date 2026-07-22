/* ============================================================
   Propstar — shared data layer
   Owns: catalogue store, quiz config store, matching engine,
   label lookups. Both the public site and the admin console
   depend on this file and never touch storage directly
   (except the lead + admin-session keys noted in the spec).
   Exposed as window.PROPSTAR.
   ============================================================ */
(function () {
  'use strict';

  var PROPS_KEY = 'propstar_properties_v3';
  var QUIZ_KEY = 'propstar_quiz_v4';

  /* ---------- helpers ---------- */

  function uid() {
    return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
  }

  function slug(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- seed quiz config ---------- */

  function seedQuiz() {
    return {
      questions: {
        city:     { on: true,  q: 'Where are you looking to buy?',   h: 'Pick the city you want to explore.' },
        locality: { on: false, q: 'Any preferred neighbourhoods?',   h: 'Optional — helps us narrow the shortlist.' },
        budget:   { on: true,  q: "What's your investment range?",   h: 'Used only to curate — never shown on the site.' },
        purpose:  { on: false, q: "What's this home for?",           h: 'So we weight the right things.' }
      },
      locations: [
        { key: 'bengaluru', label: 'Bengaluru', hint: 'Garden city, tech capital', localities: [
          { key: 'blr-yelahanka',    label: 'Yelahanka' },
          { key: 'blr-sarjapur',     label: 'Sarjapur Road' },
          { key: 'blr-bannerghatta', label: 'Bannerghatta Road' },
          { key: 'blr-devanahalli',  label: 'Devanahalli' }
        ]},
        { key: 'mumbai', label: 'Mumbai', hint: 'The maximum city', localities: [
          { key: 'mum-wadala',  label: 'Wadala' },
          { key: 'mum-worli',   label: 'Worli' },
          { key: 'mum-versova', label: 'Versova' }
        ]},
        { key: 'navimumbai', label: 'Navi Mumbai', hint: 'The planned city, near NMIA', localities: [
          { key: 'nvm-kharghar', label: 'Kharghar' }
        ]},
        { key: 'pune', label: 'Pune', hint: 'The eastern IT corridor', localities: [
          { key: 'pun-kharadi', label: 'Kharadi' }
        ]},
        { key: 'hyderabad', label: 'Hyderabad', hint: 'KPHB & Hitech City', localities: [
          { key: 'hyd-kukatpally', label: 'Kukatpally' }
        ]},
        { key: 'ncr', label: 'Delhi NCR', hint: 'Noida, Greater Noida & Gurugram', localities: [
          { key: 'ncr-sigma3',     label: 'Sigma III, Greater Noida' },
          { key: 'ncr-sec44',      label: 'Sector 44, Noida' },
          { key: 'ncr-sohna',      label: 'Sohna Road, Gurugram' },
          { key: 'ncr-golfcourse', label: 'Golf Course Road, Gurugram' }
        ]}
      ],
      budgets: [                       /* order matters — adjacency scoring */
        { key: 'b1', label: '₹1 – 3 Cr' },
        { key: 'b2', label: '₹3 – 7 Cr' },
        { key: 'b3', label: '₹7 Cr +' }
      ],
      purposes: [
        { key: 'live',   label: 'To live in',   hint: 'Your primary home' },
        { key: 'invest', label: 'Investment',   hint: 'Growth & rental yield' },
        { key: 'second', label: 'Second home',  hint: 'A weekend retreat' }
      ]
    };
  }

  var ANY_LOCALITY = { key: 'any', label: 'Open to any area' };

  /* ---------- seed catalogue ---------- */

  function seedProps() {
    return [
      {
        id: 'godrej-arden',
        developer: 'Godrej Properties', name: 'Godrej Arden', location: 'Sigma III, Greater Noida',
        status: 'Under construction', possession: 'May 2030', config: '3 & 4 BHK',
        sizes: '1,380 – 2,609 sq.ft',
        tags: ['Nature-inspired greens', 'Wellness clubhouse', '3 & 4 BHK'],
        description: 'Godrej Arden is a nature-inspired residential community in Sigma III, Greater Noida, crafted for those who value calm, comfort, and connection. Spread across lush landscaped acres, it is thoughtfully designed to promote holistic well-being.',
        curation: [
          'Nature-inspired community with expansive greens and landscaped acres',
          'Wellness-focused design with tree-lined pathways and a wellness clubhouse',
          'Metro Aqua Line just 0.7 km from the gate'
        ],
        amenities: ['Clubhouse with waterfront', 'Emerald pool', 'Gym overlooking greens', 'Indoor dining', 'Miniplex', 'Squash court'],
        connectivity: ['0.7 km to Metro Aqua Line', '4 km to Eastern Peripheral Road', '3 km to Ecotech I business hub', '7.6 km to Pari Chowk', '43 km to Noida International Airport', 'Near Noida and Yamuna Expressways, FNG corridor'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-arden-01.webp', 'assets/projects/godrej-arden-02.webp', 'assets/projects/godrej-arden-03.webp', 'assets/projects/godrej-arden-04.webp', 'assets/projects/godrej-arden-05.webp'],
        photoDescription: 'Landscaped residential towers amid greens',
        locationKey: 'ncr', localityKey: 'ncr-sigma3', nearbyKeys: [],
        budgetBands: ['b2'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-aveline',
        developer: 'Godrej Properties', name: 'Godrej Aveline', location: 'Yelahanka, Bengaluru',
        status: 'Under construction', possession: 'March 2031', config: '3, 3.5 & 4.5 BHK',
        sizes: '2,200 – 3,000 sq.ft',
        tags: ['Dutch-inspired design', 'Garden homes', 'Metro at 1 min'],
        description: 'At Godrej Aveline in Yelahanka, the sun-drenched spirit of Dutch design meets North Bangalore living: light-filled homes surrounded by gardens. Not just a home, but a place to truly settle in.',
        curation: [
          'Dutch-inspired architecture amid lush gardens',
          'Clubhouse and landscaped terraces',
          'Tower-level security'
        ],
        amenities: ['Pickleball court', 'Meditation centre', 'Kids play area', 'Swimming pool', 'Banquet hall', 'Clubhouse'],
        connectivity: ['1 min to Bagalur Cross metro', '5 min to Yelahanka metro station', '1 min to Manipal Hospital, Yelahanka', '3 min to Cytecare Hospital', '6 min to Ryan International School', '10 min to RMZ Galleria Mall'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-aveline-01.webp', 'assets/projects/godrej-aveline-02.webp', 'assets/projects/godrej-aveline-03.webp', 'assets/projects/godrej-aveline-04.webp', 'assets/projects/godrej-aveline-05.webp'],
        photoDescription: 'Garden-wrapped residential towers with pool',
        locationKey: 'bengaluru', localityKey: 'blr-yelahanka', nearbyKeys: [],
        budgetBands: ['b1', 'b2'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-horizon',
        developer: 'Godrej Properties', name: 'Godrej Horizon', location: 'Wadala, Mumbai',
        status: 'Under construction', possession: 'May 2027', config: '2 & 3 BHK apartments',
        sizes: '750 – 1,400 sq.ft',
        tags: ['Grand clubhouse', 'Sea & skyline views', '2 & 3 BHK decks'],
        description: 'Godrej Horizon is an under-construction development in Wadala, South-Central Mumbai, offering 2 & 3 BHK apartments. Spread over about 5 acres, it centres on a 5-storeyed grand clubhouse with 40+ amenities, with homes offering Eastern Bay, Arabian Sea, and Atal Setu skyline views.',
        curation: [
          '5-storeyed grand clubhouse with 40+ lifestyle and sporting amenities',
          'Deck homes with Eastern Bay, Arabian Sea, and Atal Setu skyline views'
        ],
        amenities: ['5-storeyed grand clubhouse', '40+ amenities', 'Sporting amenities', 'Rooftop amenities', 'About 5 acres of open and green space'],
        connectivity: ['Off Rafi Ahmed Kidwai Road, Wadala', 'Close to the Eastern Freeway', 'Views toward Atal Setu (MTHL)'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-horizon-01.webp', 'assets/projects/godrej-horizon-02.webp', 'assets/projects/godrej-horizon-03.webp', 'assets/projects/godrej-horizon-04.webp', 'assets/projects/godrej-horizon-05.webp', 'assets/projects/godrej-horizon-06.webp', 'assets/projects/godrej-horizon-07.webp', 'assets/projects/godrej-horizon-08.webp'],
        photoDescription: 'High-rise towers over the Wadala skyline',
        locationKey: 'mumbai', localityKey: 'mum-wadala', nearbyKeys: ['navimumbai'],
        budgetBands: ['b1', 'b2'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-ivara',
        developer: 'Godrej Properties', name: 'Godrej Ivara', location: 'Kharadi, Pune',
        status: 'New launch', possession: 'August 2032', config: '2, 3 & 4 BHK',
        sizes: '1,100 – 2,200 sq.ft',
        tags: ['New launch', '1 lakh+ sq.ft amenities', 'Co-working spaces'],
        description: 'Godrej Ivara rises in Kharadi, Pune’s growth corridor, with over 1 lakh sq.ft of curated lifestyle amenities, from co-working spaces and a cafe to a gymnasium and wellness centre, designed to let ambition, wellbeing, and leisure thrive in everyday life.',
        curation: [
          'Over 9,290 sq.m (1 lakh+ sq.ft) of curated lifestyle amenities',
          'Dedicated co-working spaces, cafe, state-of-the-art gym, and wellness centre'
        ],
        amenities: ['Swimming pool', 'State-of-the-art gym', 'Co-working space', 'Cafe', 'Yoga room', 'Kids play area'],
        connectivity: ['10 min to EON IT Park', '12 min to World Trade Center', '15 min to Kalyani Nagar and Viman Nagar', '15 min to Pune Airport', 'Close to Pune-Ahilyanagar Highway', 'Near proposed Metro Phase II'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-ivara-01.webp', 'assets/projects/godrej-ivara-02.webp', 'assets/projects/godrej-ivara-03.webp', 'assets/projects/godrej-ivara-04.webp', 'assets/projects/godrej-ivara-05.webp', 'assets/projects/godrej-ivara-06.webp', 'assets/projects/godrej-ivara-07.webp', 'assets/projects/godrej-ivara-08.webp'],
        photoDescription: 'Modern towers above the Kharadi corridor',
        locationKey: 'pune', localityKey: 'pun-kharadi', nearbyKeys: [],
        budgetBands: ['b1', 'b2'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-brooklyn-avenue',
        developer: 'Godrej Properties', name: 'Godrej Brooklyn Avenue', location: 'Kukatpally, Hyderabad',
        status: 'New launch', possession: 'June 2031', config: '3, 3+ Utility & 4 BHK',
        sizes: '2,350 – 3,350 sq.ft',
        tags: ['Brooklyn-inspired', '72,000 sq.ft clubhouse', 'Near Hitech City'],
        description: 'Godrej Brooklyn Avenue offers premium 3 & 4 BHK residences in Kukatpally, one of Hyderabad’s most coveted addresses, with Brooklyn-inspired architecture, modern amenities, and strong connectivity to major business hubs and city landmarks.',
        curation: [
          'Brooklyn-inspired architecture with premium 3 & 4 BHK residences',
          'A clubhouse of about 72,000 sq.ft with curated lifestyle experiences',
          'In the heart of KPHB, one of Hyderabad’s most sought-after residential hubs'
        ],
        amenities: ['Grand clubhouse', 'Rooftop infinity pool', 'State-of-the-art gym', 'Indoor games and sports courts', 'Landscaped gardens', 'Children’s play area', 'Walking and reflexology tracks'],
        connectivity: ['10 min to Hitech City', '10 min to Cyber Towers', '5 min to KPHB Colony metro station', '5 min to Lulu Mall', '7 min to JNTU metro station', '40 min to Rajiv Gandhi International Airport'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-brooklyn-avenue-01.webp', 'assets/projects/godrej-brooklyn-avenue-02.webp', 'assets/projects/godrej-brooklyn-avenue-03.webp', 'assets/projects/godrej-brooklyn-avenue-04.webp', 'assets/projects/godrej-brooklyn-avenue-05.webp', 'assets/projects/godrej-brooklyn-avenue-06.webp', 'assets/projects/godrej-brooklyn-avenue-07.webp', 'assets/projects/godrej-brooklyn-avenue-08.webp'],
        photoDescription: 'Brooklyn-style towers at golden hour',
        locationKey: 'hyderabad', localityKey: 'hyd-kukatpally', nearbyKeys: [],
        budgetBands: ['b1', 'b2'], purposes: ['live']
      },
      {
        id: 'godrej-varanya',
        developer: 'Godrej Properties', name: 'Godrej Varanya', location: 'Kharghar, Navi Mumbai',
        status: 'New launch', possession: 'June 2034', config: '2 & 3 BHK apartments',
        sizes: '720 – 1,150 sq.ft',
        tags: ['Hill-facing homes', 'Near NMIA', '52,000 sq.ft podium'],
        description: 'Godrej Varanya is a premium development at the foothills of the Kharghar Hills, Navi Mumbai. Set across about 6.5 acres, it offers 2 & 3 BHK homes with views of hills, mangroves, and creek, plus seamless metro, road, and rail connectivity, with Navi Mumbai International Airport about 16 minutes away.',
        curation: [
          'One of the largest open podium spaces (about 52,000 sq.ft) in the Kharghar micro-market',
          'A clubhouse of about 50,000 sq.ft with views of the Kharghar Hills, mangroves, and creek'
        ],
        amenities: ['Temperature-controlled indoor pool and outdoor swimming zones', 'Wellness spa and Zen courtyard', 'Multisport courts (padel, badminton, pickleball) and gymnasium', 'Landscaped podium with themed gardens', 'Amphitheatre and private mini-theatre', 'Children’s play areas and pet zones'],
        connectivity: ['16 min (about 8.5 km) to Navi Mumbai International Airport', '0.55 km to Utsav Chowk metro station', '1 km to Kharghar railway station', '0.1 km to Sion-Panvel Highway', 'Atal Setu (MTHL) for South Mumbai access', 'Near Central Park and Kharghar Valley Golf Course'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-varanya-01.webp', 'assets/projects/godrej-varanya-02.webp', 'assets/projects/godrej-varanya-03.webp', 'assets/projects/godrej-varanya-04.webp', 'assets/projects/godrej-varanya-05.webp', 'assets/projects/godrej-varanya-06.webp', 'assets/projects/godrej-varanya-07.webp', 'assets/projects/godrej-varanya-08.webp'],
        photoDescription: 'Towers at the foothills of the Kharghar Hills',
        locationKey: 'navimumbai', localityKey: 'nvm-kharghar', nearbyKeys: ['mumbai'],
        budgetBands: ['b1', 'b2'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-crown',
        developer: 'Godrej Properties', name: 'Godrej Crown', location: 'Sector 33, Sohna Road, Gurugram',
        status: 'Ready to move', possession: 'From January 2025', config: '2 & 3 BHK apartments',
        sizes: '1,310 – 1,996 sq.ft',
        tags: ['16-acre community', 'Rooftop amphitheatre', 'Ready to move'],
        description: 'Godrej Crown is a gated high-rise community on about 16 acres on Sohna Road, Gurugram, with spacious, ventilated 2 & 3 BHK homes. Launched in December 2022, possession began in January 2025, so what you tour is what you move into.',
        curation: [
          'A gated community of about 16 acres on the Sohna Road corridor',
          'Possession underway, so ready inventory is available',
          'Rooftop amphitheatre and a full sports and wellness deck'
        ],
        amenities: ['Clubhouse', 'Rooftop amphitheatre', 'Swimming pool', 'Gymnasium and aerobics room', 'Steam room and sauna', 'Badminton and basketball courts', 'Jogging and cycling track', 'Party lawn and landscaped gardens'],
        connectivity: ['On the Sohna Road corridor, Sector 33, Gurugram', 'Gated society with intercom and fire safety systems', 'Power backup and 24/7 CCTV security'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-crown-01.webp', 'assets/projects/godrej-crown-02.webp', 'assets/projects/godrej-crown-03.webp', 'assets/projects/godrej-crown-04.webp', 'assets/projects/godrej-crown-05.webp'],
        photoDescription: 'Twilight exterior with clubhouse pool',
        locationKey: 'ncr', localityKey: 'ncr-sohna', nearbyKeys: [],
        budgetBands: ['b1', 'b2'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-samaris',
        developer: 'Godrej Properties', name: 'Godrej Samaris', location: 'Golf Course Road area, Gurugram',
        status: 'New launch', possession: 'August 2033', config: '3, 4 & 5.5 BHK residences',
        tags: ['Ultra-luxury', '84% open space', 'Gensler architecture'],
        description: 'Godrej Samaris is an ultra-luxury, low-density development of 488 residences across five towers on about 7.5 acres, with about 84% open green space including a one-acre forest trail. Architecture is by Gensler with ARCOP and Cooper Hill, and construction is partnered with Tata Projects.',
        curation: [
          'Low-density planning: 488 homes on 7.5 acres with four residences per core',
          'About 84% open green space, including a one-acre forest trail',
          'Two grand clubhouses of about 68,000 sq.ft with golf simulator and lounges'
        ],
        amenities: ['Two grand clubhouses (about 68,000 sq.ft)', 'Swimming pools', 'Golf simulator', 'Cigar and champagne lounges', 'Spa and wellness zones', 'Fitness studios and yoga room', 'Fine dining and entertainment zones', 'Jogging and cycling tracks'],
        connectivity: ['Near Sector 53-54 Rapid Metro', 'Close to Cyber City and DLF Golf Course', 'About 18 km to IGI Airport'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-samaris-01.webp', 'assets/projects/godrej-samaris-02.webp', 'assets/projects/godrej-samaris-03.webp', 'assets/projects/godrej-samaris-04.webp', 'assets/projects/godrej-samaris-05.webp'],
        photoDescription: 'Dusk exterior with topiary garden',
        locationKey: 'ncr', localityKey: 'ncr-golfcourse', nearbyKeys: [],
        budgetBands: ['b3'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-riverine',
        developer: 'Godrej Properties', name: 'Godrej Riverine', location: 'Sector 44, Noida',
        possession: 'September 2029', config: '3 & 4 BHK residences',
        tags: ['Low-density', '4 towers, G+38', 'Sector 44 address'],
        description: 'Godrej Riverine is a luxury low-density development in Sector 44, Noida, off the Greater Noida Expressway: four towers of G+38 floors with 416 residences on about 6.15 acres, in 3 BHK and 4 BHK layouts with study, store, and family-lounge variants.',
        curation: [
          'Only 416 residences across four towers on about 6.15 acres',
          'Sector 44 address off the Greater Noida Expressway',
          'About 2 km from Golf Course station on the Blue Line metro'
        ],
        amenities: ['Clubhouse', 'Swimming pool', 'Gymnasium', 'Landscaped greens', 'Sports facilities', 'Kids play areas'],
        connectivity: ['Off the Greater Noida Expressway, Sector 44', 'About 2 km to Golf Course metro station (Blue Line)', 'Quick access to South Delhi and the Noida CBD'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-riverine-01.webp', 'assets/projects/godrej-riverine-02.webp', 'assets/projects/godrej-riverine-03.webp', 'assets/projects/godrej-riverine-04.webp', 'assets/projects/godrej-riverine-05.webp'],
        photoDescription: 'Dusk exterior with lagoon lawns',
        locationKey: 'ncr', localityKey: 'ncr-sec44', nearbyKeys: [],
        budgetBands: ['b3'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-reserve',
        developer: 'Godrej Properties', name: 'Godrej Reserve', location: 'Devanahalli, Bengaluru',
        status: 'Ready to move', possession: 'Since October 2021', config: 'Villa plots',
        sizes: '1,200 – 4,366 sq.ft plots',
        tags: ['Forest-themed plots', '42,000 trees', 'Near the airport'],
        description: 'Godrej Reserve is a forest-themed plotted community of about 92 acres in Devanahalli, between Kempegowda International Airport and Nandi Hills, with around 950 plots, over 60% open space, and about 42,000 trees. Plot sizes run from 30x40 to 40x80.',
        curation: [
          'Low-density planning of about 9 plots per acre against a typical 19',
          'About 42,000 trees and a dedicated forest area within the community',
          'Developed and delivered: possession has been underway since 2021'
        ],
        amenities: ['Two clubhouses', 'Swimming pool', 'Gymnasium', 'Outdoor sports courts', 'Book cafe and library', 'Central park and organic farms', 'Jogging and cycling tracks', 'Barbecue area and party hall'],
        connectivity: ['Near NH-44 Bellary Road', 'Between Kempegowda International Airport and Nandi Hills', 'Near SH-104 and the upcoming STRR', 'Upcoming Namma Metro Phase 2B corridor'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-reserve-01.webp', 'assets/projects/godrej-reserve-02.webp', 'assets/projects/godrej-reserve-03.webp', 'assets/projects/godrej-reserve-04.webp', 'assets/projects/godrej-reserve-05.webp'],
        photoDescription: 'Forest-edged community with amphitheatre garden',
        locationKey: 'bengaluru', localityKey: 'blr-devanahalli', nearbyKeys: [],
        budgetBands: ['b1'], purposes: ['invest', 'second']
      },
      {
        id: 'godrej-vanantara',
        developer: 'Godrej Properties', name: 'Godrej Vanantara', location: 'Bannerghatta Road, Bengaluru',
        possession: 'May 2031', config: '2, 3, 3.5, 4 & 4.5 BHK',
        sizes: '787 – 2,915 sq.ft carpet',
        tags: ['Forest-themed township', 'Private forest reserve', '80% open space'],
        description: 'Godrej Vanantara is a forest-themed, low-density gated township of about 35 acres on Bannerghatta Road, with roughly 80% open green space including a private forest reserve of about 4 acres, next to Greenwood High and close to the Electronic City corridor.',
        curation: [
          'A private forest reserve of about 4 acres inside the township',
          'Roughly 80% open green space across about 35 acres',
          'Next to Greenwood High, near NICE Road and Electronic City'
        ],
        amenities: ['Grand clubhouse', 'Swimming pools', 'Gymnasium', 'Sports courts', 'Central parkland and forest trails', 'Amphitheatre and library', 'Mini theatre', 'Retail spaces'],
        connectivity: ['On Bannerghatta Road, next to Greenwood High', 'Near the NICE Road junction', 'Close to Electronic City and JP Nagar', 'On the proposed Pink Line metro corridor'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-vanantara-01.webp', 'assets/projects/godrej-vanantara-02.webp', 'assets/projects/godrej-vanantara-03.webp', 'assets/projects/godrej-vanantara-04.webp', 'assets/projects/godrej-vanantara-05.webp'],
        photoDescription: 'Forest-edged towers with mirror-water clubhouse',
        locationKey: 'bengaluru', localityKey: 'blr-bannerghatta', nearbyKeys: [],
        budgetBands: ['b1', 'b2'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-kada-agrahara',
        developer: 'Godrej Properties', name: 'Godrej Kada Agrahara', location: 'Sarjapur Road, Bengaluru',
        status: 'New launch', possession: 'December 2030', config: '2 & 3 BHK apartments',
        sizes: '1,200 – 1,800 sq.ft',
        tags: ['New launch', 'Sarjapur corridor', 'Standalone clubhouse'],
        description: 'Godrej Kada Agrahara is a new-launch premium high-rise development off Sarjapur Road, with smart 2 & 3 BHK layouts planned around cross-ventilation, natural light, and biophilic design, minutes from the Wipro campus and the Outer Ring Road tech corridor.',
        curation: [
          'Smart 2 & 3 BHK layouts with biophilic, light-first planning',
          'Minutes from Wipro Campus, RGA Tech Park, and RMZ Ecospace',
          'On the corridor of the proposed Hebbal-Sarjapur metro line'
        ],
        amenities: ['Grand standalone clubhouse', 'Swimming pool', 'Gymnasium', 'Yoga deck and spa', 'Mini theatre', 'Sports deck and courts', 'Kids play area', 'Landscaped gardens'],
        connectivity: ['Off Sarjapur Road, near Wipro Campus', 'Near RGA Tech Park and RMZ Ecospace', 'Quick reach to Electronic City and the ORR', 'Proposed Hebbal-Sarjapur metro corridor'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-kada-agrahara-01.webp', 'assets/projects/godrej-kada-agrahara-02.webp', 'assets/projects/godrej-kada-agrahara-03.webp', 'assets/projects/godrej-kada-agrahara-04.webp', 'assets/projects/godrej-kada-agrahara-05.webp'],
        photoDescription: 'High-rise towers with podium gardens',
        locationKey: 'bengaluru', localityKey: 'blr-sarjapur', nearbyKeys: [],
        budgetBands: ['b1'], purposes: ['live', 'invest']
      },
      {
        id: 'godrej-trilogy',
        developer: 'Godrej Properties', name: 'Godrej Trilogy', location: 'Worli, Mumbai',
        possession: 'Target December 2031', config: '3 & 4 BHK sea-view residences',
        sizes: '1,752 – 2,773 sq.ft',
        tags: ['Worli sea face', 'Landmark towers', 'Private elevators'],
        description: 'Godrej Trilogy is a landmark residential development off Dr. Annie Besant Road in Worli, near the Coastal Road and the Worli Sea Face, with expansive 3 & 4 BHK sea-view residences across its Seaturf and Seafront towers, the taller rising 77 floors.',
        curation: [
          'Sea-view residences near the Worli Sea Face and Coastal Road',
          'A landmark Seafront tower of 77 floors',
          'Private elevator access on select residences'
        ],
        amenities: ['Rooftop pool', 'Clubhouse and lounges', 'Gymnasium', 'Landscaped decks', 'Indoor games', 'Concierge lobby'],
        connectivity: ['Off Dr. Annie Besant Road, Worli', 'Near the Mumbai Coastal Road', 'Near Mahalaxmi Racecourse and the Worli Sea Face'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/godrej-trilogy-01.webp', 'assets/projects/godrej-trilogy-02.webp', 'assets/projects/godrej-trilogy-03.webp', 'assets/projects/godrej-trilogy-04.webp', 'assets/projects/godrej-trilogy-05.webp'],
        photoDescription: 'Aerial twilight view of sea-face towers',
        locationKey: 'mumbai', localityKey: 'mum-worli', nearbyKeys: ['navimumbai'],
        budgetBands: ['b3'], purposes: ['live', 'invest']
      },
      {
        id: 'skyshore',
        developer: 'Godrej Properties', name: 'Skyshore', location: 'Versova, Mumbai',
        possession: 'December 2029 onwards', config: '3, 4 BHK & duplexes',
        sizes: '1,500 – 2,646 sq.ft carpet',
        tags: ['Sea-facing', '3 homes per floor', 'Rooftop infinity pool'],
        description: 'Skyshore is an ultra-luxury, low-density seafront project in Versova with two iconic wings and only three apartments per floor, offering 3 & 4 BHK and duplex residences with private decks and panoramic Arabian Sea and skyline views.',
        curation: [
          'Only three residences per floor across about 130 exclusive homes',
          'Private decks with panoramic Arabian Sea and skyline views',
          'About 850 m from Versova metro, near the upcoming Coastal Road link'
        ],
        amenities: ['Rooftop infinity pool and jacuzzi', 'Squash, padel, and badminton courts', 'Gymnasium and clubhouse', 'Sky lounge and library', 'Themed gardens and hammock lounge', 'Yoga and meditation zones'],
        connectivity: ['About 850 m to Versova metro station', 'Near Versova Beach', 'Near Kokilaben Hospital and Infiniti Mall', 'Upcoming Bandra-Versova Coastal Road link'],
        developerNote: 'Established in 1990, Godrej Properties is the first real estate company in India to have ISO certification, and is currently developing landmark projects across 15+ cities covering over 21.7 million square metres.',
        images: ['assets/projects/skyshore-01.webp', 'assets/projects/skyshore-02.webp', 'assets/projects/skyshore-03.webp', 'assets/projects/skyshore-04.webp', 'assets/projects/skyshore-05.webp'],
        photoDescription: 'Sea-facing towers with twilight pool deck',
        locationKey: 'mumbai', localityKey: 'mum-versova', nearbyKeys: ['navimumbai'],
        budgetBands: ['b3'], purposes: ['live', 'invest']
      },
      {
        id: 'mana-dale',
        developer: 'Mana Projects', name: 'Mana Dale', location: 'Kodathi, Sarjapur Road, Bengaluru',
        status: 'Under construction', possession: '2027 onwards', config: '3 & 4 BHK apartments',
        sizes: '1,590 – 2,145 sq.ft',
        tags: ['Garden rooms', '70% open space', 'Near Wipro campus'],
        description: 'Mana Dale is a nature-themed community of four G+29 blocks at Kodathi on Sarjapur Road, with over 70% open space landscaped as a tropical garden of intimate outdoor rooms: reading corners, meditation spots, play pods, and workout stations, planned along sun and wind paths.',
        curation: [
          'A tropical landscape of intimate garden rooms, planned along sun and wind paths',
          'A clubhouse of about 55,000 sq.ft with 45+ amenities',
          'About 2-3 km from the Wipro campus and RGA Tech Park'
        ],
        amenities: ['55,000 sq.ft clubhouse', 'Swimming pool and infinity pool', 'Gymnasium and outdoor gym', 'Badminton and squash courts', 'Cricket net and golf putting', 'Skywalk and amphitheatre', 'Meditation and yoga decks', 'BBQ fire pits and party lawn'],
        connectivity: ['At Kodathi, about 2-3 km from Wipro campus', 'Near RGA Tech Park', 'Near Carmelaram railway station', 'Quick reach to the Outer Ring Road'],
        images: ['assets/projects/mana-dale-01.webp', 'assets/projects/mana-dale-02.webp', 'assets/projects/mana-dale-03.webp', 'assets/projects/mana-dale-04.webp'],
        photoDescription: 'Twin towers above a landscaped entrance',
        locationKey: 'bengaluru', localityKey: 'blr-sarjapur', nearbyKeys: [],
        budgetBands: ['b1'], purposes: ['live', 'invest']
      }
    ];
  }

  /* ---------- storage ---------- */

  function load() {
    try {
      var raw = localStorage.getItem(PROPS_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch (e) { /* fall through to seed */ }
    return seedProps();
  }

  function save(arr) {
    localStorage.setItem(PROPS_KEY, JSON.stringify(arr));
    return arr;
  }

  function resetSeed() {
    localStorage.removeItem(PROPS_KEY);
    return seedProps();
  }

  function loadQuiz() {
    try {
      var raw = localStorage.getItem(QUIZ_KEY);
      if (raw) {
        var cfg = JSON.parse(raw);
        if (cfg && cfg.questions && cfg.locations) return cfg;
      }
    } catch (e) { /* fall through to seed */ }
    return seedQuiz();
  }

  function saveQuiz(cfg) {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(cfg));
    return cfg;
  }

  function resetQuiz() {
    localStorage.removeItem(QUIZ_KEY);
    return seedQuiz();
  }

  /* ---------- config lookups ---------- */

  function quizConfig() { return clone(loadQuiz()); }
  function questions() { return clone(loadQuiz().questions); }

  function activeSteps() {
    var q = loadQuiz().questions;
    return ['city', 'locality', 'budget', 'purpose'].filter(function (k) { return q[k] && q[k].on; });
  }

  function localitiesFor(cityKey) {
    var city = loadQuiz().locations.find(function (l) { return l.key === cityKey; });
    var list = city && city.localities ? clone(city.localities) : [];
    list.push(clone(ANY_LOCALITY));
    return list;
  }

  function localityLabel(key) {
    if (!key) return '';
    if (key === 'any') return ANY_LOCALITY.label;
    var cfg = loadQuiz();
    for (var i = 0; i < cfg.locations.length; i++) {
      var hit = (cfg.locations[i].localities || []).find(function (l) { return l.key === key; });
      if (hit) return hit.label;
    }
    return key;
  }

  function labelFor(kind, key) {
    if (!key) return '';
    var cfg = loadQuiz();
    var list = kind === 'city' || kind === 'location' ? cfg.locations
             : kind === 'budget' ? cfg.budgets
             : kind === 'purpose' ? cfg.purposes
             : kind === 'locality' ? null : null;
    if (kind === 'locality') return localityLabel(key);
    if (!list) return key;
    var hit = list.find(function (o) { return o.key === key; });
    return hit ? hit.label : key;
  }

  /* ---------- matching engine ---------- */

  var WEIGHTS = {
    balanced: { loc: 50, locality: 25, bud: 30, pur: 20 },
    location: { loc: 65, locality: 35, bud: 20, pur: 15 },
    budget:   { loc: 30, locality: 20, bud: 50, pur: 20 }
  };

  function budgetAdj(key) {
    var order = loadQuiz().budgets.map(function (b) { return b.key; });
    var i = order.indexOf(key);
    if (i < 0) return [];
    var adj = [];
    if (i > 0) adj.push(order[i - 1]);
    if (i < order.length - 1) adj.push(order[i + 1]);
    return adj;
  }

  function scoreProperty(p, answers, weights) {
    var w = weights || WEIGHTS.balanced;
    var score = 0, reasons = [];

    if (answers.location) {
      if (p.locationKey === answers.location) { score += w.loc; reasons.push('Exact location match'); }
      else if ((p.nearbyKeys || []).indexOf(answers.location) >= 0) { score += w.loc * 0.4; reasons.push('Near your preferred city'); }
    }
    if (answers.locality && answers.locality !== 'any') {
      if (p.localityKey === answers.locality) { score += w.locality; reasons.push('In your preferred neighbourhood'); }
    }
    if (answers.budget) {
      if ((p.budgetBands || []).indexOf(answers.budget) >= 0) { score += w.bud; reasons.push('Within your range'); }
      else {
        var adj = budgetAdj(answers.budget);
        if ((p.budgetBands || []).some(function (b) { return adj.indexOf(b) >= 0; })) {
          score += w.bud * 0.5; reasons.push('Just outside your range');
        }
      }
    }
    if (answers.purpose) {
      if ((p.purposes || []).indexOf(answers.purpose) >= 0) { score += w.pur; reasons.push('Suits your goal'); }
    }
    return { score: score, reasons: reasons };
  }

  function match(props, answers, opts) {
    opts = opts || {};
    var weights = opts.weights || WEIGHTS.balanced;
    var limit = opts.limit || 6;
    var scored = (props || []).map(function (p) {
      var s = scoreProperty(p, answers || {}, weights);
      return { prop: p, score: s.score, reasons: s.reasons };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    var top = scored.slice(0, limit);
    var fallback = props && props.length > 0 && top.every(function (t) { return t.score === 0; });
    return { results: top, fallback: fallback };
  }

  /* ---------- export ---------- */

  window.PROPSTAR = {
    uid: uid, slug: slug,
    load: load, save: save, resetSeed: resetSeed,
    loadQuiz: loadQuiz, saveQuiz: saveQuiz, resetQuiz: resetQuiz,
    quizConfig: quizConfig, questions: questions, seedQuiz: seedQuiz,
    activeSteps: activeSteps, localitiesFor: localitiesFor, localityLabel: localityLabel,
    labelFor: labelFor,
    match: match, scoreProperty: scoreProperty,
    WEIGHTS: WEIGHTS, budgetAdj: budgetAdj,
    get LOCATIONS() { return clone(loadQuiz().locations); },
    get BUDGETS() { return clone(loadQuiz().budgets); },
    get PURPOSES() { return clone(loadQuiz().purposes); },
    get QUIZ() { return quizConfig(); }
  };
})();
