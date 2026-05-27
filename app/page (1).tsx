'use client';
import { useState } from 'react';
import Link from 'next/link';

const FLAG: Record<string, string> = {
  'Albania':'🇦🇱','Algeria':'🇩🇿','Angola':'🇦🇴','Antigua and Barbuda':'🇦🇬','Argentina':'🇦🇷','Aruba':'🇦🇼','Australia':'🇦🇺','Bahamas':'🇧🇸','Bahrain':'🇧🇭','Bangladesh':'🇧🇩','Barbados':'🇧🇧','Belgium':'🇧🇪','Belize':'🇧🇿','Benin':'🇧🇯','Bermuda':'🇧🇲','Brazil':'🇧🇷','Brunei':'🇧🇳','Bulgaria':'🇧🇬','Cambodia':'🇰🇭','Cameroon':'🇨🇲','Canada':'🇨🇦','Cape Verde':'🇨🇻','Cayman Islands':'🇰🇾','Chile':'🇨🇱','China':'🇨🇳','Colombia':'🇨🇴','Comoros':'🇰🇲','Congo (DRC)':'🇨🇩','Congo (Republic)':'🇨🇬','Cook Islands':'🇨🇰','Costa Rica':'🇨🇷','Croatia':'🇭🇷','Cuba':'🇨🇺','Curacao':'🇨🇼','Cyprus':'🇨🇾','Denmark':'🇩🇰','Djibouti':'🇩🇯','Dominica':'🇩🇲','Dominican Republic':'🇩🇴','Ecuador':'🇪🇨','Egypt':'🇪🇬','El Salvador':'🇸🇻','Equatorial Guinea':'🇬🇶','Eritrea':'🇪🇷','Estonia':'🇪🇪','Faroe Islands':'🇫🇴','Fiji':'🇫🇯','Finland':'🇫🇮','France':'🇫🇷','French Polynesia':'🇵🇫','Gabon':'🇬🇦','Gambia':'🇬🇲','Georgia':'🇬🇪','Germany':'🇩🇪','Ghana':'🇬🇭','Gibraltar':'🇬🇮','Greece':'🇬🇷','Greenland':'🇬🇱','Grenada':'🇬🇩','Guam':'🇬🇺','Guatemala':'🇬🇹','Guinea':'🇬🇳','Guinea-Bissau':'🇬🇼','Guyana':'🇬🇾','Haiti':'🇭🇹','Honduras':'🇭🇳','Hong Kong':'🇭🇰','Iceland':'🇮🇸','India':'🇮🇳','Indonesia':'🇮🇩','Iran':'🇮🇷','Iraq':'🇮🇶','Ireland':'🇮🇪','Israel':'🇮🇱','Italy':'🇮🇹','Ivory Coast':'🇨🇮','Jamaica':'🇯🇲','Japan':'🇯🇵','Jordan':'🇯🇴','Kenya':'🇰🇪','Kiribati':'🇰🇮','Kuwait':'🇰🇼','Latvia':'🇱🇻','Lebanon':'🇱🇧','Liberia':'🇱🇷','Libya':'🇱🇾','Lithuania':'🇱🇹','Madagascar':'🇲🇬','Malaysia':'🇲🇾','Maldives':'🇲🇻','Malta':'🇲🇹','Marshall Islands':'🇲🇭','Mauritania':'🇲🇷','Mauritius':'🇲🇺','Mexico':'🇲🇽','Micronesia':'🇫🇲','Monaco':'🇲🇨','Montenegro':'🇲🇪','Morocco':'🇲🇦','Mozambique':'🇲🇿','Myanmar':'🇲🇲','Namibia':'🇳🇦','Nauru':'🇳🇷','Netherlands':'🇳🇱','New Caledonia':'🇳🇨','New Zealand':'🇳🇿','Nicaragua':'🇳🇮','Nigeria':'🇳🇬','North Korea':'🇰🇵','Norway':'🇳🇴','Oman':'🇴🇲','Pakistan':'🇵🇰','Palau':'🇵🇼','Panama':'🇵🇦','Papua New Guinea':'🇵🇬','Paraguay':'🇵🇾','Peru':'🇵🇪','Philippines':'🇵🇭','Poland':'🇵🇱','Portugal':'🇵🇹','Puerto Rico':'🇵🇷','Qatar':'🇶🇦','Romania':'🇷🇴','Russia':'🇷🇺','Saint Kitts and Nevis':'🇰🇳','Saint Lucia':'🇱🇨','Saint Vincent':'🇻🇨','Samoa':'🇼🇸','Sao Tome and Principe':'🇸🇹','Saudi Arabia':'🇸🇦','Senegal':'🇸🇳','Seychelles':'🇸🇨','Sierra Leone':'🇸🇱','Singapore':'🇸🇬','Slovenia':'🇸🇮','Solomon Islands':'🇸🇧','Somalia':'🇸🇴','South Africa':'🇿🇦','South Korea':'🇰🇷','Spain':'🇪🇸','Sri Lanka':'🇱🇰','Sudan':'🇸🇩','Suriname':'🇸🇷','Sweden':'🇸🇪','Syria':'🇸🇾','Taiwan':'🇹🇼','Tanzania':'🇹🇿','Thailand':'🇹🇭','Timor-Leste':'🇹🇱','Togo':'🇹🇬','Tonga':'🇹🇴','Trinidad and Tobago':'🇹🇹','Tunisia':'🇹🇳','Turkey':'🇹🇷','UAE':'🇦🇪','Ukraine':'🇺🇦','United Kingdom':'🇬🇧','United States':'🇺🇸','Uruguay':'🇺🇾','Vanuatu':'🇻🇺','Venezuela':'🇻🇪','Vietnam':'🇻🇳','Virgin Islands (US)':'🇻🇮','Yemen':'🇾🇪',
};

