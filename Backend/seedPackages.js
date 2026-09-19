/*
|--------------------------------------------------------------------------
| Seed Package Catalog
|--------------------------------------------------------------------------
| Seeds the package categories and a sample catalog of active packages so
| the public site (homepage, packages page, Travis AI search) has content
| again. Existing packages/categories are never touched.
|
| Usage:
|   node seedPackages.js
|--------------------------------------------------------------------------
*/
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./src/models/Category");
const TourPackage = require("./src/models/TourPackage");
const User = require("./src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/roambeyondd";

const packageCategories = [
    { name: "Domestic Tours", type: "package", description: "Discover the rich heritage and diverse culture of incredible India.", highlights: ["Heritage sites", "Cultural immersion", "City tours", "Food trails"], sortOrder: 1 },
    { name: "Trekking Expeditions", type: "package", description: "Challenge yourself with breathtaking treks through majestic mountains.", highlights: ["Himalayan trails", "Camping", "Summit treks", "Nature walks"], sortOrder: 2 },
    { name: "Group Tours", type: "package", description: "Travel with friends, family, or like-minded adventurers.", highlights: ["Family trips", "Friends getaway", "Social travel", "Group discounts"], sortOrder: 3 },
    { name: "Honeymoon Packages", type: "package", description: "Begin your journey together in the most romantic settings.", highlights: ["Romantic stays", "Private experiences", "Scenic routes", "Couples activities"], sortOrder: 4 },
    { name: "Corporate Tours", type: "package", description: "Build stronger teams through unforgettable travel experiences.", highlights: ["Team building", "Conference venues", "Luxury stays", "Activity planning"], sortOrder: 5 },
];

const packages = [
    // ── Domestic Tours ────────────────────────────────────────────────────
    {
        title: "Golden Triangle Heritage Tour",
        shortDescription: "Delhi – Agra – Jaipur in 6 days. Red forts, the Taj Mahal, and pink-city palaces.",
        description: "India's most iconic circuit, handcrafted for first-time explorers. Wander the lanes of Old Delhi, watch the sun rise over the Taj Mahal, and ride into Jaipur's royal Amber Fort.",
        category: "Domestic Tours",
        destination: "Delhi, Agra & Jaipur",
        img: "delhi",
        duration: "6D / 5N",
        price: 24999,
        discountPrice: 21999,
        featured: true,
        rating: 4.9,
        reviewsCount: 214,
        maxGroupSize: 12,
        highlights: ["Sunrise at Taj Mahal", "Amber Fort light & sound show", "Old Delhi rickshaw ride", "City Palace & Hawa Mahal"],
        included: ["5 nights 4-star/5-star hotel stay", "Daily breakfast", "Private AC transfers", "Experienced English-speaking guide", "All monument entry tickets"],
        excluded: ["Lunches & dinners", "Personal expenses & tips", "Travel insurance", "Any flights or train tickets"],
        itinerary: [
            { day: 1, title: "Arrival in Delhi", description: "Meet and greet at the airport, transfer to hotel. Evening walk through Chandni Chowk." },
            { day: 2, title: "Old & New Delhi", description: "Visit Jama Masjid, Red Fort, India Gate and Humayun's Tomb with a local historian." },
            { day: 3, title: "Delhi to Agra", description: "Drive to Agra via Yamuna Expressway. Sunset visit to Mehtab Bagh for the classic Taj view." },
            { day: 4, title: "Taj Mahal & Agra Fort", description: "Sunrise at Taj Mahal, then Agra Fort and Itmad-ud-Daulah. Evening drive to Jaipur." },
            { day: 5, title: "Jaipur Royal City", description: "Amber Fort, City Palace, Jantar Mantar and the iconic Hawa Mahal." },
            { day: 6, title: "Departure", description: "Morning at leisure in the Pink City, then transfer to Jaipur airport." },
        ],
        faq: [
            { question: "Is this suitable for first-time visitors to India?", answer: "Absolutely. It covers the most iconic sights at a relaxed pace with a private guide." },
            { question: "Can the itinerary be customised?", answer: "Yes — we can add Ranthambore, Pushkar or extend the tour to 8 nights." },
        ],
    },
    {
        title: "Varanasi Spiritual Sojourn",
        shortDescription: "Ganges aarti, morning boat rides and ancient ghats in the holiest city on earth.",
        description: "Experience the soul of India on the banks of the Ganges. Witness the grand evening Aarti at Dashashwamedh Ghat, wander narrow temple lanes, and sail into a misty sunrise.",
        category: "Domestic Tours",
        destination: "Varanasi",
        img: "varanasi",
        duration: "4D / 3N",
        price: 15999,
        rating: 4.8,
        reviewsCount: 128,
        maxGroupSize: 10,
        highlights: ["Evening Ganga Aarti", "Sunrise boat ride", "Sarnath ruins", "Street-food walk"],
        included: ["3 nights heritage hotel stay", "Daily breakfast", "Ganga boat rides", "Guided ghat walk", "Sarnath excursion"],
        excluded: ["Lunches & dinners", "Camera fees at temples", "Personal expenses"],
        itinerary: [
            { day: 1, title: "Arrival & Evening Aarti", description: "Check in, then an evening boat ride to witness the grand Ganga Aarti." },
            { day: 2, title: "Old City & Sarnath", description: "Morning boat ride, temple walk through the old city, and afternoon excursion to Sarnath." },
            { day: 3, title: "Banarasi Culture", description: "Silk weaving house visit, Banarasi food walk and evening Ghat photography." },
            { day: 4, title: "Departure", description: "Blessings at sunrise ghats and transfer to airport or railway station." },
        ],
        faq: [
            { question: "When is the best time to visit Varanasi?", answer: "October to March offers pleasant weather and grand festivals like Dev Deepawali." },
        ],
    },
    {
        title: "Rajasthan Royal Heritage Circuit",
        shortDescription: "Deserts, forts, and palaces across Udaipur, Jodhpur, Jaisalmer and more.",
        description: "An opulent journey through the land of maharajas. Camp in the Thar desert, watch the sunset over Mehrangarh, and glide across Lake Pichola in Udaipur.",
        category: "Domestic Tours",
        destination: "Rajasthan",
        img: "rajasthan",
        duration: "8D / 7N",
        price: 32999,
        discountPrice: 29900,
        rating: 4.9,
        reviewsCount: 187,
        maxGroupSize: 12,
        highlights: ["Thar desert camel safari", "Lake Pichola boat ride", "Mehrangarh Fort", "Ranthambore safari add-on"],
        included: ["7 nights heritage hotels & desert camp", "All breakfasts", "Private AC transfers", "Guided fort & palace tours"],
        excluded: ["Lunches & dinners", "Desert safari extras", "Camera fees", "Personal expenses"],
        itinerary: [
            { day: 1, title: "Arrive Jaipur", description: "Check in and an evening at leisure around the Pink City." },
            { day: 2, title: "Amber & Old Jaipur", description: "Amber Fort, City Palace, Jantar Mantar and local bazaars." },
            { day: 3, title: "Jaipur to Jodhpur", description: "Scenic drive to the Blue City; evening at Sardar Market." },
            { day: 4, title: "Mehrangarh Fort", description: "Explore the majestic fort and Jaswant Thada, then a walk through the old town." },
            { day: 5, title: "Jodhpur to Jaisalmer", description: "Drive across the Thar; sunset at Gadisar Lake." },
            { day: 6, title: "Jaisalmer Fort & Desert Camp", description: "Golden fortress, then a camel safari and overnight in the desert dunes." },
            { day: 7, title: "Jaisalmer to Udaipur", description: "Fly to Udaipur and spend the evening at Lake Pichola." },
            { day: 8, title: "Departure", description: "City Palace and Crystal Gallery before heading home." },
        ],
        faq: [
            { question: "Do we stay in real desert camps?", answer: "Yes — one night in a premium Swiss-tent camp under the dunes with folk performances and dinner." },
        ],
    },
    {
        title: "Kerala Backwaters & Munnar",
        shortDescription: "Houseboats, tea hills, and tropical calm in God's Own Country.",
        description: "Drift along palm-fringed backwaters in a private houseboat, wander emerald tea plantations in Munnar, and try Ayurveda in the misty hills.",
        category: "Domestic Tours",
        destination: "Kerala",
        img: "kerala",
        duration: "6D / 5N",
        price: 27999,
        rating: 4.7,
        reviewsCount: 96,
        maxGroupSize: 10,
        highlights: ["Private houseboat night", "Munnar tea estates", "Spice garden tour", "Kathakali performance"],
        included: ["5 nights resorts & houseboat", "All breakfasts plus houseboat dinner", "Private transfers", "Munnar sightseeing"],
        excluded: ["Lunches", "Ayurveda spa treatments", "Personal expenses"],
        itinerary: [
            { day: 1, title: "Arrive Kochi", description: "Check in near Fort Kochi and an evening Kathakali show." },
            { day: 2, title: "Fort Kochi", description: "Chinese fishing nets, Dutch Palace and Jew Town." },
            { day: 3, title: "Kochi to Munnar", description: "Drive up through waterfalls; evening at a tea plantation viewpoint." },
            { day: 4, title: "Munnar Hills", description: "Tea museum, Eravikulam National Park and spice gardens." },
            { day: 5, title: "Alleppey Houseboat", description: "Board a private houseboat and cruise the backwaters overnight." },
            { day: 6, title: "Departure", description: "Disembark at Alleppey and transfer to Kochi airport." },
        ],
        faq: [
            { question: "Is the houseboat private?", answer: "Yes — the houseboat is exclusively for your group, with a chef and crew on board." },
        ],
    },

    // ── Trekking Expeditions ──────────────────────────────────────────────
    {
        title: "Kedarkantha Winter Trek",
        shortDescription: "Summit a 12,500-ft Himalayan peak through snow-laden pine forests.",
        description: "One of India's most loved winter treks. Climb through frozen meadows and snow-covered camps to a panoramic summit of Kedarkantha.",
        category: "Trekking Expeditions",
        destination: "Uttarakhand",
        img: "trek",
        duration: "6D / 5N",
        price: 8999,
        featured: true,
        rating: 4.8,
        reviewsCount: 342,
        maxGroupSize: 14,
        highlights: ["12,500-ft summit", "Snow camping", "Bonfire & folk nights", "Frozen lake detour"],
        included: ["All trekking permits & fees", "Experienced trek leader", "5 nights camping/tents", "All meals on trek", "Safety & first-aid kit"],
        excluded: ["Travel to Dehradun", "Personal trekking gear", "Backpack porter (extra)"],
        itinerary: [
            { day: 1, title: "Base Camp at Sankri", description: "Arrive, gear check and evening orientation." },
            { day: 2, title: "Sankri to Juda Ka Talab", description: "Steady climb through pine and oak forests to the frozen lake." },
            { day: 3, title: "To Kedarkantha Base", description: "Climb to the summit base camp amid open meadows." },
            { day: 4, title: "Summit Day", description: "Pre-dawn ascent to the 12,500-ft summit for sunrise, then descend to camp." },
            { day: 5, title: "Descent to Sankri", description: "Trek back down past Juda Ka Talab to the base village." },
            { day: 6, title: "Departure", description: "Buffet breakfast and onward travel from Sankri." },
        ],
        faq: [
            { question: "Do I need prior trekking experience?", answer: "Basic fitness is enough — this is a beginner-friendly winter trek with a professional team." },
        ],
    },
    {
        title: "Valley of Flowers & Hemkund Sahib",
        shortDescription: "A UNESCO-listed floral valley blooming against snow-capped peaks.",
        description: "Trek to the legendary Valley of Flowers when it bursts into colour, and further up to the sacred Sikh shrine of Hemkund Sahib.",
        category: "Trekking Expeditions",
        destination: "Uttarakhand",
        duration: "7D / 6N",
        price: 12999,
        img: "mountain",
        rating: 4.7,
        reviewsCount: 154,
        maxGroupSize: 12,
        highlights: ["UNESCO floral valley", "Hemkund Sahib", "Alpine meadows", "Photography paradise"],
        included: ["Permits & forest fees", "Licensed trek leader", "Camping & guesthouse stays", "All meals on trek"],
        excluded: ["Travel to Rishikesh", "Personal gear", "Porters (extra)"],
        itinerary: [
            { day: 1, title: "Drive from Rishikesh", description: "Scenic drive to Govindghat and on to Pulna village camp." },
            { day: 2, title: "Pulna to Ghangaria", description: "Climb through forested switchbacks to the valley base." },
            { day: 3, title: "Valley of Flowers", description: "Full day of exploration inside the UNESCO-listed valley." },
            { day: 4, title: "Hemkund Sahib", description: "Steep ascent to the Sikh pilgrimage lake at 15,000 ft." },
            { day: 5, title: "Valley again", description: "Optional second visit to the valley or rest day at Ghangaria." },
            { day: 6, title: "Descent", description: "Trek down to Govindghat and drive to Rishikesh." },
            { day: 7, title: "Departure", description: "Farewell and onward travel." },
        ],
        faq: [
            { question: "When do the flowers bloom?", answer: "Peak bloom is July to mid-September; we schedule all departures in this window." },
        ],
    },
    {
        title: "Hampta Pass Trek",
        shortDescription: "Cross a high mountain pass from verdant Kullu to barren Lahaul.",
        description: "An epic crossover trek from the lush green of Kullu Valley into the stark, moonlike landscapes of Lahaul, ending with a drive over the mighty Rohtang.",
        category: "Trekking Expeditions",
        destination: "Himachal Pradesh",
        img: "mountain",
        duration: "5D / 4N",
        price: 10999,
        rating: 4.8,
        reviewsCount: 231,
        maxGroupSize: 14,
        highlights: ["14,100-ft Hampta Pass", "River crossings", "Crossover landscapes", "Chandratal add-on"],
        included: ["Permits & fees", "Trek leader & support staff", "4 nights camping", "All meals on trek"],
        excluded: ["Travel to Manali", "Personal gear", "Chandratal add-on (extra)"],
        itinerary: [
            { day: 1, title: "Manali briefing", description: "Arrive in Manali, gear check, and night in the base hostel." },
            { day: 2, title: "To Chika", description: "Short drive then a gentle trek into the forest campsite." },
            { day: 3, title: "Chika to Balu Ka Ghera", description: "Climb through alpine meadows with views of Deo Tibba." },
            { day: 4, title: "Hampta Pass Crossing", description: "Summit the pass at dawn and descend into the Lahaul valley." },
            { day: 5, title: "Chatru & Rohtang", description: "Trek out to Chatru and drive over Rohtang Pass to Manali." },
        ],
        faq: [
            { question: "How fit do I need to be?", answer: "Moderate fitness with the ability to trek 6-8 hours with a light daypack." },
        ],
    },
    {
        title: "Roopkund Mystery Lake Trek",
        shortDescription: "Climb to the frozen glacial lake surrounded by the mysteries of the Himalayas.",
        description: "Trekkers' favourite through dense forests and rhododendron jungles to the high-altitude frozen lake, with sunrise views over the Trishul massif.",
        category: "Trekking Expeditions",
        destination: "Uttarakhand",
        img: "trek",
        duration: "7D / 6N",
        price: 13999,
        rating: 4.6,
        reviewsCount: 89,
        maxGroupSize: 12,
        highlights: ["Frozen mystery lake", "Rhododendron forests", "Trishul sunrise", "Alpine camps"],
        included: ["Permits & fees", "Experienced guide & cook", "Camping with equipment", "All meals on trek"],
        excluded: ["Travel to Kathgodam", "Personal gear", "Rain gear (optional hire)"],
        itinerary: [
            { day: 1, title: "Arrive Lohajung", description: "Base camp check-in and trek briefing." },
            { day: 2, title: "Lohajung to Didna", description: "Descent into the Neel Ganga valley and forest camps." },
            { day: 3, title: "Didna to Ali Bugyal", description: "Climb through dense woods to the vast alpine meadow." },
            { day: 4, title: "Ali Bugyal to Patar Nachani", description: "Ridge walk with sweeping views of Nanda Devi." },
            { day: 5, title: "Roopkund Lake", description: "Steep climb to the frozen lake and back to camp just below." },
            { day: 6, title: "Descent to Wan", description: "Long descent through forest to the village of Wan." },
            { day: 7, title: "Return", description: "Drive back through the meadows of Kafni and on to Kathgodam." },
        ],
        faq: [
            { question: "Can beginners attempt Roopkund?", answer: "It is moderate-to-hard. Six months of regular cardio is recommended before booking." },
        ],
    },

    // ── Group Tours ───────────────────────────────────────────────────────
    {
        title: "Leh Ladakh Adventure Expedition",
        shortDescription: "High passes, monasteries and a stunning Shatmerg — the ultimate India bucket trip.",
        description: "Roam through world's highest motorable roads, crescent-shaped Pangong Lake, Nubra's sand dunes, and serene monasteries on this legendary Ladakh loop.",
        category: "Group Tours",
        destination: "Ladakh",
        img: "ladakh",
        duration: "9D / 8N",
        price: 29999,
        discountPrice: 27499,
        rating: 4.8,
        reviewsCount: 178,
        maxGroupSize: 16,
        highlights: ["Khardung La & Nubra Valley", "Pangong Lake", "Monasteries & local homestays", "Sunset at Magnetic Hill"],
        included: ["8 nights hotels & homestays", "All breakfasts & dinners", "Shared 4-wheeler for the loop", "Experienced tour captain"],
        excluded: ["Lunches", "Inner line permits (arranged)", "Bike/ATV activities (extra)"],
        itinerary: [
            { day: 1, title: "Arrive in Leh", description: "Acclimatisation day — rest, hydration and a monastery visit." },
            { day: 2, title: "Leh Sights", description: "Shanti Stupa, Leh Palace and the Hall of Fame museum." },
            { day: 3, title: "Leh to Nubra", description: "Over Khardung La to the sand dunes and double-humped camels at Hunder." },
            { day: 4, title: "Nubra to Pangong", description: "Cross Shyok river, climb Wari La and reach the stunning Pangong Tso." },
            { day: 5, title: "Pangong to Leh", description: "Drive back along the colourful Chang La pass." },
            { day: 6, title: "Leh to Tso Moriri", description: "High-altitude lake via Chumathang hot springs." },
            { day: 7, title: "Tso Moriri to Leh", description: "Return through Puga valley." },
            { day: 8, title: "Flexi / Hemis", description: "Optional Hemis monastery festival, markets and souvenir shopping." },
            { day: 9, title: "Departure", description: "Flight or drive onward from Leh." },
        ],
        faq: [
            { question: "Is this too strenuous at high altitude?", answer: "We include acclimatisation days and keep a relaxed pace with a captain who watches for AMS." },
        ],
    },
    {
        title: "Spiti Valley Group Expedition",
        shortDescription: "Trek one of India's most remote valleys with its gompas and moonscapes.",
        description: "Discover the cold desert of Spiti — Kesari-towered monasteries, Key Monastery, Chandratal Lake and the highest villages in the world.",
        category: "Group Tours",
        destination: "Himachal Pradesh",
        img: "mountain",
        duration: "8D / 7N",
        price: 22999,
        rating: 4.7,
        reviewsCount: 141,
        maxGroupSize: 16,
        highlights: ["Key Monastery", "Chandratal Lake", "Highest villages", "Kaza & Tabo monasteries"],
        included: ["7 nights homestays & hotels", "All breakfasts & dinners", "Tempo traveller for the circuit", "Local guides"],
        excluded: ["Lunches", "Permits (arranged by us)", "Soft drinks & personal expenses"],
        itinerary: [
            { day: 1, title: "Drive Shimla to Sangla", description: "Cross the apple orchards of Kinnaur to the Baspa valley." },
            { day: 2, title: "Sangla to Nako", description: "Over the Karcham bridge and up through the hanging villages." },
            { day: 3, title: "Nako to Tabo", description: "Visit the 1000-year-old Tabo monastery, the 'Ajanta of the Himalayas'." },
            { day: 4, title: "Tabo to Kaza", description: "Explore Dhankar and reach the Spiti headquarters, Kaza." },
            { day: 5, title: "Key Monastery & Kibber", description: "Morning at the iconic Key Monastery, then to the high-altitude village of Kibber." },
            { day: 6, title: "Kaza to Chandratal", description: "Cross Kunzu La to the crescent moon lake at 14,100 ft." },
            { day: 7, title: "Chandratal to Manali", description: "Descend via Batal and over Kunzum into the Kullu valley." },
            { day: 8, title: "Depart Manali", description: "Farewell breakfast and onward journey." },
        ],
        faq: [
            { question: "When does Spiti open?", answer: "The valley is accessible June to October; July-September offers the greenest landscapes." },
        ],
    },
    {
        title: "Goa Group Beachescape",
        shortDescription: "Sun, sand and late-night vibes with street food crawls and island hopping.",
        description: "A high-energy group holiday — beach shacks, water sports, river cruises and North Goa's legendary nightlife, all sorted for you.",
        category: "Group Tours",
        destination: "Goa",
        img: "goa",
        duration: "5D / 4N",
        price: 15999,
        discountPrice: 14499,
        rating: 4.6,
        reviewsCount: 265,
        maxGroupSize: 18,
        highlights: ["North-South Goa loop", "Dudhsagar falls day trip", "Island beach cruise", "Street food crawl"],
        included: ["4 nights beachside stays", "Daily breakfast", "AC group transfers", "Boat party & water sports session"],
        excluded: ["Lunches & dinners", "Personal expenses", "Adventure activities beyond inclusions"],
        itinerary: [
            { day: 1, title: "Arrive in Goa", description: "Check in to your beach resort and a sunset walk on Baga beach." },
            { day: 2, title: "North Goa", description: "Fort Aguada, a spice plantation and an evening at the riverside shacks." },
            { day: 3, title: "Dudhsagar & South", description: "Full-day jeep safari to Dudhsagar falls, then south to Palolem." },
            { day: 4, title: "Island Cruise", description: "Boat party on the Mandovi with snorkelling stop and beach games." },
            { day: 5, title: "Departure", description: "Leisure morning, souvenir shopping and flight onward." },
        ],
        faq: [
            { question: "Is this a party trip?", answer: "It's flexible — nights are social but optional; sightseeing days are well-paced for everyone." },
        ],
    },

    // ── Honeymoon Packages ────────────────────────────────────────────────
    {
        title: "Andaman Honeymoon Escape",
        shortDescription: "White sands, coral reefs and private sunset cruises in the Bay of Bengal.",
        description: "A picture-perfect tropical honeymoon — Radhanagar Beach, glass-bottom boat rides, a private sunset cruise, and a seaplane aerial view of Havelock.",
        category: "Honeymoon Packages",
        destination: "Andaman Islands",
        img: "andaman",
        duration: "6D / 5N",
        price: 34999,
        discountPrice: 32499,
        featured: true,
        rating: 4.9,
        reviewsCount: 201,
        maxGroupSize: 2,
        highlights: ["Radhanagar Beach", "Private sunset cruise", "Coral Island sea sax", "Candlelight beach dinner"],
        included: ["5 nights premium resorts", "Daily breakfast & one candlelight dinner", "All ferry & cruise transfers", "Couple photoshoot (30 mins)"],
        excluded: ["Lunches", "Water sports & scuba (extra)", "Seaplane add-on (extra)"],
        itinerary: [
            { day: 1, title: "Arrive Port Blair", description: "Cellular Jail light & sound show in the evening." },
            { day: 2, title: "To Havelock", description: "Morning ferry; evening at the famous Radhanagar Beach." },
            { day: 3, title: "Havelock Waters", description: "Snorkelling at Elephant Beach and a private sunset cruise." },
            { day: 4, title: "Port Blair & Ross", description: "Return to Port Blair and explore Ross Island." },
            { day: 5, title: "Candlelight Dinner", description: "Leisure day with couples spa and a candlelight beach dinner." },
            { day: 6, title: "Departure", description: "Transfer to airport with memories (and photos!) in hand." },
        ],
        faq: [
            { question: "Do I need a permit for the islands?", answer: "No — permits are arranged by us and are included in the package." },
        ],
    },
    {
        title: "Kashmir Honeymoon Pure",
        shortDescription: "Shikara rides on Dal Lake, Gulmarg meadows and a houseboat romance.",
        description: "Float on shikaras, sleep in a heritage houseboat, ride the Gulmarg gondola, and enjoy a private evening in the meadow-like meadows of Pahalgam.",
        category: "Honeymoon Packages",
        destination: "Kashmir",
        img: "kashmir",
        duration: "5D / 4N",
        price: 24999,
        rating: 4.8,
        reviewsCount: 164,
        maxGroupSize: 2,
        highlights: ["Deluxe houseboat on Dal", "Gulmarg gondola", "Pahalgam meadows", "Saffron fields (seasonal)"],
        included: ["2 nights deluxe houseboat", "2 nights 4-star hotel", "All breakfasts & dinners", "Private cab with driver"],
        excluded: ["Lunches", "Shikara souvenirs & shared rides", "Personal expenses"],
        itinerary: [
            { day: 1, title: "Arrive Srinagar", description: "Settle into the deluxe houseboat on Dal Lake and an evening shikara ride." },
            { day: 2, title: "Srinagar Sights", description: "Mughal gardens, Hazratbal shrine and the old city's spice market." },
            { day: 3, title: "Gulmarg Gondola", description: "Full day at Gulmarg with the cable car to 11,000 ft snowline." },
            { day: 4, title: "Pahalgam Valley", description: "Drive to Pahalgam for a picnic by the Lidder river." },
            { day: 5, title: "Departure", description: "Breakfast with a view of the Dal, then departure." },
        ],
        faq: [
            { question: "Do we stay actually on the lake?", answer: "Yes — the deluxe houseboat is moored on the Dal Lake with its own chef and dining room." },
        ],
    },
    {
        title: "Udaipur Romantic Gateway",
        shortDescription: "Palaces, lakes and sunset boat sails — a honeymoon in the 'Venice of the East'.",
        description: "Celebrate with stays by Lake Pichola, morning yoga by the water, a sunset boat sail, and a private dinner in a haveli courtyard.",
        category: "Honeymoon Packages",
        destination: "Udaipur",
        img: "udaipur",
        duration: "4D / 3N",
        price: 21999,
        discountPrice: 19999,
        rating: 4.7,
        reviewsCount: 118,
        maxGroupSize: 2,
        highlights: ["Lake Pichola sunset sail", "Haveli courtyard dinner", "City Palace & Crystal Gallery", "Private couple spa"],
        included: ["3 nights lake-view heritage hotel", "Daily breakfast", "One private haveli dinner", "Couple spa session", "All transfers"],
        excluded: ["Lunches", "Personal expenses", "Saree/turban photoshoot (extra)"],
        itinerary: [
            { day: 1, title: "Arrive Udaipur", description: "Check in with lake views and a leisurely evening walk." },
            { day: 2, title: "City Palace & Lake", description: "City Palace, Crystal Gallery, then a sunset boat sail on Lake Pichola." },
            { day: 3, title: "Kumbhalgarh & Haveli", description: "Day trip to the great wall of Kumbhalgarh, returning for a private haveli dinner." },
            { day: 4, title: "Departure", description: "Morning yoga by the lake and departure." },
        ],
        faq: [
            { question: "Can the haveli dinner be upgraded to a palace dining?", answer: "Yes — we can arrange rooftop dining at a heritage palace for a small upgrade." },
        ],
    },

    // ── Corporate Tours ───────────────────────────────────────────────────
    {
        title: "Jim Corbett Corporate Retreat",
        shortDescription: "Team offsites, jungle safaris and bonfire evenings under the stars.",
        description: "Mix strategy with adventure — morning safari into Corbett's tiger territory, riverside team activities, and bonfire network nights in a luxury resort.",
        category: "Corporate Tours",
        destination: "Jim Corbett, Uttarakhand",
        img: "default",
        duration: "3D / 2N",
        price: 21999,
        rating: 4.6,
        reviewsCount: 57,
        maxGroupSize: 40,
        highlights: ["Canter jungle safari", "Riverside team games", "Bonfire & BBQ night", "Conference facilities"],
        included: ["2 nights luxury resort", "All meals", "Safari + naturalist", "Conference hall & AV setup", "Team-building coordinator"],
        excluded: ["Alcohol", "Transport to resort", "Personal expenses"],
        itinerary: [
            { day: 1, title: "Arrival & Bonfire", description: "Check in, settle, and an opening bonfire evening with team intro games." },
            { day: 2, title: "Safari & Workshops", description: "Morning jungle safari, afternoon offsite workshop, evening riverside BBQ." },
            { day: 3, title: "Departure", description: "Morning nature walk and a debrief session before departure." },
        ],
        faq: [
            { question: "Can we run confidential sessions?", answer: "Yes — the conference hall is private with AV, projectors and breakout rooms." },
        ],
    },
    {
        title: "Rishikesh Team Offsite",
        shortDescription: "Rappelling, rafting and riverside campfires for a team that loves adventure.",
        description: "A high-energy offsite by the Ganges with white-water rafting, cliff jumps, leadership games and yoga at dawn rolled into a cliffside camp.",
        category: "Corporate Tours",
        destination: "Rishikesh, Uttarakhand",
        img: "mountain",
        duration: "3D / 2N",
        price: 18999,
        rating: 4.7,
        reviewsCount: 73,
        maxGroupSize: 30,
        highlights: ["Ganga rafting (16 km)", "Cliff jump & beach games", "Morning yoga session", "Campfire team night"],
        included: ["2 nights riverside camp", "All meals + BBQ night", "Rafting & adventure activities", "Team-building facilitators"],
        excluded: ["Transport to Rishikesh", "Alcohol", "Personal expenses"],
        itinerary: [
            { day: 1, title: "Arrival & Icebreakers", description: "Settle into the riverside camp and evening icebreaker games." },
            { day: 2, title: "Rafting & Leadership", description: "16-km raft with cliff jumps, afternoon leadership workshops, campfire night." },
            { day: 3, title: "Yoga & Departure", description: "Sunrise yoga by the Ganges and wrap-up before departure." },
        ],
        faq: [
            { question: "Is the rafting safe for non-swimmers?", answer: "Yes — everyone wears certified life jackets and a professional river guide accompanies the raft." },
        ],
    },
    {
        title: "Udaipur Luxury Conference",
        shortDescription: "Palace-style conference, lake dinners and team awards in regal luxury.",
        description: "A premium offsite at a lakeside palace hotel with full conference support, gala dinner, and optional polo-show or lake excursion for the team.",
        category: "Corporate Tours",
        destination: "Udaipur, Rajasthan",
        img: "udaipur",
        duration: "3D / 2N",
        price: 39999,
        rating: 4.8,
        reviewsCount: 41,
        maxGroupSize: 25,
        highlights: ["Palace conference halls", "Gala lake-view dinner", "Team awards & cultural night", "City Palace evening"],
        included: ["2 nights palace-hotel stay", "All meals + gala dinner", "Conference venue & AV", "Team-building & entertainment"],
        excluded: ["Transport", "Alcohol", "Optional polo show (extra)"],
        itinerary: [
            { day: 1, title: "Arrival & Welcome", description: "Check in at the palace hotel with a welcome drink by the lake." },
            { day: 2, title: "Conference Day", description: "Morning conference, afternoon City Palace & boat ride, evening gala dinner with awards." },
            { day: 3, title: "Departure", description: "Buffet breakfast and check-out." },
        ],
        faq: [
            { question: "Can we host a plenary for 50+ delegates?", answer: "Yes — larger groups use the grand ballroom; we coordinate AV, trussing and banquet services." },
        ],
    },
];

const IMG = {
    delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80&auto=format&fit=crop',
    varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=80&auto=format&fit=crop',
    rajasthan: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80&auto=format&fit=crop',
    kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80&auto=format&fit=crop',
    trek: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80&auto=format&fit=crop',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop',
    ladakh: 'https://images.unsplash.com/photo-1591019479261-1a103585c559?w=1200&q=80&auto=format&fit=crop',
    goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80&auto=format&fit=crop',
    andaman: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&q=80&auto=format&fit=crop',
    kashmir: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=80&auto=format&fit=crop',
    udaipur: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop',
};

const pickImage = (slugSeed, imgKey) => [
    {
        url: IMG[imgKey] || IMG.default,
        publicId: `unsplash/${slugSeed}`
    }
];

async function seedCategories() {
    for (const cat of packageCategories) {
        const exists = await Category.findOne({ name: cat.name });
        if (!exists) {
            await Category.create(cat);
            console.log(`Created category: ${cat.name}`);
        } else {
            console.log(`Category exists: ${cat.name}`);
        }
    }
}

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const admin = await User.findOne({ role: "admin" }).select("_id").lean()
            || await User.findOne({ role: "agent" }).select("_id").lean()
            || await User.findOne({}).select("_id").lean();

        if (!admin) {
            console.error("No user found to set as package owner. Run `node seedAdmin.js` first.");
            process.exit(1);
        }

        await seedCategories();

        let created = 0;
        let skipped = 0;

        for (const pkg of packages) {
            const exists = await TourPackage.findOne({ title: pkg.title });
            if (exists) {
                console.log(`Package exists: ${pkg.title}`);
                skipped += 1;
                continue;
            }
            const slug = pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            await TourPackage.create({
                ...pkg,
                slug,
                images: pickImage(slug, pkg.img),
                createdBy: admin._id
            });
            console.log(`Created package: ${pkg.title}`);
            created += 1;
        }

        console.log(`Seed complete. Created ${created} package(s), skipped ${skipped} existing.`);
        await mongoose.disconnect();
    } catch (err) {
        console.error("Seed failed:", err.message);
        process.exit(1);
    }
}

seed();