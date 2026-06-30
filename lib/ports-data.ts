// ============================================================
// WORLD MAJOR PORTS COORDINATES DATABASE
// Source: NGA World Port Index (public domain)
// 150+ major commercial ports for distance/routing calculations
// ============================================================

export interface PortCoord {
  name: string;
  country: string;
  lat: number;
  lon: number;
  region: string;
  unlocode?: string;
}

export const PORTS: PortCoord[] = [
  // ASIA — South East Asia & Far East
  { name: 'Singapore', country: 'Singapore', lat: 1.2655, lon: 103.7995, region: 'Asia', unlocode: 'SGSIN' },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.2855, lon: 114.1577, region: 'Asia', unlocode: 'HKHKG' },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, region: 'Asia', unlocode: 'CNSHA' },
  { name: 'Ningbo-Zhoushan', country: 'China', lat: 29.8683, lon: 121.5440, region: 'Asia', unlocode: 'CNNGB' },
  { name: 'Shenzhen', country: 'China', lat: 22.5331, lon: 113.9300, region: 'Asia', unlocode: 'CNSZX' },
  { name: 'Guangzhou', country: 'China', lat: 23.1291, lon: 113.2644, region: 'Asia', unlocode: 'CNGZH' },
  { name: 'Qingdao', country: 'China', lat: 36.0671, lon: 120.3826, region: 'Asia', unlocode: 'CNQIN' },
  { name: 'Tianjin', country: 'China', lat: 39.0042, lon: 117.7099, region: 'Asia', unlocode: 'CNTSN' },
  { name: 'Dalian', country: 'China', lat: 38.9140, lon: 121.6147, region: 'Asia', unlocode: 'CNDLC' },
  { name: 'Xiamen', country: 'China', lat: 24.4798, lon: 118.0894, region: 'Asia', unlocode: 'CNXMN' },
  { name: 'Yantai', country: 'China', lat: 37.4638, lon: 121.4478, region: 'Asia', unlocode: 'CNYNT' },
  { name: 'Fuzhou', country: 'China', lat: 26.0745, lon: 119.2965, region: 'Asia', unlocode: 'CNFOC' },
  { name: 'Lianyungang', country: 'China', lat: 34.6011, lon: 119.2222, region: 'Asia', unlocode: 'CNLYG' },
  { name: 'Hong Kong', country: 'China', lat: 22.2855, lon: 114.1577, region: 'Asia' },

  // JAPAN
  { name: 'Yokohama', country: 'Japan', lat: 35.4437, lon: 139.6380, region: 'Asia', unlocode: 'JPYOK' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6528, lon: 139.8395, region: 'Asia', unlocode: 'JPTYO' },
  { name: 'Osaka', country: 'Japan', lat: 34.6420, lon: 135.4291, region: 'Asia', unlocode: 'JPOSA' },
  { name: 'Kobe', country: 'Japan', lat: 34.6843, lon: 135.1986, region: 'Asia', unlocode: 'JPUKB' },
  { name: 'Nagoya', country: 'Japan', lat: 35.0625, lon: 136.8839, region: 'Asia', unlocode: 'JPNGO' },
  { name: 'Chiba', country: 'Japan', lat: 35.5764, lon: 140.1167, region: 'Asia', unlocode: 'JPCHB' },
  { name: 'Kawasaki', country: 'Japan', lat: 35.5022, lon: 139.7100, region: 'Asia', unlocode: 'JPKWS' },
  { name: 'Mizushima', country: 'Japan', lat: 34.5061, lon: 133.7656, region: 'Asia', unlocode: 'JPMIZ' },

  // KOREA
  { name: 'Busan', country: 'South Korea', lat: 35.1028, lon: 129.0403, region: 'Asia', unlocode: 'KRPUS' },
  { name: 'Incheon', country: 'South Korea', lat: 37.4519, lon: 126.6017, region: 'Asia', unlocode: 'KRINC' },
  { name: 'Ulsan', country: 'South Korea', lat: 35.5384, lon: 129.3114, region: 'Asia', unlocode: 'KRUSN' },
  { name: 'Gwangyang', country: 'South Korea', lat: 34.9000, lon: 127.7000, region: 'Asia', unlocode: 'KRKAN' },

  // TAIWAN
  { name: 'Kaohsiung', country: 'Taiwan', lat: 22.6273, lon: 120.3014, region: 'Asia', unlocode: 'TWKHH' },
  { name: 'Keelung', country: 'Taiwan', lat: 25.1276, lon: 121.7392, region: 'Asia', unlocode: 'TWKEL' },
  { name: 'Taichung', country: 'Taiwan', lat: 24.2839, lon: 120.5167, region: 'Asia', unlocode: 'TWTXG' },

  // SOUTHEAST ASIA
  { name: 'Port Klang', country: 'Malaysia', lat: 3.0044, lon: 101.3917, region: 'Asia', unlocode: 'MYPKG' },
  { name: 'Tanjung Pelepas', country: 'Malaysia', lat: 1.3658, lon: 103.5511, region: 'Asia', unlocode: 'MYTPP' },
  { name: 'Penang', country: 'Malaysia', lat: 5.4119, lon: 100.3328, region: 'Asia', unlocode: 'MYPEN' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7037, lon: 100.5675, region: 'Asia', unlocode: 'THBKK' },
  { name: 'Laem Chabang', country: 'Thailand', lat: 13.0833, lon: 100.8833, region: 'Asia', unlocode: 'THLCH' },
  { name: 'Map Ta Phut', country: 'Thailand', lat: 12.6833, lon: 101.1833, region: 'Asia', unlocode: 'THMAT' },
  { name: 'Jakarta (Tanjung Priok)', country: 'Indonesia', lat: -6.1058, lon: 106.8800, region: 'Asia', unlocode: 'IDTPP' },
  { name: 'Surabaya', country: 'Indonesia', lat: -7.2042, lon: 112.7378, region: 'Asia', unlocode: 'IDSUB' },
  { name: 'Belawan', country: 'Indonesia', lat: 3.7900, lon: 98.6886, region: 'Asia', unlocode: 'IDBLW' },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9789, region: 'Asia', unlocode: 'PHMNL' },
  { name: 'Cebu', country: 'Philippines', lat: 10.3157, lon: 123.8854, region: 'Asia', unlocode: 'PHCEB' },
  { name: 'Subic Bay', country: 'Philippines', lat: 14.7975, lon: 120.2783, region: 'Asia', unlocode: 'PHSFS' },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.7626, lon: 106.6602, region: 'Asia', unlocode: 'VNSGN' },
  { name: 'Haiphong', country: 'Vietnam', lat: 20.8449, lon: 106.6881, region: 'Asia', unlocode: 'VNHPH' },
  { name: 'Cai Mep', country: 'Vietnam', lat: 10.5333, lon: 107.0333, region: 'Asia', unlocode: 'VNCMT' },
  { name: 'Yangon', country: 'Myanmar', lat: 16.7740, lon: 96.1746, region: 'Asia', unlocode: 'MMRGN' },
  { name: 'Sihanoukville', country: 'Cambodia', lat: 10.6093, lon: 103.5292, region: 'Asia', unlocode: 'KHKOS' },

  // SOUTH ASIA
  { name: 'Mumbai (Nhava Sheva)', country: 'India', lat: 18.9474, lon: 72.9518, region: 'Asia', unlocode: 'INNSA' },
  { name: 'Mundra', country: 'India', lat: 22.7393, lon: 69.7158, region: 'Asia', unlocode: 'INMUN' },
  { name: 'Chennai', country: 'India', lat: 13.1067, lon: 80.2926, region: 'Asia', unlocode: 'INMAA' },
  { name: 'Kolkata', country: 'India', lat: 22.5675, lon: 88.3144, region: 'Asia', unlocode: 'INCCU' },
  { name: 'Cochin', country: 'India', lat: 9.9667, lon: 76.2667, region: 'Asia', unlocode: 'INCOK' },
  { name: 'Visakhapatnam', country: 'India', lat: 17.6892, lon: 83.2114, region: 'Asia', unlocode: 'INVTZ' },
  { name: 'Kandla', country: 'India', lat: 23.0167, lon: 70.2167, region: 'Asia', unlocode: 'INIXY' },
  { name: 'Tuticorin', country: 'India', lat: 8.7642, lon: 78.1348, region: 'Asia', unlocode: 'INTUT' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8425, lon: 66.9742, region: 'Asia', unlocode: 'PKKHI' },
  { name: 'Port Qasim', country: 'Pakistan', lat: 24.7833, lon: 67.3500, region: 'Asia', unlocode: 'PKBQM' },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9500, lon: 79.8500, region: 'Asia', unlocode: 'LKCMB' },
  { name: 'Chittagong', country: 'Bangladesh', lat: 22.3300, lon: 91.8000, region: 'Asia', unlocode: 'BDCGP' },

  // MIDDLE EAST
  { name: 'Jebel Ali', country: 'UAE', lat: 25.0153, lon: 55.0625, region: 'Middle East', unlocode: 'AEJEA' },
  { name: 'Dubai (Port Rashid)', country: 'UAE', lat: 25.2667, lon: 55.2667, region: 'Middle East', unlocode: 'AEDXB' },
  { name: 'Khor Fakkan', country: 'UAE', lat: 25.3500, lon: 56.3500, region: 'Middle East', unlocode: 'AEKLF' },
  { name: 'Abu Dhabi (Khalifa)', country: 'UAE', lat: 24.8333, lon: 54.6667, region: 'Middle East', unlocode: 'AEKHL' },
  { name: 'Fujairah', country: 'UAE', lat: 25.1167, lon: 56.3500, region: 'Middle East', unlocode: 'AEFJR' },
  { name: 'Sharjah', country: 'UAE', lat: 25.3667, lon: 55.3833, region: 'Middle East', unlocode: 'AESHJ' },
  { name: 'Salalah', country: 'Oman', lat: 17.0167, lon: 54.0833, region: 'Middle East', unlocode: 'OMSLL' },
  { name: 'Sohar', country: 'Oman', lat: 24.5000, lon: 56.6167, region: 'Middle East', unlocode: 'OMSOH' },
  { name: 'Muscat', country: 'Oman', lat: 23.6167, lon: 58.5833, region: 'Middle East', unlocode: 'OMMCT' },
  { name: 'Hamad Port', country: 'Qatar', lat: 25.0167, lon: 51.6667, region: 'Middle East', unlocode: 'QAHMD' },
  { name: 'Bahrain', country: 'Bahrain', lat: 26.1500, lon: 50.6333, region: 'Middle East', unlocode: 'BHKBS' },
  { name: 'Dammam', country: 'Saudi Arabia', lat: 26.5000, lon: 50.2000, region: 'Middle East', unlocode: 'SADMM' },
  { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1925, region: 'Middle East', unlocode: 'SAJED' },
  { name: 'Yanbu', country: 'Saudi Arabia', lat: 24.0833, lon: 38.0667, region: 'Middle East', unlocode: 'SAYNB' },
  { name: 'Jubail', country: 'Saudi Arabia', lat: 27.0167, lon: 49.6500, region: 'Middle East', unlocode: 'SAJUB' },
  { name: 'Kuwait (Shuwaikh)', country: 'Kuwait', lat: 29.3500, lon: 47.9500, region: 'Middle East', unlocode: 'KWKWI' },
  { name: 'Bandar Abbas', country: 'Iran', lat: 27.1500, lon: 56.2167, region: 'Middle East', unlocode: 'IRBND' },
  { name: 'Basra (Umm Qasr)', country: 'Iraq', lat: 30.0500, lon: 47.9333, region: 'Middle East', unlocode: 'IQUQR' },
  { name: 'Aden', country: 'Yemen', lat: 12.7833, lon: 45.0167, region: 'Middle East', unlocode: 'YEADE' },
  { name: 'Aqaba', country: 'Jordan', lat: 29.5167, lon: 35.0000, region: 'Middle East', unlocode: 'JOAQB' },
  { name: 'Haifa', country: 'Israel', lat: 32.8333, lon: 35.0000, region: 'Middle East', unlocode: 'ILHFA' },
  { name: 'Ashdod', country: 'Israel', lat: 31.8167, lon: 34.6500, region: 'Middle East', unlocode: 'ILASH' },

  // MEDITERRANEAN / EUROPE / BLACK SEA
  { name: 'Istanbul (Ambarli)', country: 'Turkey', lat: 40.9667, lon: 28.6833, region: 'Europe', unlocode: 'TRAMR' },
  { name: 'Istanbul (Bosphorus)', country: 'Turkey', lat: 41.1333, lon: 29.0667, region: 'Europe', unlocode: 'TRIST' },
  { name: 'Tuzla', country: 'Turkey', lat: 40.8333, lon: 29.3000, region: 'Europe', unlocode: 'TRTZX' },
  { name: 'Izmir (Aliaga)', country: 'Turkey', lat: 38.8000, lon: 26.9667, region: 'Europe', unlocode: 'TRALI' },
  { name: 'Mersin', country: 'Turkey', lat: 36.7833, lon: 34.6333, region: 'Europe', unlocode: 'TRMER' },
  { name: 'Iskenderun', country: 'Turkey', lat: 36.5833, lon: 36.1833, region: 'Europe', unlocode: 'TRISK' },
  { name: 'Piraeus', country: 'Greece', lat: 37.9472, lon: 23.6361, region: 'Europe', unlocode: 'GRPIR' },
  { name: 'Thessaloniki', country: 'Greece', lat: 40.6333, lon: 22.9500, region: 'Europe', unlocode: 'GRSKG' },
  { name: 'Genoa', country: 'Italy', lat: 44.4056, lon: 8.9347, region: 'Europe', unlocode: 'ITGOA' },
  { name: 'Trieste', country: 'Italy', lat: 45.6500, lon: 13.7667, region: 'Europe', unlocode: 'ITTRS' },
  { name: 'La Spezia', country: 'Italy', lat: 44.1167, lon: 9.8333, region: 'Europe', unlocode: 'ITSPE' },
  { name: 'Gioia Tauro', country: 'Italy', lat: 38.4500, lon: 15.9000, region: 'Europe', unlocode: 'ITGIT' },
  { name: 'Livorno', country: 'Italy', lat: 43.5500, lon: 10.3000, region: 'Europe', unlocode: 'ITLIV' },
  { name: 'Naples', country: 'Italy', lat: 40.8333, lon: 14.2500, region: 'Europe', unlocode: 'ITNAP' },
  { name: 'Civitavecchia', country: 'Italy', lat: 42.0833, lon: 11.7833, region: 'Europe', unlocode: 'ITCVV' },
  { name: 'Barcelona', country: 'Spain', lat: 41.3500, lon: 2.1667, region: 'Europe', unlocode: 'ESBCN' },
  { name: 'Valencia', country: 'Spain', lat: 39.4667, lon: -0.3333, region: 'Europe', unlocode: 'ESVLC' },
  { name: 'Algeciras', country: 'Spain', lat: 36.1333, lon: -5.4500, region: 'Europe', unlocode: 'ESALG' },
  { name: 'Bilbao', country: 'Spain', lat: 43.3500, lon: -3.0167, region: 'Europe', unlocode: 'ESBIO' },
  { name: 'Las Palmas', country: 'Spain', lat: 28.1500, lon: -15.4167, region: 'Europe', unlocode: 'ESLPA' },
  { name: 'Marseille', country: 'France', lat: 43.3000, lon: 5.3667, region: 'Europe', unlocode: 'FRMRS' },
  { name: 'Le Havre', country: 'France', lat: 49.4833, lon: 0.1167, region: 'Europe', unlocode: 'FRLEH' },
  { name: 'Dunkirk', country: 'France', lat: 51.0500, lon: 2.3667, region: 'Europe', unlocode: 'FRDKK' },
  { name: 'Fos-sur-Mer', country: 'France', lat: 43.4333, lon: 4.9333, region: 'Europe', unlocode: 'FRFOS' },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7167, lon: -9.1333, region: 'Europe', unlocode: 'PTLIS' },
  { name: 'Sines', country: 'Portugal', lat: 37.9500, lon: -8.8667, region: 'Europe', unlocode: 'PTSIE' },
  { name: 'Constanta', country: 'Romania', lat: 44.1500, lon: 28.6500, region: 'Europe', unlocode: 'ROCND' },
  { name: 'Varna', country: 'Bulgaria', lat: 43.2000, lon: 27.9167, region: 'Europe', unlocode: 'BGVAR' },
  { name: 'Burgas', country: 'Bulgaria', lat: 42.4833, lon: 27.4833, region: 'Europe', unlocode: 'BGBOJ' },
  { name: 'Odessa', country: 'Ukraine', lat: 46.4833, lon: 30.7333, region: 'Europe', unlocode: 'UAODS' },
  { name: 'Novorossiysk', country: 'Russia', lat: 44.7167, lon: 37.7833, region: 'Europe', unlocode: 'RUNVS' },
  { name: 'St Petersburg', country: 'Russia', lat: 59.9333, lon: 30.2333, region: 'Europe', unlocode: 'RULED' },
  { name: 'Klaipeda', country: 'Lithuania', lat: 55.7167, lon: 21.1333, region: 'Europe', unlocode: 'LTKLJ' },
  { name: 'Riga', country: 'Latvia', lat: 56.9500, lon: 24.1000, region: 'Europe', unlocode: 'LVRIX' },
  { name: 'Tallinn', country: 'Estonia', lat: 59.4500, lon: 24.7500, region: 'Europe', unlocode: 'EETLL' },
  { name: 'Gdansk', country: 'Poland', lat: 54.3500, lon: 18.6500, region: 'Europe', unlocode: 'PLGDN' },
  { name: 'Gdynia', country: 'Poland', lat: 54.5167, lon: 18.5333, region: 'Europe', unlocode: 'PLGDY' },

  // NORTH EUROPE
  { name: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lon: 4.4777, region: 'Europe', unlocode: 'NLRTM' },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3833, lon: 4.9000, region: 'Europe', unlocode: 'NLAMS' },
  { name: 'Antwerp', country: 'Belgium', lat: 51.2667, lon: 4.4000, region: 'Europe', unlocode: 'BEANR' },
  { name: 'Zeebrugge', country: 'Belgium', lat: 51.3333, lon: 3.2000, region: 'Europe', unlocode: 'BEZEE' },
  { name: 'Hamburg', country: 'Germany', lat: 53.5333, lon: 9.9833, region: 'Europe', unlocode: 'DEHAM' },
  { name: 'Bremerhaven', country: 'Germany', lat: 53.5500, lon: 8.5833, region: 'Europe', unlocode: 'DEBRV' },
  { name: 'Wilhelmshaven', country: 'Germany', lat: 53.5167, lon: 8.1333, region: 'Europe', unlocode: 'DEWVN' },
  { name: 'Felixstowe', country: 'UK', lat: 51.9500, lon: 1.3167, region: 'Europe', unlocode: 'GBFXT' },
  { name: 'Southampton', country: 'UK', lat: 50.9000, lon: -1.4000, region: 'Europe', unlocode: 'GBSOU' },
  { name: 'London (Gateway)', country: 'UK', lat: 51.5000, lon: 0.4833, region: 'Europe', unlocode: 'GBLON' },
  { name: 'Liverpool', country: 'UK', lat: 53.4000, lon: -3.0000, region: 'Europe', unlocode: 'GBLIV' },
  { name: 'Immingham', country: 'UK', lat: 53.6333, lon: -0.2167, region: 'Europe', unlocode: 'GBIMM' },
  { name: 'Dublin', country: 'Ireland', lat: 53.3500, lon: -6.2167, region: 'Europe', unlocode: 'IEDUB' },
  { name: 'Gothenburg', country: 'Sweden', lat: 57.7167, lon: 11.9500, region: 'Europe', unlocode: 'SEGOT' },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3333, lon: 18.0500, region: 'Europe', unlocode: 'SESTO' },
  { name: 'Helsinki', country: 'Finland', lat: 60.1667, lon: 24.9333, region: 'Europe', unlocode: 'FIHEL' },
  { name: 'Oslo', country: 'Norway', lat: 59.9167, lon: 10.7500, region: 'Europe', unlocode: 'NOOSL' },
  { name: 'Bergen', country: 'Norway', lat: 60.3917, lon: 5.3242, region: 'Europe', unlocode: 'NOBGO' },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6833, lon: 12.6000, region: 'Europe', unlocode: 'DKCPH' },
  { name: 'Aarhus', country: 'Denmark', lat: 56.1500, lon: 10.2000, region: 'Europe', unlocode: 'DKAAR' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1500, lon: -21.9500, region: 'Europe', unlocode: 'ISREY' },

  // AFRICA
  { name: 'Casablanca', country: 'Morocco', lat: 33.6000, lon: -7.6167, region: 'Africa', unlocode: 'MACAS' },
  { name: 'Tanger Med', country: 'Morocco', lat: 35.8833, lon: -5.5167, region: 'Africa', unlocode: 'MAPTM' },
  { name: 'Algiers', country: 'Algeria', lat: 36.7833, lon: 3.0500, region: 'Africa', unlocode: 'DZALG' },
  { name: 'Alexandria', country: 'Egypt', lat: 31.2000, lon: 29.9000, region: 'Africa', unlocode: 'EGALY' },
  { name: 'Port Said', country: 'Egypt', lat: 31.2667, lon: 32.3000, region: 'Africa', unlocode: 'EGPSD' },
  { name: 'Suez', country: 'Egypt', lat: 29.9667, lon: 32.5500, region: 'Africa', unlocode: 'EGSUZ' },
  { name: 'Damietta', country: 'Egypt', lat: 31.4167, lon: 31.8000, region: 'Africa', unlocode: 'EGDAM' },
  { name: 'Tunis', country: 'Tunisia', lat: 36.8000, lon: 10.1833, region: 'Africa', unlocode: 'TNTUN' },
  { name: 'Tripoli', country: 'Libya', lat: 32.9000, lon: 13.1833, region: 'Africa', unlocode: 'LYTIP' },
  { name: 'Mombasa', country: 'Kenya', lat: -4.0500, lon: 39.6667, region: 'Africa', unlocode: 'KEMBA' },
  { name: 'Dar es Salaam', country: 'Tanzania', lat: -6.8167, lon: 39.2833, region: 'Africa', unlocode: 'TZDAR' },
  { name: 'Djibouti', country: 'Djibouti', lat: 11.5833, lon: 43.1500, region: 'Africa', unlocode: 'DJJIB' },
  { name: 'Lagos (Apapa)', country: 'Nigeria', lat: 6.4500, lon: 3.3667, region: 'Africa', unlocode: 'NGAPP' },
  { name: 'Tin Can Island', country: 'Nigeria', lat: 6.4333, lon: 3.3500, region: 'Africa', unlocode: 'NGTIN' },
  { name: 'Tema', country: 'Ghana', lat: 5.6333, lon: 0.0167, region: 'Africa', unlocode: 'GHTEM' },
  { name: 'Abidjan', country: 'Cote dIvoire', lat: 5.2667, lon: -4.0167, region: 'Africa', unlocode: 'CIABJ' },
  { name: 'Dakar', country: 'Senegal', lat: 14.6667, lon: -17.4333, region: 'Africa', unlocode: 'SNDKR' },
  { name: 'Luanda', country: 'Angola', lat: -8.8167, lon: 13.2333, region: 'Africa', unlocode: 'AOLAD' },
  { name: 'Walvis Bay', country: 'Namibia', lat: -22.9500, lon: 14.5000, region: 'Africa', unlocode: 'NAWVB' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9167, lon: 18.4167, region: 'Africa', unlocode: 'ZACPT' },
  { name: 'Durban', country: 'South Africa', lat: -29.8667, lon: 31.0333, region: 'Africa', unlocode: 'ZADUR' },
  { name: 'Richards Bay', country: 'South Africa', lat: -28.7833, lon: 32.0833, region: 'Africa', unlocode: 'ZARCB' },
  { name: 'Port Elizabeth', country: 'South Africa', lat: -33.9667, lon: 25.6333, region: 'Africa', unlocode: 'ZAPLZ' },

  // NORTH AMERICA — USA EAST COAST
  { name: 'New York / New Jersey', country: 'USA', lat: 40.6833, lon: -74.1500, region: 'North America', unlocode: 'USNYC' },
  { name: 'Norfolk', country: 'USA', lat: 36.8500, lon: -76.3000, region: 'North America', unlocode: 'USORF' },
  { name: 'Baltimore', country: 'USA', lat: 39.2667, lon: -76.5833, region: 'North America', unlocode: 'USBAL' },
  { name: 'Philadelphia', country: 'USA', lat: 39.9500, lon: -75.1500, region: 'North America', unlocode: 'USPHL' },
  { name: 'Boston', country: 'USA', lat: 42.3500, lon: -71.0500, region: 'North America', unlocode: 'USBOS' },
  { name: 'Savannah', country: 'USA', lat: 32.0833, lon: -81.1000, region: 'North America', unlocode: 'USSAV' },
  { name: 'Charleston', country: 'USA', lat: 32.7833, lon: -79.9333, region: 'North America', unlocode: 'USCHS' },
  { name: 'Jacksonville', country: 'USA', lat: 30.3833, lon: -81.6167, region: 'North America', unlocode: 'USJAX' },
  { name: 'Miami', country: 'USA', lat: 25.7833, lon: -80.1833, region: 'North America', unlocode: 'USMIA' },

  // USA GULF & WEST COAST
  { name: 'Houston', country: 'USA', lat: 29.7333, lon: -95.2667, region: 'North America', unlocode: 'USHOU' },
  { name: 'New Orleans', country: 'USA', lat: 29.9500, lon: -90.0667, region: 'North America', unlocode: 'USMSY' },
  { name: 'Mobile', country: 'USA', lat: 30.7000, lon: -88.0500, region: 'North America', unlocode: 'USMOB' },
  { name: 'Corpus Christi', country: 'USA', lat: 27.8000, lon: -97.4000, region: 'North America', unlocode: 'USCRP' },
  { name: 'Galveston', country: 'USA', lat: 29.3000, lon: -94.8000, region: 'North America', unlocode: 'USGLS' },
  { name: 'Los Angeles', country: 'USA', lat: 33.7500, lon: -118.2667, region: 'North America', unlocode: 'USLAX' },
  { name: 'Long Beach', country: 'USA', lat: 33.7667, lon: -118.2167, region: 'North America', unlocode: 'USLGB' },
  { name: 'Oakland', country: 'USA', lat: 37.8000, lon: -122.3333, region: 'North America', unlocode: 'USOAK' },
  { name: 'Seattle', country: 'USA', lat: 47.6000, lon: -122.3333, region: 'North America', unlocode: 'USSEA' },
  { name: 'Tacoma', country: 'USA', lat: 47.2667, lon: -122.4167, region: 'North America', unlocode: 'USTIW' },
  { name: 'Portland (Oregon)', country: 'USA', lat: 45.5500, lon: -122.7500, region: 'North America', unlocode: 'USPDX' },

  // CANADA & MEXICO
  { name: 'Vancouver', country: 'Canada', lat: 49.2833, lon: -123.1167, region: 'North America', unlocode: 'CAVAN' },
  { name: 'Montreal', country: 'Canada', lat: 45.5000, lon: -73.5667, region: 'North America', unlocode: 'CAMTR' },
  { name: 'Halifax', country: 'Canada', lat: 44.6500, lon: -63.5833, region: 'North America', unlocode: 'CAHAL' },
  { name: 'Prince Rupert', country: 'Canada', lat: 54.3167, lon: -130.3167, region: 'North America', unlocode: 'CAPRR' },
  { name: 'Manzanillo', country: 'Mexico', lat: 19.0500, lon: -104.3333, region: 'North America', unlocode: 'MXZLO' },
  { name: 'Veracruz', country: 'Mexico', lat: 19.2000, lon: -96.1333, region: 'North America', unlocode: 'MXVER' },
  { name: 'Altamira', country: 'Mexico', lat: 22.4833, lon: -97.9000, region: 'North America', unlocode: 'MXATM' },
  { name: 'Lazaro Cardenas', country: 'Mexico', lat: 17.9500, lon: -102.2000, region: 'North America', unlocode: 'MXLZC' },

  // CENTRAL AMERICA & CARIBBEAN
  { name: 'Panama (Balboa)', country: 'Panama', lat: 8.9500, lon: -79.5667, region: 'Central America', unlocode: 'PABLB' },
  { name: 'Panama (Colon)', country: 'Panama', lat: 9.3500, lon: -79.9000, region: 'Central America', unlocode: 'PAONX' },
  { name: 'Kingston', country: 'Jamaica', lat: 17.9833, lon: -76.8000, region: 'Caribbean', unlocode: 'JMKIN' },
  { name: 'Havana', country: 'Cuba', lat: 23.1333, lon: -82.3500, region: 'Caribbean', unlocode: 'CUHAV' },
  { name: 'Santo Domingo', country: 'Dominican Republic', lat: 18.4833, lon: -69.9500, region: 'Caribbean', unlocode: 'DOSDQ' },
  { name: 'San Juan', country: 'Puerto Rico', lat: 18.4500, lon: -66.0667, region: 'Caribbean', unlocode: 'PRSJU' },
  { name: 'Cartagena', country: 'Colombia', lat: 10.4000, lon: -75.5500, region: 'South America', unlocode: 'COCTG' },
  { name: 'Freeport', country: 'Bahamas', lat: 26.5333, lon: -78.7000, region: 'Caribbean', unlocode: 'BSFPO' },

  // SOUTH AMERICA
  { name: 'Santos', country: 'Brazil', lat: -23.9500, lon: -46.3333, region: 'South America', unlocode: 'BRSSZ' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9000, lon: -43.2000, region: 'South America', unlocode: 'BRRIO' },
  { name: 'Tubarão', country: 'Brazil', lat: -20.3000, lon: -40.2500, region: 'South America', unlocode: 'BRTUB' },
  { name: 'Paranagua', country: 'Brazil', lat: -25.5167, lon: -48.5167, region: 'South America', unlocode: 'BRPNG' },
  { name: 'Itaqui', country: 'Brazil', lat: -2.5667, lon: -44.3667, region: 'South America', unlocode: 'BRITQ' },
  { name: 'Vitoria', country: 'Brazil', lat: -20.3167, lon: -40.3333, region: 'South America', unlocode: 'BRVIX' },
  { name: 'Salvador', country: 'Brazil', lat: -12.9667, lon: -38.5000, region: 'South America', unlocode: 'BRSSA' },
  { name: 'Suape', country: 'Brazil', lat: -8.3833, lon: -34.9667, region: 'South America', unlocode: 'BRSUA' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6000, lon: -58.3667, region: 'South America', unlocode: 'ARBUE' },
  { name: 'Bahia Blanca', country: 'Argentina', lat: -38.7333, lon: -62.2667, region: 'South America', unlocode: 'ARBHI' },
  { name: 'Montevideo', country: 'Uruguay', lat: -34.9000, lon: -56.2000, region: 'South America', unlocode: 'UYMVD' },
  { name: 'Valparaiso', country: 'Chile', lat: -33.0333, lon: -71.6167, region: 'South America', unlocode: 'CLVAP' },
  { name: 'San Antonio', country: 'Chile', lat: -33.5833, lon: -71.6167, region: 'South America', unlocode: 'CLSAI' },
  { name: 'Callao', country: 'Peru', lat: -12.0500, lon: -77.1500, region: 'South America', unlocode: 'PECLL' },
  { name: 'Guayaquil', country: 'Ecuador', lat: -2.2000, lon: -79.8833, region: 'South America', unlocode: 'ECGYE' },

  // OCEANIA
  { name: 'Sydney', country: 'Australia', lat: -33.8500, lon: 151.2167, region: 'Oceania', unlocode: 'AUSYD' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8333, lon: 144.9000, region: 'Oceania', unlocode: 'AUMEL' },
  { name: 'Brisbane', country: 'Australia', lat: -27.4667, lon: 153.0333, region: 'Oceania', unlocode: 'AUBNE' },
  { name: 'Fremantle', country: 'Australia', lat: -32.0500, lon: 115.7500, region: 'Oceania', unlocode: 'AUFRE' },
  { name: 'Port Hedland', country: 'Australia', lat: -20.3167, lon: 118.5667, region: 'Oceania', unlocode: 'AUPHE' },
  { name: 'Dampier', country: 'Australia', lat: -20.6500, lon: 116.7167, region: 'Oceania', unlocode: 'AUDAM' },
  { name: 'Newcastle (AUS)', country: 'Australia', lat: -32.9000, lon: 151.7833, region: 'Oceania', unlocode: 'AUNTL' },
  { name: 'Adelaide', country: 'Australia', lat: -34.7833, lon: 138.5000, region: 'Oceania', unlocode: 'AUADL' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8500, lon: 174.7833, region: 'Oceania', unlocode: 'NZAKL' },
  { name: 'Tauranga', country: 'New Zealand', lat: -37.6500, lon: 176.1833, region: 'Oceania', unlocode: 'NZTRG' },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2833, lon: 174.7833, region: 'Oceania', unlocode: 'NZWLG' },
];

// Sort by name for dropdowns
export const PORTS_SORTED = [...PORTS].sort((a, b) => a.name.localeCompare(b.name));

// Get unique countries
export const COUNTRIES = Array.from(new Set(PORTS.map((p) => p.country))).sort();

// Search ports
export function searchPorts(query: string): PortCoord[] {
  if (!query || query.length < 1) return PORTS_SORTED.slice(0, 20);
  const q = query.toLowerCase();
  return PORTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      (p.unlocode && p.unlocode.toLowerCase().includes(q))
  ).slice(0, 30);
}

// ============================================================
// HAVERSINE DISTANCE — Great Circle distance in nautical miles
// ============================================================
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Initial bearing in degrees (0-360, 0 = North)
export function initialBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ1 = (lon1 * Math.PI) / 180;
  const λ2 = (lon2 * Math.PI) / 180;
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

export function bearingToCompass(bearing: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(bearing / 22.5) % 16];
}
