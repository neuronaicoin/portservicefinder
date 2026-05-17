'use client';
import { useState, useEffect, useRef } from 'react';

// ============================================================
// DATA
// ============================================================
const PORT_DATA: Record<string, string[]> = {
  'Albania': ['Durrës', 'Vlorë', 'Shëngjin'],
  'Algeria': ['Algiers', 'Oran', 'Annaba', 'Skikda', 'Béjaïa', 'Djendjene'],
  'Angola': ['Luanda', 'Lobito', 'Namibe', 'Soyo'],
  'Argentina': ['Buenos Aires', 'Bahía Blanca', 'Rosario', 'Mar del Plata', 'Quequén', 'San Lorenzo', 'Ushuaia'],
  'Australia': ['Port Hedland', 'Fremantle', 'Melbourne', 'Sydney', 'Brisbane', 'Gladstone', 'Darwin', 'Adelaide', 'Townsville'],
  'Bahrain': ['Mina Salman', 'Khalifa Bin Salman'],
  'Bangladesh': ['Chittagong', 'Mongla'],
  'Belgium': ['Antwerp', 'Ghent', 'Zeebrugge'],
  'Brazil': ['Santos', 'Rio de Janeiro', 'Paranaguá', 'Itajaí', 'Manaus', 'Fortaleza', 'Recife', 'Salvador', 'Vitória', 'Rio Grande'],
  'Bulgaria': ['Varna', 'Burgas'],
  'Canada': ['Vancouver', 'Prince Rupert', 'Montreal', 'Halifax', 'Saint John NB', 'Thunder Bay'],
  'Chile': ['Valparaíso', 'San Antonio', 'Antofagasta', 'Iquique', 'Arica', 'Punta Arenas'],
  'China': ['Shanghai', 'Tianjin', 'Qingdao', 'Guangzhou', 'Ningbo-Zhoushan', 'Shenzhen', 'Dalian', 'Xiamen', 'Nanjing', 'Fuzhou'],
  'Colombia': ['Cartagena', 'Buenaventura', 'Barranquilla', 'Santa Marta'],
  'Croatia': ['Rijeka', 'Split', 'Zadar', 'Dubrovnik', 'Ploče'],
  'Cyprus': ['Limassol', 'Famagusta', 'Larnaca'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Esbjerg', 'Fredericia', 'Aalborg'],
  'Djibouti': ['Djibouti', 'Doraleh'],
  'Ecuador': ['Guayaquil', 'Manta', 'Esmeraldas'],
  'Egypt': ['Alexandria', 'Port Said', 'Suez', 'Damietta', 'East Port Said'],
  'Estonia': ['Tallinn', 'Sillamäe', 'Muuga'],
  'Finland': ['Helsinki', 'Kotka', 'Turku', 'Hanko', 'Rauma'],
  'France': ['Marseille', 'Le Havre', 'Dunkirk', 'Bordeaux', 'Nantes', 'Rouen', 'Calais'],
  'Germany': ['Hamburg', 'Bremen', 'Bremerhaven', 'Rostock', 'Lübeck', 'Kiel', 'Emden'],
  'Ghana': ['Tema', 'Takoradi'],
  'Greece': ['Piraeus', 'Thessaloniki', 'Volos', 'Patras', 'Heraklion', 'Kavala', 'Elefsina', 'Lavrio'],
  'Honduras': ['Puerto Cortés', 'San Lorenzo'],
  'Hong Kong': ['Kwai Tsing', 'Stonecutters'],
  'India': ['Mumbai', 'Chennai', 'Kolkata', 'Kandla', 'Nhava Sheva (JNPT)', 'Visakhapatnam', 'Paradip', 'Cochin'],
  'Indonesia': ['Jakarta / Tanjung Priok', 'Surabaya', 'Belawan (Medan)', 'Makassar', 'Semarang', 'Balikpapan'],
  'Iran': ['Bandar Abbas', 'Imam Khomeini', 'Bushehr', 'Bandar Anzali'],
  'Iraq': ['Umm Qasr', 'Khor al-Zubair', 'Basra'],
  'Ireland': ['Dublin', 'Cork', 'Waterford', 'Galway'],
  'Israel': ['Haifa', 'Ashdod', 'Eilat'],
  'Italy': ['Genoa', 'Naples', 'Livorno', 'Taranto', 'Venice', 'Trieste', 'Gioia Tauro', 'Civitavecchia', 'Ravenna', 'Ancona'],
  'Japan': ['Yokohama', 'Osaka', 'Nagoya', 'Kobe', 'Tokyo', 'Hakata', 'Chiba', 'Kawasaki', 'Niigata'],
  'Jordan': ['Aqaba'],
  'Kenya': ['Mombasa', 'Lamu'],
  'Kuwait': ['Kuwait City / Shuwaikh', 'Shuaiba'],
  'Latvia': ['Riga', 'Ventspils', 'Liepāja'],
  'Libya': ['Tripoli', 'Benghazi', 'Misrata', 'Tobruk'],
  'Lithuania': ['Klaipeda'],
  'Malaysia': ['Port Klang', 'Penang', 'Johor', 'Kuching', 'Kota Kinabalu', 'Bintulu', 'Tanjung Pelepas'],
  'Malta': ['Valletta / Grand Harbour', 'Marsaxlokk'],
  'Mauritius': ['Port Louis'],
  'Mexico': ['Manzanillo', 'Veracruz', 'Altamira', 'Lázaro Cárdenas', 'Ensenada', 'Tampico'],
  'Morocco': ['Casablanca', 'Tanger Med', 'Agadir', 'Safi', 'Nador'],
  'Mozambique': ['Maputo', 'Beira', 'Nacala'],
  'Myanmar': ['Yangon / Thilawa', 'Kyaukpyu'],
  'Namibia': ['Walvis Bay', 'Lüderitz'],
  'Netherlands': ['Rotterdam', 'Amsterdam', 'Vlissingen', 'Moerdijk', 'Terneuzen'],
  'New Zealand': ['Auckland', 'Tauranga', 'Wellington', 'Lyttelton', 'Port Chalmers'],
  'Nigeria': ['Lagos / Apapa', 'Tin Can Island', 'Onne', 'Port Harcourt', 'Calabar', 'Warri'],
  'Norway': ['Oslo', 'Bergen', 'Stavanger', 'Tromsø', 'Trondheim', 'Kristiansand', 'Narvik'],
  'Oman': ['Muscat / Port Sultan Qaboos', 'Salalah', 'Sohar', 'Duqm'],
  'Pakistan': ['Karachi', 'Port Qasim', 'Gwadar'],
  'Panama': ['Balboa', 'Manzanillo', 'Colón', 'Cristóbal'],
  'Peru': ['Callao', 'Paita', 'Ilo', 'Matarani'],
  'Philippines': ['Manila', 'Cebu', 'Davao', 'General Santos', 'Cagayan de Oro', 'Batangas'],
  'Poland': ['Gdańsk', 'Gdynia', 'Szczecin', 'Świnoujście'],
  'Portugal': ['Lisbon', 'Sines', 'Porto / Leixões', 'Setúbal'],
  'Qatar': ['Doha / Hamad Port', 'Ras Laffan'],
  'Romania': ['Constanța', 'Galați', 'Brăila', 'Tulcea'],
  'Russia': ['Novorossiysk', 'St. Petersburg', 'Vladivostok', 'Nakhodka', 'Murmansk', 'Kaliningrad'],
  'Saudi Arabia': ['Jeddah', 'Dammam / King Abdulaziz', 'Yanbu', 'Jubail', 'Jizan', 'Ras Tanura'],
  'Senegal': ['Dakar'],
  'Singapore': ['Singapore', 'Jurong', 'Tuas', 'Pasir Panjang'],
  'Slovenia': ['Koper'],
  'South Africa': ['Durban', 'Cape Town', 'Port Elizabeth', 'Richards Bay', 'East London', 'Saldanha'],
  'South Korea': ['Busan', 'Incheon', 'Ulsan', 'Pohang', 'Gwangyang', 'Pyeongtaek'],
  'Spain': ['Barcelona', 'Valencia', 'Bilbao', 'Algeciras', 'Las Palmas', 'Cartagena', 'Huelva', 'Tarragona'],
  'Sri Lanka': ['Colombo', 'Hambantota', 'Trincomalee'],
  'Sudan': ['Port Sudan'],
  'Sweden': ['Gothenburg', 'Stockholm', 'Malmö', 'Gävle', 'Luleå'],
  'Taiwan': ['Kaohsiung', 'Keelung', 'Taichung'],
  'Tanzania': ['Dar es Salaam', 'Tanga', 'Zanzibar'],
  'Thailand': ['Bangkok / Laem Chabang', 'Map Ta Phut', 'Songkhla'],
  'Togo': ['Lomé'],
  'Tunisia': ['Tunis / La Goulette', 'Sousse', 'Sfax', 'Bizerte'],
  'Turkey': ['Mersin', 'Istanbul', 'Izmir', 'Iskenderun', 'Gemlik', 'Aliaga', 'Derince', 'Samsun', 'Trabzon', 'Antalya', 'Zonguldak', 'Bandırma', 'Mudanya', 'Tekirdağ'],
  'UAE': ['Dubai / Jebel Ali', 'Abu Dhabi', 'Sharjah', 'Fujairah', 'Ras Al Khaimah', 'Khalifa Port'],
  'Ukraine': ['Odessa', 'Yuzhne', 'Chornomorsk', 'Mykolaiv'],
  'United Kingdom': ['London', 'Liverpool', 'Southampton', 'Aberdeen', 'Felixstowe', 'Grimsby', 'Tilbury', 'Hull', 'Tees', 'Belfast', 'Milford Haven', 'Immingham'],
  'United States': ['New Orleans', 'Houston', 'Los Angeles', 'New York / New Jersey', 'Baltimore', 'Seattle', 'Miami', 'Savannah', 'Charleston', 'Norfolk', 'Long Beach', 'Oakland', 'Tampa', 'Jacksonville', 'Philadelphia'],
  'Uruguay': ['Montevideo', 'Nueva Palmira'],
  'Venezuela': ['Maracaibo', 'La Guaira', 'Puerto Cabello'],
  'Vietnam': ['Ho Chi Minh City / Cat Lai', 'Hai Phong', 'Da Nang', 'Cai Mep'],
};

const MARINE_SERVICES = [
  { key: 'engine', label: 'Main & Auxiliary Engine' },
  { key: 'refrigeration', label: 'Refrigeration & HVAC' },
  { key: 'electrical', label: 'Electrical & Automation' },
  { key: 'navigation', label: 'Navigation & Communication' },
  { key: 'diving', label: 'Underwater Diving' },
  { key: 'hull', label: 'Hull, Propeller & Rudder' },
  { key: 'crane', label: 'Crane & Hatch Covers' },
  { key: 'welding', label: 'Welding & Fabrication' },
  { key: 'mooring', label: 'Mooring & Rigging' },
  { key: 'survey', label: 'Classification Survey' },
  { key: 'ndt', label: 'Non-Destructive Testing' },
  { key: 'firefighting', label: 'Fire Fighting & Safety' },
  { key: 'ballast', label: 'Ballast Water Treatment' },
  { key: 'hydraulics', label: 'Hydraulics' },
  { key: 'boiler', label: 'Boiler & Steam Systems' },
  { key: 'painting', label: 'Painting & Blasting' },
  { key: 'sewage', label: 'Sewage & MARPOL' },
  { key: 'liferaft', label: 'Liferaft & LSA Service' },
];

interface Provider {
  id: string; type: string; ico: string; name: string; bio: string;
  ports: string[]; country: string; svc: string[];
  phone: string; email: string; wa: string; web: string; addr: string; person: string;
}

const PROVIDERS: Provider[] = [
  { id: 'p001', type: 'agent', ico: '🏢', name: 'Mersin Maritime Agency Ltd.', bio: 'Full-service ship agency operating in Turkish ports since 1994. FONASBA member. Specialists in bulk carriers, tankers and general cargo. 24/7 operations with experienced crew change, customs clearance and bunker coordination.', ports: ['Mersin', 'Iskenderun', 'Gemlik'], country: 'Turkey', svc: ['agent'], phone: '+90 324 238 0000', email: 'info@mersinagency.com', wa: '+905320000000', web: 'https://mersinagency.com', addr: 'Liman Cad. No:14, 33000 Mersin, Turkey', person: 'Capt. Ahmet Yılmaz' },
  { id: 'p002', type: 'chandler', ico: '⚓', name: 'Mersin Ship Supply Co.', bio: 'Leading chandler in South Turkey since 2001. Full provisions, deck/engine stores, bonded goods, spare parts. 24/7 delivery to anchorage and alongside. ISO 9001 certified.', ports: ['Mersin', 'Iskenderun'], country: 'Turkey', svc: ['chandler'], phone: '+90 324 239 1111', email: 'supply@mersinsupply.com', wa: '+905322221111', web: 'https://mersinsupply.com', addr: 'Serbest Bölge, 33020 Mersin, Turkey', person: 'Mehmet Demir' },
  { id: 'p003', type: 'service', ico: '🔧', name: 'MedTech Marine Services', bio: 'Certified refrigeration, HVAC and engine repair engineers. Class-approved workshop in Mersin. MAN authorised. Reefer cargo systems specialist.', ports: ['Mersin'], country: 'Turkey', svc: ['refrigeration', 'engine', 'electrical'], phone: '+90 324 240 2222', email: 'tech@medtechmarine.com', wa: '+905333332222', web: 'https://medtechmarine.com', addr: 'OSB Mah. 4. Sok. No:8, Mersin', person: 'Eng. Ali Kaya' },
  { id: 'p004', type: 'service', ico: '🔧', name: 'Toros Marine Engineering', bio: 'Engine overhaul, welding, hydraulics specialists. Emergency 24/7 response in Mersin and Iskenderun. ABS and Lloyds approved welders.', ports: ['Mersin', 'Iskenderun'], country: 'Turkey', svc: ['engine', 'diving', 'hull', 'welding', 'hydraulics'], phone: '+90 326 555 3333', email: 'ops@torosmarine.com', wa: '+905344443333', web: 'https://torosmarine.com', addr: 'Liman Bölgesi, 31200 Iskenderun', person: 'Mustafa Şahin' },
  { id: 'p005', type: 'service', ico: '🔧', name: 'Istanbul Hull & Diving Co.', bio: 'Class-approved underwater diving services in Istanbul Bosphorus, Aliaga and Tuzla. Propeller polishing, IWS, anodes, hull cleaning.', ports: ['Istanbul', 'Aliaga'], country: 'Turkey', svc: ['diving', 'hull', 'survey'], phone: '+90 212 444 5555', email: 'ops@istanbuldive.com', wa: '+905355554444', web: 'https://istanbuldive.com', addr: 'Karaköy, 34425 Istanbul', person: 'Cpt. Burak Aydın' },
  { id: 'p006', type: 'agent', ico: '🏢', name: 'Istanbul Bosphorus Agency', bio: 'Strait passage and Istanbul port agency. Bunker calls, crew change, supplies. 30 years experience in Turkish Straits.', ports: ['Istanbul', 'Bandırma'], country: 'Turkey', svc: ['agent'], phone: '+90 212 555 6666', email: 'ops@bosphorusagency.com', wa: '+905366665555', web: 'https://bosphorusagency.com', addr: 'Salıpazarı, 34433 Istanbul', person: 'Cpt. Selim Öz' },
  { id: 'p007', type: 'agent', ico: '🏢', name: 'Piraeus Shipping Agents S.A.', bio: 'FONASBA member agency based in Piraeus. All vessel types, comprehensive husbandry since 1982. Greek Shipping Co-operation Committee member.', ports: ['Piraeus', 'Volos', 'Elefsina'], country: 'Greece', svc: ['agent'], phone: '+30 210 422 0000', email: 'info@piraeusagents.gr', wa: '+306900000000', web: 'https://piraeusagents.gr', addr: 'Akti Miaouli 27, 18535 Piraeus', person: 'Cpt. Stavros Papadimitriou' },
  { id: 'p008', type: 'chandler', ico: '⚓', name: 'Aegean Ship Supplies', bio: 'Premier shipchandler in Piraeus and Thessaloniki. Bonded stores, fresh provisions, technical spares. Direct supply to major Greek operators.', ports: ['Piraeus', 'Thessaloniki'], country: 'Greece', svc: ['chandler'], phone: '+30 210 411 2222', email: 'sales@aegeansupply.gr', wa: '+306911112222', web: 'https://aegeansupply.gr', addr: '2 Akti Kondili, 18545 Piraeus', person: 'Yiannis Markopoulos' },
  { id: 'p009', type: 'service', ico: '🔧', name: 'Hellenic Marine Technical', bio: 'Engine repair, electrical and automation services across Greek ports. Wärtsilä and MAN service partner.', ports: ['Piraeus', 'Thessaloniki', 'Patras'], country: 'Greece', svc: ['engine', 'electrical', 'navigation', 'survey'], phone: '+30 210 433 4444', email: 'tech@hellenicmarine.gr', wa: '+306922223333', web: 'https://hellenicmarine.gr', addr: 'Drapetsona Industrial Zone, Piraeus', person: 'Eng. Dimitris Pappas' },
  { id: 'p010', type: 'agent', ico: '🏢', name: 'Rotterdam Port Agency BV', bio: 'Leading independent agency in Rotterdam and Amsterdam. 40 years of port call management for all vessel types.', ports: ['Rotterdam', 'Amsterdam'], country: 'Netherlands', svc: ['agent'], phone: '+31 10 411 0000', email: 'info@rtmagency.nl', wa: '+31612340000', web: 'https://rtmagency.nl', addr: 'Wijnhaven 3, 3011 WG Rotterdam', person: 'Jan van Dijk' },
  { id: 'p011', type: 'chandler', ico: '⚓', name: 'Rotterdam Ship Supplies B.V.', bio: 'Premium chandler serving Rotterdam and Amsterdam. Worldwide procurement. ISO 9001 certified. 24h delivery service.', ports: ['Rotterdam', 'Amsterdam', 'Vlissingen'], country: 'Netherlands', svc: ['chandler'], phone: '+31 10 422 1111', email: 'orders@rtmsupplies.nl', wa: '+31621111222', web: 'https://rtmsupplies.nl', addr: 'Waalhaven Z.z. 39, 3088 HH Rotterdam', person: 'Marcus van der Berg' },
  { id: 'p012', type: 'service', ico: '🔧', name: 'Maasvlakte Marine Services', bio: 'Full technical service in Rotterdam. Engine, hydraulics, electrical, BWTS. Class-approved by DNV, LR, ABS.', ports: ['Rotterdam'], country: 'Netherlands', svc: ['engine', 'electrical', 'hydraulics', 'ballast', 'survey', 'welding'], phone: '+31 10 433 2222', email: 'service@maasvlakte.nl', wa: '+31633332222', web: 'https://maasvlaktemarine.nl', addr: 'Europaweg 875, 3199 LD Rotterdam', person: 'Eng. Pieter Jansen' },
  { id: 'p013', type: 'agent', ico: '🏢', name: 'Singapore Maritime Services Pte.', bio: 'Full agency services in Singapore anchorages. Bunker calls specialist. 24/7 boarding officers.', ports: ['Singapore', 'Jurong'], country: 'Singapore', svc: ['agent'], phone: '+65 6222 0000', email: 'ops@sgmaritime.sg', wa: '+6591110000', web: 'https://sgmaritime.sg', addr: '1 Maritime Square, Singapore 099253', person: 'Cpt. Tan Wei Ming' },
  { id: 'p014', type: 'chandler', ico: '⚓', name: 'Lion City Ship Supply', bio: 'Singapore-based chandler. Fresh provisions from Singapore wet market, bonded stores, technical spares. Global procurement network.', ports: ['Singapore', 'Tuas', 'Jurong'], country: 'Singapore', svc: ['chandler'], phone: '+65 6233 1111', email: 'sales@lioncitysupply.sg', wa: '+6591234567', web: 'https://lioncitysupply.sg', addr: '10 Penjuru Road, Singapore 609122', person: 'Lim Kah Seng' },
  { id: 'p015', type: 'service', ico: '🔧', name: 'Asia Marine Tech Pte.', bio: 'Singapore-based specialists. Navigation, electrical, automation, BWTS. MAN and Wärtsilä authorised. Class-approved.', ports: ['Singapore', 'Jurong'], country: 'Singapore', svc: ['electrical', 'engine', 'survey', 'navigation', 'ballast', 'firefighting'], phone: '+65 6244 2222', email: 'tech@asiamarinetech.sg', wa: '+6592223333', web: 'https://asiamarinetech.sg', addr: '31 Tuas Avenue, Singapore 639441', person: 'Eng. Raj Kumar' },
  { id: 'p016', type: 'agent', ico: '🏢', name: 'Santos Port Agency Ltda.', bio: 'Leading ship agency in Santos and Paranaguá. 30 years serving bulk carriers and tankers in Brazil. CONAPRA certified.', ports: ['Santos', 'Paranaguá'], country: 'Brazil', svc: ['agent'], phone: '+55 13 3211 0000', email: 'ops@santosagency.com.br', wa: '+5513999990000', web: 'https://santosagency.com.br', addr: 'Av. Conselheiro Nébias 248, Santos', person: 'Cpt. Roberto Silva' },
  { id: 'p017', type: 'chandler', ico: '⚓', name: 'BrasilMar Ship Supplies', bio: 'Full chandler services at Santos, Paranaguá and Rio Grande. Fresh provisions, engine stores, bonded. 24/7 delivery.', ports: ['Santos', 'Paranaguá', 'Rio Grande'], country: 'Brazil', svc: ['chandler'], phone: '+55 13 3222 1111', email: 'pedidos@brasilmar.com.br', wa: '+5513988881111', web: 'https://brasilmar.com.br', addr: 'Rua Senador Dantas 75, Santos', person: 'Carlos Mendes' },
  { id: 'p018', type: 'service', ico: '🔧', name: 'BrasilMar Technical Services', bio: 'Refrigeration and HVAC specialists covering the South American Atlantic coast. Emergency response 24/7. ABS authorised.', ports: ['Santos', 'Paranaguá', 'Itajaí'], country: 'Brazil', svc: ['refrigeration', 'engine', 'diving', 'hull', 'electrical'], phone: '+55 13 3233 2222', email: 'tech@brasilmartech.com.br', wa: '+5513977772222', web: 'https://brasilmartech.com.br', addr: 'Av. Eng. Augusto Barata 100, Santos', person: 'Eng. Paulo Costa' },
  { id: 'p019', type: 'agent', ico: '🏢', name: 'Hamburg Maritime Services GmbH', bio: 'Hamburg, Bremerhaven and Bremen port agency. ZBVS member. Specialists in container vessels, RoRo and bulk.', ports: ['Hamburg', 'Bremerhaven', 'Bremen'], country: 'Germany', svc: ['agent'], phone: '+49 40 311 0000', email: 'info@hamburgmaritime.de', wa: '+491701110000', web: 'https://hamburgmaritime.de', addr: 'Steinhöft 9, 20459 Hamburg', person: 'Kapt. Klaus Müller' },
  { id: 'p020', type: 'chandler', ico: '⚓', name: 'Nord Ship Provisions', bio: 'German North Sea chandler. Premium provisions, technical stores, spare parts logistics. EU-bonded warehouse.', ports: ['Hamburg', 'Bremerhaven'], country: 'Germany', svc: ['chandler'], phone: '+49 40 322 1111', email: 'sales@nordprovisions.de', wa: '+491721112222', web: 'https://nordprovisions.de', addr: 'Veddeler Damm 2, 20539 Hamburg', person: 'Heinrich Schmidt' },
  { id: 'p021', type: 'agent', ico: '🏢', name: 'Gulf Maritime Agency LLC', bio: 'Dubai, Jebel Ali, Fujairah and Abu Dhabi agency. 24/7 bunker call handling. UAE-licensed shipping agents.', ports: ['Dubai / Jebel Ali', 'Fujairah', 'Abu Dhabi'], country: 'UAE', svc: ['agent'], phone: '+971 4 393 0000', email: 'ops@gulfmaritime.ae', wa: '+971501110000', web: 'https://gulfmaritime.ae', addr: 'JLT Cluster H, Dubai', person: 'Cpt. Khalid Al Hosani' },
  { id: 'p022', type: 'chandler', ico: '⚓', name: 'Emirates Ship Supplies', bio: 'UAE chandler for all Gulf ports. Halal provisions, bonded stores, technical spares. Express airfreight for spares.', ports: ['Dubai / Jebel Ali', 'Fujairah', 'Sharjah'], country: 'UAE', svc: ['chandler'], phone: '+971 4 384 1111', email: 'orders@emiratesupply.ae', wa: '+971502221111', web: 'https://emiratesupply.ae', addr: 'Jebel Ali Free Zone, Dubai', person: 'Ahmed Al Mansouri' },
  { id: 'p023', type: 'service', ico: '🔧', name: 'Gulf Marine Tech Services', bio: 'Engine, electrical, hull and diving services across UAE ports. ABS and Lloyds approved. Drydock support at Dubai Maritime City.', ports: ['Dubai / Jebel Ali', 'Fujairah'], country: 'UAE', svc: ['engine', 'electrical', 'diving', 'hull', 'welding', 'ballast', 'crane'], phone: '+971 4 395 2222', email: 'tech@gulfmarinetech.ae', wa: '+971503332222', web: 'https://gulfmarinetech.ae', addr: 'Dubai Maritime City, Dubai', person: 'Eng. Hassan Al Rashidi' },
  { id: 'p024', type: 'agent', ico: '🏢', name: 'Shanghai Maritime Agency Co.', bio: 'Shanghai, Ningbo, Qingdao port agency. State-licensed. All vessel types. Mandarin/English/Korean speaking staff.', ports: ['Shanghai', 'Ningbo-Zhoushan', 'Qingdao'], country: 'China', svc: ['agent'], phone: '+86 21 5840 0000', email: 'ops@shanghaiagency.cn', wa: '+8613800000000', web: 'https://shanghaiagency.cn', addr: 'Pudong Avenue 1, Shanghai', person: 'Cpt. Wei Zhang' },
  { id: 'p025', type: 'chandler', ico: '⚓', name: 'East China Ship Supply', bio: 'Chandler in Shanghai, Ningbo, Qingdao. Asian and Western provisions, technical spares, bonded warehouse.', ports: ['Shanghai', 'Ningbo-Zhoushan', 'Qingdao'], country: 'China', svc: ['chandler'], phone: '+86 21 5841 1111', email: 'sales@eastchinasupply.cn', wa: '+8613811111111', web: 'https://eastchinasupply.cn', addr: 'Yangshan Port, Shanghai', person: 'Liu Wei' },
  { id: 'p026', type: 'agent', ico: '🏢', name: 'UK Port Services Ltd.', bio: 'London, Felixstowe, Southampton agency. ITIC insured. Strong relationships with UK port authorities and HMRC.', ports: ['London', 'Felixstowe', 'Southampton'], country: 'United Kingdom', svc: ['agent'], phone: '+44 20 7222 0000', email: 'ops@ukportservices.co.uk', wa: '+447700900000', web: 'https://ukportservices.co.uk', addr: '10 Mark Lane, London EC3R 7BD', person: 'Cpt. James Thompson' },
  { id: 'p027', type: 'service', ico: '🔧', name: 'Tees Marine Engineering', bio: 'NE England technical services covering Tees, Hull, Grimsby. Hot work, NDT, hydraulics, marine electrical.', ports: ['Tees', 'Hull', 'Grimsby', 'Immingham'], country: 'United Kingdom', svc: ['engine', 'welding', 'ndt', 'hydraulics', 'electrical', 'painting'], phone: '+44 1642 222 111', email: 'service@teesmarine.co.uk', wa: '+447701110000', web: 'https://teesmarine.co.uk', addr: 'Riverside Park, Middlesbrough', person: 'Eng. David Wilson' },
  { id: 'p028', type: 'agent', ico: '🏢', name: 'Durban Port Agency Pty.', bio: 'Durban, Cape Town, Richards Bay port agency. SAASOA member. Bulk, tanker and container expertise since 1978.', ports: ['Durban', 'Cape Town', 'Richards Bay'], country: 'South Africa', svc: ['agent'], phone: '+27 31 304 0000', email: 'ops@durbanagency.co.za', wa: '+27821110000', web: 'https://durbanagency.co.za', addr: 'Maydon Wharf, Durban 4001', person: 'Cpt. Sipho Ndlovu' },
  { id: 'p029', type: 'service', ico: '🔧', name: 'Cape Marine Services', bio: 'Cape Town and Saldanha technical services. Underwater diving, hull, propeller. SAMSA approved.', ports: ['Cape Town', 'Saldanha'], country: 'South Africa', svc: ['diving', 'hull', 'engine', 'painting', 'survey'], phone: '+27 21 419 1111', email: 'service@capemarine.co.za', wa: '+27822221111', web: 'https://capemarine.co.za', addr: 'V&A Waterfront, Cape Town', person: 'Eng. Pieter van Wyk' },
  { id: 'p030', type: 'agent', ico: '🏢', name: 'Gulf Coast Maritime Services', bio: 'Houston, New Orleans, Galveston port agency. US Coast Guard documentation specialists. 24/7 emergency response.', ports: ['Houston', 'New Orleans', 'Galveston'], country: 'United States', svc: ['agent'], phone: '+1 713 555 0000', email: 'ops@gulfcoastmaritime.com', wa: '+17135550001', web: 'https://gulfcoastmaritime.com', addr: '1100 Louisiana St, Houston TX', person: 'Cpt. Mike Johnson' },
  { id: 'p031', type: 'chandler', ico: '⚓', name: 'NY Harbor Ship Supply', bio: 'New York/NJ chandler. Bonded warehouse, full provisions, technical stores. USDA-approved facility.', ports: ['New York / New Jersey', 'Baltimore', 'Boston'], country: 'United States', svc: ['chandler'], phone: '+1 212 555 1111', email: 'orders@nyharborsupply.com', wa: '+12125551112', web: 'https://nyharborsupply.com', addr: 'Brooklyn Marine Terminal, NY', person: 'Tony Russo' },
  { id: 'p032', type: 'agent', ico: '🏢', name: 'Busan Maritime Agency', bio: 'Busan, Ulsan, Incheon port agency. Korean Shipping Agency member. Container, tanker and bulk specialists.', ports: ['Busan', 'Ulsan', 'Incheon'], country: 'South Korea', svc: ['agent'], phone: '+82 51 463 0000', email: 'ops@busanmaritime.kr', wa: '+821011110000', web: 'https://busanmaritime.kr', addr: 'Jung-gu, Busan 48944', person: 'Cpt. Kim Min-jun' },
  { id: 'p033', type: 'service', ico: '🔧', name: 'Busan Marine Tech', bio: 'Korean marine technical services. Engine, electrical, hull, BWTS. KR class-approved. 24/7 emergency.', ports: ['Busan', 'Ulsan', 'Gwangyang'], country: 'South Korea', svc: ['engine', 'electrical', 'hull', 'ballast', 'welding', 'survey', 'navigation'], phone: '+82 51 472 1111', email: 'tech@busanmarinetech.kr', wa: '+821022221111', web: 'https://busanmarinetech.kr', addr: 'Gamcheon Port, Busan', person: 'Eng. Park Jung-ho' },
  { id: 'p034', type: 'agent', ico: '🏢', name: 'Suez Canal Agency Co.', bio: 'Suez, Port Said, Alexandria agency. Canal transit specialists. SCA-licensed.', ports: ['Suez', 'Port Said', 'Alexandria', 'Damietta'], country: 'Egypt', svc: ['agent'], phone: '+20 62 333 0000', email: 'transit@suezagency.com.eg', wa: '+201001110000', web: 'https://suezagency.com.eg', addr: 'Port Tawfik, Suez 43511', person: 'Cpt. Mohamed Hassan' },
  { id: 'p035', type: 'agent', ico: '🏢', name: 'Panama Canal Maritime Agency', bio: 'Balboa, Cristóbal, Colón agency. Canal transit booking. ACP-registered. English and Spanish operations.', ports: ['Balboa', 'Cristóbal', 'Colón', 'Manzanillo'], country: 'Panama', svc: ['agent'], phone: '+507 269 0000', email: 'transit@panamacanalagency.com', wa: '+5076500000', web: 'https://panamacanalagency.com', addr: 'Balboa Yacht Club, Panama City', person: 'Cpt. Luis Martinez' },
  { id: 'p036', type: 'agent', ico: '🏢', name: 'Mumbai Maritime Services', bio: 'Mumbai, Nhava Sheva, Kandla agency. INSA member. Tanker, bulk and container expertise. Customs liaison.', ports: ['Mumbai', 'Nhava Sheva (JNPT)', 'Kandla'], country: 'India', svc: ['agent'], phone: '+91 22 6622 0000', email: 'ops@mumbaimaritime.in', wa: '+919812340000', web: 'https://mumbaimaritime.in', addr: 'Ballard Estate, Mumbai 400001', person: 'Cpt. Rajesh Kumar' },
  { id: 'p037', type: 'agent', ico: '🏢', name: 'Yokohama Port Agency', bio: 'Yokohama, Tokyo, Kobe, Osaka port agency. JIFFA member. English-speaking 24/7 operations team.', ports: ['Yokohama', 'Tokyo', 'Kobe', 'Osaka'], country: 'Japan', svc: ['agent'], phone: '+81 45 663 0000', email: 'ops@yokohamaagency.jp', wa: '+819011110000', web: 'https://yokohamaagency.jp', addr: 'Naka-ku, Yokohama 231-0023', person: 'Cpt. Hiroshi Tanaka' },
];

// ============================================================
// SEARCH LOGIC

function runSearch(country: string, port: string, cat: string, ms: Set<string>) {
  const ok = (p: Provider) => {
    if (cat === 'all') return true;
    if (cat === 'agent') return p.type === 'agent';
    if (cat === 'chandler') return p.type === 'chandler';
    if (cat === 'service') { if (p.type !== 'service') return false; return ms.size === 0 || p.svc.some(s => ms.has(s)); }
    return false;
  };
  let r = PROVIDERS.filter(p => p.ports.includes(port) && ok(p));
  let fb = false;
  if (!r.length && country) { r = PROVIDERS.filter(p => p.country === country && ok(p)); fb = true; }
  return { r, fb };
}

export default function Home() {
  const [country, setCountry] = useState('');
  const [port, setPort] = useState('');
  const [svcType, setSvcType] = useState('all');
  const [ms, setMs] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<Provider[]>([]);
  const [fb, setFb] = useState(false);
  const [detail, setDetail] = useState<Provider | null>(null);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<'register'|'login'>('register');
  const [seg, setSeg] = useState('agent');
  const [payModal, setPayModal] = useState(false);
  const [plan, setPlan] = useState<'monthly'|'yearly'>('monthly');
  const countries = Object.keys(PORT_DATA).sort();
  const ports = country ? PORT_DATA[country] || [] : [];
  const g = {color:'#c8a84b'} as React.CSSProperties;
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";
  const nav = (k: string) => k === 'agent' ? 'Ship Agent' : k === 'chandler' ? 'Shipchandler' : 'Marine Service';

  function search(c: string, p: string, s: string, m: Set<string>) {
    if (!c || !p) { setDone(false); return; }
    const {r, fb: f} = runSearch(c, p, s, m);
    setResults(r); setFb(f); setDone(true);
  }

  function toggleMs(key: string) {
    const n = new Set(ms);
    if (n.has(key)) n.delete(key); else n.add(key);
    setMs(n); search(country, port, svcType, n);
  }

  const sel = {background:'rgba(8,16,10,.85)',border:'1px solid rgba(200,168,75,.3)',color:'#f5f0e8',padding:'13px 16px',fontFamily:"'Outfit',sans-serif",fontSize:14,width:'100%',outline:'none',appearance:'none' as const};
  const lbl = {display:'block',fontFamily:rj,fontSize:13,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase' as const,color:'#c8a84b',marginBottom:6};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#08100a;overflow-x:hidden;}
        select option{background:#111c13;color:#f5f0e8;}
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes scrollBanner{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .a1{opacity:0;animation:fu .7s .1s forwards;}
        .a2{opacity:0;animation:fu .7s .2s forwards;}
        .a3{opacity:0;animation:fu .7s .3s forwards;}
        .a4{opacity:0;animation:fu .7s .4s forwards;}
        .nlnk:hover{color:#c8a84b!important;}
        .rrow:hover{border-color:#c8a84b!important;cursor:pointer;}
        .scard:hover,.tier:hover,.wcard:hover,.step:hover{background:#162019!important;}
      `}</style>
      <div style={{background:'#08100a',color:'#f5f0e8',fontFamily:"'Outfit',sans-serif",fontWeight:300,minHeight:'100vh'}}>

        {/* NAV */}
        <nav style={{position:'fixed',top:0,width:'100%',zIndex:300,height:66,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',background:'rgba(8,16,10,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.22)'}}>
          <div style={{fontFamily:lb,fontSize:20,fontWeight:700,letterSpacing:1}}>PortService<span style={g}>Finder</span></div>
          <div style={{display:'flex',alignItems:'center',gap:20}}>
            <span className="nlnk" style={{color:'#7a8a72',fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600}} onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>How It Works</span>
            <span className="nlnk" style={{color:'#7a8a72',fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600}} onClick={()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
            <button style={{background:'transparent',border:'1px solid rgba(200,168,75,.4)',color:'#c8a84b',padding:'9px 22px',fontFamily:rj,fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}} onClick={()=>{setTab('login');setModal(true);}}>Sign In</button>
            <button style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'9px 22px',fontFamily:rj,fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}} onClick={()=>{setTab('register');setModal(true);}}>List Your Business</button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{minHeight:'calc(100vh - 66px)',paddingTop:100,paddingBottom:60,paddingLeft:56,paddingRight:56,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:32}}>
          <div className="a1" style={{fontFamily:rj,fontSize:12,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',display:'flex',alignItems:'center',gap:12,justifyContent:'center'}}>
            <span style={{width:32,height:1,background:'#c8a84b',display:'inline-block'}}/>Global Maritime Services Directory<span style={{width:32,height:1,background:'#c8a84b',display:'inline-block'}}/>
          </div>
          <h1 className="a2" style={{fontFamily:lb,fontSize:'clamp(40px,5.5vw,72px)',fontWeight:700,lineHeight:1.05,letterSpacing:-1,maxWidth:860}}>Every Port. Every <em style={g}>Service.</em><br/>One Platform.</h1>
          <p className="a3" style={{fontSize:16,lineHeight:1.75,color:'#b0c0a4',maxWidth:540}}>Find verified ship agents, shipchandlers and marine service companies at any port worldwide. Free to search.</p>
          <div className="a4" style={{display:'flex',gap:20,flexWrap:'wrap',justifyContent:'center'}}>
            {[['160+','Countries'],['1,000+','Ports'],['22','Service Categories']].map(([n,l])=>(
              <span key={l} style={{fontFamily:rj,fontSize:14,color:'#7a8a72',fontWeight:600}}><strong style={g}>{n}</strong> {l}</span>
            ))}
          </div>
        </section>

        {/* SEARCH */}
        <section id="search" style={{background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.2)',borderBottom:'1px solid rgba(200,168,75,.2)',padding:'48px 56px'}}>
          <h2 style={{fontFamily:lb,fontSize:'clamp(28px,3.5vw,46px)',fontWeight:700,lineHeight:1.05,marginBottom:28}}>Search the <em style={g}>Directory</em></h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:14,alignItems:'flex-end'}}>
            <div><label style={lbl}>Country</label><select style={sel} value={country} onChange={e=>{setCountry(e.target.value);setPort('');setDone(false);}}><option value="">Select country...</option>{countries.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>Port</label><select style={sel} value={port} onChange={e=>{setPort(e.target.value);search(country,e.target.value,svcType,ms);}} disabled={!country}><option value="">Select port...</option>{ports.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label style={lbl}>Service Type</label><select style={sel} value={svcType} onChange={e=>{setSvcType(e.target.value);setMs(new Set());search(country,port,e.target.value,new Set());}}><option value="all">All Services</option><option value="agent">Ship Agent</option><option value="chandler">Shipchandler</option><option value="service">Marine Services</option></select></div>
            <button style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'13px 32px',fontFamily:rj,fontSize:16,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',height:50,whiteSpace:'nowrap'}} onClick={()=>search(country,port,svcType,ms)}>Search →</button>
          </div>
          {svcType==='service'&&(<div style={{marginTop:18,padding:'18px 20px',background:'rgba(200,168,75,.05)',border:'1px solid rgba(200,168,75,.2)'}}><div style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Choose specific marine services (optional)</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',gap:6}}>{MARINE_SERVICES.map(s=>(<div key={s.key} onClick={()=>toggleMs(s.key)} style={{padding:'8px 12px',border:`1px solid ${ms.has(s.key)?'#c8a84b':'rgba(200,168,75,.2)'}`,background:ms.has(s.key)?'#c8a84b':'rgba(8,16,10,.4)',color:ms.has(s.key)?'#08100a':'#b0c0a4',fontFamily:rj,fontSize:12,fontWeight:600,cursor:'pointer',userSelect:'none'}}>{s.label}</div>))}</div></div>)}
          {done&&(<div style={{borderTop:'1px solid rgba(200,168,75,.2)',paddingTop:20,marginTop:20}}>
            <div style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>{fb?`Other providers in ${country}`:`${results.length} provider${results.length!==1?'s':''} found at ${port}`}</div>
            {fb&&results.length>0&&(<div style={{padding:'12px 16px',background:'rgba(200,168,75,.07)',border:'1px solid rgba(200,168,75,.2)',fontSize:13,color:'#e2c06a',marginBottom:12,fontFamily:rj,fontWeight:500,lineHeight:1.5}}>📡 No providers at <strong>{port}</strong> yet. Showing others in <strong>{country}</strong>.</div>)}
            {results.length===0&&(<div style={{padding:28,textAlign:'center',fontFamily:rj,fontSize:13,color:'#7a8a72',lineHeight:1.7}}><strong style={{color:'#c8a84b',display:'block',marginBottom:6}}>No providers found.</strong><span style={{color:'#c8a84b',cursor:'pointer'}} onClick={()=>{setTab('register');setModal(true);}}>Register your business →</span></div>)}
            {results.map(p=>(<div key={p.id} className="rrow" onClick={()=>setDetail(p)} style={{background:'#111c13',border:'1px solid rgba(200,168,75,.2)',padding:'18px 22px',marginBottom:8,display:'grid',gridTemplateColumns:'48px 1fr auto',gap:14,alignItems:'center',transition:'border-color .3s'}}>
              <div style={{width:48,height:48,background:'rgba(200,168,75,.1)',border:'1px solid rgba(200,168,75,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{p.ico}</div>
              <div><div style={{fontSize:15,fontWeight:600,marginBottom:3}}>{p.name}</div><div style={{fontSize:13,color:'#b0c0a4',marginBottom:7,lineHeight:1.4}}>{p.bio.length>150?p.bio.slice(0,150)+'…':p.bio}</div><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{p.ports.map(pt=><span key={pt} style={{fontFamily:rj,fontSize:10,letterSpacing:1,fontWeight:700,padding:'2px 8px',border:'1px solid rgba(200,168,75,.3)',color:'#c8a84b'}}>{pt}</span>)}</div></div>
              <div style={{textAlign:'right',flexShrink:0}}><div style={{fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:7,fontWeight:600}}>{nav(p.type)}</div><button onClick={e=>{e.stopPropagation();setDetail(p);}} style={{background:'transparent',border:'1px solid rgba(200,168,75,.3)',color:'#c8a84b',padding:'7px 16px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>View Contact</button></div>
            </div>))}
          </div>)}
        </section>

        {/* VISUALS */}
        <section style={{background:'#08100a',padding:'60px 56px',textAlign:'center'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:40}}>
            <div style={{position:'relative',width:140,height:140}}>
              <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(200,168,75,.3)',animation:'spinSlow 18s linear infinite'}}/>
              <div style={{position:'absolute',inset:14,borderRadius:'50%',border:'1px solid rgba(200,168,75,.2)',animation:'spinSlow 12s linear infinite reverse'}}/>
              <div style={{position:'absolute',inset:28,borderRadius:'50%',border:'1px solid rgba(200,168,75,.15)',animation:'spinSlow 8s linear infinite'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:50,height:50,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%, rgba(200,168,75,.4), rgba(200,168,75,.05))',border:'1px solid rgba(200,168,75,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>⚓</div></div>
            </div>
          </div>
          <div style={{overflow:'hidden',borderTop:'1px solid rgba(200,168,75,.12)',borderBottom:'1px solid rgba(200,168,75,.12)',padding:'10px 0',marginBottom:40}}>
            <div style={{display:'flex',gap:40,animation:'scrollBanner 28s linear infinite',whiteSpace:'nowrap'}}>
              {['Rotterdam·NL','Singapore·SG','Dubai·UAE','Shanghai·CN','Mersin·TR','Houston·US','Piraeus·GR','Santos·BR','Hamburg·DE','Mumbai·IN','Busan·KR','Yokohama·JP','Durban·ZA','Sydney·AU','Panama·PA','Antwerp·BE',
                'Rotterdam·NL','Singapore·SG','Dubai·UAE','Shanghai·CN','Mersin·TR','Houston·US','Piraeus·GR','Santos·BR','Hamburg·DE','Mumbai·IN','Busan·KR','Yokohama·JP'].map((item,i)=>(
                <span key={i} style={{fontFamily:rj,fontSize:11,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:i%4===0?'#c8a84b':'#2a3a22',flexShrink:0}}>{item}</span>
              ))}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'rgba(200,168,75,.12)',maxWidth:900,margin:'0 auto'}}>
            {[['80+','Countries','with active providers'],['1,000+','Ports','in our database'],['37+','Providers','verified & growing'],['$0','Search Fee','forever free']].map(([v,l,s])=>(
              <div key={l} style={{background:'#0c1610',padding:'22px 16px',textAlign:'center'}}><div style={{fontFamily:lb,fontSize:32,fontWeight:700,color:'#c8a84b',lineHeight:1,marginBottom:5}}>{v}</div><div style={{fontFamily:rj,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',color:'#f5f0e8',marginBottom:3}}>{l}</div><div style={{fontFamily:rj,fontSize:9,color:'#7a8a72'}}>{s}</div></div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{padding:'100px 56px',background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.15)'}}>
          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>Platform</div>
          <h2 style={{fontFamily:lb,fontSize:'clamp(28px,3.5vw,46px)',fontWeight:700,lineHeight:1.05,marginBottom:48}}>How <em style={g}>PortServiceFinder</em> Works</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'rgba(200,168,75,.15)'}}>
            {[{n:'01',ico:'🌍',t:'Select Country & Port',d:'Choose your destination from our global list. The system loads every registered port instantly. Search is completely free.'},
              {n:'02',ico:'🔍',t:'Filter by Service Type',d:'Select Ship Agent, Shipchandler or Marine Services. Further narrow to specific specializations.'},
              {n:'03',ico:'📡',t:'Smart Country Fallback',d:'No provider at your port? We automatically show other providers in the same country — clearly flagged.'}].map(s=>(
              <div key={s.n} className="step" style={{background:'#111c13',padding:'42px 34px',position:'relative',overflow:'hidden',transition:'background .4s'}}>
                <div style={{fontFamily:lb,fontSize:76,fontWeight:700,color:'rgba(200,168,75,.06)',position:'absolute',top:8,right:14,lineHeight:1}}>{s.n}</div>
                <div style={{fontSize:28,marginBottom:16}}>{s.ico}</div>
                <h3 style={{fontFamily:lb,fontSize:21,fontWeight:700,marginBottom:12}}>{s.t}</h3>
                <p style={{fontSize:14,lineHeight:1.8,color:'#b0c0a4'}}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{padding:'100px 56px'}}>
          <div style={{fontFamily:rj,fontSize:11,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:14,fontWeight:700}}>Pricing</div>
          <h2 style={{fontFamily:lb,fontSize:'clamp(28px,3.5vw,46px)',fontWeight:700,lineHeight:1.05,marginBottom:48}}>Simple, <em style={g}>Transparent</em> Pricing</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:18,maxWidth:760,margin:'0 auto'}}>
            {[{name:'Monthly',amt:'$149',per:'/ month',yr:'Billed monthly · Cancel anytime',badge:null,items:['Listed at all your ports','Full company profile','Direct phone, email & WhatsApp','Verified provider badge','Performance dashboard','Email support']},
              {name:'Annual',amt:'$1,200',per:'/ year',yr:'Equivalent to $100/month',badge:'Save $588',items:['Everything in Monthly plan','$588 saved vs monthly billing','Priority placement in results','Direct contact details','Verified provider badge','Priority email support']}].map(tier=>(
              <div key={tier.name} className="tier" style={{background:tier.badge?'linear-gradient(180deg,rgba(200,168,75,.06),transparent)':'#111c13',border:`1px solid ${tier.badge?'#c8a84b':'rgba(200,168,75,.25)'}`,padding:'36px 30px',position:'relative',transition:'all .4s',display:'flex',flexDirection:'column'}}>
                {tier.badge&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#c8a84b',color:'#08100a',fontFamily:rj,fontSize:11,letterSpacing:'2px',fontWeight:700,padding:'5px 14px'}}>{tier.badge}</div>}
                <div style={{fontFamily:rj,fontSize:12,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>{tier.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:6}}><span style={{fontFamily:lb,fontSize:46,fontWeight:700,lineHeight:1}}>{tier.amt}</span><span style={{fontFamily:rj,fontSize:13,color:'#7a8a72',fontWeight:600}}>{tier.per}</span></div>
                <div style={{fontSize:12,color:'#b0c0a4',marginBottom:22,fontFamily:rj,fontWeight:500}}>{tier.yr}</div>
                <ul style={{listStyle:'none',flex:1,marginBottom:22,display:'flex',flexDirection:'column',gap:9}}>{tier.items.map(item=>(<li key={item} style={{fontSize:13,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:8,lineHeight:1.5}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>{item}</li>))}</ul>
                <button onClick={()=>{setTab('register');setModal(true);}} style={{padding:13,background:tier.badge?'#c8a84b':'transparent',border:'1px solid rgba(200,168,75,.4)',color:tier.badge?'#08100a':'#c8a84b',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',width:'100%'}}>Get Started</button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{padding:'80px 56px',textAlign:'center',background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.15)'}}>
          <h2 style={{fontFamily:lb,fontSize:'clamp(32px,4vw,56px)',fontWeight:700,lineHeight:1.05,marginBottom:16}}>Be Found by Every Vessel <em style={g}>Worldwide</em></h2>
          <p style={{fontSize:15,color:'#b0c0a4',maxWidth:460,margin:'0 auto 36px',lineHeight:1.75}}>List on PortServiceFinder for <strong style={g}>$149/month</strong> or <strong style={g}>$1,200/year</strong>. No setup fee.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>{setTab('register');setModal(true);}} style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'14px 36px',fontFamily:rj,fontSize:15,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>List Your Business</button>
            <button onClick={()=>document.getElementById('search')?.scrollIntoView({behavior:'smooth'})} style={{background:'transparent',color:'#f5f0e8',border:'1px solid rgba(200,168,75,.3)',padding:'13px 28px',fontFamily:rj,fontSize:15,letterSpacing:'2px',textTransform:'uppercase',fontWeight:600,cursor:'pointer'}}>Search a Port — Free</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{borderTop:'1px solid rgba(200,168,75,.2)',padding:'56px'}}>
          <div style={{display:'grid',gridTemplateColumns:'2.2fr 1fr 1fr 1fr',gap:56,marginBottom:40}}>
            <div>
              <div style={{fontFamily:lb,fontSize:18,fontWeight:700,letterSpacing:1,marginBottom:12}}>PortService<span style={g}>Finder</span></div>
              <p style={{fontSize:13,color:'#7a8a72',lineHeight:1.75,maxWidth:240,marginBottom:18}}>The global maritime services directory.</p>
              <a href="mailto:info@portservicefinder.com" style={{fontSize:13,color:'rgba(200,168,75,.6)',textDecoration:'none'}}>📧 info@portservicefinder.com</a>
            </div>
            {[{t:'Directory',l:['Ship Agents','Shipchandlers','Marine Services','Search by Port']},{t:'Company',l:['About Us','Contact','Blog','Partners']},{t:'Legal',l:['Terms of Service','Privacy Policy','Listing Rules','Disclaimer']}].map(col=>(
              <div key={col.t}><h4 style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:16,fontWeight:700}}>{col.t}</h4><ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:9}}>{col.l.map(l=><li key={l}><a href="#" style={{color:'#7a8a72',textDecoration:'none',fontSize:13}}>{l}</a></li>)}</ul></div>
            ))}
          </div>
          <div style={{borderTop:'1px solid rgba(200,168,75,.15)',paddingTop:18,display:'flex',justifyContent:'space-between',fontFamily:rj,fontSize:11,color:'#4a4a3a',letterSpacing:1,fontWeight:600}}>
            <span>© 2026 PortServiceFinder. All rights reserved.</span>
            <span>MARITIME DIRECTORY · GLOBAL · FREE TO SEARCH</span>
          </div>
        </footer>

        {/* DETAIL MODAL */}
        {detail&&(<div style={{position:'fixed',inset:0,background:'rgba(8,16,10,.95)',backdropFilter:'blur(16px)',zIndex:550,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px',overflowY:'auto'}} onClick={e=>{if(e.target===e.currentTarget)setDetail(null);}}>
          <div style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.3)',width:'100%',maxWidth:720,margin:'auto'}}>
            <div style={{padding:'30px 36px 22px',borderBottom:'1px solid rgba(200,168,75,.2)',display:'flex',gap:18,alignItems:'flex-start'}}>
              <div style={{width:60,height:60,background:'rgba(200,168,75,.1)',border:'1px solid rgba(200,168,75,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{detail.ico}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:4}}>{detail.name}</div>
                <div style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700,marginBottom:8}}>{nav(detail.type)}</div>
                <span style={{fontFamily:rj,fontSize:11,color:'#4caf76',border:'1px solid rgba(76,175,118,.3)',padding:'3px 9px',letterSpacing:1,fontWeight:700}}>✓ VERIFIED PROVIDER</span>
              </div>
              <button onClick={()=>setDetail(null)} style={{background:'none',border:'none',color:'#7a8a72',fontSize:20,cursor:'pointer',flexShrink:0}}>✕</button>
            </div>
            <div style={{padding:'26px 36px 32px'}}>
              <p style={{fontSize:14,color:'#f5f0e8',lineHeight:1.7,marginBottom:20}}>{detail.bio}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
                {[{label:'Phone',value:detail.phone,href:`tel:${detail.phone.replace(/\s/g,'')}`},{label:'Email',value:detail.email,href:`mailto:${detail.email}`},{label:'WhatsApp',value:detail.wa,href:`https://wa.me/${detail.wa.replace(/\D/g,'')}`},{label:'Website',value:detail.web.replace(/^https?:\/\//,''),href:detail.web}].map(c=>(
                  <div key={c.label} style={{background:'#111c13',border:'1px solid rgba(200,168,75,.2)',padding:'14px 16px'}}>
                    <div style={{fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:5,fontWeight:600}}>{c.label}</div>
                    <a href={c.href} target="_blank" rel="noreferrer" style={{fontSize:14,color:'#c8a84b',textDecoration:'none'}}>{c.value}</a>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>{detail.ports.map(p=><span key={p} style={{fontFamily:rj,fontSize:10,letterSpacing:1,fontWeight:700,padding:'2px 8px',border:'1px solid rgba(200,168,75,.3)',color:'#c8a84b'}}>{p}</span>)}</div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <a href={`tel:${detail.phone.replace(/\s/g,'')}`} style={{flex:1,minWidth:140,padding:13,background:'#c8a84b',color:'#08100a',textDecoration:'none',fontFamily:rj,fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>📞 Call Now</a>
                <a href={`mailto:${detail.email}`} style={{flex:1,minWidth:140,padding:13,background:'#c8a84b',color:'#08100a',textDecoration:'none',fontFamily:rj,fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>✉ Email</a>
                <a href={`https://wa.me/${detail.wa.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{flex:1,minWidth:140,padding:13,background:'transparent',border:'1px solid rgba(200,168,75,.4)',color:'#c8a84b',textDecoration:'none',fontFamily:rj,fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>💬 WhatsApp</a>
              </div>
            </div>
          </div>
        </div>)}

        {/* REGISTER/LOGIN MODAL */}
        {modal&&(<div style={{position:'fixed',inset:0,background:'rgba(8,16,10,.95)',backdropFilter:'blur(16px)',zIndex:500,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px',overflowY:'auto'}} onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
          <div style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.3)',width:'100%',maxWidth:740,margin:'auto'}}>
            <div style={{padding:'26px 34px 18px',borderBottom:'1px solid rgba(200,168,75,.2)',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><h2 style={{fontFamily:lb,fontSize:24,fontWeight:700,marginBottom:4}}>{tab==='login'?'Provider Sign In':'List Your Business'}</h2><p style={{fontSize:13,color:'#b0c0a4',lineHeight:1.6}}>{tab==='login'?'Access your listing dashboard.':'Join PortServiceFinder — get found by vessels worldwide.'}</p></div>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'#7a8a72',fontSize:20,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'26px 34px'}}>
              <div style={{display:'flex',borderBottom:'1px solid rgba(200,168,75,.2)',marginBottom:22}}>
                {(['register','login'] as const).map(t=>(<button key={t} onClick={()=>setTab(t)} style={{padding:'10px 20px',fontFamily:rj,fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',color:tab===t?'#c8a84b':'#7a8a72',background:'none',border:'none',borderBottom:tab===t?'2px solid #c8a84b':'2px solid transparent',marginBottom:-1}}>{t==='register'?'Register Business':'Sign In'}</button>))}
              </div>
              {tab==='register'?(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
                    {[{type:'agent',ico:'🏢',name:'Ship Agent'},{type:'chandler',ico:'⚓',name:'Shipchandler'},{type:'service',ico:'🔧',name:'Marine Service'}].map(s=>(<div key={s.type} onClick={()=>setSeg(s.type)} style={{border:`1px solid ${seg===s.type?'#c8a84b':'rgba(200,168,75,.2)'}`,padding:'14px 10px',textAlign:'center',cursor:'pointer',background:seg===s.type?'rgba(200,168,75,.1)':'transparent'}}><div style={{fontSize:20,marginBottom:5}}>{s.ico}</div><div style={{fontFamily:rj,fontSize:12,letterSpacing:1,textTransform:'uppercase',fontWeight:700}}>{s.name}</div><div style={{fontSize:11,color:'#c8a84b',marginTop:2,fontFamily:rj,fontWeight:600}}>$149/mo</div></div>))}
                  </div>
                  <FI l="Company Name *" p="Your company name"/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}><FI l="City *" p="e.g. Mersin"/><FI l="Country *" p="e.g. Turkey"/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}><FI l="Port 1 *" p="e.g. Mersin"/><FI l="Port 2" p="Optional"/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}><FI l="Email *" p="info@yourcompany.com" t="email"/><FI l="Phone *" p="+1 ..."/></div>
                  <FI l="Contact Person *" p="Primary contact name"/>
                  <div style={{marginBottom:16}}><label style={{display:'block',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:4,fontWeight:600}}>Company Bio *</label><textarea maxLength={500} placeholder="Brief company description..." style={{background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.25)',color:'#f5f0e8',padding:'10px 13px',fontFamily:"'Outfit',sans-serif",fontSize:14,width:'100%',resize:'vertical',minHeight:80}}/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}><FI l="Login Email *" p="your@company.com" t="email"/><FI l="Password *" p="Min 8 characters" t="password"/></div>
                  <button onClick={()=>{setModal(false);setPayModal(true);}} style={{width:'100%',padding:14,background:'#c8a84b',border:'none',color:'#08100a',fontFamily:rj,fontSize:14,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',marginTop:8}}>Continue to Payment</button>
                  <p style={{fontSize:11,color:'#7a8a72',textAlign:'center',marginTop:10}}>$149/month or $1,200/year. Cancel anytime.</p>
                </div>
              ):(
                <div>
                  <FI l="Email" p="your@company.com" t="email"/>
                  <FI l="Password" p="••••••••" t="password"/>
                  <button style={{width:'100%',padding:14,background:'#c8a84b',border:'none',color:'#08100a',fontFamily:rj,fontSize:14,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',marginTop:8}}>Sign In</button>
                  <p style={{textAlign:'center',fontSize:13,color:'#7a8a72',marginTop:14}}>Not registered? <span style={{color:'#c8a84b',cursor:'pointer'}} onClick={()=>setTab('register')}>List your business →</span></p>
                </div>
              )}
            </div>
          </div>
        </div>)}

        {/* PAYMENT MODAL */}
        {payModal&&(<div style={{position:'fixed',inset:0,background:'rgba(8,16,10,.96)',backdropFilter:'blur(20px)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',overflowY:'auto'}} onClick={e=>{if(e.target===e.currentTarget)setPayModal(false);}}>
          <div style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.3)',width:'100%',maxWidth:620,padding:40,margin:'auto',position:'relative'}}>
            <button onClick={()=>setPayModal(false)} style={{position:'absolute',top:18,right:18,background:'none',border:'none',color:'#7a8a72',fontSize:20,cursor:'pointer'}}>✕</button>
            <h2 style={{fontFamily:lb,fontSize:26,fontWeight:700,marginBottom:6}}>Choose Your <em style={g}>Plan</em></h2>
            <p style={{fontSize:13,color:'#b0c0a4',marginBottom:24,lineHeight:1.6}}>Select monthly or annual billing. Cancel anytime.</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:26}}>
              {[{id:'monthly',label:'Monthly',price:'$149',period:'per month',note:'Billed monthly.',badge:null},{id:'yearly',label:'Annual',price:'$1,200',period:'per year',note:'Equivalent to $100/month.',badge:'Save $588'}].map(p=>(
                <div key={p.id} onClick={()=>setPlan(p.id as 'monthly'|'yearly')} style={{border:`2px solid ${plan===p.id?'#c8a84b':'rgba(200,168,75,.25)'}`,padding:'26px 22px',cursor:'pointer',position:'relative',background:plan===p.id?'rgba(200,168,75,.07)':'transparent'}}>
                  {p.badge&&<div style={{position:'absolute',top:14,right:14,background:'#c8a84b',color:'#08100a',fontFamily:rj,fontSize:10,letterSpacing:'1.5px',fontWeight:700,padding:'3px 8px'}}>{p.badge}</div>}
                  <div style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700,marginBottom:10}}>{p.label}</div>
                  <div style={{fontFamily:lb,fontSize:36,fontWeight:700,lineHeight:1}}>{p.price}</div>
                  <div style={{fontFamily:rj,fontSize:12,color:'#7a8a72',fontWeight:600,marginTop:4}}>{p.period}</div>
                  <div style={{fontSize:12,color:'#b0c0a4',marginTop:10,lineHeight:1.5}}>{p.note}</div>
                </div>
              ))}
            </div>
            <FI l="Cardholder Name" p="Name on card"/>
            <FI l="Card Number" p="1234 5678 9012 3456"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><FI l="Expiry (MM/YY)" p="MM/YY"/><FI l="CVC" p="123"/></div>
            <button onClick={()=>{setPayModal(false);alert('Welcome to PortServiceFinder! Your listing is now active.');}} style={{width:'100%',padding:14,background:'#c8a84b',border:'none',color:'#08100a',fontFamily:rj,fontSize:14,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',marginTop:18}}>
              Pay {plan==='yearly'?'$1,200':'$149'} & Activate Listing
            </button>
            <div style={{fontFamily:rj,fontSize:11,color:'#7a8a72',textAlign:'center',marginTop:12,fontWeight:600}}>🔒 Secure payment · Cancel anytime</div>
          </div>
        </div>)}

      </div>
    </div>
  </div>
  </div>
    </>
  );
}

function FI({l,p,t='text'}:{l:string;p:string;t?:string}) {
  return (
    <div style={{marginBottom:10}}>
      <label style={{display:'block',fontFamily:"'Rajdhani',sans-serif",fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:4,fontWeight:600}}>{l}</label>
      <input type={t} placeholder={p} style={{background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.25)',color:'#f5f0e8',padding:'10px 13px',fontFamily:"'Outfit',sans-serif",fontSize:14,width:'100%'}}/>
    </div>
  );
}