const PORT_DATA: Record<string, string[]> = {
  'Albania': ['Durrës', 'Vlorë', 'Shëngjin', 'Sarandë'],
  'Algeria': ['Algiers', 'Oran', 'Annaba', 'Skikda', 'Béjaïa', 'Arzew', 'Mostaganem', 'Ghazaouet', 'Djendjene', 'Tenes'],
  'Angola': ['Luanda', 'Lobito', 'Namibe', 'Soyo', 'Cabinda', 'Porto Amboim'],
  'Antigua and Barbuda': ["St. John's"],
  'Argentina': ['Buenos Aires', 'Bahía Blanca', 'Rosario', 'Mar del Plata', 'Quequén', 'San Lorenzo', 'Ushuaia', 'Zarate', 'Campana', 'Puerto Madryn', 'La Plata', 'Puerto Deseado'],
  'Aruba': ['Oranjestad', 'Barcadera', 'San Nicolas'],
  'Australia': ['Port Hedland', 'Fremantle', 'Melbourne', 'Sydney', 'Brisbane', 'Gladstone', 'Darwin', 'Adelaide', 'Townsville', 'Newcastle', 'Geelong', 'Hay Point', 'Dampier', 'Port Kembla', 'Cairns', 'Mackay', 'Port Walcott', 'Esperance', 'Bunbury', 'Albany'],
  'Bahamas': ['Nassau', 'Freeport', 'South Riding Point'],
  'Bahrain': ['Mina Salman', 'Khalifa Bin Salman', 'Sitra'],
  'Bangladesh': ['Chittagong', 'Mongla', 'Payra'],
  'Barbados': ['Bridgetown'],
  'Belgium': ['Antwerp', 'Ghent', 'Zeebrugge', 'Ostend', 'Liège', 'Brussels'],
  'Belize': ['Belize City', 'Big Creek', 'Commerce Bight'],
  'Benin': ['Cotonou'],
  'Bermuda': ['Hamilton', "St. George's", 'Royal Naval Dockyard'],
  'Brazil': ['Santos', 'Rio de Janeiro', 'Paranaguá', 'Itajaí', 'Manaus', 'Fortaleza', 'Recife', 'Salvador', 'Vitória', 'Rio Grande', 'Suape', 'Itaqui', 'Pecém', 'Tubarão', 'Aratu', 'Belém', 'Imbituba', 'Antonina', 'Santarém', 'Maceió'],
  'Brunei': ['Muara', 'Seria'],
  'Bulgaria': ['Varna', 'Burgas', 'Lom', 'Rousse'],
  'Cambodia': ['Sihanoukville', 'Phnom Penh'],
  'Cameroon': ['Douala', 'Kribi', 'Limbe'],
  'Canada': ['Vancouver', 'Prince Rupert', 'Montreal', 'Halifax', 'Saint John NB', 'Thunder Bay', 'Quebec City', 'Hamilton', 'Sept-Îles', 'Port Hawkesbury', 'Sydney NS', 'Churchill', 'Nanaimo', 'Victoria', 'Trois-Rivières', 'Belledune'],
  'Cape Verde': ['Praia', 'Mindelo', 'Palmeira'],
  'Cayman Islands': ['George Town'],
  'Chile': ['Valparaíso', 'San Antonio', 'Antofagasta', 'Iquique', 'Arica', 'Punta Arenas', 'Talcahuano', 'San Vicente', 'Coronel', 'Mejillones', 'Chañaral', 'Lirquén', 'Puerto Montt', 'Coquimbo'],
  'China': ['Shanghai', 'Tianjin', 'Qingdao', 'Guangzhou', 'Ningbo-Zhoushan', 'Shenzhen', 'Dalian', 'Xiamen', 'Nanjing', 'Fuzhou', 'Yantai', 'Lianyungang', 'Rizhao', 'Yingkou', 'Quanzhou', 'Tangshan', 'Beihai', 'Shantou', 'Zhuhai', 'Zhanjiang', 'Hong Kong', 'Haikou', 'Wenzhou', 'Sanya', 'Suzhou', 'Jiangyin', 'Nantong', 'Changshu', 'Taicang', 'Foshan', 'Zhongshan', 'Jiujiang', 'Wuhu', 'Maanshan', 'Yangzhou'],
  'Colombia': ['Cartagena', 'Buenaventura', 'Barranquilla', 'Santa Marta', 'Tumaco', 'Turbo', 'Coveñas', 'Puerto Bolívar'],
  'Comoros': ['Moroni', 'Mutsamudu'],
  'Congo (DRC)': ['Matadi', 'Boma', 'Banana'],
  'Congo (Republic)': ['Pointe-Noire'],
  'Cook Islands': ['Avatiu'],
  'Costa Rica': ['Limón', 'Puntarenas', 'Caldera', 'Moín'],
  'Croatia': ['Rijeka', 'Split', 'Zadar', 'Dubrovnik', 'Ploče', 'Šibenik', 'Pula'],
  'Cuba': ['Havana', 'Mariel', 'Cienfuegos', 'Santiago de Cuba', 'Matanzas', 'Nuevitas'],
  'Curacao': ['Willemstad', 'Bullenbaai'],
  'Cyprus': ['Limassol', 'Famagusta', 'Larnaca', 'Vasilikos'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Esbjerg', 'Fredericia', 'Aalborg', 'Kalundborg', 'Odense', 'Køge', 'Helsingør', 'Skagen'],
  'Djibouti': ['Djibouti', 'Doraleh', 'Tadjourah'],
  'Dominica': ['Roseau', 'Portsmouth'],
  'Dominican Republic': ['Santo Domingo', 'Caucedo', 'Puerto Plata', 'Haina', 'Boca Chica', 'Manzanillo'],
  'Ecuador': ['Guayaquil', 'Manta', 'Esmeraldas', 'Puerto Bolívar', 'Posorja'],
  'Egypt': ['Alexandria', 'Port Said', 'Suez', 'Damietta', 'East Port Said', 'Sokhna', 'Adabiya', 'El Dekheila', 'Safaga', 'Hurghada'],
  'El Salvador': ['Acajutla', 'La Unión'],
  'Equatorial Guinea': ['Malabo', 'Bata', 'Luba'],
  'Eritrea': ['Massawa', 'Assab'],
  'Estonia': ['Tallinn', 'Sillamäe', 'Muuga', 'Paldiski'],
  'Faroe Islands': ['Tórshavn', 'Klaksvík', 'Runavík'],
  'Fiji': ['Suva', 'Lautoka'],
  'Finland': ['Helsinki', 'Kotka', 'Turku', 'Hanko', 'Rauma', 'Kokkola', 'Pori', 'Oulu', 'Hamina', 'Naantali'],
  'France': ['Marseille', 'Le Havre', 'Dunkirk', 'Bordeaux', 'Nantes-Saint-Nazaire', 'Rouen', 'Calais', 'Brest', 'La Rochelle', 'Sète', 'Toulon', 'Cherbourg', 'Boulogne-sur-Mer', 'Bayonne', 'Lorient', 'Fos-sur-Mer'],
  'French Polynesia': ['Papeete'],
  'Gabon': ['Libreville', 'Port-Gentil', 'Owendo'],
  'Gambia': ['Banjul'],
  'Georgia': ['Batumi', 'Poti', 'Kulevi'],
  'Germany': ['Hamburg', 'Bremen', 'Bremerhaven', 'Rostock', 'Lübeck', 'Kiel', 'Emden', 'Wilhelmshaven', 'Cuxhaven', 'Stralsund'],
  'Ghana': ['Tema', 'Takoradi'],
  'Gibraltar': ['Gibraltar'],
  'Greece': ['Piraeus', 'Thessaloniki', 'Volos', 'Patras', 'Heraklion', 'Kavala', 'Elefsina', 'Lavrio', 'Alexandroupoli', 'Igoumenitsa', 'Rhodes', 'Corfu', 'Mykonos', 'Santorini', 'Chania'],
  'Greenland': ['Nuuk', 'Sisimiut', 'Ilulissat'],
  'Grenada': ["St. George's"],
  'Guam': ['Apra Harbor'],
  'Guatemala': ['Puerto Quetzal', 'Puerto Barrios', 'Santo Tomás de Castilla'],
  'Guinea': ['Conakry', 'Kamsar'],
  'Guinea-Bissau': ['Bissau'],
  'Guyana': ['Georgetown', 'New Amsterdam'],
  'Haiti': ['Port-au-Prince', 'Cap-Haïtien'],
  'Honduras': ['Puerto Cortés', 'San Lorenzo', 'Puerto Castilla', 'La Ceiba'],
  'Hong Kong': ['Kwai Tsing', 'Stonecutters', 'Tsing Yi'],
  'Iceland': ['Reykjavik', 'Hafnarfjörður', 'Akureyri', 'Grundartangi', 'Reyðarfjörður'],
  'India': ['Mumbai', 'Chennai', 'Kolkata', 'Kandla', 'Nhava Sheva (JNPT)', 'Visakhapatnam', 'Paradip', 'Cochin', 'Tuticorin', 'Mormugao', 'New Mangalore', 'Ennore', 'Haldia', 'Mundra', 'Pipavav', 'Krishnapatnam', 'Hazira', 'Dahej', 'Karaikal', 'Kakinada', 'Gangavaram'],
  'Indonesia': ['Jakarta / Tanjung Priok', 'Surabaya / Tanjung Perak', 'Belawan (Medan)', 'Makassar', 'Semarang', 'Balikpapan', 'Banjarmasin', 'Pontianak', 'Bitung', 'Dumai', 'Cilacap', 'Palembang', 'Jambi', 'Padang', 'Cilegon', 'Cigading', 'Lhokseumawe', 'Pekanbaru', 'Tarakan', 'Sorong', 'Ambon', 'Kupang', 'Manado', 'Kendari'],
  'Iran': ['Bandar Abbas', 'Imam Khomeini', 'Bushehr', 'Bandar Anzali', 'Chabahar', 'Khorramshahr', 'Bandar Lengeh', 'Assaluyeh'],
  'Iraq': ['Umm Qasr', 'Khor al-Zubair', 'Basra', 'Al Faw'],
  'Ireland': ['Dublin', 'Cork', 'Waterford', 'Galway', 'Limerick', 'Rosslare', 'Foynes'],
  'Israel': ['Haifa', 'Ashdod', 'Eilat'],
  'Italy': ['Genoa', 'Naples', 'Livorno', 'Taranto', 'Venice', 'Trieste', 'Gioia Tauro', 'Civitavecchia', 'Ravenna', 'Ancona', 'La Spezia', 'Cagliari', 'Augusta', 'Palermo', 'Salerno', 'Bari', 'Brindisi', 'Catania', 'Messina', 'Savona', 'Marghera', 'Olbia'],
  'Ivory Coast': ['Abidjan', 'San Pédro'],
  'Jamaica': ['Kingston', 'Montego Bay', 'Port Esquivel'],
  'Japan': ['Yokohama', 'Osaka', 'Nagoya', 'Kobe', 'Tokyo', 'Hakata', 'Chiba', 'Kawasaki', 'Niigata', 'Sakai-Senboku', 'Kita-Kyushu', 'Shimizu', 'Mizushima', 'Tomakomai', 'Sendai', 'Hachinohe', 'Naha', 'Akita', 'Sakata', 'Kashima', 'Wakayama', 'Tokuyama', 'Oita', 'Imari', 'Otaru', 'Hakodate', 'Kanmon'],
  'Jordan': ['Aqaba'],
  'Kenya': ['Mombasa', 'Lamu', 'Kilindini'],
  'Kiribati': ['Tarawa', 'Kiritimati'],
  'Kuwait': ['Kuwait City / Shuwaikh', 'Shuaiba', 'Doha Port', 'Mina Al Ahmadi'],
  'Latvia': ['Riga', 'Ventspils', 'Liepāja'],
  'Lebanon': ['Beirut', 'Tripoli', 'Sidon'],
  'Liberia': ['Monrovia', 'Buchanan', 'Greenville', 'Harper'],
  'Libya': ['Tripoli', 'Benghazi', 'Misrata', 'Tobruk', 'Es Sider', 'Ras Lanuf', 'Marsa El Brega', 'Zueitina'],
  'Lithuania': ['Klaipeda', 'Butinge'],
  'Madagascar': ['Toamasina', 'Mahajanga', 'Toliara', 'Antsiranana'],
  'Malaysia': ['Port Klang', 'Penang', 'Johor', 'Kuching', 'Kota Kinabalu', 'Bintulu', 'Tanjung Pelepas', 'Pasir Gudang', 'Kuantan', 'Labuan', 'Lumut', 'Miri', 'Sandakan'],
  'Maldives': ['Malé'],
  'Malta': ['Valletta / Grand Harbour', 'Marsaxlokk'],
  'Marshall Islands': ['Majuro', 'Ebeye'],
  'Mauritania': ['Nouakchott', 'Nouadhibou'],
  'Mauritius': ['Port Louis'],
  'Mexico': ['Manzanillo', 'Veracruz', 'Altamira', 'Lázaro Cárdenas', 'Ensenada', 'Tampico', 'Coatzacoalcos', 'Tuxpan', 'Mazatlán', 'Topolobampo', 'Progreso', 'Salina Cruz', 'Guaymas', 'Acapulco'],
  'Micronesia': ['Pohnpei', 'Chuuk', 'Yap'],
  'Monaco': ['Monaco'],
  'Montenegro': ['Bar', 'Kotor'],
  'Morocco': ['Casablanca', 'Tanger Med', 'Agadir', 'Safi', 'Nador', 'Jorf Lasfar', 'Mohammedia', 'Laâyoune', 'Dakhla', 'Kenitra'],
  'Mozambique': ['Maputo', 'Beira', 'Nacala', 'Pemba', 'Quelimane'],
  'Myanmar': ['Yangon / Thilawa', 'Kyaukpyu', 'Sittwe', 'Mawlamyine'],
  'Namibia': ['Walvis Bay', 'Lüderitz'],
  'Nauru': ['Aiwo'],
  'Netherlands': ['Rotterdam', 'Amsterdam', 'Vlissingen', 'Moerdijk', 'Terneuzen', 'Den Helder', 'IJmuiden', 'Delfzijl', 'Eemshaven', 'Harlingen', 'Velsen-Noord'],
  'New Caledonia': ['Nouméa'],
  'New Zealand': ['Auckland', 'Tauranga', 'Wellington', 'Lyttelton', 'Port Chalmers', 'Napier', 'Nelson', 'Bluff', 'New Plymouth', 'Timaru'],
  'Nicaragua': ['Corinto', 'Bluefields', 'Puerto Cabezas'],
  'Nigeria': ['Lagos / Apapa', 'Tin Can Island', 'Onne', 'Port Harcourt', 'Calabar', 'Warri', 'Bonny', 'Sapele'],
  'North Korea': ['Nampo', 'Wonsan', 'Hungnam', 'Chongjin', 'Rason'],
  'Norway': ['Oslo', 'Bergen', 'Stavanger', 'Tromsø', 'Trondheim', 'Kristiansand', 'Narvik', 'Mongstad', 'Sture', 'Kårstø', 'Slagentangen', 'Hammerfest', 'Mo i Rana', 'Ålesund'],
  'Oman': ['Muscat / Port Sultan Qaboos', 'Salalah', 'Sohar', 'Duqm', 'Khasab', 'Mina Al Fahal'],
  'Pakistan': ['Karachi', 'Port Qasim', 'Gwadar'],
  'Palau': ['Koror', 'Malakal'],
  'Panama': ['Balboa', 'Manzanillo', 'Colón', 'Cristóbal', 'Vacamonte', 'Charco Azul', 'Almirante', 'Aguadulce'],
  'Papua New Guinea': ['Port Moresby', 'Lae', 'Madang', 'Rabaul', 'Kimbe'],
  'Peru': ['Callao', 'Paita', 'Ilo', 'Matarani', 'Salaverry', 'Chimbote', 'Talara', 'Pisco'],
  'Philippines': ['Manila', 'Cebu', 'Davao', 'General Santos', 'Cagayan de Oro', 'Batangas', 'Subic Bay', 'Iloilo', 'Zamboanga', 'Bacolod', 'Tacloban', 'Dumaguete', 'Surigao', 'Puerto Princesa', 'Tagbilaran', 'Ozamiz', 'Calbayog', 'Legazpi', 'Cagayan', 'Naga'],
  'Poland': ['Gdańsk', 'Gdynia', 'Szczecin', 'Świnoujście', 'Police', 'Kołobrzeg'],
  'Portugal': ['Lisbon', 'Sines', 'Porto / Leixões', 'Setúbal', 'Aveiro', 'Faro', 'Funchal', 'Ponta Delgada'],
  'Puerto Rico': ['San Juan', 'Ponce', 'Mayagüez'],
  'Qatar': ['Doha / Hamad Port', 'Ras Laffan', 'Mesaieed'],
  'Romania': ['Constanța', 'Galați', 'Brăila', 'Tulcea', 'Mangalia', 'Midia'],
  'Russia': ['Novorossiysk', 'St. Petersburg', 'Vladivostok', 'Nakhodka', 'Murmansk', 'Kaliningrad', 'Ust-Luga', 'Primorsk', 'Tuapse', 'Taman', 'Sovetskaya Gavan', 'Vanino', 'Vostochny', 'Magadan', 'Sakhalin (Korsakov)', 'Arkhangelsk', 'Vyborg'],
  'Saint Kitts and Nevis': ['Basseterre', 'Charlestown'],
  'Saint Lucia': ['Castries', 'Vieux Fort'],
  'Saint Vincent': ['Kingstown'],
  'Samoa': ['Apia'],
  'Sao Tome and Principe': ['São Tomé'],
  'Saudi Arabia': ['Jeddah', 'Dammam / King Abdulaziz', 'Yanbu', 'Jubail', 'Jizan', 'Ras Tanura', 'King Fahd Industrial', 'King Abdullah Port', 'Duba'],
  'Senegal': ['Dakar', 'Ziguinchor'],
  'Seychelles': ['Victoria'],
  'Sierra Leone': ['Freetown', 'Pepel'],
  'Singapore': ['Singapore', 'Jurong', 'Tuas', 'Pasir Panjang', 'Sembawang'],
  'Slovenia': ['Koper'],
  'Solomon Islands': ['Honiara', 'Noro'],
  'Somalia': ['Mogadishu', 'Berbera', 'Bosaso', 'Kismayo'],
  'South Africa': ['Durban', 'Cape Town', 'Port Elizabeth', 'Richards Bay', 'East London', 'Saldanha', 'Mossel Bay', 'Ngqura'],
  'South Korea': ['Busan', 'Incheon', 'Ulsan', 'Pohang', 'Gwangyang', 'Pyeongtaek', 'Mokpo', 'Donghae', 'Gunsan', 'Yeosu', 'Masan', 'Jeju'],
  'Spain': ['Barcelona', 'Valencia', 'Bilbao', 'Algeciras', 'Las Palmas', 'Cartagena', 'Huelva', 'Tarragona', 'Vigo', 'A Coruña', 'Gijón', 'Santander', 'Málaga', 'Alicante', 'Castellón', 'Ferrol', 'Avilés', 'Almería', 'Sevilla', 'Pasajes', 'Tenerife', 'Palma de Mallorca'],
  'Sri Lanka': ['Colombo', 'Hambantota', 'Trincomalee', 'Galle'],
  'Sudan': ['Port Sudan', 'Suakin'],
  'Suriname': ['Paramaribo', 'Nieuw Nickerie'],
  'Sweden': ['Gothenburg', 'Stockholm', 'Malmö', 'Gävle', 'Luleå', 'Helsingborg', 'Trelleborg', 'Norrköping', 'Oxelösund', 'Karlshamn'],
  'Syria': ['Latakia', 'Tartus', 'Banias'],
  'Taiwan': ['Kaohsiung', 'Keelung', 'Taichung', 'Hualien', 'Taipei (Taoyuan)', 'Suao', 'Anping', 'Mailiao'],
  'Tanzania': ['Dar es Salaam', 'Tanga', 'Zanzibar', 'Mtwara'],
  'Thailand': ['Bangkok / Laem Chabang', 'Map Ta Phut', 'Songkhla', 'Sattahip', 'Sriracha', 'Phuket', 'Ranong'],
  'Timor-Leste': ['Dili'],
  'Togo': ['Lomé', 'Kpémé'],
  'Tonga': ['Nukuʻalofa'],
  'Trinidad and Tobago': ['Port of Spain', 'Point Lisas', 'Point Fortin', 'Scarborough'],
  'Tunisia': ['Tunis / La Goulette', 'Sousse', 'Sfax', 'Bizerte', 'Gabès', 'Zarzis', 'Skhira'],
  'Turkey': ['Mersin', 'Istanbul', 'Izmir', 'Iskenderun', 'Gemlik', 'Aliaga', 'Derince', 'Samsun', 'Trabzon', 'Antalya', 'Zonguldak', 'Bandırma', 'Mudanya', 'Tekirdağ', 'Ambarli', 'Hopa', 'Rize', 'Ordu', 'Sinop', 'Çanakkale', 'Kocaeli', 'Yarımca', 'Tuzla', 'Karaköy'],
  'UAE': ['Dubai / Jebel Ali', 'Abu Dhabi', 'Sharjah', 'Fujairah', 'Ras Al Khaimah', 'Khalifa Port', 'Hamriyah', 'Ajman', 'Umm Al Quwain', 'Mina Rashid', 'Mina Zayed'],
  'Ukraine': ['Odessa', 'Yuzhne', 'Chornomorsk', 'Mykolaiv', 'Mariupol', 'Berdyansk', 'Reni', 'Izmail'],
  'United Kingdom': ['London', 'Liverpool', 'Southampton', 'Aberdeen', 'Felixstowe', 'Grimsby', 'Tilbury', 'Hull', 'Tees', 'Belfast', 'Milford Haven', 'Immingham', 'Bristol', 'Glasgow', 'Cardiff', 'Portsmouth', 'Plymouth', 'Newport', 'Sullom Voe', 'Sheerness', 'Dover', 'Harwich'],
  'United States': ['New Orleans', 'Houston', 'Los Angeles', 'New York / New Jersey', 'Baltimore', 'Seattle', 'Miami', 'Savannah', 'Charleston', 'Norfolk', 'Long Beach', 'Oakland', 'Tampa', 'Jacksonville', 'Philadelphia', 'Boston', 'Mobile', 'Corpus Christi', 'Beaumont', 'Galveston', 'Port Arthur', 'Tacoma', 'Portland OR', 'San Francisco', 'San Diego', 'Honolulu', 'Anchorage', 'Wilmington NC', 'Port Everglades', 'Pascagoula', 'Lake Charles', 'Freeport TX', 'Texas City', 'Gulfport', 'Brunswick'],
  'Uruguay': ['Montevideo', 'Nueva Palmira', 'Fray Bentos', 'Punta del Este', 'Colonia'],
  'Vanuatu': ['Port Vila', 'Luganville'],
  'Venezuela': ['Maracaibo', 'La Guaira', 'Puerto Cabello', 'Puerto Ordaz', 'El Guamache', 'Guanta', 'Amuay', 'Cardón'],
  'Vietnam': ['Ho Chi Minh City / Cat Lai', 'Hai Phong', 'Da Nang', 'Cai Mep', 'Quy Nhon', 'Vung Tau', 'Nha Trang', 'Phu My', 'Cam Pha', 'Cua Lo', 'Can Tho'],
  'Virgin Islands (US)': ['Charlotte Amalie', 'Christiansted'],
  'Yemen': ['Aden', 'Hodeidah', 'Mukalla', 'Mocha'],
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
  { key: 'crew', label: 'Crew Change & Logistics' },
  { key: 'bunker', label: 'Bunker Supply' },
  { key: 'lubricant', label: 'Lubricant Supply' },
  { key: 'freshwater', label: 'Fresh Water Supply' },
  { key: 'garbage', label: 'Garbage & Sludge Disposal' },
  { key: 'tank', label: 'Tank Cleaning' },
  { key: 'slop', label: 'Slop & Bilge Disposal' },
  { key: 'holdcleaning', label: 'Cargo Hold Cleaning' },
  { key: 'lashing', label: 'Lashing & Securing' },
  { key: 'anchor', label: 'Anchor & Chain Service' },
  { key: 'pilotladder', label: 'Pilot Ladder Inspection' },
  { key: 'gasfree', label: 'Gas Free Certification' },
  { key: 'gmdss', label: 'Radio / GMDSS Survey' },
  { key: 'ecdis', label: 'ECDIS Update Service' },
  { key: 'imo', label: 'IMO / Flag Documentation' },
  { key: 'pestcontrol', label: 'Pest Control & Fumigation' },
];

const FEATURED_BLOGS = [
  {slug:'singapore-port-complete-guide-2026',flag:'🇸🇬',title:'Singapore Port Complete Guide',excerpt:'130,000+ annual vessel calls. The world\u2019s busiest port — terminals, anchorages, bunkering, agency.',time:'14 min'},
  {slug:'suez-canal-transit-complete-guide-2026',flag:'🇪🇬',title:'Suez Canal Transit Guide',excerpt:'Everything about Suez Canal transit — booking, tolls, convoy system, agents at Port Said and Suez.',time:'13 min'},
  {slug:'rotterdam-port-complete-guide-2026',flag:'🇳🇱',title:'Rotterdam Port Guide',excerpt:'Europe\u2019s largest port — terminals, pilotage, bunkering, and operational efficiency benchmark.',time:'13 min'},
  {slug:'panama-canal-transit-complete-guide-2026',flag:'🇵🇦',title:'Panama Canal Transit Guide',excerpt:'Booking, locks, tolls, agency at Balboa and Crist\u00f3bal. Navigate the world\u2019s most complex canal.',time:'13 min'},
  {slug:'dubai-jebel-ali-port-complete-guide-2026',flag:'🇦🇪',title:'Dubai & Jebel Ali Port Guide',excerpt:'Middle East\u2019s largest port + Fujairah bunkering hub. UAE port system explained.',time:'12 min'},
  {slug:'istanbul-turkish-straits-complete-guide-2026',flag:'🇹🇷',title:'Istanbul & Turkish Straits',excerpt:'Bosphorus and Dardanelles transit — procedures, TSVTS, Istanbul agency, Ambarli port.',time:'12 min'},
];

const TESTIMONIALS = [
  { role: 'Fleet Operations Manager', region: 'Bulk Carrier Operator · Asia Region', icon: '🚢', quote: 'Finding reliable agents and chandlers across new ports used to mean calling four or five contacts and waiting hours for quotes. Having a single directory cuts that workflow down to minutes.' },
  { role: 'Operations Director', region: 'Tanker Operator · Europe Region', icon: '🚢', quote: 'Our biggest pain point was visibility — knowing which providers at a new port were actually responsive and verified. A centralized directory with verified status solves a real operational problem.' },
  { role: 'Ship Agent', region: 'Mediterranean Region', icon: '🏢', quote: 'Visibility to new operators has always been our biggest challenge. Being listed on a platform that vessel operators actively search has noticeably increased the volume of inquiries we receive.' },
  { role: 'Port Agency Manager', region: 'Asia-Pacific Region', icon: '🏢', quote: 'What attracted us most was the no-commission model. A flat subscription fee is far more predictable than commission-based platforms — we know exactly what we are paying every month.' },
  { role: 'Shipchandler', region: 'Northern Europe Region', icon: '⚓', quote: 'We serve multiple ports but only local operators knew us before. PortServiceFinder put us on the global map — we now receive quote requests from vessels under flags we had never worked with.' },
  { role: 'Marine Service Provider', region: 'Middle East Region', icon: '🔧', quote: 'After listing, we started receiving inquiries from vessels at ports where we were previously invisible. The platform paid for itself within the first month of active listing.' },
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
  const [mobileMenu, setMobileMenu] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // LIST BUSINESS FLOW STATE
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // FORM DATA
  const [fProviderType, setFProviderType] = useState('');
  const [fCompanyName, setFCompanyName] = useState('');
  const [fBio, setFBio] = useState('');
  const [fCountry, setFCountry] = useState('');
  const [fPorts, setFPorts] = useState<string[]>([]);
  const [fSvc, setFSvc] = useState<Set<string>>(new Set());
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fWhatsapp, setFWhatsapp] = useState('');
  const [fWebsite, setFWebsite] = useState('');
  const [fAddress, setFAddress] = useState('');
  const [fContactPerson, setFContactPerson] = useState('');
  const [fFormError, setFFormError] = useState('');

  const countries = Object.keys(PORT_DATA).sort();
  const ports = country ? PORT_DATA[country] || [] : [];
  const fAvailablePorts = fCountry ? PORT_DATA[fCountry] || [] : [];
  const g = {color:'#c8a84b'} as React.CSSProperties;
  const rj = "'Rajdhani',sans-serif";
  const lb = "'Libre Baskerville',serif";
  const TL = (k: string) => k === 'agent' ? 'Ship Agent' : k === 'chandler' ? 'Shipchandler' : 'Marine Service';

  function doSearch(c: string, p: string, s: string, m: Set<string>) {
    if (!c || !p) { setDone(false); return; }
    const res = runSearch(c, p, s, m);
    setResults(res.r); setFb(res.fb); setDone(true);
  }

  function toggleMs(key: string) {
    const n = new Set(ms);
    if (n.has(key)) n.delete(key); else n.add(key);
    setMs(n); doSearch(country, port, svcType, n);
  }

  function openListBusiness() {
    setShowFormModal(true);
    setMobileMenu(false);
    setFFormError('');
  }

  function resetForm() {
    setFProviderType('');
    setFCompanyName('');
    setFBio('');
    setFCountry('');
    setFPorts([]);
    setFSvc(new Set());
    setFEmail('');
    setFPhone('');
    setFWhatsapp('');
    setFWebsite('');
    setFAddress('');
    setFContactPerson('');
    setFFormError('');
    setCheckoutError('');
  }

  function closeAllModals() {
    setShowFormModal(false);
    setShowPlanModal(false);
    setCheckoutLoading(false);
  }

  function togglePortInForm(p: string) {
    setFPorts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function toggleSvcInForm(key: string) {
    const n = new Set(fSvc);
    if (n.has(key)) n.delete(key); else n.add(key);
    setFSvc(n);
  }

  function validateForm(): string {
    if (!fProviderType) return 'Please select a provider type.';
    if (!fCompanyName.trim()) return 'Company name is required.';
    if (fCompanyName.trim().length < 3) return 'Company name is too short.';
    if (!fCountry) return 'Please select a country.';
    if (fPorts.length === 0) return 'Please select at least one port.';
    if (!fEmail.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.trim())) return 'Please enter a valid email address.';
    if (!fPhone.trim()) return 'Phone number is required.';
    if (!fContactPerson.trim()) return 'Contact person name is required.';
    if (!fBio.trim()) return 'Company description is required.';
    if (fBio.trim().length < 30) return 'Company description should be at least 30 characters.';
    if (fProviderType === 'service' && fSvc.size === 0) return 'Please select at least one service category.';
    return '';
  }

  function handleFormSubmit() {
    const err = validateForm();
    if (err) {
      setFFormError(err);
      return;
    }
    setFFormError('');
    setShowFormModal(false);
    setShowPlanModal(true);
  }

  async function handleCheckout(plan: 'monthly' | 'annual') {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const payload = {
        provider_type: fProviderType,
        company_name: fCompanyName.trim(),
        bio: fBio.trim(),
        country: fCountry,
        ports: fPorts,
        email: fEmail.trim(),
        phone: fPhone.trim(),
        whatsapp: fWhatsapp.trim(),
        website: fWebsite.trim(),
        address: fAddress.trim(),
        contact_person: fContactPerson.trim(),
        svc: Array.from(fSvc),
        plan,
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || 'Failed to create checkout. Please try again.');
      }

      // Redirect to Polar checkout
      window.location.href = data.checkout_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setCheckoutError(msg);
      setCheckoutLoading(false);
    }
  }

  async function submitNewsletter() {
    setNewsletterError('');
    const email = newsletterEmail.trim();
    if (!email) return setNewsletterError('Please enter your email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setNewsletterError('Please enter a valid email address.');

    setNewsletterSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/xqejbadb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'Newsletter Signup (Footer)',
          _subject: `Newsletter Signup: ${email}`,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.errors?.[0]?.message || `Subscription failed (status ${response.status}). Please try again.`;
        setNewsletterError(msg);
        setNewsletterSubmitting(false);
        return;
      }
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    } catch {
      setNewsletterError('Network error. Please check your connection and try again.');
    } finally {
      setNewsletterSubmitting(false);
    }
  }

  const S = {
    sel: {background:'rgba(8,16,10,.9)',border:'1px solid rgba(200,168,75,.3)',color:'#f5f0e8',padding:'15px 16px',fontSize:16,width:'100%',outline:'none',transition:'border-color .25s'} as React.CSSProperties,
    lbl: {display:'block',fontFamily:rj,fontSize:13,fontWeight:700,letterSpacing:'1.8px',textTransform:'uppercase' as const,color:'#c8a84b',marginBottom:7},
    inp: {background:'rgba(8,16,10,.9)',border:'1px solid rgba(200,168,75,.3)',color:'#f5f0e8',padding:'12px 14px',fontSize:14,width:'100%',outline:'none',fontFamily:"'Outfit',sans-serif"} as React.CSSProperties,
    flbl: {display:'block',fontFamily:rj,fontSize:11,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase' as const,color:'#c8a84b',marginBottom:6} as React.CSSProperties,
  };

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}html{scroll-behavior:smooth;}
        body{background:#08100a;overflow-x:hidden;}
        select option{background:#111c13;color:#f5f0e8;}
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scrollBanner{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes waveMove{0%{background-position:0 0}100%{background-position:1200px 0}}
        @keyframes radarSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes centerPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,168,75,.5),0 0 20px rgba(200,168,75,.4);transform:scale(1)}50%{box-shadow:0 0 0 15px rgba(200,168,75,0),0 0 30px rgba(200,168,75,.7);transform:scale(1.08)}}
        @keyframes dotBlink{
          0%,93%{background:rgba(200,168,75,.4);box-shadow:none;transform:translate(-50%,-50%) scale(1);}
          94%,98%{background:#ffd76a;box-shadow:0 0 14px #c8a84b,0 0 24px rgba(200,168,75,.6);transform:translate(-50%,-50%) scale(1.7);}
          100%{background:rgba(200,168,75,.4);transform:translate(-50%,-50%) scale(1);}
        }
        @keyframes labelShow{
          0%,93%{opacity:0;transform:translateY(0);}
          94%,98%{opacity:1;transform:translateY(-4px);}
          100%{opacity:0;transform:translateY(0);}
        }
        @keyframes modalSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spinner{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .a1{opacity:0;animation:fu .7s .1s forwards;}
        .a2{opacity:0;animation:fu .7s .25s forwards;}
        .a3{opacity:0;animation:fu .7s .4s forwards;}
        .a4{opacity:0;animation:fu .7s .55s forwards;}
        .nlnk:hover{color:#c8a84b!important;}
        .footer-link:hover{color:#c8a84b!important;}
        .btn-gold{transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,168,75,.35);filter:brightness(1.08);}
        .btn-gold:disabled{cursor:wait;transform:none;box-shadow:none;filter:none;opacity:.7;}
        .btn-ghost{transition:background .25s ease, color .25s ease, border-color .25s ease;}
        .btn-ghost:hover{background:rgba(200,168,75,.12);border-color:#c8a84b!important;}
        .rrow{transition:border-color .3s ease, transform .25s ease, box-shadow .25s ease;}
        .rrow:hover{border-color:#c8a84b!important;cursor:pointer;transform:translateX(4px);box-shadow:-4px 0 0 #c8a84b;}
        .tier{transition:transform .35s ease, box-shadow .35s ease, background .35s ease;}
        .tier:hover{transform:translateY(-6px);box-shadow:0 14px 38px rgba(0,0,0,.45);background:#162019!important;}
        .step{transition:transform .35s ease, background .35s ease;}
        .step:hover{transform:translateY(-4px);background:#162019!important;}
        .blog-card{transition:transform .3s ease, border-color .3s ease, box-shadow .3s ease;}
        .blog-card:hover{transform:translateY(-4px);border-color:#c8a84b!important;box-shadow:0 12px 32px rgba(0,0,0,.4);cursor:pointer;}
        .testi-card{transition:transform .35s ease, border-color .35s ease, box-shadow .35s ease;position:relative;}
        .testi-card:hover{transform:translateY(-4px);border-color:rgba(200,168,75,.55)!important;box-shadow:0 10px 30px rgba(0,0,0,.4);}
        .sel-focus:focus{border-color:#c8a84b!important;}
        .card-input:focus{border-color:#c8a84b!important;outline:none;}
        .logo-mark{filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}
        .mobile-menu-btn{display:none;}
        .modal-content{animation:modalSlide .35s ease forwards;}
        .spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(8,16,10,.3);border-top-color:#08100a;border-radius:50%;animation:spinner .8s linear infinite;}
        .ptype-card{cursor:pointer;transition:all .25s ease;}
        .ptype-card:hover{border-color:#c8a84b!important;transform:translateY(-3px);}
        .wave-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.06;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='120' viewBox='0 0 1200 120'><path d='M0 60 Q 150 20 300 60 T 600 60 T 900 60 T 1200 60' stroke='%23c8a84b' stroke-width='1.2' fill='none'/><path d='M0 90 Q 150 50 300 90 T 600 90 T 900 90 T 1200 90' stroke='%23c8a84b' stroke-width='0.8' fill='none' opacity='0.6'/></svg>");background-repeat:repeat;animation:waveMove 40s linear infinite;}
        .hero-bg{position:absolute;inset:0;z-index:0;background:linear-gradient(180deg, rgba(8,16,10,.78) 0%, rgba(8,16,10,.82) 50%, rgba(8,16,10,.96) 100%),url('/hero-bg.jpg');background-size:cover;background-position:center 35%;background-repeat:no-repeat;}
        .hero-content{position:relative;z-index:2;}
        .radar-wrap{filter:drop-shadow(0 4px 18px rgba(200,168,75,.15));}
        .radar-center{width:54px;height:54px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(200,168,75,.5),rgba(200,168,75,.08));border:1px solid rgba(200,168,75,.55);display:flex;align-items:center;justify-content:center;font-size:22px;animation:centerPulse 2.4s ease-in-out infinite;}
        .radar-dot{position:absolute;width:9px;height:9px;border-radius:50%;background:rgba(200,168,75,.4);transform:translate(-50%,-50%);animation:dotBlink 14s linear infinite;z-index:3;}
        .radar-label{position:absolute;left:14px;top:-2px;font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;letter-spacing:1.2px;color:#ffd76a;white-space:nowrap;opacity:0;animation:labelShow 14s linear infinite;text-shadow:0 0 8px rgba(200,168,75,.5);pointer-events:none;}
        .dot-r1-tl{top:38%;left:38%;animation-delay:-0.75s;}
        .dot-r1-tl .radar-label{animation-delay:-0.75s;}
        .dot-r1-br{top:62%;left:62%;animation-delay:-3.75s;}
        .dot-r1-br .radar-label{animation-delay:-3.75s;}
        .dot-r2-tr{top:32%;left:68%;animation-delay:-1.75s;}
        .dot-r2-tr .radar-label{animation-delay:-1.75s;}
        .dot-r2-bl{top:68%;left:32%;animation-delay:-4.75s;}
        .dot-r2-bl .radar-label{animation-delay:-4.75s;}
        .dot-r3-right{top:50%;left:88%;animation-delay:-1.25s;}
        .dot-r3-right .radar-label{animation-delay:-1.25s;}
        .dot-r3-left{top:50%;left:12%;animation-delay:-4.25s;}
        .dot-r3-left .radar-label{animation-delay:-4.25s;}
        .dot-r4-top{top:6%;left:50%;animation-delay:0s;}
        .dot-r4-top .radar-label{animation-delay:0s;}
        .dot-r4-bottom{top:94%;left:50%;animation-delay:-3s;}
        .dot-r4-bottom .radar-label{animation-delay:-3s;}
        @media(max-width:900px){
          .nav-links-desktop{display:none!important;}
          .mobile-menu-btn{display:flex!important;}
          .nav-cta-desktop{display:none!important;}
        }
        @media(max-width:768px){
          nav{padding:0 16px!important;}
          .logo-text{font-size:16px!important;}
          .logo-mark{width:26px!important;height:26px!important;}
          .hero-sec{padding:80px 16px 40px!important;gap:20px!important;}
          .hero-h1{font-size:clamp(26px,7vw,42px)!important;letter-spacing:-1px!important;}
          .hero-bg{background-position:center 30%!important;background-size:cover!important;}
          .hero-sec{min-height:auto!important;}
          .search-wrap{padding:18px 14px!important;max-width:100%!important;}
          .sgrid{grid-template-columns:1fr!important;}
          .vis-sec{padding:36px 16px!important;}
          .stats4{grid-template-columns:repeat(2,1fr)!important;}
          .sec-pad{padding:50px 16px!important;}
          .steps3{grid-template-columns:1fr!important;}
          .blogs-grid{grid-template-columns:1fr!important;}
          .testi-grid{grid-template-columns:1fr!important;}
          .tiers2{grid-template-columns:1fr!important;}
          .ftgrid{grid-template-columns:1fr!important;}
          .ftpad{padding:36px 16px 0!important;}
          .newsletter-wrap{grid-template-columns:1fr!important;padding:20px 18px!important;gap:18px!important;}
          .news-input-row{flex-direction:column!important;}
          .ctapad{padding:50px 16px!important;}
          .dc2{grid-template-columns:1fr!important;}
          .ptype-grid{grid-template-columns:1fr!important;}
          .form-grid-2{grid-template-columns:1fr!important;}
          .radar-wrap{width:220px!important;height:220px!important;}
          .radar-label{font-size:9px!important;}
          .hero-stats{gap:10px!important;}
          .blog-hero-title{font-size:22px!important;}
        }
        @media(min-width:769px) and (max-width:1024px){
          .blogs-grid{grid-template-columns:repeat(2,1fr)!important;}
          .testi-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>

      <div className="wave-bg"></div>
      <div style={{background:'#08100a',color:'#f5f0e8',fontFamily:"'Outfit',sans-serif",fontWeight:300,minHeight:'100vh',position:'relative',zIndex:1}}>

        {/* NAV */}
        <nav style={{position:'fixed',top:0,width:'100%',zIndex:300,height:62,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(8,16,10,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'#f5f0e8',flexShrink:0}}>
            <svg className="logo-mark" width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="36" fill="none" stroke="#c8a84b" strokeWidth="0.6" opacity="0.5"/>
              <polygon points="50,15 56,50 50,50" fill="#f5f0e8"/>
              <polygon points="50,15 44,50 50,50" fill="#c8a84b"/>
              <polygon points="50,85 56,50 50,50" fill="#c8a84b"/>
              <polygon points="50,85 44,50 50,50" fill="#f5f0e8"/>
              <polygon points="85,50 50,44 50,50" fill="#c8a84b"/>
              <polygon points="85,50 50,56 50,50" fill="#f5f0e8"/>
              <polygon points="15,50 50,44 50,50" fill="#f5f0e8"/>
              <polygon points="15,50 50,56 50,50" fill="#c8a84b"/>
              <circle cx="50" cy="50" r="3.5" fill="#c8a84b"/>
            </svg>
            <span className="logo-text" style={{fontFamily:lb,fontSize:20,fontWeight:700,letterSpacing:1}}>PortService<span style={g}>Finder</span></span>
          </Link>
          <div className="nav-links-desktop" style={{display:'flex',alignItems:'center',gap:18}}>
            <span className="nlnk" style={{color:'#7a8a72',fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600}} onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>How It Works</span>
            <Link href="/blog" className="nlnk" style={{color:'#7a8a72',fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600,textDecoration:'none'}}>Guides</Link>
            <Link href="/faq" className="nlnk" style={{color:'#7a8a72',fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600,textDecoration:'none'}}>FAQ</Link>
            <Link href="/about" className="nlnk" style={{color:'#7a8a72',fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600,textDecoration:'none'}}>About</Link>
            <span className="nlnk" style={{color:'#7a8a72',fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600}} onClick={()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
            <button onClick={openListBusiness} className="btn-gold nav-cta-desktop" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'7px 14px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>List Business</button>
          </div>
          <button className="mobile-menu-btn btn-gold" style={{display:'none',background:'#c8a84b',color:'#08100a',border:'none',padding:'7px 12px',fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',alignItems:'center',gap:6}} onClick={()=>setMobileMenu(!mobileMenu)}>
            ☰ Menu
          </button>
        </nav>

        {/* MOBILE MENU OVERLAY */}
        {mobileMenu&&(
          <div style={{position:'fixed',top:62,left:0,right:0,background:'rgba(8,16,10,.98)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,168,75,.2)',zIndex:299,padding:'20px 16px',display:'flex',flexDirection:'column',gap:12}}>
            <span style={{color:'#f5f0e8',fontSize:14,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600,padding:'10px 0',borderBottom:'1px solid rgba(200,168,75,.1)'}} onClick={()=>{document.getElementById('how')?.scrollIntoView({behavior:'smooth'});setMobileMenu(false);}}>How It Works</span>
            <Link href="/blog" style={{color:'#f5f0e8',fontSize:14,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:rj,fontWeight:600,padding:'10px 0',borderBottom:'1px solid rgba(200,168,75,.1)',textDecoration:'none'}}>Guides & Blog</Link>
            <Link href="/faq" style={{color:'#f5f0e8',fontSize:14,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:rj,fontWeight:600,padding:'10px 0',borderBottom:'1px solid rgba(200,168,75,.1)',textDecoration:'none'}}>FAQ</Link>
            <Link href="/about" style={{color:'#f5f0e8',fontSize:14,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:rj,fontWeight:600,padding:'10px 0',borderBottom:'1px solid rgba(200,168,75,.1)',textDecoration:'none'}}>About</Link>
            <span style={{color:'#f5f0e8',fontSize:14,letterSpacing:'1.5px',textTransform:'uppercase',cursor:'pointer',fontFamily:rj,fontWeight:600,padding:'10px 0',borderBottom:'1px solid rgba(200,168,75,.1)'}} onClick={()=>{document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'});setMobileMenu(false);}}>Pricing</span>
            <Link href="/for-providers" style={{color:'#f5f0e8',fontSize:14,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:rj,fontWeight:600,padding:'10px 0',borderBottom:'1px solid rgba(200,168,75,.1)',textDecoration:'none'}}>For Providers</Link>
            <Link href="/contact" style={{color:'#f5f0e8',fontSize:14,letterSpacing:'1.5px',textTransform:'uppercase',fontFamily:rj,fontWeight:600,padding:'10px 0',borderBottom:'1px solid rgba(200,168,75,.1)',textDecoration:'none'}}>Contact</Link>
            <button onClick={openListBusiness} className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'12px',fontFamily:rj,fontSize:13,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',textAlign:'center'}}>List Your Business</button>
          </div>
        )}

        {/* HERO */}
        <section className="hero-sec" style={{position:'relative',minHeight:'100vh',paddingTop:100,paddingBottom:60,paddingLeft:48,paddingRight:48,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:28,overflow:'hidden'}}>
          <div className="hero-bg"></div>
          <div className="hero-content" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:28,width:'100%'}}>
            <div className="a1" style={{fontFamily:rj,fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#c8a84b',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
              <span style={{width:32,height:1,background:'#c8a84b',display:'inline-block',opacity:.5}}/>
              Global Maritime Services Directory
              <span style={{width:32,height:1,background:'#c8a84b',display:'inline-block',opacity:.5}}/>
            </div>
            <h1 className="a2 hero-h1" style={{fontFamily:lb,fontSize:'clamp(32px,4vw,58px)',fontWeight:700,lineHeight:1.05,letterSpacing:-1.5,maxWidth:820,textShadow:'0 2px 14px rgba(0,0,0,.6)'}}>
              Every Port. Every <em style={g}>Service.</em><br/>One Platform.
            </h1>
            <p className="a3" style={{fontSize:15,lineHeight:1.8,color:'#d4dcc8',maxWidth:460,textShadow:'0 1px 6px rgba(0,0,0,.6)'}}>
              Find verified ship agents, shipchandlers and marine service companies at any port worldwide. Free to search.
            </p>
            <div className="a3 hero-stats" style={{display:'flex',gap:18,flexWrap:'wrap',justifyContent:'center'}}>
              {[['150+','Countries'],['1,200+','Ports'],['34','Categories']].map(([n,l])=>(
                <span key={l} style={{fontFamily:rj,fontSize:12,color:'#b5bfa8',fontWeight:600}}><strong style={g}>{n}</strong> {l}</span>
              ))}
            </div>

            <div className="a4 search-wrap" style={{width:'100%',maxWidth:1080,background:'rgba(10,20,14,.92)',border:'1px solid rgba(200,168,75,.35)',backdropFilter:'blur(22px)',padding:'34px 38px',marginTop:4,boxShadow:'0 18px 48px rgba(0,0,0,.45)'}}>
              <div className="sgrid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:14,alignItems:'flex-end'}}>
                <div>
                  <label style={S.lbl}>Country</label>
                  <select className="sel-focus" style={S.sel} value={country} onChange={e=>{setCountry(e.target.value);setPort('');setDone(false);}}>
                    <option value="">Select country...</option>
                    {countries.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.lbl}>Port</label>
                  <select className="sel-focus" style={S.sel} value={port} onChange={e=>{setPort(e.target.value);doSearch(country,e.target.value,svcType,ms);}} disabled={!country}>
                    <option value="">Select port...</option>
                    {ports.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.lbl}>Service Type</label>
                  <select className="sel-focus" style={S.sel} value={svcType} onChange={e=>{setSvcType(e.target.value);setMs(new Set());doSearch(country,port,e.target.value,new Set());}}>
                    <option value="all">All Services</option>
                    <option value="agent">Ship Agent</option>
                    <option value="chandler">Shipchandler</option>
                    <option value="service">Marine Services</option>
                  </select>
                </div>
                <button className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'14px 30px',fontFamily:rj,fontSize:15,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',height:52,whiteSpace:'nowrap'}} onClick={()=>doSearch(country,port,svcType,ms)}>Search</button>
              </div>
              {svcType==='service'&&(
                <div style={{marginTop:14,padding:'14px 16px',background:'rgba(200,168,75,.04)',border:'1px solid rgba(200,168,75,.15)'}}>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:9,fontWeight:700}}>Specific marine services (optional)</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:5}}>
                    {MARINE_SERVICES.map(s=>(<div key={s.key} onClick={()=>toggleMs(s.key)} style={{padding:'6px 10px',border:`1px solid ${ms.has(s.key)?'#c8a84b':'rgba(200,168,75,.18)'}`,background:ms.has(s.key)?'#c8a84b':'transparent',color:ms.has(s.key)?'#08100a':'#b0c0a4',fontFamily:rj,fontSize:11,fontWeight:600,cursor:'pointer',userSelect:'none',transition:'all .2s ease'}}>{s.label}</div>))}
                  </div>
                </div>
              )}
              {done&&(
                <div style={{borderTop:'1px solid rgba(200,168,75,.15)',paddingTop:16,marginTop:16}}>
                  <div style={{fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:11,fontWeight:700}}>
                    {fb?`Other providers in ${country}`:`${results.length} provider${results.length!==1?'s':''} found at ${port}`}
                  </div>
                  {fb&&results.length>0&&(<div style={{padding:'10px 13px',background:'rgba(200,168,75,.06)',border:'1px solid rgba(200,168,75,.18)',fontSize:12,color:'#e2c06a',marginBottom:9,fontFamily:rj,lineHeight:1.5}}>No providers at <strong>{port}</strong> yet — showing others in <strong>{country}</strong>.</div>)}
                  {results.length===0&&(<div style={{padding:20,textAlign:'center',fontFamily:rj,fontSize:12,color:'#7a8a72'}}><strong style={{color:'#c8a84b',display:'block',marginBottom:4}}>No providers found.</strong><button onClick={openListBusiness} style={{color:'#c8a84b',cursor:'pointer',background:'none',border:'none',fontFamily:rj,fontSize:12,fontWeight:600}}>Register your business →</button></div>)}
                  {results.map(p=>(
                    <div key={p.id} className="rrow" onClick={()=>setDetail(p)} style={{background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.2)',padding:'14px 18px',marginBottom:6,display:'grid',gridTemplateColumns:'44px 1fr auto',gap:14,alignItems:'center'}}>
                      <div style={{width:44,height:44,background:'rgba(200,168,75,.1)',border:'1px solid rgba(200,168,75,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{p.ico}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,marginBottom:2,display:'flex',alignItems:'center',gap:8}}>
                          <span>{p.name}</span>
                          <span style={{fontSize:16,lineHeight:1}}>{FLAG[p.country]||''}</span>
                        </div>
                        <div style={{fontSize:11,color:'#b0c0a4',lineHeight:1.4}}>{p.bio.length>100?p.bio.slice(0,100)+'...':p.bio}</div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontFamily:rj,fontSize:9,letterSpacing:'1px',textTransform:'uppercase',color:'#7a8a72',marginBottom:5,fontWeight:600}}>{TL(p.type)}</div>
                        <button className="btn-gold" onClick={e=>{e.stopPropagation();setDetail(p);}} style={{background:'#c8a84b',border:'none',color:'#08100a',padding:'6px 12px',fontFamily:rj,fontSize:10,letterSpacing:'1px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>View Contact</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BLOG SECTION */}
        <section className="sec-pad" style={{padding:'80px 48px',background:'#08100a',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <div style={{textAlign:'center',marginBottom:42,maxWidth:680,margin:'0 auto 42px'}}>
            <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>📚 Knowledge Hub</div>
            <h2 className="blog-hero-title" style={{fontFamily:lb,fontSize:'clamp(24px,3vw,38px)',fontWeight:700,lineHeight:1.05,marginBottom:14}}>Complete <em style={g}>Port Guides</em> for Major Hubs</h2>
            <p style={{fontSize:13,color:'#b0c0a4',lineHeight:1.7}}>Comprehensive operational guides for vessel operators, ship agents and maritime professionals. Written by industry experts.</p>
          </div>

          <div className="blogs-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,maxWidth:1180,margin:'0 auto'}}>
            {FEATURED_BLOGS.map(post=>(
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card" style={{background:'#111c13',padding:'22px 22px',border:'1px solid rgba(200,168,75,.18)',textDecoration:'none',color:'inherit',display:'flex',flexDirection:'column'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                  <span style={{fontSize:30,lineHeight:1}}>{post.flag}</span>
                  <span style={{fontFamily:rj,fontSize:10,letterSpacing:'1.5px',color:'#7a8a72',fontWeight:600,background:'rgba(200,168,75,.06)',padding:'3px 9px',border:'1px solid rgba(200,168,75,.15)'}}>⏱️ {post.time}</span>
                </div>
                <h3 style={{fontFamily:lb,fontSize:17,fontWeight:700,lineHeight:1.3,marginBottom:10}}>{post.title}</h3>
                <p style={{fontSize:12.5,lineHeight:1.65,color:'#b0c0a4',marginBottom:14,flex:1}}>{post.excerpt}</p>
                <div style={{fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700,paddingTop:10,borderTop:'1px solid rgba(200,168,75,.1)'}}>Read Guide →</div>
              </Link>
            ))}
          </div>

          <div style={{textAlign:'center',marginTop:30}}>
            <Link href="/blog" className="btn-ghost" style={{display:'inline-block',background:'transparent',color:'#c8a84b',border:'1px solid rgba(200,168,75,.4)',padding:'13px 32px',fontFamily:rj,fontSize:12,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,textDecoration:'none'}}>View All Guides →</Link>
          </div>
        </section>

        {/* RADAR VISUALIZATION */}
        <section className="vis-sec" style={{background:'#08100a',padding:'52px 48px',textAlign:'center',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:40}}>
            <div className="radar-wrap" style={{position:'relative',width:300,height:300}}>
              <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(200,168,75,.25)'}}/>
              <div style={{position:'absolute',inset:'12.5%',borderRadius:'50%',border:'1px solid rgba(200,168,75,.2)'}}/>
              <div style={{position:'absolute',inset:'25%',borderRadius:'50%',border:'1px solid rgba(200,168,75,.18)'}}/>
              <div style={{position:'absolute',inset:'37.5%',borderRadius:'50%',border:'1px solid rgba(200,168,75,.15)'}}/>
              <div style={{position:'absolute',top:'50%',left:0,right:0,height:1,background:'rgba(200,168,75,.1)'}}/>
              <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'rgba(200,168,75,.1)'}}/>
              <div className="radar-sweep" style={{position:'absolute',inset:0,borderRadius:'50%',background:'conic-gradient(from 0deg, rgba(200,168,75,.45) 0deg, rgba(200,168,75,.15) 30deg, transparent 60deg, transparent 360deg)',animation:'radarSpin 14s linear infinite'}}/>
              <div className="radar-dot dot-r4-top"><span className="radar-label">Rotterdam</span></div>
              <div className="radar-dot dot-r4-bottom"><span className="radar-label">Santos</span></div>
              <div className="radar-dot dot-r3-right"><span className="radar-label">Hong Kong</span></div>
              <div className="radar-dot dot-r3-left"><span className="radar-label">Houston</span></div>
              <div className="radar-dot dot-r2-tr"><span className="radar-label">Shanghai</span></div>
              <div className="radar-dot dot-r2-bl"><span className="radar-label">Hamburg</span></div>
              <div className="radar-dot dot-r1-tl"><span className="radar-label">Singapore</span></div>
              <div className="radar-dot dot-r1-br"><span className="radar-label">Dubai</span></div>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:5}}>
                <div className="radar-center">⚓</div>
              </div>
            </div>
          </div>
          <div style={{overflow:'hidden',borderTop:'1px solid rgba(200,168,75,.1)',borderBottom:'1px solid rgba(200,168,75,.1)',padding:'8px 0',marginBottom:32}}>
            <div style={{display:'flex',gap:32,animation:'scrollBanner 28s linear infinite',whiteSpace:'nowrap'}}>
              {['Rotterdam','Singapore','Dubai','Shanghai','Suez','Houston','Piraeus','Santos','Hamburg','Mumbai','Busan','Yokohama','Durban','Sydney','Panama','Antwerp','Rotterdam','Singapore','Dubai','Shanghai','Suez','Houston','Piraeus','Santos','Hamburg','Mumbai','Busan','Yokohama'].map((item,i)=>(
                <span key={i} style={{fontFamily:rj,fontSize:10,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:i%4===0?'#c8a84b':'#2a3a22',flexShrink:0}}>{item}</span>
              ))}
            </div>
          </div>
          <div className="stats4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'rgba(200,168,75,.1)',maxWidth:800,margin:'0 auto'}}>
            {[['150+','Countries','worldwide coverage'],['1,200+','Ports','in database'],['34','Service Categories','available'],['$0','Search Fee','always free']].map(([v,l,s])=>(
              <div key={l} style={{background:'#0c1610',padding:'18px 12px',textAlign:'center'}}>
                <div style={{fontFamily:lb,fontSize:26,fontWeight:700,color:'#c8a84b',lineHeight:1,marginBottom:4}}>{v}</div>
                <div style={{fontFamily:rj,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',color:'#f5f0e8',marginBottom:2}}>{l}</div>
                <div style={{fontFamily:rj,fontSize:9,color:'#7a8a72'}}>{s}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="sec-pad" style={{padding:'80px 48px',background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Platform</div>
          <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,38px)',fontWeight:700,lineHeight:1.05,marginBottom:40}}>How <em style={g}>PortServiceFinder</em> Works</h2>
          <div className="steps3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'rgba(200,168,75,.1)'}}>
            {[{n:'01',ico:'🌍',t:'Select Country & Port',d:'Choose your destination from our global list. Completely free.'},{n:'02',ico:'🔍',t:'Filter by Service Type',d:'Select Ship Agent, Shipchandler or Marine Services.'},{n:'03',ico:'📡',t:'Smart Fallback',d:'No provider at your port? We show others in the same country.'}].map(s=>(
              <div key={s.n} className="step" style={{background:'#111c13',padding:'34px 28px',position:'relative',overflow:'hidden'}}>
                <div style={{fontFamily:lb,fontSize:60,fontWeight:700,color:'rgba(200,168,75,.05)',position:'absolute',top:6,right:10,lineHeight:1}}>{s.n}</div>
                <div style={{fontSize:24,marginBottom:12}}>{s.ico}</div>
                <h3 style={{fontFamily:lb,fontSize:18,fontWeight:700,marginBottom:9}}>{s.t}</h3>
                <p style={{fontSize:13,lineHeight:1.75,color:'#b0c0a4'}}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* INDUSTRY VOICES — TESTIMONIALS */}
        <section className="sec-pad" style={{padding:'80px 48px',background:'#08100a',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <div style={{textAlign:'center',maxWidth:720,margin:'0 auto 44px'}}>
            <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>💬 Industry Feedback</div>
            <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,38px)',fontWeight:700,lineHeight:1.05,marginBottom:14}}>Industry <em style={g}>Voices</em></h2>
            <p style={{fontSize:13,color:'#b0c0a4',lineHeight:1.7}}>What maritime professionals say about a centralized port services directory — feedback gathered during our pre-launch consultation with operators, ship agents, and service providers.</p>
          </div>

          <div className="testi-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,maxWidth:1180,margin:'0 auto'}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="testi-card" style={{background:'#111c13',padding:'24px 24px',border:'1px solid rgba(200,168,75,.18)',display:'flex',flexDirection:'column',position:'relative'}}>
                <div style={{position:'absolute',top:14,right:18,fontFamily:lb,fontSize:42,color:'rgba(200,168,75,.15)',lineHeight:1,fontWeight:700}}>&ldquo;</div>
                <div style={{fontSize:22,marginBottom:14}}>{t.icon}</div>
                <div style={{color:'#c8a84b',fontSize:12,letterSpacing:1,marginBottom:14}}>★★★★★</div>
                <p style={{fontSize:13.5,lineHeight:1.7,color:'#d4dcc8',marginBottom:18,flex:1,fontStyle:'italic'}}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{paddingTop:14,borderTop:'1px solid rgba(200,168,75,.12)'}}>
                  <div style={{fontFamily:rj,fontSize:12,fontWeight:700,color:'#f5f0e8',marginBottom:3,letterSpacing:'.5px'}}>{t.role}</div>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#c8a84b',fontWeight:600}}>{t.region}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{textAlign:'center',marginTop:34,fontFamily:rj,fontSize:10,color:'#5a6a52',letterSpacing:'.5px',maxWidth:680,margin:'34px auto 0',lineHeight:1.6}}>
            Composite quotes representing common feedback themes from maritime professionals during our pre-launch consultation phase. Individual identifying details have been omitted for confidentiality.
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="sec-pad" style={{padding:'80px 48px'}}>
          <div style={{fontFamily:rj,fontSize:10,letterSpacing:'3px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Pricing</div>
          <h2 style={{fontFamily:lb,fontSize:'clamp(24px,3vw,38px)',fontWeight:700,lineHeight:1.05,marginBottom:40}}>Simple, <em style={g}>Transparent</em> Pricing</h2>
          <p style={{color:'#b0c0a4',maxWidth:440,margin:'-26px auto 32px',fontSize:13,lineHeight:1.7,textAlign:'center'}}>Affordable subscription. No commission. No hidden fees. Cancel anytime.</p>
          <div className="tiers2" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,maxWidth:680,margin:'0 auto'}}>
            {[{name:'Monthly',amt:'$49.90',per:'/ month',yr:'Billed monthly · Direct paid subscription',badge:null,items:['Listed at all your ports','Full company profile','Phone, email & WhatsApp','Verified provider badge','Active immediately after verification','Cancel anytime']},{name:'Annual',amt:'$500',per:'/ year',yr:'$41.67/month equivalent — save $98.80 (~16%)',badge:'Save $98.80',items:['Everything in Monthly','Priority placement in results','$98.80 saved vs monthly','Priority support','Best value','Active immediately after verification']}].map(tier=>(
              <div key={tier.name} className="tier" style={{background:tier.badge?'linear-gradient(180deg,rgba(200,168,75,.06),transparent)':'#111c13',border:`1px solid ${tier.badge?'#c8a84b':'rgba(200,168,75,.2)'}`,padding:'28px 24px',position:'relative',display:'flex',flexDirection:'column'}}>
                {tier.badge&&<div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'#c8a84b',color:'#08100a',fontFamily:rj,fontSize:10,letterSpacing:'2px',fontWeight:700,padding:'4px 12px'}}>{tier.badge}</div>}
                <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:10,fontWeight:700}}>{tier.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:5,marginBottom:4}}><span style={{fontFamily:lb,fontSize:38,fontWeight:700,lineHeight:1}}>{tier.amt}</span><span style={{fontFamily:rj,fontSize:12,color:'#7a8a72',fontWeight:600}}>{tier.per}</span></div>
                <div style={{fontSize:11,color:'#b0c0a4',marginBottom:18,fontFamily:rj}}>{tier.yr}</div>
                <ul style={{listStyle:'none',flex:1,marginBottom:18,display:'flex',flexDirection:'column',gap:7}}>
                  {tier.items.map(item=>(<li key={item} style={{fontSize:12,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:7,lineHeight:1.5}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>{item}</li>))}
                </ul>
                <button onClick={openListBusiness} className={tier.badge?'btn-gold':'btn-ghost'} style={{padding:11,background:tier.badge?'#c8a84b':'transparent',border:'1px solid rgba(200,168,75,.35)',color:tier.badge?'#08100a':'#c8a84b',fontFamily:rj,fontSize:11,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer',width:'100%'}}>Subscribe Now</button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ctapad" style={{padding:'72px 48px',textAlign:'center',background:'#0c1610',borderTop:'1px solid rgba(200,168,75,.1)'}}>
          <h2 style={{fontFamily:lb,fontSize:'clamp(26px,3.5vw,48px)',fontWeight:700,lineHeight:1.05,marginBottom:12}}>Be Found by Every Vessel <em style={g}>Worldwide</em></h2>
          <p style={{fontSize:14,color:'#b0c0a4',maxWidth:400,margin:'0 auto 28px',lineHeight:1.75}}>List on PortServiceFinder — <strong style={g}>$49.90/month or $500/year</strong>. Direct subscription, cancel anytime.</p>
          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={openListBusiness} className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'12px 28px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>Subscribe Now</button>
            <button className="btn-ghost" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{background:'transparent',color:'#f5f0e8',border:'1px solid rgba(200,168,75,.3)',padding:'11px 22px',fontFamily:rj,fontSize:13,letterSpacing:'2px',textTransform:'uppercase',fontWeight:600,cursor:'pointer'}}>Search Free</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ftpad" style={{borderTop:'1px solid rgba(200,168,75,.15)',padding:'48px 48px 0'}}>

          {/* NEWSLETTER SIGNUP */}
          <div className="newsletter-wrap" style={{maxWidth:1180,margin:'0 auto 38px',padding:'26px 30px',background:'linear-gradient(180deg,rgba(200,168,75,.06),rgba(200,168,75,.02))',border:'1px solid rgba(200,168,75,.22)',display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:30,alignItems:'center'}}>
            <div>
              <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>📬 Newsletter</div>
              <h3 style={{fontFamily:lb,fontSize:20,fontWeight:700,marginBottom:6,lineHeight:1.3}}>Stay Updated on Maritime <em style={g}>Insights</em></h3>
              <p style={{fontSize:12.5,color:'#b0c0a4',lineHeight:1.65}}>New port guides, industry updates, and platform news. No spam, ever.</p>
            </div>
            <div>
              {newsletterSubmitted ? (
                <div style={{padding:'18px 20px',background:'rgba(76,175,118,.1)',border:'1px solid rgba(76,175,118,.4)',display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:24,color:'#4caf76',fontWeight:700,flexShrink:0}}>✓</span>
                  <div>
                    <div style={{fontFamily:rj,fontSize:13,fontWeight:700,color:'#f5f0e8',marginBottom:3}}>You&apos;re subscribed!</div>
                    <div style={{fontSize:11.5,color:'#b5bfa8',lineHeight:1.5}}>We&apos;ll send you maritime industry insights & port guides — no spam, ever.</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="news-input-row" style={{display:'flex',gap:8}}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={newsletterEmail}
                      onChange={e=>setNewsletterEmail(e.target.value)}
                      disabled={newsletterSubmitting}
                      onKeyDown={e=>{if(e.key==='Enter')submitNewsletter();}}
                      style={{flex:1,background:'rgba(8,16,10,.7)',border:'1px solid rgba(200,168,75,.3)',color:'#f5f0e8',padding:'10px 14px',fontSize:13,fontFamily:"'Outfit',sans-serif",outline:'none'}}
                    />
                    <button
                      className="btn-gold"
                      onClick={submitNewsletter}
                      disabled={newsletterSubmitting}
                      style={{background:newsletterSubmitting?'#7a6730':'#c8a84b',color:'#08100a',border:'none',padding:'10px 22px',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:newsletterSubmitting?'wait':'pointer',whiteSpace:'nowrap',opacity:newsletterSubmitting?0.7:1}}
                    >
                      {newsletterSubmitting?'...':'Subscribe'}
                    </button>
                  </div>
                  {newsletterError && (
                    <div style={{fontFamily:rj,fontSize:11,color:'#ff8a8a',marginTop:6,fontWeight:600}}>⚠ {newsletterError}</div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="ftgrid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:34,marginBottom:32}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#c8a84b" strokeWidth="2.5"/>
                  <polygon points="50,15 56,50 50,50" fill="#f5f0e8"/>
                  <polygon points="50,15 44,50 50,50" fill="#c8a84b"/>
                  <polygon points="50,85 56,50 50,50" fill="#c8a84b"/>
                  <polygon points="50,85 44,50 50,50" fill="#f5f0e8"/>
                  <polygon points="85,50 50,44 50,50" fill="#c8a84b"/>
                  <polygon points="85,50 50,56 50,50" fill="#f5f0e8"/>
                  <polygon points="15,50 50,44 50,50" fill="#f5f0e8"/>
                  <polygon points="15,50 50,56 50,50" fill="#c8a84b"/>
                  <circle cx="50" cy="50" r="3.5" fill="#c8a84b"/>
                </svg>
                <div style={{fontFamily:lb,fontSize:18,fontWeight:700,letterSpacing:1}}>PortService<span style={g}>Finder</span></div>
              </div>
              <p style={{fontSize:12,color:'#7a8a72',lineHeight:1.75,maxWidth:240,marginBottom:14}}>The global maritime services directory. Free for vessel operators. No commission, ever.</p>
              <a href="mailto:contact@portservicefinder.com" className="footer-link" style={{fontSize:12,color:'rgba(200,168,75,.6)',textDecoration:'none'}}>contact@portservicefinder.com</a>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Directory</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Search Ports</Link></li>
                <li><Link href="/ports/singapore" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Singapore</Link></li>
                <li><Link href="/ports/rotterdam" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Rotterdam</Link></li>
                <li><Link href="/ports/suez" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Suez</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Resources</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/blog" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Blog & Guides</Link></li>
                <li><Link href="/for-providers" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>For Providers</Link></li>
                <li><Link href="/faq" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Company</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/about" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>About</Link></li>
                <li><Link href="/contact" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:12,fontWeight:700}}>Legal</h4>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                <li><Link href="/terms" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Terms of Service</Link></li>
                <li><Link href="/privacy" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Privacy Policy</Link></li>
                <li><Link href="/refund-policy" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Refund Policy</Link></li>
                <li><Link href="/listing-rules" className="footer-link" style={{color:'#7a8a72',textDecoration:'none',fontSize:12}}>Listing Rules</Link></li>
              </ul>
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(200,168,75,.1)',padding:'14px 0 20px',display:'flex',justifyContent:'space-between',fontFamily:rj,fontSize:10,color:'#3a3a2a',letterSpacing:1,fontWeight:600,flexWrap:'wrap',gap:8}}>
            <span>© 2026 PortServiceFinder. All rights reserved.</span>
            <span>MARITIME DIRECTORY · GLOBAL · FREE TO SEARCH</span>
          </div>
        </footer>

        {/* DETAIL MODAL */}
        {detail&&(
          <div style={{position:'fixed',inset:0,background:'rgba(8,16,10,.95)',backdropFilter:'blur(16px)',zIndex:550,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'36px 16px',overflowY:'auto'}} onClick={e=>{if(e.target===e.currentTarget)setDetail(null);}}>
            <div className="modal-content" style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.3)',width:'100%',maxWidth:660,margin:'auto'}}>
              <div style={{padding:'22px 28px 16px',borderBottom:'1px solid rgba(200,168,75,.15)',display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:50,height:50,background:'rgba(200,168,75,.1)',border:'1px solid rgba(200,168,75,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{detail.ico}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:lb,fontSize:20,fontWeight:700,marginBottom:3,display:'flex',alignItems:'center',gap:10}}>
                    <span>{detail.name}</span>
                    <span style={{fontSize:22,lineHeight:1}}>{FLAG[detail.country]||''}</span>
                  </div>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',fontWeight:700,marginBottom:5}}>{TL(detail.type)} · {detail.country}</div>
                  <span style={{fontFamily:rj,fontSize:9,color:'#4caf76',border:'1px solid rgba(76,175,118,.3)',padding:'2px 7px',letterSpacing:1,fontWeight:700}}>✓ VERIFIED</span>
                </div>
                <button onClick={()=>setDetail(null)} style={{background:'none',border:'none',color:'#7a8a72',fontSize:18,cursor:'pointer',flexShrink:0}}>✕</button>
              </div>
              <div style={{padding:'18px 28px 24px'}}>
                <p style={{fontSize:13,color:'#f5f0e8',lineHeight:1.7,marginBottom:16}}>{detail.bio}</p>
                <div className="dc2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                  {[{label:'Phone',value:detail.phone,href:`tel:${detail.phone.replace(/\s/g,'')}`},{label:'Email',value:detail.email,href:`mailto:${detail.email}`},{label:'WhatsApp',value:detail.wa,href:`https://wa.me/${detail.wa.replace(/\D/g,'')}`},{label:'Website',value:detail.web.replace(/^https?:\/\//,''),href:detail.web}].map(c=>(
                    <div key={c.label} style={{background:'#111c13',border:'1px solid rgba(200,168,75,.15)',padding:'10px 12px'}}>
                      <div style={{fontFamily:rj,fontSize:9,letterSpacing:'1.5px',textTransform:'uppercase',color:'#7a8a72',marginBottom:3,fontWeight:600}}>{c.label}</div>
                      <a href={c.href} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#c8a84b',textDecoration:'none'}}>{c.value}</a>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:14}}>
                  {detail.ports.map(p=><span key={p} style={{fontFamily:rj,fontSize:9,letterSpacing:1,fontWeight:700,padding:'2px 6px',border:'1px solid rgba(200,168,75,.3)',color:'#c8a84b'}}>{p}</span>)}
                </div>
                <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                  <a className="btn-gold" href={`tel:${detail.phone.replace(/\s/g,'')}`} style={{flex:1,minWidth:110,padding:10,background:'#c8a84b',color:'#08100a',textDecoration:'none',fontFamily:rj,fontSize:10,letterSpacing:'1px',textTransform:'uppercase',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>📞 Call</a>
                  <a className="btn-gold" href={`mailto:${detail.email}`} style={{flex:1,minWidth:110,padding:10,background:'#c8a84b',color:'#08100a',textDecoration:'none',fontFamily:rj,fontSize:10,letterSpacing:'1px',textTransform:'uppercase',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>✉ Email</a>
                  <a className="btn-ghost" href={`https://wa.me/${detail.wa.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{flex:1,minWidth:110,padding:10,background:'transparent',border:'1px solid rgba(200,168,75,.4)',color:'#c8a84b',textDecoration:'none',fontFamily:rj,fontSize:10,letterSpacing:'1px',textTransform:'uppercase',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>💬 WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORM MODAL — Step 1: Provider Info */}
        {showFormModal && (
          <div style={{position:'fixed',inset:0,background:'rgba(8,16,10,.95)',backdropFilter:'blur(16px)',zIndex:600,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'30px 16px',overflowY:'auto'}} onClick={e=>{if(e.target===e.currentTarget){setShowFormModal(false);resetForm();}}}>
            <div className="modal-content" style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.3)',width:'100%',maxWidth:760,margin:'auto'}}>

              {/* HEADER */}
              <div style={{padding:'22px 28px 18px',borderBottom:'1px solid rgba(200,168,75,.15)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:14}}>
                <div>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:6,fontWeight:700}}>Step 1 of 2 · Provider Information</div>
                  <h2 style={{fontFamily:lb,fontSize:22,fontWeight:700,lineHeight:1.2}}>List Your <em style={g}>Business</em></h2>
                  <p style={{fontSize:12.5,color:'#b0c0a4',marginTop:6,lineHeight:1.5}}>Fill in your company details. After submission, you&apos;ll choose a subscription plan and complete payment.</p>
                </div>
                <button onClick={()=>{setShowFormModal(false);resetForm();}} style={{background:'none',border:'none',color:'#7a8a72',fontSize:20,cursor:'pointer',flexShrink:0}}>✕</button>
              </div>

              {/* PROGRESS BAR */}
              <div style={{display:'flex',gap:0,padding:'0 28px',marginTop:14,marginBottom:6}}>
                <div style={{flex:1,height:3,background:'#c8a84b'}}/>
                <div style={{flex:1,height:3,background:'rgba(200,168,75,.2)'}}/>
              </div>

              <div style={{padding:'18px 28px 24px'}}>

                {/* PROVIDER TYPE SELECTION */}
                <div style={{marginBottom:20}}>
                  <label style={S.flbl}>Provider Type *</label>
                  <div className="ptype-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    {[{key:'agent',ico:'🏢',label:'Ship Agent',desc:'Port agency services'},{key:'chandler',ico:'⚓',label:'Shipchandler',desc:'Provisions & supplies'},{key:'service',ico:'🔧',label:'Marine Service',desc:'Technical services'}].map(o=>(
                      <div key={o.key} className="ptype-card" onClick={()=>setFProviderType(o.key)} style={{padding:'14px 12px',border:`1px solid ${fProviderType===o.key?'#c8a84b':'rgba(200,168,75,.2)'}`,background:fProviderType===o.key?'rgba(200,168,75,.08)':'#111c13',textAlign:'center'}}>
                        <div style={{fontSize:22,marginBottom:6}}>{o.ico}</div>
                        <div style={{fontFamily:rj,fontSize:12,fontWeight:700,color:fProviderType===o.key?'#c8a84b':'#f5f0e8',marginBottom:3,letterSpacing:'.5px'}}>{o.label}</div>
                        <div style={{fontSize:10,color:'#7a8a72',fontFamily:rj}}>{o.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COMPANY NAME */}
                <div style={{marginBottom:16}}>
                  <label style={S.flbl}>Company Name *</label>
                  <input className="card-input" type="text" value={fCompanyName} onChange={e=>setFCompanyName(e.target.value)} placeholder="e.g. Mersin Maritime Agency Ltd." style={S.inp}/>
                </div>

                {/* COMPANY BIO */}
                <div style={{marginBottom:16}}>
                  <label style={S.flbl}>Company Description / Bio *</label>
                  <textarea className="card-input" value={fBio} onChange={e=>setFBio(e.target.value)} placeholder="Brief description of your services, certifications, experience..." rows={4} style={{...S.inp,resize:'vertical',minHeight:80,fontFamily:"'Outfit',sans-serif"}}/>
                  <div style={{fontFamily:rj,fontSize:10,color:'#7a8a72',marginTop:4}}>{fBio.length} characters · minimum 30</div>
                </div>

                {/* COUNTRY */}
                <div style={{marginBottom:16}}>
                  <label style={S.flbl}>Country *</label>
                  <select className="card-input" value={fCountry} onChange={e=>{setFCountry(e.target.value);setFPorts([]);}} style={S.inp}>
                    <option value="">Select country...</option>
                    {countries.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* PORTS - Multi Select */}
                {fCountry && (
                  <div style={{marginBottom:16}}>
                    <label style={S.flbl}>Ports You Operate At * ({fPorts.length} selected)</label>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:6,maxHeight:200,overflowY:'auto',padding:10,background:'rgba(8,16,10,.6)',border:'1px solid rgba(200,168,75,.2)'}}>
                      {fAvailablePorts.map(p=>(
                        <div key={p} onClick={()=>togglePortInForm(p)} style={{padding:'7px 10px',border:`1px solid ${fPorts.includes(p)?'#c8a84b':'rgba(200,168,75,.18)'}`,background:fPorts.includes(p)?'#c8a84b':'transparent',color:fPorts.includes(p)?'#08100a':'#b0c0a4',fontFamily:rj,fontSize:11,fontWeight:600,cursor:'pointer',userSelect:'none',textAlign:'center'}}>{p}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MARINE SERVICES (only for service type) */}
                {fProviderType === 'service' && (
                  <div style={{marginBottom:16}}>
                    <label style={S.flbl}>Service Categories * ({fSvc.size} selected)</label>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:5,maxHeight:240,overflowY:'auto',padding:10,background:'rgba(8,16,10,.6)',border:'1px solid rgba(200,168,75,.2)'}}>
                      {MARINE_SERVICES.map(s=>(
                        <div key={s.key} onClick={()=>toggleSvcInForm(s.key)} style={{padding:'6px 10px',border:`1px solid ${fSvc.has(s.key)?'#c8a84b':'rgba(200,168,75,.18)'}`,background:fSvc.has(s.key)?'#c8a84b':'transparent',color:fSvc.has(s.key)?'#08100a':'#b0c0a4',fontFamily:rj,fontSize:11,fontWeight:600,cursor:'pointer',userSelect:'none'}}>{s.label}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTACT INFO */}
                <div className="form-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                  <div>
                    <label style={S.flbl}>Email *</label>
                    <input className="card-input" type="email" value={fEmail} onChange={e=>setFEmail(e.target.value)} placeholder="ops@yourcompany.com" style={S.inp}/>
                  </div>
                  <div>
                    <label style={S.flbl}>Phone *</label>
                    <input className="card-input" type="tel" value={fPhone} onChange={e=>setFPhone(e.target.value)} placeholder="+90 324 238 0000" style={S.inp}/>
                  </div>
                </div>

                <div className="form-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                  <div>
                    <label style={S.flbl}>WhatsApp (optional)</label>
                    <input className="card-input" type="tel" value={fWhatsapp} onChange={e=>setFWhatsapp(e.target.value)} placeholder="+905320000000" style={S.inp}/>
                  </div>
                  <div>
                    <label style={S.flbl}>Website (optional)</label>
                    <input className="card-input" type="url" value={fWebsite} onChange={e=>setFWebsite(e.target.value)} placeholder="https://yourcompany.com" style={S.inp}/>
                  </div>
                </div>

                <div style={{marginBottom:16}}>
                  <label style={S.flbl}>Contact Person *</label>
                  <input className="card-input" type="text" value={fContactPerson} onChange={e=>setFContactPerson(e.target.value)} placeholder="Cpt. John Smith" style={S.inp}/>
                </div>

                <div style={{marginBottom:20}}>
                  <label style={S.flbl}>Office Address (optional)</label>
                  <input className="card-input" type="text" value={fAddress} onChange={e=>setFAddress(e.target.value)} placeholder="Street, City, ZIP" style={S.inp}/>
                </div>

                {/* ERROR */}
                {fFormError && (
                  <div style={{padding:'12px 14px',background:'rgba(255,138,138,.08)',border:'1px solid rgba(255,138,138,.3)',marginBottom:14,fontFamily:rj,fontSize:12,color:'#ff8a8a',fontWeight:600}}>⚠ {fFormError}</div>
                )}

                {/* BUTTONS */}
                <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:18}}>
                  <button onClick={()=>{setShowFormModal(false);resetForm();}} className="btn-ghost" style={{background:'transparent',border:'1px solid rgba(200,168,75,.3)',color:'#c8a84b',padding:'12px 22px',fontFamily:rj,fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>Cancel</button>
                  <button onClick={handleFormSubmit} className="btn-gold" style={{background:'#c8a84b',color:'#08100a',border:'none',padding:'12px 28px',fontFamily:rj,fontSize:12,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>Continue to Plan →</button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* PLAN MODAL — Step 2: Subscription Plan */}
        {showPlanModal && (
          <div style={{position:'fixed',inset:0,background:'rgba(8,16,10,.95)',backdropFilter:'blur(16px)',zIndex:600,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'30px 16px',overflowY:'auto'}} onClick={e=>{if(e.target===e.currentTarget && !checkoutLoading)closeAllModals();}}>
            <div className="modal-content" style={{background:'#0c1610',border:'1px solid rgba(200,168,75,.3)',width:'100%',maxWidth:680,margin:'auto'}}>

              {/* HEADER */}
              <div style={{padding:'22px 28px 18px',borderBottom:'1px solid rgba(200,168,75,.15)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:14}}>
                <div>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:6,fontWeight:700}}>Step 2 of 2 · Choose Your Plan</div>
                  <h2 style={{fontFamily:lb,fontSize:22,fontWeight:700,lineHeight:1.2}}>Select <em style={g}>Subscription</em> Plan</h2>
                  <p style={{fontSize:12.5,color:'#b0c0a4',marginTop:6,lineHeight:1.5}}>Cancel anytime. No commission. Active immediately after payment.</p>
                </div>
                <button onClick={()=>{if(!checkoutLoading){setShowPlanModal(false);setShowFormModal(true);}}} style={{background:'none',border:'none',color:'#7a8a72',fontSize:20,cursor:checkoutLoading?'not-allowed':'pointer',flexShrink:0}}>✕</button>
              </div>

              {/* PROGRESS BAR */}
              <div style={{display:'flex',gap:0,padding:'0 28px',marginTop:14,marginBottom:6}}>
                <div style={{flex:1,height:3,background:'#c8a84b'}}/>
                <div style={{flex:1,height:3,background:'#c8a84b'}}/>
              </div>

              <div style={{padding:'18px 28px 24px'}}>

                {/* SUMMARY */}
                <div style={{background:'rgba(200,168,75,.05)',border:'1px solid rgba(200,168,75,.18)',padding:'14px 16px',marginBottom:18}}>
                  <div style={{fontFamily:rj,fontSize:10,letterSpacing:'1.5px',textTransform:'uppercase',color:'#c8a84b',marginBottom:6,fontWeight:700}}>Your Submission</div>
                  <div style={{fontSize:13,color:'#f5f0e8',marginBottom:3,fontWeight:600}}>{fCompanyName}</div>
                  <div style={{fontSize:11,color:'#b0c0a4',lineHeight:1.5}}>{TL(fProviderType)} · {fCountry} · {fPorts.length} port{fPorts.length!==1?'s':''}</div>
                </div>

                {/* PLAN CARDS */}
                <div className="tiers2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18}}>

                  {/* MONTHLY */}
                  <div style={{background:'#111c13',border:'1px solid rgba(200,168,75,.2)',padding:'22px 20px',display:'flex',flexDirection:'column'}}>
                    <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>Monthly</div>
                    <div style={{display:'flex',alignItems:'baseline',gap:5,marginBottom:4}}>
                      <span style={{fontFamily:lb,fontSize:32,fontWeight:700,lineHeight:1}}>$49.90</span>
                      <span style={{fontFamily:rj,fontSize:11,color:'#7a8a72',fontWeight:600}}>/ month</span>
                    </div>
                    <div style={{fontSize:11,color:'#b0c0a4',marginBottom:14,fontFamily:rj,lineHeight:1.4}}>Billed monthly · Cancel anytime</div>
                    <ul style={{listStyle:'none',flex:1,marginBottom:14,display:'flex',flexDirection:'column',gap:6}}>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>All your ports listed</li>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>Full company profile</li>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>Verified badge</li>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>Cancel anytime</li>
                    </ul>
                    <button onClick={()=>handleCheckout('monthly')} disabled={checkoutLoading} className="btn-ghost" style={{padding:11,background:'transparent',border:'1px solid rgba(200,168,75,.4)',color:'#c8a84b',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:checkoutLoading?'wait':'pointer',width:'100%',opacity:checkoutLoading?.6:1}}>
                      {checkoutLoading ? <span className="spinner"/> : 'Subscribe Monthly'}
                    </button>
                  </div>

                  {/* ANNUAL */}
                  <div style={{background:'linear-gradient(180deg,rgba(200,168,75,.08),transparent)',border:'1px solid #c8a84b',padding:'22px 20px',position:'relative',display:'flex',flexDirection:'column'}}>
                    <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'#c8a84b',color:'#08100a',fontFamily:rj,fontSize:9,letterSpacing:'1.5px',fontWeight:700,padding:'3px 10px'}}>BEST VALUE · SAVE $98.80</div>
                    <div style={{fontFamily:rj,fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:'#c8a84b',marginBottom:8,fontWeight:700}}>Annual</div>
                    <div style={{display:'flex',alignItems:'baseline',gap:5,marginBottom:4}}>
                      <span style={{fontFamily:lb,fontSize:32,fontWeight:700,lineHeight:1}}>$500</span>
                      <span style={{fontFamily:rj,fontSize:11,color:'#7a8a72',fontWeight:600}}>/ year</span>
                    </div>
                    <div style={{fontSize:11,color:'#b0c0a4',marginBottom:14,fontFamily:rj,lineHeight:1.4}}>$41.67/month · ~16% saving</div>
                    <ul style={{listStyle:'none',flex:1,marginBottom:14,display:'flex',flexDirection:'column',gap:6}}>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>Everything in Monthly</li>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>Priority placement</li>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>Priority support</li>
                      <li style={{fontSize:11.5,color:'#b0c0a4',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}><span style={{color:'#c8a84b',fontWeight:700,flexShrink:0}}>✓</span>Save $98.80</li>
                    </ul>
                    <button onClick={()=>handleCheckout('annual')} disabled={checkoutLoading} className="btn-gold" style={{padding:11,background:'#c8a84b',color:'#08100a',border:'none',fontFamily:rj,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700,cursor:checkoutLoading?'wait':'pointer',width:'100%',opacity:checkoutLoading?.6:1}}>
                      {checkoutLoading ? <span className="spinner"/> : 'Subscribe Annual'}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
                {checkoutError && (
                  <div style={{padding:'12px 14px',background:'rgba(255,138,138,.08)',border:'1px solid rgba(255,138,138,.3)',marginBottom:14,fontFamily:rj,fontSize:12,color:'#ff8a8a',fontWeight:600}}>⚠ {checkoutError}</div>
                )}

                {/* LOADING MESSAGE */}
                {checkoutLoading && (
                  <div style={{padding:'12px 14px',background:'rgba(200,168,75,.08)',border:'1px solid rgba(200,168,75,.3)',marginBottom:14,fontFamily:rj,fontSize:12,color:'#c8a84b',fontWeight:600,textAlign:'center'}}>
                    Creating secure checkout session, please wait...
                  </div>
                )}

                {/* INFO */}
                <div style={{padding:'12px 14px',background:'rgba(76,175,118,.06)',border:'1px solid rgba(76,175,118,.2)',display:'flex',alignItems:'flex-start',gap:10}}>
                  <span style={{color:'#4caf76',fontSize:16,flexShrink:0}}>🔒</span>
                  <div>
                    <div style={{fontFamily:rj,fontSize:11,fontWeight:700,color:'#4caf76',marginBottom:3,letterSpacing:'.5px'}}>Secure Payment by Polar</div>
                    <div style={{fontSize:11,color:'#b0c0a4',lineHeight:1.5}}>You&apos;ll be redirected to Polar&apos;s secure checkout. Your listing will activate automatically after successful payment.</div>
                  </div>
                </div>

                {/* BACK BUTTON */}
                <div style={{marginTop:14,textAlign:'center'}}>
                  <button onClick={()=>{if(!checkoutLoading){setShowPlanModal(false);setShowFormModal(true);}}} disabled={checkoutLoading} style={{background:'none',border:'none',color:'#7a8a72',fontFamily:rj,fontSize:11,letterSpacing:'1px',textTransform:'uppercase',fontWeight:600,cursor:checkoutLoading?'not-allowed':'pointer',textDecoration:'underline'}}>← Back to form</button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
