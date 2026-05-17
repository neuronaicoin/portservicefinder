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
// ============================================================
function runSearch(country: string, port: string, cat: string, marineSvcs: Set<string>) {
  const matchesCat = (p: Provider) => {
    if (cat === 'all') return true;
    if (cat === 'agent') return p.type === 'agent';
    if (cat === 'chandler') return p.type === 'chandler';
    if (cat === 'service') {
      if (p.type !== 'service') return false;
      if (marineSvcs.size === 0) return true;
      return p.svc.some(s => marineSvcs.has(s));
    }
    return false;
  };
  let results = PROVIDERS.filter(p => p.ports.includes(port) && matchesCat(p));
  let fallback = false;
  if (!results.length && country) {
    results = PROVIDERS.filter(p => p.country === country && matchesCat(p));
    fallback = true;
  }
  return { results, fallback };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Home() {
  const [country, setCountry] = useState('');
  const [port, setPort] = useState('');
  const [svcType, setSvcType] = useState('all');
  const [marineSvcs, setMarineSvcs] = useState<Set<string>>(new Set());
  const [searchDone, setSearchDone] = useState(false);
  const [results, setResults] = useState<Provider[]>([]);
  const [fallback, setFallback] = useState(false);
  const [detailProvider, setDetailProvider] = useState<Provider | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'register' | 'login'>('register');
  const [selectedSegment, setSelectedSegment] = useState('agent');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [openSvc, setOpenSvc] = useState<string | null>(null);

  const countries = Object.keys(PORT_DATA).sort();
  const ports = country ? PORT_DATA[country] || [] : [];

  function doSearch(c: string, p: string, s: string, ms: Set<string>) {
    if (!c || !p) { setSearchDone(false); return; }
    const r = runSearch(c, p, s, ms);
    setResults(r.results);
    setFallback(r.fallback);
    setSearchDone(true);
  }

  function toggleMarineSvc(key: string) {
    const next = new Set(marineSvcs);
    if (next.has(key)) next.delete(key); else next.add(key);
    setMarineSvcs(next);
    doSearch(country, port, svcType, next);
  }

  const typeLabel = (t: string) => t === 'agent' ? 'Ship Agent' : t === 'chandler' ? 'Shipchandler' : 'Marine Service';

  const S = {
    page: { background: '#08100a', color: '#f5f0e8', fontFamily: "'Outfit', sans-serif", fontWeight: 300, minHeight: '100vh' } as React.CSSProperties,
    // NAVBAR
    nav: { position: 'fixed', top: 0, width: '100%', zIndex: 300, height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', background: 'rgba(8,16,10,.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,168,75,.22)' } as React.CSSProperties,
    logoText: { fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' } as React.CSSProperties,
    gold: { color: '#c8a84b' } as React.CSSProperties,
    navR: { display: 'flex', alignItems: 'center', gap: 20 } as React.CSSProperties,
    nlnk: { color: '#7a8a72', fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 } as React.CSSProperties,
    nbtnOutline: { background: 'transparent', border: '1px solid rgba(200,168,75,.4)', color: '#c8a84b', padding: '9px 22px', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
    nbtnSolid: { background: '#c8a84b', color: '#08100a', border: 'none', padding: '9px 22px', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
    // HERO
    hero: { minHeight: 'calc(100vh - 66px)', paddingTop: 100, paddingBottom: 60, paddingLeft: 56, paddingRight: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 32 } as React.CSSProperties,
    eyebrow: { fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a84b', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' } as React.CSSProperties,
    h1: { fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(40px,5.5vw,72px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, maxWidth: 860 } as React.CSSProperties,
    heroSub: { fontSize: 16, lineHeight: 1.75, color: '#b0c0a4', maxWidth: 540 } as React.CSSProperties,
    counts: { display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' } as React.CSSProperties,
    // SEARCH
    searchSec: { background: '#0c1610', borderTop: '1px solid rgba(200,168,75,.2)', borderBottom: '1px solid rgba(200,168,75,.2)', padding: '48px 56px' } as React.CSSProperties,
    searchGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'flex-end' } as React.CSSProperties,
    sfLabel: { display: 'block', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 6 } as React.CSSProperties,
    sfSelect: { background: 'rgba(8,16,10,.85)', border: '1px solid rgba(200,168,75,.3)', color: '#f5f0e8', padding: '13px 16px', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%', outline: 'none', appearance: 'none', cursor: 'pointer' } as React.CSSProperties,
    btnSearch: { background: '#c8a84b', color: '#08100a', border: 'none', padding: '13px 32px', fontFamily: "'Rajdhani', sans-serif", fontSize: 16, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', height: 50, whiteSpace: 'nowrap' } as React.CSSProperties,
    // STATS
    statsBar: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(200,168,75,.15)', borderBottom: '1px solid rgba(200,168,75,.15)' } as React.CSSProperties,
    statN: { fontFamily: "'Libre Baskerville', serif", fontSize: 48, fontWeight: 700, color: '#c8a84b', lineHeight: 1, letterSpacing: -1 } as React.CSSProperties,
    statL: { fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#7a8a72', marginTop: 6, fontWeight: 600 } as React.CSSProperties,
    // SECTIONS
    sec: { padding: '100px 56px' } as React.CSSProperties,
    secAlt: { background: '#0c1610', borderTop: '1px solid rgba(200,168,75,.15)', borderBottom: '1px solid rgba(200,168,75,.15)' } as React.CSSProperties,
    secEye: { fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a84b', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontWeight: 700 } as React.CSSProperties,
    secTitle: { fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 700, lineHeight: 1.05, marginBottom: 48 } as React.CSSProperties,
    // CARDS
    card: { background: '#111c13', border: '1px solid rgba(200,168,75,.2)', padding: '40px 32px' } as React.CSSProperties,
    // MODAL BG
    modalBg: { position: 'fixed', inset: 0, background: 'rgba(8,16,10,.95)', backdropFilter: 'blur(16px)', zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' } as React.CSSProperties,
  };

  return (
    <>
      {/* GOOGLE FONTS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{overflow-x:hidden;background:#08100a;}
        select option{background:#111c13;color:#f5f0e8;}
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%{r:3;opacity:.55}100%{r:14;opacity:0}}
        .anim1{opacity:0;animation:fu .7s .1s forwards;}
        .anim2{opacity:0;animation:fu .7s .2s forwards;}
        .anim3{opacity:0;animation:fu .7s .3s forwards;}
        .anim4{opacity:0;animation:fu .7s .4s forwards;}
        .anim5{opacity:0;animation:fu .7s .55s forwards;}
        .port-pulse{fill:#c8a84b;opacity:0;animation:pulse 3s ease-out infinite;}
        .port-dot{fill:#c8a84b;stroke:rgba(200,168,75,.4);stroke-width:4;paint-order:stroke;}
        .port-label{fill:#f5f0e8;font-family:'Rajdhani',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:.4px;pointer-events:none;text-shadow:0 0 4px #08100a,0 0 4px #08100a;}
        .map-land{fill:#1a2c1f;stroke:rgba(200,168,75,.18);stroke-width:.4;}
        .map-graticule{stroke:rgba(200,168,75,.06);stroke-width:.3;fill:none;}
        .nlnk:hover{color:#c8a84b!important;}
        .result-row:hover{border-color:#c8a84b!important;cursor:pointer;}
        .svc-sub-item:hover{border-color:#c8a84b!important;color:#f5f0e8!important;}
        .seg-card:hover{background:#162019!important;}
        .tier:hover{background:#162019!important;border-color:#c8a84b!important;}
        .why-card:hover{background:#162019!important;}
        .step:hover{background:#162019!important;}
        input, select, textarea{color:#f5f0e8!important;}
        input::placeholder{color:#7a8a72;}
        input:focus, select:focus, textarea:focus{border-color:#c8a84b!important;outline:none;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-track{background:#08100a;}
        ::-webkit-scrollbar-thumb{background:#c8a84b33;border-radius:3px;}
      `}</style>

      <div style={S.page}>

        {/* ── NAV ── */}
        <nav style={S.nav}>
          <div style={S.logoText}>
            <span>PortService</span><span style={S.gold}>Finder</span>
          </div>
          <div style={S.navR}>
            <span style={S.nlnk} className="nlnk" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</span>
            <span style={S.nlnk} className="nlnk" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</span>
            <span style={S.nlnk} className="nlnk" onClick={() => document.getElementById('why')?.scrollIntoView({ behavior: 'smooth' })}>Why Us</span>
            <button style={S.nbtnOutline} onClick={() => { setModalTab('login'); setModalOpen(true); }}>Sign In</button>
            <button style={S.nbtnSolid} onClick={() => { setModalTab('register'); setModalOpen(true); }}>List Your Business</button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={S.hero}>
          <div className="anim1" style={S.eyebrow}>
            <span style={{ width: 32, height: 1, background: '#c8a84b', display: 'inline-block' }} />
            Global Maritime Services Directory
            <span style={{ width: 32, height: 1, background: '#c8a84b', display: 'inline-block' }} />
          </div>
          <h1 className="anim2" style={S.h1}>
            Every Port. Every <em style={S.gold}>Service.</em><br />One Platform.
          </h1>
          <p className="anim3" style={S.heroSub}>
            Find verified ship agents, shipchandlers and marine service companies at any port worldwide. Free to search — no account required.
          </p>
          <div className="anim4" style={S.counts}>
            {[['160+', 'Countries'], ['1,000+', 'Ports'], ['22', 'Service Categories']].map(([n, l]) => (
              <span key={l} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: '#7a8a72', fontWeight: 600 }}>
                <strong style={S.gold}>{n}</strong> {l}
                {l !== 'Service Categories' && <span style={{ marginLeft: 20, color: 'rgba(200,168,75,.3)' }}>·</span>}
              </span>
            ))}
          </div>

          {/* ── MAP ── */}
          <div className="anim5" style={{ width: '100%', maxWidth: 1080, aspectRatio: '2/1', position: 'relative', marginTop: 8 }}>
            <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
              <defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(200,168,75,0.04)" strokeWidth="0.5" /></pattern></defs>
              <rect width="1000" height="500" fill="url(#grid)" />
              <line className="map-graticule" x1="0" y1="250" x2="1000" y2="250" />
              <line className="map-graticule" x1="500" y1="0" x2="500" y2="500" />
              <line className="map-graticule" x1="0" y1="125" x2="1000" y2="125" />
              <line className="map-graticule" x1="0" y1="375" x2="1000" y2="375" />
              <line className="map-graticule" x1="250" y1="0" x2="250" y2="500" />
              <line className="map-graticule" x1="750" y1="0" x2="750" y2="500" />
              {/* Continents */}
              <path className="map-land" d="M 145 120 Q 130 100 145 80 L 175 75 L 200 70 L 230 78 L 245 92 L 240 110 L 260 115 L 285 130 L 280 155 L 260 175 L 240 185 L 215 195 L 195 210 L 175 215 L 160 220 L 150 215 L 145 200 L 155 185 L 150 165 L 138 150 L 142 135 Z" />
              <path className="map-land" d="M 275 280 L 290 270 L 310 270 L 330 280 L 345 300 L 350 325 L 350 355 L 345 385 L 335 415 L 325 440 L 312 460 L 300 470 L 290 460 L 285 440 L 290 415 L 285 390 L 275 365 L 268 340 L 268 315 L 272 295 Z" />
              <path className="map-land" d="M 470 110 L 490 105 L 515 105 L 535 110 L 555 115 L 560 130 L 550 145 L 530 155 L 510 158 L 495 162 L 480 158 L 475 145 L 470 130 Z" />
              <path className="map-land" d="M 490 175 L 515 170 L 540 172 L 560 180 L 575 200 L 580 230 L 580 260 L 575 290 L 565 320 L 555 350 L 540 375 L 525 395 L 510 405 L 498 400 L 490 380 L 488 355 L 490 325 L 485 295 L 478 265 L 475 235 L 478 210 L 482 190 Z" />
              <path className="map-land" d="M 570 175 L 595 175 L 615 185 L 625 200 L 620 215 L 605 220 L 585 218 L 575 205 L 568 190 Z" />
              <path className="map-land" d="M 560 100 L 600 92 L 650 88 L 700 88 L 750 92 L 800 96 L 845 100 L 860 115 L 855 130 L 830 135 L 800 138 L 770 138 L 740 135 L 710 132 L 680 130 L 650 128 L 620 128 L 590 130 L 570 125 Z" />
              <path className="map-land" d="M 670 200 L 695 200 L 715 210 L 720 230 L 710 250 L 695 260 L 680 255 L 668 240 L 665 220 Z" />
              <path className="map-land" d="M 720 145 L 760 140 L 790 145 L 810 160 L 815 180 L 800 200 L 775 210 L 750 208 L 730 200 L 718 180 L 715 160 Z" />
              <path className="map-land" d="M 770 220 L 800 218 L 815 230 L 815 245 L 800 252 L 780 250 L 770 240 Z" />
              <path className="map-land" d="M 825 165 L 835 162 L 842 172 L 840 185 L 832 188 L 826 178 Z" />
              <path className="map-land" d="M 800 270 L 825 268 L 845 275 L 850 285 L 835 290 L 815 288 L 800 280 Z" />
              <path className="map-land" d="M 820 320 L 855 315 L 890 318 L 910 330 L 905 350 L 880 360 L 850 358 L 825 352 L 815 340 Z" />
              {/* Port Markers */}
              {[
                [515, 128, 'Rotterdam'], [525, 120, 'Hamburg'], [550, 165, 'Piraeus'],
                [580, 170, 'Mersin'], [569, 153, 'Istanbul'], [575, 193, 'Port Said'],
                [625, 210, 'Dubai'], [675, 230, 'Mumbai'], [782, 265, 'Singapore'],
                [800, 185, 'Shanghai'], [820, 170, 'Busan'], [840, 175, 'Yokohama'],
                [895, 348, 'Sydney'], [560, 375, 'Durban'], [495, 275, 'Lagos'],
                [215, 200, 'Houston'], [270, 160, 'New York'], [165, 180, 'Los Angeles'],
                [335, 370, 'Santos'], [310, 415, 'Buenos Aires'], [257, 278, 'Panama'],
                [508, 125, 'Antwerp'], [465, 170, 'Algeciras'],
              ].map(([x, y, label]) => (
                <g key={String(label)} transform={`translate(${x},${y})`}>
                  <circle className="port-pulse" cx="0" cy="0" r="3" />
                  <circle className="port-dot" cx="0" cy="0" r="3" />
                  <text className="port-label" x="6" y="-6">{label}</text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* ── SEARCH ── */}
        <section style={S.searchSec} id="search">
          <h2 style={{ ...S.secTitle, fontFamily: "'Libre Baskerville', serif", marginBottom: 28 }}>
            Search the <em style={S.gold}>Directory</em>
          </h2>
          <div style={S.searchGrid}>
            <div>
              <label style={S.sfLabel}>Country</label>
              <select style={S.sfSelect} value={country} onChange={e => { setCountry(e.target.value); setPort(''); setSearchDone(false); }}>
                <option value="">Select country...</option>
                {countries.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.sfLabel}>Port</label>
              <select style={S.sfSelect} value={port} onChange={e => { setPort(e.target.value); doSearch(country, e.target.value, svcType, marineSvcs); }} disabled={!country}>
                <option value="">Select port...</option>
                {ports.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={S.sfLabel}>Service Type</label>
              <select style={S.sfSelect} value={svcType} onChange={e => { setSvcType(e.target.value); setMarineSvcs(new Set()); doSearch(country, port, e.target.value, new Set()); }}>
                <option value="all">All Services</option>
                <option value="agent">Ship Agent</option>
                <option value="chandler">Shipchandler</option>
                <option value="service">Marine Services</option>
              </select>
            </div>
            <button style={S.btnSearch} onClick={() => doSearch(country, port, svcType, marineSvcs)}>Search →</button>
          </div>

          {/* Marine sub-categories */}
          {svcType === 'service' && (
            <div style={{ marginTop: 18, padding: '18px 20px', background: 'rgba(200,168,75,.05)', border: '1px solid rgba(200,168,75,.2)' }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 12, fontWeight: 700 }}>Choose specific marine services (optional)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                {MARINE_SERVICES.map(s => (
                  <div key={s.key} className="svc-sub-item" onClick={() => toggleMarineSvc(s.key)} style={{ padding: '8px 12px', border: `1px solid ${marineSvcs.has(s.key) ? '#c8a84b' : 'rgba(200,168,75,.2)'}`, background: marineSvcs.has(s.key) ? '#c8a84b' : 'rgba(8,16,10,.4)', color: marineSvcs.has(s.key) ? '#08100a' : '#b0c0a4', fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {searchDone && (
            <div style={{ borderTop: '1px solid rgba(200,168,75,.2)', paddingTop: 20, marginTop: 20 }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 14, fontWeight: 700 }}>
                {fallback ? `Other providers in ${country}` : `${results.length} provider${results.length !== 1 ? 's' : ''} found at ${port}`}
              </div>
              {fallback && results.length > 0 && (
                <div style={{ padding: '12px 16px', background: 'rgba(200,168,75,.07)', border: '1px solid rgba(200,168,75,.2)', fontSize: 13, color: '#e2c06a', marginBottom: 12, fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, lineHeight: 1.5 }}>
                  📡 No providers registered at <strong>{port}</strong> yet. Showing other available providers in <strong>{country}</strong>.
                </div>
              )}
              {results.length === 0 && (
                <div style={{ padding: 28, textAlign: 'center', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: '#7a8a72', fontWeight: 500, lineHeight: 1.7 }}>
                  <strong style={{ color: '#c8a84b', display: 'block', marginBottom: 6, fontSize: 14 }}>No providers found.</strong>
                  We are still onboarding providers in this region. <span style={{ color: '#c8a84b', cursor: 'pointer' }} onClick={() => { setModalTab('register'); setModalOpen(true); }}>Register your business →</span>
                </div>
              )}
              {results.map(p => (
                <div key={p.id} className="result-row" onClick={() => setDetailProvider(p)} style={{ background: '#111c13', border: '1px solid rgba(200,168,75,.2)', padding: '18px 22px', marginBottom: 8, display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 14, alignItems: 'center', transition: 'border-color .3s' }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(200,168,75,.1)', border: '1px solid rgba(200,168,75,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{p.ico}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 7, lineHeight: 1.4 }}>{p.bio.length > 150 ? p.bio.slice(0, 150) + '…' : p.bio}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {p.ports.map(pt => <span key={pt} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: 1, fontWeight: 700, padding: '2px 8px', border: '1px solid rgba(200,168,75,.3)', color: '#c8a84b' }}>{pt}</span>)}
                      {fallback && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: 1, fontWeight: 700, padding: '2px 8px', border: '1px solid rgba(200,168,75,.2)', color: '#e2c06a' }}>Other Port</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', marginBottom: 7, fontWeight: 600 }}>{typeLabel(p.type)}</div>
                    <button onClick={e => { e.stopPropagation(); setDetailProvider(p); }} style={{ background: 'transparent', border: '1px solid rgba(200,168,75,.3)', color: '#c8a84b', padding: '7px 16px', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>View Contact</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── STATS ── */}
        <div style={S.statsBar}>
          {[['160+', 'Countries Covered'], ['1,000+', 'Ports in Database'], ['22', 'Service Categories']].map(([n, l], i) => (
            <div key={l} style={{ padding: '36px 20px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(200,168,75,.15)' : 'none' }}>
              <div style={S.statN}>{n}</div>
              <div style={S.statL}>{l}</div>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <section style={S.sec} id="how">
          <div style={S.secEye}><span style={{ width: 30, height: 1, background: 'rgba(200,168,75,.4)', display: 'inline-block' }} />Platform</div>
          <h2 style={S.secTitle}>How <em style={S.gold}>PortServiceFinder</em> Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(200,168,75,.15)' }}>
            {[
              { n: '01', ico: '🌍', title: 'Select Country & Port', text: 'Choose your destination country from our global list of all coastal nations. The system instantly loads every registered port in that country. No account needed — search is completely free and open to all maritime operators worldwide.' },
              { n: '02', ico: '🔍', title: 'Filter by Service Type', text: 'Select Ship Agent, Shipchandler or Marine Services. When you choose Marine Services, you can further narrow down to specific specializations — engine repair, refrigeration, diving, electrical and more.' },
              { n: '03', ico: '📡', title: 'Smart Country Fallback', text: 'No provider at your exact port? PortServiceFinder automatically shows other available service companies in the same country — clearly flagged — so you always find what you need.' },
            ].map(s => (
              <div key={s.n} className="step" style={{ background: '#111c13', padding: '42px 34px', position: 'relative', overflow: 'hidden', transition: 'background .4s' }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 76, fontWeight: 700, color: 'rgba(200,168,75,.06)', position: 'absolute', top: 8, right: 14, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{s.ico}</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 21, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#b0c0a4' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SEGMENTS ── */}
        <section style={{ ...S.sec, ...S.secAlt }} id="services">
          <div style={S.secEye}><span style={{ width: 30, height: 1, background: 'rgba(200,168,75,.4)', display: 'inline-block' }} />Directory Segments</div>
          <h2 style={S.secTitle}>Three Segments.<br />One <em style={S.gold}>Powerful</em> Directory.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(200,168,75,.15)' }}>
            {[
              { ico: '🏢', title: 'Ship Agents', items: ['Full port call management', 'Customs clearance & documentation', 'Crew change & visa assistance', 'Cargo supervision & tally', 'Husbandry — medical, stores, spares', 'Port authority & terminal liaison', 'Bunker coordination & fuel', '24/7 emergency vessel assistance'] },
              { ico: '⚓', title: 'Shipchandlers', items: ['Fresh and dry provisions, frozen foods', 'Deck stores — ropes, paints, safety gear', 'Engine room stores & consumables', 'Bonded and duty-free stores', 'Spare parts sourcing & delivery', 'Lubricating oils and chemicals', 'Safety & firefighting equipment', '24/7 emergency delivery'] },
              { ico: '🔧', title: 'Marine Services', items: ['Main Engine & Auxiliary Repair', 'Refrigeration & HVAC', 'Electrical & Automation', 'Navigation & Communication', 'Underwater Diving', 'Hull, Propeller & Rudder', 'Welding & Fabrication', 'Classification Survey & NDT'] },
            ].map(seg => (
              <div key={seg.title} className="seg-card" style={{ background: '#111c13', padding: '42px 34px', position: 'relative', overflow: 'hidden', transition: 'background .4s', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 50, height: 50, border: '1px solid rgba(200,168,75,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>{seg.ico}</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 21, fontWeight: 700, marginBottom: 10 }}>{seg.title}</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                  {seg.items.map(item => (
                    <li key={item} style={{ fontSize: 13, color: '#b0c0a4', display: 'flex', alignItems: 'flex-start', gap: 7, lineHeight: 1.5 }}>
                      <span style={{ color: '#c8a84b', fontSize: 11, flexShrink: 0, marginTop: 1 }}>→</span>{item}
                    </li>
                  ))}
                </ul>
                <div style={{ paddingTop: 18, borderTop: '1px solid rgba(200,168,75,.2)', display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 20 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 700 }}>$149</span>
                  <span style={{ fontSize: 12, color: '#7a8a72', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>/ month</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section style={S.sec} id="pricing">
          <div style={S.secEye}><span style={{ width: 30, height: 1, background: 'rgba(200,168,75,.4)', display: 'inline-block' }} />Pricing</div>
          <h2 style={S.secTitle}>Simple, <em style={S.gold}>Transparent</em> Pricing</h2>
          <p style={{ textAlign: 'center', color: '#b0c0a4', maxWidth: 540, margin: '-30px auto 40px', fontSize: 14, lineHeight: 1.7 }}>One subscription. All features. No commission, no hidden fees.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, maxWidth: 760, margin: '0 auto' }}>
            {[
              { name: 'Monthly', amt: '$149', per: '/ month', yr: 'Billed monthly · Cancel anytime', badge: null, items: ['Listed at all your ports', 'Full company profile', 'Direct phone, email & WhatsApp', 'Verified provider badge', 'Performance dashboard', 'Email support'] },
              { name: 'Annual', amt: '$1,200', per: '/ year', yr: 'Equivalent to $100/month', badge: 'Save $588', items: ['Everything in Monthly plan', '$588 saved vs monthly billing', 'Priority placement in results', 'Direct phone, email & WhatsApp', 'Verified provider badge', 'Priority email support'] },
            ].map(tier => (
              <div key={tier.name} className="tier" style={{ background: tier.badge ? 'linear-gradient(180deg,rgba(200,168,75,.06),transparent)' : '#111c13', border: `1px solid ${tier.badge ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, padding: '36px 30px', position: 'relative', transition: 'all .4s', display: 'flex', flexDirection: 'column' }}>
                {tier.badge && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#c8a84b', color: '#08100a', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', fontWeight: 700, padding: '5px 14px' }}>{tier.badge}</div>}
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 12, fontWeight: 700 }}>{tier.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 46, fontWeight: 700, lineHeight: 1 }}>{tier.amt}</span>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: '#7a8a72', fontWeight: 600 }}>{tier.per}</span>
                </div>
                <div style={{ fontSize: 12, color: '#b0c0a4', marginBottom: 22, fontFamily: "'Rajdhani', sans-serif", fontWeight: 500 }}>{tier.yr}</div>
                <ul style={{ listStyle: 'none', flex: 1, marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {tier.items.map(item => (
                    <li key={item} style={{ fontSize: 13, color: '#b0c0a4', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
                      <span style={{ color: '#c8a84b', fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setModalTab('register'); setModalOpen(true); }} style={{ padding: 13, background: tier.badge ? '#c8a84b' : 'transparent', border: '1px solid rgba(200,168,75,.4)', color: tier.badge ? '#08100a' : '#c8a84b', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', width: '100%' }}>Get Started</button>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY ── */}
        <section style={{ ...S.sec, ...S.secAlt }} id="why">
          <div style={S.secEye}><span style={{ width: 30, height: 1, background: 'rgba(200,168,75,.4)', display: 'inline-block' }} />Why PortServiceFinder</div>
          <h2 style={S.secTitle}>The Platform Every<br />Maritime Operator <em style={S.gold}>Needs</em></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'rgba(200,168,75,.15)' }}>
            {[
              { ico: '⚡', title: 'Instant Access at Any Port', text: 'Your vessel is heading to a port you\'ve never called before. In seconds, PortServiceFinder shows you every verified agent, chandler and service company registered there — with full contact details, bio and specializations.' },
              { ico: '🔒', title: 'Verified, Professional Listings', text: 'Every provider on PortServiceFinder has submitted their company registration, physical address and service details. No anonymous listings, no fake companies. You know exactly who you\'re contacting.' },
              { ico: '📡', title: 'Smart Country-Level Fallback', text: 'When no service is available at your exact port, our system automatically shows other available providers in the same country — clearly flagged. You\'ll always find help.' },
              { ico: '🌐', title: 'Truly Global Coverage', text: 'From Busan to Buenos Aires, from Rotterdam to Richards Bay — PortServiceFinder covers every coastal nation and every significant commercial port worldwide.' },
              { ico: '💰', title: 'Free to Search, Always', text: 'Shipowners, operators, charterers and managers never pay a cent. Search as many ports, countries and service types as you need — unlimited, forever free.' },
              { ico: '📈', title: 'Flat-Fee Visibility', text: '$149/month puts your business in front of every vessel operator searching your port. No algorithms, no bidding, no commission cuts. A simple flat fee — same for everyone.' },
            ].map(w => (
              <div key={w.title} className="why-card" style={{ background: '#111c13', padding: '34px 30px', transition: 'background .4s' }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{w.ico}</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, fontWeight: 700, marginBottom: 10 }}>{w.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#b0c0a4' }}>{w.text}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: '34px 30px', textAlign: 'center', background: '#111c13', border: '1px solid rgba(200,168,75,.2)', marginTop: 52 }}>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Early Access — <em style={S.gold}>Founding Members Welcome</em></h3>
            <p style={{ fontSize: 14, color: '#b0c0a4', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>PortServiceFinder is in early access. Founding providers get locked-in pricing for life and direct input on platform features.</p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '100px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, border: '1px solid rgba(200,168,75,.15)', borderRadius: '50%', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 800, height: 800, border: '1px solid rgba(200,168,75,.05)', borderRadius: '50%', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ ...S.secEye, justifyContent: 'center', marginBottom: 22 }}><span style={{ width: 30, height: 1, background: 'rgba(200,168,75,.4)', display: 'inline-block' }} />Get Started Today</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(32px,4vw,56px)', fontWeight: 700, lineHeight: 1.05, marginBottom: 16 }}>Be Found by<br />Every Vessel <em style={S.gold}>Worldwide</em></h2>
            <p style={{ fontSize: 15, color: '#b0c0a4', maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.75 }}>List your maritime business on PortServiceFinder for <strong style={S.gold}>$149/month</strong> or <strong style={S.gold}>$1,200/year</strong>. No setup fee. Cancel anytime.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { setModalTab('register'); setModalOpen(true); }} style={{ background: '#c8a84b', color: '#08100a', border: 'none', padding: '14px 36px', fontFamily: "'Rajdhani', sans-serif", fontSize: 15, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>List Your Business</button>
              <button onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: '#f5f0e8', border: '1px solid rgba(200,168,75,.3)', padding: '13px 28px', fontFamily: "'Rajdhani', sans-serif", fontSize: 15, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }}>Search a Port — Free</button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(200,168,75,.2)', padding: '56px 56px 0', display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: 56 }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>PortService<span style={S.gold}>Finder</span></div>
            <p style={{ fontSize: 13, color: '#7a8a72', lineHeight: 1.75, maxWidth: 240, marginBottom: 18 }}>The global maritime services directory. Connecting vessels with verified agents, chandlers and service providers at every port worldwide.</p>
            <div style={{ fontSize: 13, color: '#7a8a72' }}>📧 <a href="mailto:info@portservicefinder.com" style={{ color: 'rgba(200,168,75,.6)', textDecoration: 'none' }}>info@portservicefinder.com</a></div>
          </div>
          {[
            { title: 'Directory', links: ['Ship Agents', 'Shipchandlers', 'Marine Services', 'Search by Port'] },
            { title: 'Company', links: ['About Us', 'Contact', 'Blog', 'Partners'] },
            { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Listing Rules', 'Disclaimer'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 16, fontWeight: 700 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(l => <li key={l}><a href="#" style={{ color: '#7a8a72', textDecoration: 'none', fontSize: 13 }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </footer>
        <div style={{ borderTop: '1px solid rgba(200,168,75,.15)', padding: '18px 56px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: '#4a4a3a', letterSpacing: 1, fontWeight: 600, flexWrap: 'wrap', gap: 10 }}>
          <span>© 2026 PortServiceFinder. All rights reserved.</span>
          <span>MARITIME DIRECTORY · GLOBAL · FREE TO SEARCH</span>
        </div>

        {/* ── PROVIDER DETAIL MODAL ── */}
        {detailProvider && (
          <div style={{ ...S.modalBg, zIndex: 550 }} onClick={e => { if (e.target === e.currentTarget) setDetailProvider(null); }}>
            <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.3)', width: '100%', maxWidth: 720, margin: 'auto' }}>
              <div style={{ padding: '30px 36px 22px', borderBottom: '1px solid rgba(200,168,75,.2)', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ width: 60, height: 60, background: 'rgba(200,168,75,.1)', border: '1px solid rgba(200,168,75,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{detailProvider.ico}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{detailProvider.name}</div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 8 }}>{typeLabel(detailProvider.type)}</div>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: '#4caf76', border: '1px solid rgba(76,175,118,.3)', padding: '3px 9px', letterSpacing: 1, fontWeight: 700 }}>✓ VERIFIED PROVIDER</span>
                </div>
                <button onClick={() => setDetailProvider(null)} style={{ background: 'none', border: 'none', color: '#7a8a72', fontSize: 20, cursor: 'pointer', flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ padding: '26px 36px 32px' }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(200,168,75,.2)', fontWeight: 700 }}>About</div>
                  <p style={{ fontSize: 14, color: '#f5f0e8', lineHeight: 1.7 }}>{detailProvider.bio}</p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(200,168,75,.2)', fontWeight: 700 }}>Contact Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { label: 'Phone', value: detailProvider.phone, href: `tel:${detailProvider.phone.replace(/\s/g, '')}` },
                      { label: 'Email', value: detailProvider.email, href: `mailto:${detailProvider.email}` },
                      { label: 'WhatsApp / 24h', value: detailProvider.wa, href: `https://wa.me/${detailProvider.wa.replace(/\D/g, '')}` },
                      { label: 'Website', value: detailProvider.web.replace(/^https?:\/\//, ''), href: detailProvider.web },
                    ].map(c => (
                      <div key={c.label} style={{ background: '#111c13', border: '1px solid rgba(200,168,75,.2)', padding: '14px 16px' }}>
                        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', marginBottom: 5, fontWeight: 600 }}>{c.label}</div>
                        <a href={c.href} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: '#c8a84b', textDecoration: 'none' }}>{c.value}</a>
                      </div>
                    ))}
                    <div style={{ background: '#111c13', border: '1px solid rgba(200,168,75,.2)', padding: '14px 16px', gridColumn: '1/-1' }}>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', marginBottom: 5, fontWeight: 600 }}>Address</div>
                      <div style={{ fontSize: 14 }}>{detailProvider.addr}</div>
                    </div>
                    <div style={{ background: '#111c13', border: '1px solid rgba(200,168,75,.2)', padding: '14px 16px', gridColumn: '1/-1' }}>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', marginBottom: 5, fontWeight: 600 }}>Contact Person</div>
                      <div style={{ fontSize: 14 }}>{detailProvider.person}</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(200,168,75,.2)', fontWeight: 700 }}>Ports Served</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {detailProvider.ports.map(p => <span key={p} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: 1, fontWeight: 700, padding: '2px 8px', border: '1px solid rgba(200,168,75,.3)', color: '#c8a84b' }}>{p}</span>)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  <a href={`tel:${detailProvider.phone.replace(/\s/g, '')}`} style={{ flex: 1, minWidth: 140, padding: 13, background: '#c8a84b', color: '#08100a', textDecoration: 'none', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>📞 Call Now</a>
                  <a href={`mailto:${detailProvider.email}`} style={{ flex: 1, minWidth: 140, padding: 13, background: '#c8a84b', color: '#08100a', textDecoration: 'none', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>✉ Send Email</a>
                  <a href={`https://wa.me/${detailProvider.wa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: 140, padding: 13, background: 'transparent', border: '1px solid rgba(200,168,75,.4)', color: '#c8a84b', textDecoration: 'none', fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>💬 WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REGISTER / LOGIN MODAL ── */}
        {modalOpen && (
          <div style={S.modalBg} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
            <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.3)', width: '100%', maxWidth: 740, margin: 'auto' }}>
              <div style={{ padding: '26px 34px 18px', borderBottom: '1px solid rgba(200,168,75,.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{modalTab === 'login' ? 'Provider Sign In' : 'List Your Business'}</h2>
                  <p style={{ fontSize: 13, color: '#b0c0a4', lineHeight: 1.6, maxWidth: 440 }}>{modalTab === 'login' ? 'Access your listing dashboard.' : 'Join PortServiceFinder and get found by vessels at every port you serve.'}</p>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#7a8a72', fontSize: 20, cursor: 'pointer', flexShrink: 0 }}>✕</button>
              </div>
              <div style={{ padding: '26px 34px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,168,75,.2)', marginBottom: 22 }}>
                  {(['register', 'login'] as const).map(tab => (
                    <button key={tab} onClick={() => setModalTab(tab)} style={{ padding: '10px 20px', fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', color: modalTab === tab ? '#c8a84b' : '#7a8a72', borderBottom: modalTab === tab ? '2px solid #c8a84b' : '2px solid transparent', marginBottom: -1, background: 'none', border: 'none', borderBottom: modalTab === tab ? '2px solid #c8a84b' : 'none' }}>
                      {tab === 'register' ? 'Register Business' : 'Sign In'}
                    </button>
                  ))}
                </div>

                {modalTab === 'register' ? (
                  <div>
                    {/* Segment select */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
                      {[{ type: 'agent', ico: '🏢', name: 'Ship Agent' }, { type: 'chandler', ico: '⚓', name: 'Shipchandler' }, { type: 'service', ico: '🔧', name: 'Marine Service' }].map(s => (
                        <div key={s.type} onClick={() => setSelectedSegment(s.type)} style={{ border: `1px solid ${selectedSegment === s.type ? '#c8a84b' : 'rgba(200,168,75,.2)'}`, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', background: selectedSegment === s.type ? 'rgba(200,168,75,.1)' : 'transparent' }}>
                          <div style={{ fontSize: 20, marginBottom: 5 }}>{s.ico}</div>
                          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: '#c8a84b', marginTop: 2, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>$149/mo</div>
                        </div>
                      ))}
                    </div>
                    <FInput label="Company Name *" placeholder="Your company name" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <FInput label="City / Head Office *" placeholder="e.g. Mersin" />
                      <FInput label="Country *" placeholder="e.g. Turkey" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <FInput label="Port 1 *" placeholder="e.g. Mersin" />
                      <FInput label="Port 2" placeholder="Optional" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <FInput label="Email *" type="email" placeholder="info@yourcompany.com" />
                      <FInput label="Phone *" placeholder="+1 ..." />
                    </div>
                    <FInput label="Contact Person *" placeholder="Primary contact name" />
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', marginBottom: 4, fontWeight: 600 }}>Company Bio (max 500 characters) *</label>
                      <textarea maxLength={500} placeholder="Brief company description, experience, certifications, key services." style={{ background: 'rgba(8,16,10,.7)', border: '1px solid rgba(200,168,75,.25)', color: '#f5f0e8', padding: '10px 13px', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%', resize: 'vertical', minHeight: 80 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <FInput label="Login Email *" type="email" placeholder="your@company.com" />
                      <FInput label="Password *" type="password" placeholder="Min 8 characters" />
                    </div>
                    <button onClick={() => { setModalOpen(false); setPayModalOpen(true); }} style={{ width: '100%', padding: 14, background: '#c8a84b', border: 'none', color: '#08100a', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Continue to Payment</button>
                    <p style={{ fontSize: 11, color: '#7a8a72', textAlign: 'center', marginTop: 10 }}>$149/month or $1,200/year. Cancel anytime.</p>
                  </div>
                ) : (
                  <div>
                    <FInput label="Email" type="email" placeholder="your@company.com" />
                    <FInput label="Password" type="password" placeholder="••••••••" />
                    <button style={{ width: '100%', padding: 14, background: '#c8a84b', border: 'none', color: '#08100a', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Sign In to PortServiceFinder</button>
                    <p style={{ textAlign: 'center', fontSize: 13, color: '#7a8a72', marginTop: 14 }}>Not registered? <span style={{ color: '#c8a84b', cursor: 'pointer' }} onClick={() => setModalTab('register')}>List your business →</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENT MODAL ── */}
        {payModalOpen && (
          <div style={{ ...S.modalBg, zIndex: 600, alignItems: 'center' }} onClick={e => { if (e.target === e.currentTarget) setPayModalOpen(false); }}>
            <div style={{ background: '#0c1610', border: '1px solid rgba(200,168,75,.3)', width: '100%', maxWidth: 620, padding: 40, margin: 'auto', position: 'relative' }}>
              <button onClick={() => setPayModalOpen(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#7a8a72', fontSize: 20, cursor: 'pointer' }}>✕</button>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Choose Your <em style={S.gold}>Plan</em></h2>
              <p style={{ fontSize: 13, color: '#b0c0a4', marginBottom: 24, lineHeight: 1.6 }}>Select monthly or annual billing. Cancel anytime.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 26 }}>
                {[{ id: 'monthly', label: 'Monthly', price: '$149', period: 'per month', note: 'Billed monthly. Cancel anytime.', badge: null },
                { id: 'yearly', label: 'Annual', price: '$1,200', period: 'per year', note: 'Equivalent to $100/month.', badge: 'Save $588' }].map(p => (
                  <div key={p.id} onClick={() => setSelectedPlan(p.id as 'monthly' | 'yearly')} style={{ border: `2px solid ${selectedPlan === p.id ? '#c8a84b' : 'rgba(200,168,75,.25)'}`, padding: '26px 22px', cursor: 'pointer', position: 'relative', background: selectedPlan === p.id ? 'rgba(200,168,75,.07)' : 'transparent' }}>
                    {p.badge && <div style={{ position: 'absolute', top: 14, right: 14, background: '#c8a84b', color: '#08100a', fontFamily: "'Rajdhani', sans-serif", fontSize: 10, letterSpacing: '1.5px', fontWeight: 700, padding: '3px 8px' }}>{p.badge}</div>}
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c8a84b', fontWeight: 700, marginBottom: 10 }}>{p.label}</div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{p.price}</div>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: '#7a8a72', fontWeight: 600, marginTop: 4 }}>{p.period}</div>
                    <div style={{ fontSize: 12, color: '#b0c0a4', marginTop: 10, lineHeight: 1.5 }}>{p.note}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <FInput label="Cardholder Name" placeholder="Name on card" />
                <FInput label="Card Number" placeholder="1234 5678 9012 3456" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <FInput label="Expiry (MM/YY)" placeholder="MM/YY" />
                  <FInput label="CVC" placeholder="123" />
                </div>
              </div>
              <button onClick={() => { setPayModalOpen(false); alert('Welcome to PortServiceFinder! Your listing is now active.'); }} style={{ width: '100%', padding: 14, background: '#c8a84b', border: 'none', color: '#08100a', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
                Pay {selectedPlan === 'yearly' ? '$1,200' : '$149'} & Activate Listing
              </button>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: '#7a8a72', textAlign: 'center', marginTop: 12, fontWeight: 600 }}>🔒 Secure payment · Cancel anytime</div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ── FORM INPUT HELPER ──
function FInput({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7a8a72', marginBottom: 4, fontWeight: 600 }}>{label}</label>
      <input type={type} placeholder={placeholder} style={{ background: 'rgba(8,16,10,.7)', border: '1px solid rgba(200,168,75,.25)', color: '#f5f0e8', padding: '10px 13px', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%' }} />
    </div>
  );
}