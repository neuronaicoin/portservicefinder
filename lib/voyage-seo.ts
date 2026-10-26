// ============================================================
// Voyage Hub SEO content: one record per tool route under /voyage.
// Used by app/voyage/<slug>/layout.tsx (metadata) and
// components/VoyageToolSeo.tsx (on-page copy + JSON-LD).
// Keep every claim in line with what the tool page actually does.
// ============================================================

export type VoyageSeoCategory = 'operators' | 'ship' | 'hub';

export interface VoyageFaq {
  q: string;
  a: string;
}

export interface VoyageToolSeoEntry {
  /** Short display name used in links and breadcrumbs */
  name: string;
  /** <title> without the brand suffix, max 55 chars, primary keyword first */
  title: string;
  /** Meta description, 140-160 chars */
  description: string;
  /** 2-3 sentences: what it is and who it is for */
  intro: string;
  howTo: string[];
  faq: VoyageFaq[];
  keywords: string[];
  category: VoyageSeoCategory;
  related: string[];
}

export const VOYAGE_SEO: Record<string, VoyageToolSeoEntry> = {
  // ------------------------------------------------------------
  // OPERATOR / COMMERCIAL SIDE
  // ------------------------------------------------------------
  laytime: {
    name: 'Laytime & Demurrage Calculator',
    title: 'Laytime & Demurrage Calculator',
    description:
      'Free laytime calculator: log NOR and Statement of Facts events, exclude stoppages, and get demurrage or despatch due in a printable statement. No signup.',
    intro:
      'This laytime calculator turns a Statement of Facts into a laytime statement. You enter the charter party terms (allowed laytime in hours, demurrage rate, despatch at half, full or none), log NOR, commenced, stopped, resumed and completed times, and it works out time used, time excluded and the demurrage or despatch amount. It is built for operators, chartering desks, agents and masters who need a quick, checkable figure before the formal claim.',
    howTo: [
      'Enter the port call details: vessel, port, operation (loading, discharging or both) and cargo quantity.',
      'Add the charter party terms: allowed laytime in hours, demurrage rate per day, despatch basis and the claim time bar.',
      'Click "Add Standard Sequence" or add events one by one (NOR, Commenced, Stopped, Resumed, Completed) with exact date and time.',
      'Log each period that does not count (rain, Sunday or holiday under SHEX, breakdown) as a Stopped event (not counted) followed by a Resumed event, and add the reason.',
      'Check the quick preview, then open the full statement to print or save it as PDF.',
    ],
    faq: [
      {
        q: 'How is demurrage calculated?',
        a: 'Demurrage = (time counted minus allowed laytime) in days x the daily demurrage rate. Time counted is the period from laytime commencement to completion, less any excluded periods such as weather stoppages or excepted Sundays and holidays. This tool does that arithmetic from your SoF events.',
      },
      {
        q: 'What is the difference between SHINC and SHEX?',
        a: 'SHINC (Sundays and Holidays Included) means every day counts as laytime. SHEX (Sundays and Holidays Excepted) means Sundays and public holidays do not count unless the charter party says otherwise (for example "unless used"). In this calculator you record the excepted period as a stopped/resumed pair so it is deducted.',
      },
      {
        q: 'How is despatch calculated?',
        a: 'If the vessel finishes inside the allowed laytime, the time saved in days is multiplied by the despatch rate. Despatch is commonly half the demurrage rate; you can choose half rate, full rate or no despatch.',
      },
      {
        q: 'Does the calculator apply "once on demurrage, always on demurrage"?',
        a: 'No. Every stoppage you mark as excluded is deducted, including stoppages after laytime has expired. If your charter party applies the once-on-demurrage rule, do not mark later stoppages as excluded.',
      },
      {
        q: 'Does it work out SHEX periods from a calendar automatically?',
        a: 'No. The SHEX, SHINC, FHEX and NOR condition fields are recorded on the statement, but excluded periods come from the events you log. The Holidays Calendar tool lists port holidays and counts SHEX days to help you find them.',
      },
    ],
    keywords: [
      'laytime calculator',
      'demurrage calculator',
      'despatch calculation',
      'statement of facts',
      'SHINC SHEX',
      'laytime statement',
      'notice of readiness',
    ],
    category: 'operators',
    related: ['holidays', 'claims', 'documents', 'tce'],
  },

  tce: {
    name: 'TCE Calculator',
    title: 'TCE Calculator: Time Charter Equivalent',
    description:
      'Free TCE calculator for voyage estimates: freight (lump sum, $/MT or Worldscale), bunkers, port and canal costs, profit per day and TC comparison.',
    intro:
      'The TCE calculator is a voyage estimator for owners, operators and chartering brokers. It takes the freight, ballast and laden legs, speed and consumption, bunker prices, port and canal costs, and returns the time charter equivalent in dollars per day, total voyage days and the voyage result. You can also compare that result with a time charter hire rate for the same number of days.',
    howTo: [
      'Enter the vessel type and DWT, then the freight structure (lump sum, $/MT or Worldscale with flat rate), cargo quantity and commission.',
      'Add ballast and laden distances, service speed, consumption at sea, in port and at anchor, and bunker prices.',
      'Add each port call with its disbursement cost and days in port.',
      'Add canal fees and transit days (Suez, Panama, Kiel, Bosphorus or other) and any other costs such as insurance or war risk.',
      'Optionally enter a TC hire rate to compare, then open the full report for the TCE and profit and loss breakdown.',
    ],
    faq: [
      {
        q: 'How is TCE calculated?',
        a: 'TCE = (gross freight + demurrage earned - commission - voyage costs) / total voyage days. Voyage costs are bunkers, port costs, canal fees and other voyage-specific costs. Total days include ballast and laden sea time, port days and canal transit days.',
      },
      {
        q: 'How do I calculate Worldscale freight?',
        a: 'Worldscale freight = WS points / 100 x flat rate ($/MT) x cargo quantity. For example WS 85 on a $20.50 flat rate pays $17.425 per tonne. Select Worldscale as the freight type and enter the WS points and flat rate.',
      },
      {
        q: 'What is the difference between TCE and time charter hire?',
        a: 'Time charter hire is a fixed daily rate paid by the charterer, who also pays bunkers and port costs. TCE converts a voyage charter result into the same per-day figure so you can compare the two options directly.',
      },
      {
        q: 'Is the result a guaranteed voyage result?',
        a: 'No. It is an estimate. Actual results depend on weather, port performance, bunker prices paid and the final laytime outcome.',
      },
    ],
    keywords: [
      'TCE calculator',
      'time charter equivalent',
      'voyage estimate',
      'voyage calculator shipping',
      'Worldscale calculator',
      'freight calculator',
    ],
    category: 'operators',
    related: ['distance', 'bunker-plan', 'laytime', 'hire'],
  },

  hire: {
    name: 'Hire Statement Calculator',
    title: 'Hire Statement Calculator for Time Charter',
    description:
      'Build a time charter hire statement: gross hire, off-hire, bunkers on delivery and redelivery, CVE, address commission, brokerage and balance due.',
    intro:
      'This tool builds a time charter hire statement between owner and charterer. It calculates hire for the period from delivery to redelivery, deducts off-hire periods, adds or deducts bunkers on delivery and redelivery, pro-rates CVE, applies address commission and brokerage, and shows the balance after hire already paid. It suits operators, owners and accounts teams reconciling hire.',
    howTo: [
      'Enter vessel and charter details, then the delivery and redelivery date and time and the daily hire rate.',
      'Add each off-hire period (breakdown, deviation, detention) with start and end time.',
      'Enter bunker quantities and prices on delivery and on redelivery (VLSFO and MGO).',
      'Set CVE per month, address commission and brokerage percentages, and any other adjustments.',
      'Enter hire already paid to see the balance due to the owner, then print or save the statement.',
    ],
    faq: [
      {
        q: 'How is time charter hire calculated?',
        a: 'Gross hire = the hire rate per day x the days between delivery and redelivery. Off-hire time is deducted, then commissions, CVE and bunker adjustments are applied to reach the amount due to the owner.',
      },
      {
        q: 'Who pays for bunkers on delivery and redelivery?',
        a: 'Typically the charterer pays the owner for bunkers remaining on board at delivery, and the owner pays the charterer for bunkers on board at redelivery, at the prices agreed in the charter party.',
      },
      {
        q: 'What is CVE in a time charter?',
        a: 'CVE (communications, victualling and entertainment) is a lump sum per month paid by the charterer to the owner. This tool pro-rates it on on-hire days.',
      },
      {
        q: 'What is address commission?',
        a: 'Address commission is a percentage of hire retained by the charterer, separate from brokerage paid to the brokers. Both are usually deducted from hire on the statement.',
      },
    ],
    keywords: [
      'hire statement',
      'time charter hire calculation',
      'off-hire calculation',
      'bunkers on delivery redelivery',
      'CVE time charter',
      'address commission',
    ],
    category: 'operators',
    related: ['claims', 'bunker', 'tce', 'bunker-plan'],
  },

  cii: {
    name: 'CII, EU ETS & FuelEU Calculator',
    title: 'CII Calculator with EU ETS & FuelEU Cost',
    description:
      'Free CII calculator: estimate your A to E rating, CO2 emissions, EU ETS allowance cost and FuelEU Maritime position from fuel consumption and distance.',
    intro:
      'This compliance calculator estimates a ship\'s Carbon Intensity Indicator (CII) rating from A to E, total CO2 from the fuels burned, the EU ETS allowance cost for a voyage and the FuelEU Maritime balance. It covers 15 fuel types including VLSFO, MGO, LNG, methanol and biofuel blends. It is meant for technical managers, operators and charterers who want an indicative figure before verified data is available.',
    howTo: [
      'Enter vessel type, DWT and GT, and the reporting year.',
      'Enter the voyage distance and the annual distance used for the CII rating.',
      'Add each fuel burned with its quantity in tonnes; CO2 factors are applied automatically.',
      'Choose the EU ETS voyage type (EU to EU, EU to non-EU, port stay and so on) and the current EUA price.',
      'Switch on FuelEU Maritime if relevant, then open the report for rating, ETS cost and total compliance cost.',
    ],
    faq: [
      {
        q: 'What is the CII rating?',
        a: 'The Carbon Intensity Indicator is an IMO measure of grams of CO2 emitted per unit of transport work (capacity x nautical miles). Ships of 5,000 GT and above receive an annual rating from A to E against a required value that tightens each year.',
      },
      {
        q: 'How is CII calculated?',
        a: 'Attained CII = annual CO2 emissions / (capacity x distance sailed). Capacity is DWT for most ship types and GT for some passenger and ro-ro types. The rating comes from the ratio of attained to required CII, where required CII is the reference line reduced by the factor for that year.',
      },
      {
        q: 'What happens if a ship gets a D or E rating?',
        a: 'A ship rated D for three consecutive years, or E in a single year, must submit a corrective action plan as part of its SEEMP. The calculator flags when corrective action would be required.',
      },
      {
        q: 'How much EU ETS cost does a voyage carry?',
        a: 'EU ETS covers 100% of emissions on voyages between EU ports and at berth in EU ports, and 50% on voyages into or out of the EU. Surrender was phased in at 40% for 2024 and 70% for 2025, rising to 100% from 2026. Cost = covered CO2 x phase-in x EUA price.',
      },
      {
        q: 'How accurate is this CII calculator?',
        a: 'It is indicative. It uses a single average set of rating boundaries across ship types, while the official boundaries differ by ship type, and it scales voyage fuel to a full year by distance. Use your verifier\'s DCS figures for filing.',
      },
    ],
    keywords: [
      'CII calculator',
      'carbon intensity indicator',
      'CII rating',
      'EU ETS shipping calculator',
      'FuelEU Maritime calculator',
      'EUA cost shipping',
      'IMO DCS',
    ],
    category: 'operators',
    related: ['noon', 'tracker', 'marpol', 'bunker-plan'],
  },

  bunker: {
    name: 'CP Performance Claim Calculator',
    title: 'Charter Party Speed & Consumption Claim Tool',
    description:
      'Compare actual speed and fuel against charter party warranties in good weather only. Get the speed claim, overconsumption claim and off-hire value.',
    intro:
      'This charter party performance tool compares a voyage\'s actual speed and fuel consumption with the warranted figures, using the good weather period only. It returns time lost, the speed claim value at the hire rate, excess fuel and its cost, any off-hire value and the net claim position. It is aimed at operators, charterers and owners settling performance claims on a time charter.',
    howTo: [
      'Enter voyage details: vessel, ports, sailing and arrival times, charter type and laden or ballast condition.',
      'Enter the charter party warranties: speed laden and ballast, main engine and auxiliary consumption, and the good weather definition (Beaufort and sea state).',
      'Enter the actual averages from the noon reports: total days, distance, average speed and consumption.',
      'Split the voyage hours into good weather, bad weather and adverse current hours.',
      'Add off-hire hours, hire rate and bunker prices, then open the full report for the claim summary.',
    ],
    faq: [
      {
        q: 'How is a speed and consumption claim calculated?',
        a: 'Only the good weather period is assessed. Time lost = good weather distance / actual speed minus good weather distance / warranted speed, valued at the hire rate. Overconsumption = (actual minus warranted daily consumption) x good weather days, valued at the bunker price.',
      },
      {
        q: 'What counts as good weather in a charter party?',
        a: 'Usually the charter party defines it, commonly winds up to Beaufort force 4 and Douglas sea state 3, often with no adverse currents. You enter the limits that apply to your contract.',
      },
      {
        q: 'Why are adverse currents excluded?',
        a: 'Adverse currents reduce speed over ground through no fault of the vessel, so the hours you log as adverse current are not counted as good weather time.',
      },
      {
        q: 'Is the result ready to submit as a claim?',
        a: 'It is a working figure. Have the analysis checked independently (for example by a weather routing provider) before submitting it to the other party.',
      },
    ],
    keywords: [
      'speed and consumption claim',
      'charter party performance',
      'overconsumption claim',
      'good weather method',
      'CP performance calculator',
      'underperformance claim',
    ],
    category: 'operators',
    related: ['noon', 'tracker', 'claims', 'hire'],
  },

  'bunker-plan': {
    name: 'Bunker Planner',
    title: 'Bunker Planner & ROB Calculator',
    description:
      'Plan voyage bunkers leg by leg: sea, port, canal, anchorage and bunker stops, with ROB tracking, safety and weather margins, tank checks and total cost.',
    intro:
      'The bunker planner works out how much fuel a ship needs from delivery to redelivery. You add the voyage in legs (sea, port stay, canal, anchorage, bunker stop), and it tracks ROB of main fuel and MGO through each leg, adds reserve and weather margins, checks tank capacity and estimates the cost. It is for operators and superintendents planning stems on time or voyage charters.',
    howTo: [
      'Enter the vessel, charter type, main fuel and the ROB on delivery for main fuel, MGO and ECA fuel.',
      'Set the target ROB required at redelivery.',
      'Add each leg in order: sea legs with distance, speed and consumption; port, anchorage and canal stays in days; bunker stops with quantity and price.',
      'Set reserve and weather margins as percentages, plus tank capacities and default prices.',
      'Review the bunker to lift, minimum ROB during the voyage, warnings and total bunker cost.',
    ],
    faq: [
      {
        q: 'How do I calculate how much bunker to order?',
        a: 'Bunker to lift = total consumption for the voyage + target ROB at the end - ROB now, plus a safety reserve. This planner adds your reserve and weather margins and subtracts fuel already planned at bunker stops.',
      },
      {
        q: 'What does ROB mean?',
        a: 'ROB means Remaining On Board: the quantity of each fuel grade in the tanks at a given moment, usually reported in metric tonnes.',
      },
      {
        q: 'What safety margin should I use for bunkers?',
        a: 'Many companies use a reserve of a few days\' consumption or a percentage of voyage consumption, plus a weather margin on long ocean legs. Follow your company policy; the planner lets you set both percentages.',
      },
      {
        q: 'Does the planner warn me if I will run short?',
        a: 'Yes. It flags a fuel shortage, a very low minimum ROB during the voyage and when planned bunkers would exceed tank capacity.',
      },
    ],
    keywords: [
      'bunker planner',
      'bunker calculation',
      'ROB calculator',
      'bunker requirement',
      'fuel planning ship',
      'bunker stem planning',
    ],
    category: 'operators',
    related: ['bunker-prices', 'planner', 'distance', 'tce'],
  },

  'bunker-prices': {
    name: 'Bunker Price Tracker',
    title: 'Bunker Price Tracker & Port Comparison',
    description:
      'Log bunker quotes by port and fuel grade, rank the cheapest ports and see the saving on your next stem. You enter the prices; data stays in your browser.',
    intro:
      'The bunker price tracker is a private log of the bunker quotes you receive. Enter prices by port, date, grade and supplier, and it ranks ports from cheapest to most expensive and shows how much a given stem quantity saves at the cheaper port. There is no live price feed: you add the quotes from your broker, supplier or price service.',
    howTo: [
      'Click "Add Price" and enter the port, date, fuel grade, price per tonne and supplier.',
      'Repeat for each quote you receive.',
      'In Stem Planning, choose the fuel grade and stem quantity you want to compare.',
      'Read the cheapest port, the price spread and the stem saving, then filter the log by fuel.',
    ],
    faq: [
      {
        q: 'Does this tool show live bunker prices?',
        a: 'No. It is a tracker for quotes you enter yourself. Get current prices from your broker, supplier or a price service, then log them here to compare.',
      },
      {
        q: 'How do I compare bunker prices between ports?',
        a: 'Log the latest quote for each port in the same grade. The tracker sorts ports by price and multiplies the spread by your stem quantity to show the saving.',
      },
      {
        q: 'What is a bunker stem?',
        a: 'A stem is a confirmed bunker order: the grade, quantity, port, supplier and delivery date agreed for a vessel.',
      },
      {
        q: 'Is cheapest always best?',
        a: 'Not always. Deviation time, barge availability, delivery delays and fuel quality all affect the real cost. Use the saving figure as one input to the decision.',
      },
    ],
    keywords: [
      'bunker prices',
      'bunker price comparison',
      'VLSFO price by port',
      'bunker quote tracker',
      'bunker stem',
    ],
    category: 'operators',
    related: ['bunker-plan', 'disbursement', 'indices', 'tce'],
  },

  planner: {
    name: 'Voyage Planner',
    title: 'Voyage Planner: Sea Route, ETA & Fuel',
    description:
      'Plan a passage port to port: land-avoiding sea route, distance, ETA, fuel burn and ROB on arrival, plus a wind, wave and current outlook along the track.',
    intro:
      'The voyage planner lays out a passage between two ports on a map. It can draw a land-avoiding sea route automatically or follow waypoints you add (canals, capes, straits), then gives leg distances, courses, sea time, ETA and fuel burn with a sea margin. Once the route is set you can load a forecast of wind, wave height and current along the track from Open-Meteo (about 16 days ahead).',
    howTo: [
      'Choose the departure and arrival ports; keep "Auto sea route" on or add common waypoints such as Suez Canal or Cape of Good Hope.',
      'Enter vessel particulars, service speed, consumption at sea and sea margin.',
      'Enter departure date and time, bunker ROB, auxiliary consumption and port days at arrival.',
      'Read the passage summary: distance, sea time, ETA and ROB on arrival.',
      'Load the weather and move the ship along the route to see the outlook for each day.',
    ],
    faq: [
      {
        q: 'How do I calculate ETA for a sea passage?',
        a: 'ETA = departure time + distance / speed, adjusted for any sea margin and waypoints. The planner adds your sea margin and shows the ETA for the whole route.',
      },
      {
        q: 'Can I use the route for navigation?',
        a: 'No. It is a planning figure. Distances are great-circle legs between points on the route, not a navigated track. Always plan the passage on approved charts.',
      },
      {
        q: 'Where does the weather data come from?',
        a: 'Wind, wave and current forecasts come from Open-Meteo, with a horizon of about 16 days. Days beyond the forecast are marked as such.',
      },
      {
        q: 'Does the planner tell me if I have enough fuel?',
        a: 'Yes. It estimates fuel burn for the passage and warns when the departure ROB is not enough at the entered consumption.',
      },
    ],
    keywords: [
      'voyage planner',
      'passage planning tool',
      'sea route calculator',
      'ETA calculator ship',
      'weather routing',
      'voyage fuel calculator',
    ],
    category: 'operators',
    related: ['distance', 'weather', 'bunker-plan', 'tide'],
  },

  distance: {
    name: 'Port Distance Calculator',
    title: 'Port to Port Distance Calculator & ETA',
    description:
      'Free sea distance calculator: great-circle distance between 200+ ports or custom coordinates, with sea days, fuel and cost at several speeds side by side.',
    intro:
      'The distance calculator gives the great-circle distance and initial bearing between two ports, or between any two sets of coordinates. It then builds a table of sea days, total days, daily consumption, total fuel and fuel cost at several speeds, scaling consumption with the cube of speed. It is useful for quick estimates by operators, brokers and officers.',
    howTo: [
      'Type the departure and arrival ports, or open the advanced section to enter coordinates or override the distance.',
      'Enter the base speed, consumption at that speed, bunker price and port stay days.',
      'List the speeds you want to compare, separated by commas.',
      'Read the speed table and save or print the result.',
    ],
    faq: [
      {
        q: 'How is the distance between two ports calculated?',
        a: 'This tool uses the great-circle distance, the shortest path over the earth\'s surface. Real sea routes are longer because of land, canals, traffic separation schemes and routing, so add a margin or enter the actual distance in the override field.',
      },
      {
        q: 'How does speed affect fuel consumption?',
        a: 'Daily consumption rises roughly with the cube of speed, so a 10% reduction in speed cuts daily consumption by about 27%. The table uses this cube-law approximation.',
      },
      {
        q: 'How many days will the voyage take?',
        a: 'Sea days = distance / (speed x 24). The table shows sea days and total days including port stay for each speed you enter.',
      },
      {
        q: 'Which ports are included?',
        a: 'More than 200 major ports worldwide are in the search list. For any other place, enter latitude and longitude.',
      },
    ],
    keywords: [
      'port distance calculator',
      'sea distance calculator',
      'nautical miles between ports',
      'voyage ETA calculator',
      'ship fuel consumption speed',
    ],
    category: 'operators',
    related: ['planner', 'tce', 'bunker-plan', 'ports'],
  },

  tracker: {
    name: 'Voyage Performance Tracker',
    title: 'Voyage Performance Tracker vs CP',
    description:
      'Set up a voyage, add noon reports and track speed, consumption, weather and ROB against charter party warranties with a predicted ETA after each report.',
    intro:
      'The voyage tracker follows a single voyage from sailing to arrival. You set up the voyage and charter party warranties, then add each day\'s noon report (position, distance, speed, consumption, ROB and weather). It shows progress, average speed and consumption against the warranty, good and bad weather reports, bunker cost so far and a predicted ETA.',
    howTo: [
      'In Voyage Setup, enter the voyage, total distance, ETD, original ETA and cargo.',
      'Enter the charter party speed, consumption and good weather criteria.',
      'Enter initial bunker ROB and fuel prices.',
      'Add a noon report each day with distance run, speed, consumption, ROB and weather.',
      'Open the Analysis tab for performance against the charter party and the predicted ETA.',
    ],
    faq: [
      {
        q: 'How do I monitor vessel performance during a voyage?',
        a: 'Compare each day\'s speed and consumption from the noon report with the warranted figures, separating good weather days from bad weather days. This tracker does that automatically as reports are added.',
      },
      {
        q: 'How is the predicted ETA worked out?',
        a: 'Remaining distance is divided by the average speed achieved so far and added to the time of the last report.',
      },
      {
        q: 'What is the difference between this and the Noon Report Manager?',
        a: 'Both log noon reports. The tracker adds a full voyage setup with cargo and bunker cost tracking; the Noon Report Manager is a lighter daily log with slip, RPM and current fields.',
      },
      {
        q: 'Can I turn the result into a claim?',
        a: 'Use the averages from the tracker in the CP Performance tool, which calculates the speed and overconsumption claim for the good weather period.',
      },
    ],
    keywords: [
      'voyage tracker',
      'vessel performance monitoring',
      'noon report analysis',
      'charter party performance',
      'predicted ETA',
    ],
    category: 'operators',
    related: ['noon', 'bunker', 'fleet', 'claims'],
  },

  noon: {
    name: 'Noon Report Manager',
    title: 'Noon Report Manager & Analysis',
    description:
      'Log daily noon reports with position, distance, speed, slip, RPM, consumption, ROB and weather, and compare them with CP warranties. Free, in your browser.',
    intro:
      'The noon report manager is a daily log for the 24-hour report sent from ship to office. It records position, steaming hours, distance, speed, slip, RPM, main and auxiliary consumption, ROB, Beaufort, sea state, swell and current, then compares the averages with the charter party speed and consumption. Progress and ETA update with each report.',
    howTo: [
      'Enter the voyage setup: vessel, ports, total distance and the charter party speed and consumption.',
      'Click "Add Noon Report" and fill in date, time (UTC), position, distance and steaming hours.',
      'Add consumption, ROB and weather (Beaufort, sea state, swell, current).',
      'Open the Analysis tab to see averages, good weather days and the daily log against the warranty.',
    ],
    faq: [
      {
        q: 'What is a noon report?',
        a: 'A noon report is the daily report a ship sends to its owner, manager or charterer, usually at local noon. It covers position, distance run, average speed, fuel consumption, ROB and weather for the past 24 hours.',
      },
      {
        q: 'What should a noon report include?',
        a: 'At minimum: date and time, position, steaming hours, distance, average speed, main and auxiliary engine consumption, ROB per grade, wind force and direction, sea state and swell. Many companies also ask for RPM, slip and current.',
      },
      {
        q: 'What counts as a good weather day?',
        a: 'A common definition is Beaufort 4 or less with sea state 3 or less and swell up to 2 metres, but your charter party governs. The analysis uses this common definition.',
      },
      {
        q: 'How is average speed calculated from noon reports?',
        a: 'Average speed = distance run / steaming hours. If you leave speed at 0 the tool calculates it for you.',
      },
    ],
    keywords: [
      'noon report',
      'noon report template',
      'noon report format',
      'ship daily report',
      'vessel performance report',
    ],
    category: 'operators',
    related: ['tracker', 'bunker', 'cii', 'fleet'],
  },

  claims: {
    name: 'Claims Center',
    title: 'Shipping Claims Register: Demurrage & Off-Hire',
    description:
      'Track demurrage, despatch, off-hire and speed or consumption claims in one register, with time-bar countdowns, status and a running net position.',
    intro:
      'The claims center is a register for the commercial claims on a voyage or charter. For each claim it calculates a working amount (demurrage or despatch, off-hire hire and bunkers, speed and consumption), tracks status from draft to paid, and counts down to the time bar from the event end date. The running net position shows who owes whom.',
    howTo: [
      'Enter the voyage reference, vessel, charterer and charter party date.',
      'Add a claim and pick its type: demurrage or despatch, off-hire, speed or consumption, or other.',
      'Fill in the figures for that type and the event end date and time bar in days.',
      'Update the status (draft, submitted, agreed, paid, disputed) as the claim moves on.',
      'Watch the time-bar warnings and the net position across all claims.',
    ],
    faq: [
      {
        q: 'What is a time bar in a charter party?',
        a: 'A time bar is the deadline in the charter party for presenting a claim with full supporting documents, often 90 days from completion of discharge. A claim presented late can be lost entirely.',
      },
      {
        q: 'How is an off-hire claim calculated?',
        a: 'Off-hire = off-hire hours / 24 x the daily hire rate, plus the value of bunkers consumed during the off-hire period. The amount is credited to the charterer.',
      },
      {
        q: 'How is a demurrage claim calculated?',
        a: 'Demurrage = (laytime used minus laytime allowed) in hours / 24 x the demurrage rate. For a full SoF-based calculation, use the Laytime & Demurrage Calculator.',
      },
      {
        q: 'Can I track claims across a whole voyage?',
        a: 'Yes. Add as many claims as you need under one voyage reference; the register totals what is owed to the owner and to the charterer.',
      },
    ],
    keywords: [
      'demurrage claim',
      'off-hire claim',
      'charter party time bar',
      'shipping claims register',
      'despatch claim',
    ],
    category: 'operators',
    related: ['laytime', 'bunker', 'hire', 'photos'],
  },

  disbursement: {
    name: 'Disbursement Account Tracker',
    title: 'Port Disbursement Account (DA) Tracker',
    description:
      'Compare estimate, pro-forma DA and final DA line by line for each port call, flag variances above your threshold and check totals before you settle.',
    intro:
      'The disbursement tracker compares three figures for every port cost item: your own estimate, the agent\'s pro-forma disbursement account and the final DA. It flags items where the final exceeds the pro-forma by more than your chosen percentage, and totals each port call and the whole voyage. It is for operators and accounts teams checking agency accounts.',
    howTo: [
      'Enter the voyage reference, currency and variance threshold in percent.',
      'Add a port call with port, agent, call type and dates.',
      'Add line items (port dues, pilotage, towage, agency fee and so on) with estimate, pro-forma and final amounts.',
      'Review the flagged items and ask the agent for vouchers before settling.',
    ],
    faq: [
      {
        q: 'What is a proforma disbursement account?',
        a: 'A proforma DA (PDA) is the port agent\'s advance estimate of all port costs for a call, usually funded by the owner or operator before arrival.',
      },
      {
        q: 'What is a final disbursement account?',
        a: 'The final DA (FDA) is the agent\'s actual account after the call, supported by vouchers. The difference to the advance is then settled.',
      },
      {
        q: 'What is a normal DA variance?',
        a: 'It depends on the port and the call, which is why you set your own threshold. Any item where the final exceeds the pro-forma by more than that percentage is flagged.',
      },
      {
        q: 'What items appear on a port disbursement account?',
        a: 'Typical items include port and light dues, pilotage, towage, mooring, berth hire, agency fee, launch hire, garbage removal and communication costs.',
      },
    ],
    keywords: [
      'disbursement account',
      'proforma DA',
      'final DA',
      'port costs',
      'port disbursement',
      'agency fee',
    ],
    category: 'operators',
    related: ['tce', 'congestion', 'contacts', 'bunker-prices'],
  },

  indices: {
    name: 'Baltic Index Tracker',
    title: 'Baltic Dry Index Tracker (BDI, BCI, BPI)',
    description:
      'Log Baltic Dry Index and sub-index readings (BCI, BPI, BSI, BHSI) or your own route rate, and chart the trend and day-on-day change. Free and private.',
    intro:
      'The market indices tool is a personal log of the Baltic dry bulk indices. You enter the daily published figure for the BDI or the Capesize, Panamax, Supramax and Handysize sub-indices, or a custom series such as your own route TCE, and it charts the trend with high, low and day-on-day change. It has no live feed; figures are entered by you.',
    howTo: [
      'Choose an index: BDI, BCI, BPI, BSI, BHSI or Custom.',
      'Click "Add Reading" and enter the date and value.',
      'Repeat each business day to build the series.',
      'Read the chart, high, low and change, and print the log if needed.',
    ],
    faq: [
      {
        q: 'What is the Baltic Dry Index?',
        a: 'The BDI is a daily composite index of dry bulk freight published by the Baltic Exchange in London. It combines the Capesize, Panamax and Supramax time charter averages.',
      },
      {
        q: 'What do BCI, BPI, BSI and BHSI stand for?',
        a: 'Baltic Capesize Index, Baltic Panamax Index, Baltic Supramax Index and Baltic Handysize Index: the sub-indices for each dry bulk size segment.',
      },
      {
        q: 'Does this tool show the live BDI?',
        a: 'No. You enter the published figure yourself. The Baltic Exchange publishes the indices each London business day.',
      },
      {
        q: 'Can I track my own freight rate?',
        a: 'Yes. Choose Custom and give it a label, for example a specific route TCE in dollars per day.',
      },
    ],
    keywords: [
      'Baltic Dry Index',
      'BDI tracker',
      'Capesize index',
      'Panamax index',
      'dry bulk freight index',
    ],
    category: 'operators',
    related: ['tce', 'bunker-prices', 'congestion', 'fleet'],
  },

  congestion: {
    name: 'Port Congestion Log',
    title: 'Port Congestion Log & Berthing Estimate',
    description:
      'Log vessels waiting and average waiting days by port from agent reports, rank congestion levels and estimate your berthing date from your ETA. Free.',
    intro:
      'This tool keeps a log of port congestion reports from your agents or own observations: vessels waiting, average wait in days and free berths. It ranks ports from clear to severe and projects a berthing date for your ship by adding the latest average wait to your ETA. There is no live AIS feed; the data is what you enter.',
    howTo: [
      'Click "Add Report" and enter the port, date, vessels waiting, average wait and source.',
      'Repeat as new agent reports come in.',
      'Under My Berthing Estimate, enter your port and ETA.',
      'Read the projected berthing date and the congestion ranking by port.',
    ],
    faq: [
      {
        q: 'How do I estimate waiting time at a congested port?',
        a: 'Ask the agent for the number of vessels waiting and the current average wait. Adding that average to your ETA gives an indicative berthing date, which this tool calculates.',
      },
      {
        q: 'How are congestion levels banded?',
        a: 'By average wait: under 3 days clear or light, 3 to 7 days moderate, 7 to 14 days heavy, and more than 14 days severe.',
      },
      {
        q: 'Does the tool use AIS data?',
        a: 'No. It relies on agent reports and your own observations, which you log manually.',
      },
      {
        q: 'Who pays for waiting time at a congested port?',
        a: 'It depends on the charter party: whether NOR can be tendered on arrival (for example WIBON) and whether waiting time counts as laytime. Check the contract terms.',
      },
    ],
    keywords: [
      'port congestion',
      'vessel waiting time',
      'berthing estimate',
      'port congestion report',
      'anchorage waiting time',
    ],
    category: 'operators',
    related: ['laytime', 'disbursement', 'ports', 'fleet'],
  },

  fleet: {
    name: 'Fleet Dashboard',
    title: 'Fleet Dashboard for Vessel Operators',
    description:
      'See all your vessels on one screen: status, route progress, ETA, delay, ROB and demurrage exposure, with delayed ships sorted first. Free, no signup.',
    intro:
      'The fleet dashboard is a single-screen overview of the ships you operate. For each vessel you record status, route, progress, ETA, delay, ROB and current demurrage exposure, and the dashboard sorts delayed and on-demurrage vessels to the top. It links each ship to the tracker, noon report and claims tools.',
    howTo: [
      'Click "Add Vessel" and enter name, IMO, type and charterer.',
      'Set the status (at sea, in port, loading, discharging, at anchor, idle) and the route.',
      'Enter progress, ETA, delay in days, demurrage exposure and ROB.',
      'Filter by status and update each card as reports come in.',
    ],
    faq: [
      {
        q: 'What is a fleet dashboard?',
        a: 'A fleet dashboard shows the position and commercial status of every vessel in one view, so an operator can see at a glance which ships are delayed or incurring demurrage.',
      },
      {
        q: 'Does it track ships by AIS automatically?',
        a: 'No. You update status, progress and ETA yourself, so it works for any vessel without a data subscription.',
      },
      {
        q: 'Where is the data stored?',
        a: 'In your browser\'s local storage on this device. Nothing is sent to a server.',
      },
      {
        q: 'Which vessels appear first?',
        a: 'Vessels on demurrage and delayed vessels are sorted to the top, then the rest.',
      },
    ],
    keywords: [
      'fleet dashboard',
      'fleet management tool',
      'vessel operations dashboard',
      'demurrage exposure',
      'ship operator tool',
    ],
    category: 'operators',
    related: ['tracker', 'noon', 'claims', 'congestion'],
  },

  // ------------------------------------------------------------
  // SHIP SIDE
  // ------------------------------------------------------------
  draft: {
    name: 'Draft Survey Calculator',
    title: 'Draft Survey Calculator for Cargo Weight',
    description:
      'Free draft survey calculator: six-point drafts, quarter-mean, trim and density corrections, hog and sag, deductibles and the difference to B/L quantity.',
    intro:
      'This draft survey calculator estimates cargo weight from initial and final draft readings. It takes the six draft marks, applies perpendicular corrections, the quarter-mean draft, first and second trim corrections and the density correction, deducts bunkers, ballast, fresh water and the ship constant, and compares the result with the bill of lading figure. It is a practice and cross-check tool for officers and surveyors.',
    howTo: [
      'Enter vessel constants from the hydrostatic tables: LBP, TPC, MTC and LCF.',
      'For the initial survey, enter port and starboard drafts forward, midship and aft, plus mark distance corrections.',
      'Enter the observed sea water density and the deductibles (fuel, fresh water, ballast, constant).',
      'Repeat for the final survey.',
      'Enter the B/L quantity if you want the difference shown, then read the cargo quantity result.',
    ],
    faq: [
      {
        q: 'How is a draft survey calculated?',
        a: 'Mean drafts are corrected to the perpendiculars, combined into the quarter-mean draft, and used to find displacement. Trim and density corrections are applied, deductibles are subtracted, and the difference between initial and final net displacement is the cargo weight.',
      },
      {
        q: 'What is the quarter-mean draft?',
        a: 'Quarter-mean draft = (forward + aft + 6 x midship) / 8. It allows for hog or sag of the hull.',
      },
      {
        q: 'What is the first trim correction formula?',
        a: 'First trim correction = trim x LCF x TPC x 100 / LBP, with trim and LCF in metres and TPC in tonnes per centimetre.',
      },
      {
        q: 'Can I use the result for a commercial survey?',
        a: 'No. Displacement here is a simplified approximation from TPC, not read from the ship\'s hydrostatic tables. For a commercial survey, displacement must come from the approved tables.',
      },
    ],
    keywords: [
      'draft survey calculator',
      'draught survey',
      'quarter mean draft',
      'trim correction',
      'cargo weight by draft',
      'density correction',
    ],
    category: 'ship',
    related: ['stability', 'cargo', 'documents', 'tide'],
  },

  cargo: {
    name: 'Bulk Cargo Database',
    title: 'Bulk Cargo Stowage Factor Database',
    description:
      'Search 68 cargoes for stowage factor, angle of repose and IMSBC group (A, B or C), with carriage notes and a hold volume calculator. Free to use.',
    intro:
      'The cargo database lists 68 common bulk and general cargoes with typical stowage factor, angle of repose, IMSBC group and carriage and care notes. A built-in hold volume calculator works out the volume needed for a given quantity, or the maximum cargo that fits in a given volume, with a broken stowage allowance. It is for deck officers, planners and brokers.',
    howTo: [
      'Search by cargo name, UN number or hazard, or filter by category and IMSBC group.',
      'Open a cargo to read its stowage factor, angle of repose and carriage notes.',
      'Click "Use in Hold Calculator" to load its stowage factor.',
      'Enter quantity and broken stowage, or available hold volume, to get volume needed or maximum cargo.',
    ],
    faq: [
      {
        q: 'What is a stowage factor?',
        a: 'Stowage factor is the volume a cargo occupies per tonne, in cubic metres per metric tonne (m3/MT). Multiply by about 35.88 to convert to cubic feet per long ton.',
      },
      {
        q: 'What are IMSBC Group A, B and C cargoes?',
        a: 'Group A cargoes may liquefy if moisture exceeds the Transportable Moisture Limit. Group B cargoes have a chemical hazard. Group C cargoes are neither liquefiable nor chemically hazardous.',
      },
      {
        q: 'How do I calculate the hold space needed?',
        a: 'Volume needed = quantity x stowage factor x (1 + broken stowage). Broken stowage is near 0% for trimmed bulk and can be 10 to 25% for bagged or break-bulk cargo.',
      },
      {
        q: 'Are the figures exact for my cargo?',
        a: 'No. They are typical ranges from the IMSBC Code and standard references. The shipper\'s declaration and cargo documents govern.',
      },
    ],
    keywords: [
      'stowage factor',
      'IMSBC code',
      'bulk cargo database',
      'angle of repose',
      'Group A cargo liquefaction',
      'hold volume calculator',
    ],
    category: 'ship',
    related: ['draft', 'stability', 'lashing', 'tce'],
  },

  stability: {
    name: 'Ship Stability Check',
    title: 'Ship Stability Calculator: KG, GM & Trim',
    description:
      'Quick ship stability check: displacement, KG, free surface correction, fluid GM and approximate trim from a weight list. Indicative only, free to use.',
    intro:
      'The stability check gives a quick estimate of displacement, KG, free surface correction, fluid GM and approximate trim from a list of weights. You enter lightship and hydrostatic values from the stability book and each deadweight item with its LCG, VCG and free surface moment. It flags GM below the 0.15 m minimum and negative GM. It is an indicative check and does not replace the approved loading computer.',
    howTo: [
      'Enter lightship weight, LCG and KG, plus LBP, KM, MTC, TPC and LCF for the approximate draft.',
      'Add each deadweight item (cargo, fuel, ballast, stores) with weight, LCG and VCG.',
      'Enter the free surface moment for slack tanks.',
      'Read displacement, KG, GM (solid and fluid) and approximate trim.',
    ],
    faq: [
      {
        q: 'How is GM calculated?',
        a: 'GM = KM - KG. KG is the sum of (weight x VCG) divided by displacement. The free surface correction (total free surface moment / displacement) is added to KG to give the fluid GM.',
      },
      {
        q: 'What is the minimum GM for a ship?',
        a: 'The IMO Intact Stability Code requires an initial GM of at least 0.15 m, along with GZ curve criteria. Many ships and cargoes have higher requirements in the stability booklet.',
      },
      {
        q: 'What is free surface effect?',
        a: 'Liquid in a slack tank moves as the ship heels, which raises the effective centre of gravity and reduces GM. It is accounted for with the tank\'s free surface moment.',
      },
      {
        q: 'Does this tool check the GZ curve and weather criterion?',
        a: 'No. GZ curve, weather criterion, grain, timber and damage stability are not calculated. Use the approved loading instrument.',
      },
    ],
    keywords: [
      'ship stability calculator',
      'GM calculation',
      'KG calculation',
      'free surface correction',
      'trim calculation',
    ],
    category: 'ship',
    related: ['draft', 'lashing', 'cargo', 'tide'],
  },

  lashing: {
    name: 'Cargo Lashing Calculator',
    title: 'Cargo Lashing Calculator (CSS Code)',
    description:
      'Check transverse sliding of a cargo unit with a simplified CSS Code balance-of-forces method: friction, lashing MSL and angles. Indicative and free.',
    intro:
      'The lashing calculator checks whether a cargo unit is secured against transverse sliding in heavy weather. It uses simplified CSS Code accelerations scaled by stowage position, ship length, speed and GM, and compares the external force with friction plus the transverse holding of each lashing based on its MSL and angles. It is for deck officers and supercargoes making a quick check.',
    howTo: [
      'Enter the cargo unit weight, stowage position (forward, midship or aft) and friction surface.',
      'Optionally enter LBP, speed and GM to refine the accelerations.',
      'Add lashings with type, MSL in kN, vertical and horizontal angles and count.',
      'Read the transverse force, total resistance and whether securing is adequate.',
    ],
    faq: [
      {
        q: 'What is MSL in cargo securing?',
        a: 'Maximum Securing Load is the allowable load on a lashing device. For wire and chain it is often taken as about half the breaking load; use the value from your Cargo Securing Manual.',
      },
      {
        q: 'How do I calculate lashing requirements?',
        a: 'The balance-of-forces method compares the transverse external force (mass x g x transverse acceleration) with friction plus the transverse components of the lashings. Securing is adequate when resistance is equal to or greater than the force.',
      },
      {
        q: 'Does the tool check tipping?',
        a: 'No. It checks transverse sliding only. Tipping, racking and the full CSS Code Annex 13 advanced calculation are not included.',
      },
      {
        q: 'Can I rely on the result for securing?',
        a: 'No. It is indicative. The ship\'s approved Cargo Securing Manual and class requirements govern.',
      },
    ],
    keywords: [
      'lashing calculator',
      'CSS Code Annex 13',
      'cargo securing calculation',
      'MSL lashing',
      'heavy lift lashing',
    ],
    category: 'ship',
    related: ['stability', 'weather', 'cargo', 'photos'],
  },

  psc: {
    name: 'PSC Sentry',
    title: 'PSC Deficiency Codes & Inspection Checklist',
    description:
      'Search PSC deficiency codes, detention risk and action codes, open MoU inspection databases by IMO number, and prepare for the current CIC campaign.',
    intro:
      'PSC Sentry is a reference for Port State Control preparation. It has a searchable deficiency code list with detention risk, typical action and rectification, the standard PSC action codes, one-click links to Equasis, GISIS and the regional MoU inspection databases for a given IMO number, and self-check lists for concentrated inspection campaigns. It is for masters, chief engineers and superintendents.',
    howTo: [
      'Search deficiency codes by code, description or convention, and filter by category or detention risk.',
      'Open a code to see the regulation, typical action and how to rectify it.',
      'In MoU Databases, enter an IMO number to open its inspection history on each official site.',
      'Use the CIC tab checklists and the action code reference to prepare before arrival.',
    ],
    faq: [
      {
        q: 'What are PSC action codes?',
        a: 'Action codes tell the ship what to do about a deficiency, for example code 17 (rectify before departure) or code 30 (ship detained). The tool lists the standard codes and their meaning.',
      },
      {
        q: 'How can I check a ship\'s PSC history?',
        a: 'Search by IMO number on Equasis, the Paris MoU and Tokyo MoU databases or IMO GISIS. The MoU Databases tab opens these official portals directly.',
      },
      {
        q: 'What is a Concentrated Inspection Campaign?',
        a: 'A CIC is a joint campaign run by Paris MoU and Tokyo MoU, usually from 1 September to 30 November, in which PSC officers inspect one topic in more depth.',
      },
      {
        q: 'What are the most common detainable deficiencies?',
        a: 'Fire safety, life-saving appliances, ISM and structural or watertight integrity items are frequent grounds for detention. Filter the code list by "Very High Detention Risk" to see them.',
      },
    ],
    keywords: [
      'PSC deficiency codes',
      'port state control checklist',
      'PSC action codes',
      'Paris MoU inspection',
      'Tokyo MoU',
      'CIC campaign',
    ],
    category: 'ship',
    related: ['marpol', 'vault', 'drills', 'ports'],
  },

  marpol: {
    name: 'MARPOL Tracker',
    title: 'MARPOL Compliance Checklist (Annex I-VI)',
    description:
      'MARPOL self-check for Annex I, IV, V and VI: record books, discharge rules, sewage, garbage and fuel sulphur limits for normal waters, ECA or Med SECA.',
    intro:
      'The MARPOL tracker is a self-check for oil (Annex I), sewage (Annex IV), garbage (Annex V) and air pollution (Annex VI). You set the current area (normal waters, ECA, special area or the Mediterranean SOx ECA), log record book dates, sludge, bilge and sewage quantities and fuel sulphur, and tick the checklist items. It shows a completion score and the key discharge and sulphur rules.',
    howTo: [
      'Enter the vessel and choose the current area.',
      'Log the last Oil Record Book and Garbage Record Book entries, sludge and bilge ROB.',
      'Enter the sewage system type and retention ROB.',
      'Enter the in-use fuel sulphur and tick the checklist items for each Annex.',
      'Review the completion score and the quick reference before area changes.',
    ],
    faq: [
      {
        q: 'What is the sulphur limit for ship fuel?',
        a: 'The global limit is 0.50% m/m. In Emission Control Areas the limit is 0.10%, including the Mediterranean SOx ECA from 1 May 2025.',
      },
      {
        q: 'What can be discharged under MARPOL Annex V?',
        a: 'Garbage discharge is generally prohibited. Food waste may be discharged at sea under distance and comminution rules, and plastics may never be discharged.',
      },
      {
        q: 'How far from land can sewage be discharged?',
        a: 'Comminuted and disinfected sewage more than 3 nautical miles from land, untreated sewage more than 12 nautical miles at 4 knots or more, and treated sewage from an approved plant subject to its certificate. Special area rules are stricter.',
      },
      {
        q: 'How long must bunker delivery notes be kept?',
        a: 'Bunker delivery notes must be kept on board for three years, and the representative sample retained for at least 12 months.',
      },
    ],
    keywords: [
      'MARPOL checklist',
      'MARPOL Annex VI',
      'ECA sulphur limit',
      'Oil Record Book',
      'Garbage Record Book',
      'Med SECA',
    ],
    category: 'ship',
    related: ['psc', 'cii', 'incidents', 'vault'],
  },

  incidents: {
    name: 'Incident & Near Miss Log',
    title: 'Near Miss & Incident Report Log for Ships',
    description:
      'Record near misses, accidents and equipment failures with severity, immediate action, root cause and corrective action, and track each to closure.',
    intro:
      'The incident log records near misses, accidents, injuries, pollution, equipment failures and security events on board. Each entry holds severity, location, description, immediate action, root cause and corrective or preventive action, with status from open to closed. Entries can be anonymous, and the log can be searched, filtered and printed.',
    howTo: [
      'Click "Report Incident" and enter date, time, type, severity and location.',
      'Describe what happened and the immediate action taken.',
      'Add the root cause and the corrective or preventive action with owner and due date.',
      'Update the status to investigating or closed, and filter or print the log.',
    ],
    faq: [
      {
        q: 'What is a near miss at sea?',
        a: 'A near miss is an event that could have caused injury, damage or pollution but did not. Under the ISM Code, near misses are reported and analysed so that the causes are fixed before an accident happens.',
      },
      {
        q: 'What should a near miss report include?',
        a: 'Date, time, location, what happened, the immediate action, the root cause and the corrective action to prevent it happening again.',
      },
      {
        q: 'How do I find the root cause?',
        a: 'A common method is the 5-why: ask why the event happened, then why that cause occurred, until you reach an underlying cause rather than just the trigger.',
      },
      {
        q: 'Can reports be anonymous?',
        a: 'Yes. Tick "Anonymous" to leave the reporter name off the record.',
      },
    ],
    keywords: [
      'near miss report',
      'incident report ship',
      'accident log',
      'root cause analysis',
      'ISM near miss',
    ],
    category: 'ship',
    related: ['drills', 'photos', 'diary', 'emergency'],
  },

  drills: {
    name: 'Drill Tracker',
    title: 'SOLAS Drill Tracker & Schedule',
    description:
      'Track SOLAS drills on board: fire, abandon ship, enclosed space, steering, MOB and more, with next-due dates and overdue alerts. Free, no signup.',
    intro:
      'The drill tracker keeps the schedule of shipboard drills required by SOLAS and the ISM Code. It covers 12 drill types, from fire and abandon ship to enclosed space entry, emergency steering, man overboard and blackout. Log each drill with date, performance, participants and scenario, and the tracker shows what is overdue, due soon or not yet logged.',
    howTo: [
      'Enter the vessel name and IMO number.',
      'Click "Log" next to a drill type after each drill.',
      'Record date, performance rating, participants and the scenario or lessons learned.',
      'Check the schedule for overdue and due-soon drills and print it for the record.',
    ],
    faq: [
      {
        q: 'How often are fire and abandon ship drills required?',
        a: 'Under SOLAS, each crew member takes part in at least one abandon ship drill and one fire drill every month, and within 24 hours of leaving port if more than 25% of the crew has changed.',
      },
      {
        q: 'How often must lifeboats be launched?',
        a: 'Each lifeboat must be launched and manoeuvred in the water with its assigned crew at least once every three months.',
      },
      {
        q: 'How often are enclosed space entry drills required?',
        a: 'Enclosed space entry and rescue drills are required at least every two months.',
      },
      {
        q: 'Can I change the intervals?',
        a: 'The intervals are defaults. Your company SMS, flag or ship type may require more frequent drills, which take precedence.',
      },
    ],
    keywords: [
      'SOLAS drills',
      'drill schedule ship',
      'fire drill frequency',
      'enclosed space drill',
      'abandon ship drill',
    ],
    category: 'ship',
    related: ['emergency', 'incidents', 'mlc', 'psc'],
  },

  emergency: {
    name: 'Emergency Reference Card',
    title: 'Ship Emergency Procedures Quick Reference',
    description:
      'Printable ship emergency reference: first actions for fire, flooding, MOB and more, common alarm signals, MAYDAY and PAN-PAN format and your contacts.',
    intro:
      'The emergency reference collects first-action prompts for eight emergencies (general emergency, fire, abandon ship, man overboard, flooding, pollution, medical and security), common alarm signals, the MAYDAY and PAN-PAN message formats and your own emergency contacts on one printable page. It is a memory aid to post near the bridge or ship\'s office.',
    howTo: [
      'Enter the vessel name, call sign and MMSI.',
      'Review the first-action card for each emergency type.',
      'Fill in your emergency contacts (company DPA, P&I, MRCC and others).',
      'Print the page and post it where the crew can see it.',
    ],
    faq: [
      {
        q: 'What is the correct MAYDAY format?',
        a: 'MAYDAY three times, "this is" and the vessel name three times, call sign or MMSI, then MAYDAY and the vessel name, position, nature of distress, assistance required and persons on board, ending with "over".',
      },
      {
        q: 'What is the difference between MAYDAY and PAN-PAN?',
        a: 'MAYDAY is used for grave and imminent danger to a vessel or person. PAN-PAN signals urgency where there is no immediate danger to life.',
      },
      {
        q: 'What is the general emergency alarm signal?',
        a: 'By convention, seven or more short blasts followed by one long blast. Your ship\'s muster list defines the exact signals.',
      },
      {
        q: 'Does this replace the muster list?',
        a: 'No. It is a memory aid. The ship\'s SMS, muster list and the Master\'s orders govern every emergency.',
      },
    ],
    keywords: [
      'ship emergency procedures',
      'MAYDAY format',
      'PAN-PAN',
      'general alarm signal',
      'man overboard procedure',
    ],
    category: 'ship',
    related: ['drills', 'contacts', 'incidents', 'weather'],
  },

  mlc: {
    name: 'MLC Rest Hours Checker',
    title: 'MLC Rest Hours Calculator & Checker',
    description:
      'Free rest hours calculator: hourly work and rest grid per crew member, checked against MLC 2006 and STCW limits (10 h in 24 h, 77 h in 7 days).',
    intro:
      'This tool records hours of work and rest on a weekly hourly grid for each crew member and checks them against the MLC 2006 and STCW minimums: 10 hours of rest in any 24-hour period and 77 hours in any 7 days. It also flags rest split into more than two periods. An MLC self-check list is included for the master or chief officer.',
    howTo: [
      'Enter the vessel and the week starting date (Monday).',
      'Add each crew member with name and rank.',
      'Tap hour cells to mark work, or use the row buttons to fill a whole day.',
      'Read daily and weekly rest and any violations, then complete the MLC self-check.',
    ],
    faq: [
      {
        q: 'What are the MLC minimum rest hours?',
        a: 'At least 10 hours of rest in any 24-hour period and at least 77 hours in any 7-day period. Rest may be divided into no more than two periods, one at least 6 hours long, with no more than 14 hours between them.',
      },
      {
        q: 'What is the maximum working time at sea?',
        a: 'The equivalent limit is 14 hours of work in any 24 hours and 72 hours in any 7 days.',
      },
      {
        q: 'Do STCW and MLC rest hours differ?',
        a: 'The numeric limits are aligned: 10 hours in 24 and 77 hours in 7 days. STCW applies them to watchkeeping and safety duties, MLC to all seafarers.',
      },
      {
        q: 'Does this replace the official rest hours record?',
        a: 'No. It is a working aid. Use the official record forms required by your flag and SMS.',
      },
    ],
    keywords: [
      'MLC rest hours',
      'rest hours calculator',
      'STCW hours of rest',
      'hours of work seafarers',
      'MLC 2006 compliance',
    ],
    category: 'ship',
    related: ['wages', 'drills', 'vault', 'visa'],
  },

  wages: {
    name: 'Crew Wage Calculator',
    title: 'Seafarer Wage Calculator: Crew Wage Bill',
    description:
      'Build a crew wage bill: basic wage, guaranteed and extra overtime, leave pay, subsistence and seniority per rank, per month and per contract. Free tool.',
    intro:
      'The wage calculator builds a monthly and full-contract wage bill for a crew. For each seafarer you enter rank, basic wage, guaranteed overtime, extra overtime hours and rate, leave pay, subsistence and seniority, and it totals the crew cost. Picking a rank fills an indicative basic wage, which you replace with the real CBA or ITF figure.',
    howTo: [
      'Enter the vessel and currency.',
      'Add each crew member with rank and contract length in months.',
      'Enter basic wage, guaranteed and extra overtime, leave pay, subsistence and seniority.',
      'Read the monthly wage bill and total contract cost, then print it.',
    ],
    faq: [
      {
        q: 'How is a seafarer\'s monthly wage calculated?',
        a: 'Monthly wage = basic + guaranteed overtime + extra overtime + leave pay + subsistence + seniority. This tool totals each part per person and for the whole crew.',
      },
      {
        q: 'What is guaranteed overtime?',
        a: 'A fixed monthly overtime payment, commonly for around 103 hours, paid regardless of hours actually worked. Extra overtime is paid on top for hours above the guarantee.',
      },
      {
        q: 'Are the wage figures official ITF rates?',
        a: 'No. The rank figures are indicative only. Use the applicable CBA, ITF or IBF table or the seafarer\'s employment agreement.',
      },
      {
        q: 'Does it calculate tax or social security?',
        a: 'No. Taxes, social contributions and allotments are not calculated.',
      },
    ],
    keywords: [
      'seafarer wage calculator',
      'crew wage bill',
      'guaranteed overtime seafarer',
      'ITF wage scale',
      'crew cost calculator',
    ],
    category: 'ship',
    related: ['mlc', 'visa', 'vault', 'hire'],
  },

  visa: {
    name: 'Seafarer Visa Guide',
    title: 'Seafarer Visa Requirements by Country',
    description:
      'Seafarer visa guide for 14 major maritime countries: shore leave, crew change sign-on and sign-off, and airport transit, with the typical documents needed.',
    intro:
      'This guide summarises seafarer entry rules for 14 major maritime countries and areas, including the United States, the Schengen Area, the United Kingdom, Singapore, China and Australia. For each it shows whether a visa is typically needed for shore leave, sign-on or sign-off and airport transit, the usual documents and practical notes. It is orientation for crewing managers, agents and seafarers.',
    howTo: [
      'Search for a country or area.',
      'Read the requirement for shore leave, sign-on or sign-off and airport transit.',
      'Check the typical documents and notes.',
      'Confirm with the local agent and the embassy or consulate before any crew change.',
    ],
    faq: [
      {
        q: 'Do seafarers need a visa for shore leave?',
        a: 'It depends on the country and the seafarer\'s nationality. Many countries allow shore leave with a seafarer\'s identity document or discharge book, while some, such as the United States, require a visa in advance for nearly all foreign crew.',
      },
      {
        q: 'What visa does a seafarer need for the United States?',
        a: 'Foreign crew generally need a C1/D crew visa, obtained in advance from a US embassy or consulate.',
      },
      {
        q: 'What documents does a seafarer need for a crew change?',
        a: 'Typically a valid passport, seafarer\'s identity document or discharge book, a letter of guarantee from the agent or company, and the visa where required.',
      },
      {
        q: 'Is this information binding?',
        a: 'No. Rules change often and depend on nationality. The local agent and the embassy or consulate give the binding answer.',
      },
    ],
    keywords: [
      'seafarer visa',
      'crew change visa',
      'shore leave visa',
      'C1/D visa',
      'seafarer transit visa',
    ],
    category: 'ship',
    related: ['holidays', 'ports', 'wages', 'mlc'],
  },

  vault: {
    name: 'Certificate Expiry Tracker',
    title: 'Ship Certificate Expiry Tracker',
    description:
      'Track ship certificates, class and crew documents with expiry alerts at 90 and 30 days. Start from templates for SMC, DOC, ISSC, IOPP and more.',
    intro:
      'The document vault tracks the validity of ship and crew certificates. Add each certificate with number, issuing authority, issue and expiry dates, or start from templates for standard certificates such as SMC, DOC, ISSC, IOPP, IAPP, Load Line, MLC and P&I. It flags documents that are expired, due within 30 days or due within 90 days. Only records are kept; no files are uploaded.',
    howTo: [
      'Enter the vessel name and IMO number.',
      'Click "From Template" to add standard certificates, or "Add Document" for any other.',
      'Enter the number, issuing authority, issue date and expiry date.',
      'Filter by type and review expired and expiring items, then print the list.',
    ],
    faq: [
      {
        q: 'Which certificates must a ship carry?',
        a: 'Common statutory certificates include the Safety Management Certificate, Document of Compliance, ISSC, IOPP, IAPP, International Load Line Certificate, Safety Construction, Safety Equipment and Safety Radio certificates and the Maritime Labour Certificate, plus class and insurance certificates.',
      },
      {
        q: 'When will I be alerted?',
        a: 'Documents are flagged when they are within 90 days of expiry, again within 30 days, and when expired.',
      },
      {
        q: 'Can I upload certificate scans?',
        a: 'No. The vault records details and dates only. Keep scanned files in your usual secure location.',
      },
      {
        q: 'Where is the data stored?',
        a: 'In your browser\'s local storage on this device.',
      },
    ],
    keywords: [
      'ship certificate tracker',
      'certificate expiry',
      'statutory certificates',
      'ISM certificates',
      'vessel documents',
    ],
    category: 'ship',
    related: ['drydock', 'psc', 'mlc', 'documents'],
  },

  documents: {
    name: 'Maritime Document Generator',
    title: 'Notice of Readiness & Maritime Letter Templates',
    description:
      'Generate a Notice of Readiness, Statement of Facts, LOP, LOI, Master\'s protest and receipts. Auto-filled, editable, ready to copy, email or print.',
    intro:
      'The document generator creates the standard letters and notices used in port: Notice of Readiness, Statement of Facts, Letter of Protest, Letter of Indemnity, Master\'s Letter of Protest, Notice of Apparent Good Order, Mate\'s Receipt and Notice of Tender. You fill in vessel, port, parties and cargo once, and it produces a formatted text you can copy, email or print.',
    howTo: [
      'Select the document type.',
      'Enter vessel, port, date and parties (charterer, receiver, agent, recipient).',
      'Add cargo details and the fields specific to the document, such as NOR status, SoF events or the protest account.',
      'Preview the document, then copy it, open it in your mail app or print it.',
    ],
    faq: [
      {
        q: 'What is a Notice of Readiness?',
        a: 'A Notice of Readiness (NOR) is the master\'s notice to the charterer or receiver that the vessel has arrived and is ready in all respects to load or discharge. Laytime normally starts running a set time after a valid NOR.',
      },
      {
        q: 'What is a Letter of Protest?',
        a: 'A Letter of Protest (LOP) is a formal written record of a disagreement or problem, such as a delay, short delivery or damage, issued to protect the issuer\'s rights in a later claim.',
      },
      {
        q: 'When is a Letter of Indemnity used?',
        a: 'Commonly for releasing cargo without the original bill of lading or for changing the discharge port. LOIs carry legal risk; consult your P&I club before issuing one.',
      },
      {
        q: 'Can I edit the generated document?',
        a: 'Yes. The text is a starting point. Review and adjust the wording before issuing.',
      },
    ],
    keywords: [
      'notice of readiness template',
      'letter of protest template',
      'letter of indemnity',
      'statement of facts template',
      'mate\'s receipt',
      'master protest',
    ],
    category: 'ship',
    related: ['laytime', 'claims', 'diary', 'photos'],
  },

  drydock: {
    name: 'Drydock Planner',
    title: 'Drydock Planner & Class Survey Cycle',
    description:
      'Plan dry-docking: track the 5-year class survey cycle and due dates, list the work scope and estimate yard cost with day rates. Free, in your browser.',
    intro:
      'The drydock planner tracks the class survey cycle and helps budget a docking. From your last special survey and dry-dock dates it shows due dates for special, intermediate, annual, bottom, tail shaft and boiler surveys, flagging those overdue or due within six months. You can then list the scope of work with estimated costs and add yard days at a day rate.',
    howTo: [
      'Enter the last special survey, last dry-dock and build dates.',
      'Review the survey schedule and the items overdue or due soon.',
      'Enter the shipyard, planned start, duration and yard day rate.',
      'Add work items with estimated cost and mark them done as the job progresses.',
    ],
    faq: [
      {
        q: 'How often must a ship be dry-docked?',
        a: 'Class requires two bottom inspections in each 5-year special survey cycle, with no more than 36 months between them. One may be an in-water survey (UWILD) for some ships.',
      },
      {
        q: 'What is the class survey cycle?',
        a: 'A 5-year cycle with annual surveys within 3 months of each anniversary, an intermediate survey around year 2.5 and a special (renewal) survey at the end.',
      },
      {
        q: 'How do I estimate drydock cost?',
        a: 'Add the yard\'s daily dock charges for the planned days to the cost of each work item in the specification. The planner totals both.',
      },
      {
        q: 'Are the due dates official?',
        a: 'No. They are anchored to the dates you enter. The class survey status report is authoritative.',
      },
    ],
    keywords: [
      'drydock planning',
      'class survey cycle',
      'special survey',
      'intermediate survey',
      'drydock cost estimate',
    ],
    category: 'ship',
    related: ['maintenance', 'spares', 'vault', 'photos'],
  },

  maintenance: {
    name: 'Planned Maintenance Tracker',
    title: 'Planned Maintenance System (PMS) Tracker',
    description:
      'Lightweight ship PMS: running-hour and calendar maintenance tasks with automatic due dates, overdue alerts and critical equipment flags. Free to use.',
    intro:
      'PMS Mini is a lightweight planned maintenance tracker for ship equipment. Each task runs on running hours or calendar days; update an engine\'s current hours and hour-based tasks recalculate automatically. Tasks are flagged overdue or due soon, and critical equipment is marked. It is a working aid, not a class-approved PMS.',
    howTo: [
      'Add equipment and its current running hours in the Equipment Hours tab.',
      'Add tasks with equipment, interval type (hours or days) and interval.',
      'Enter when each task was last done (hours or date).',
      'Click "Done now" after a job, and update running hours regularly.',
    ],
    faq: [
      {
        q: 'What is a planned maintenance system on a ship?',
        a: 'A PMS schedules maintenance by running hours or calendar intervals and records when it was done, as required by the ISM Code for equipment critical to safe operation.',
      },
      {
        q: 'How are running-hour tasks calculated?',
        a: 'Next due hours = hours at last done + interval. When current running hours pass that figure, the task is overdue.',
      },
      {
        q: 'Is this a class-approved PMS?',
        a: 'No. It is a lightweight tracker for small fleets or personal use.',
      },
      {
        q: 'Where is the data kept?',
        a: 'In your browser\'s local storage on this device.',
      },
    ],
    keywords: [
      'planned maintenance system',
      'ship PMS',
      'running hours maintenance',
      'maintenance tracker',
      'engine maintenance schedule',
    ],
    category: 'ship',
    related: ['spares', 'drydock', 'vault', 'incidents'],
  },

  spares: {
    name: 'Spares Inventory',
    title: 'Ship Spare Parts Inventory Tracker',
    description:
      'Track ship spare parts on board: stock, minimum levels, part numbers, location, supplier and value, with reorder flags for items below minimum stock.',
    intro:
      'The spares inventory tracks the spare parts on board. For each part you record equipment, part number, stock on board, minimum stock, unit price, location and supplier, and mark critical spares. Items below minimum are flagged for reorder, and the total stock value is shown. Each order can be marked requested, ordered or received.',
    howTo: [
      'Click "Add Spare" and enter part name, equipment and part number.',
      'Enter stock on board, minimum stock, unit price, location and supplier.',
      'Mark critical spares.',
      'Filter by below minimum or critical, and update order status as you reorder.',
    ],
    faq: [
      {
        q: 'What are critical spares on a ship?',
        a: 'Spares for equipment whose failure could cause a hazardous situation, identified under the ISM Code and class rules. They should always be kept above minimum stock.',
      },
      {
        q: 'How do I set minimum stock levels?',
        a: 'Use the maker\'s recommendations, class requirements and your own consumption history. Remember lead time to the next port with a reliable supplier.',
      },
      {
        q: 'Can I see the value of spares on board?',
        a: 'Yes. Stock value is calculated from stock on board x unit price.',
      },
      {
        q: 'Where can I find a supplier?',
        a: 'PortServiceFinder lists ship chandlers and spare parts suppliers by port, free to search.',
      },
    ],
    keywords: [
      'ship spare parts inventory',
      'critical spares',
      'marine spares tracker',
      'minimum stock level',
    ],
    category: 'ship',
    related: ['maintenance', 'drydock', 'contacts', 'disbursement'],
  },

  ports: {
    name: 'Port Database',
    title: 'Port Information: Draft, Pilotage & VHF',
    description:
      'Quick reference for major hub ports: max draft, LOA, terminals, pilotage, VHF, working hours and links to PSC inspection history. Free port info.',
    intro:
      'The port database is a quick reference for major hub ports worldwide. Each port shows coordinates, time zone, maximum draft and LOA, pilotage, VHF channels, working hours and main terminals, with links to the official PSC inspection databases and to local service providers on PortServiceFinder. Always confirm details with the agent before arrival.',
    howTo: [
      'Search by port name, country or UN/LOCODE, or filter by region.',
      'Open a port to read draft, LOA, pilotage, VHF and terminals.',
      'Use the PSC links to check a vessel\'s inspection history by IMO number.',
      'Follow the links to holidays, visa rules or local providers for that port.',
    ],
    faq: [
      {
        q: 'Where can I find port restrictions such as maximum draft?',
        a: 'The port database lists typical maximum draft and LOA for major ports. Restrictions change, so confirm them with the port authority, current notices and your agent.',
      },
      {
        q: 'Is pilotage compulsory?',
        a: 'It depends on the port and ship size. Each port card shows whether pilotage is compulsory, recommended or optional.',
      },
      {
        q: 'How do I find a ship agent at a port?',
        a: 'Each port card links to PortServiceFinder, where you can search ship agents, chandlers and marine services in that port for free and contact them directly.',
      },
      {
        q: 'How many ports are covered?',
        a: 'The database covers major hub ports in each region. For distances between more than 200 ports, use the Distance Calculator.',
      },
    ],
    keywords: [
      'port information',
      'port database',
      'port restrictions draft',
      'pilotage VHF channel',
      'port guide',
    ],
    category: 'ship',
    related: ['holidays', 'visa', 'tide', 'distance'],
  },

  tide: {
    name: 'Tide & UKC Calculator',
    title: 'Tide Calculator: Height of Tide & UKC',
    description:
      'Enter HW and LW times and heights to get height of tide at any time, the tide curve and the window with enough water for your draft and UKC. Free.',
    intro:
      'The tide calculator interpolates the height of tide between the high and low water times you take from the tide table. It draws the tide curve, gives the height and total water at any time, and finds the windows where charted depth plus tide covers your draft plus the required under-keel clearance. It is a planning aid for deck officers and port operators.',
    howTo: [
      'Enter the port and date, then each HW and LW time and height above chart datum in order.',
      'Enter the draft, required UKC and charted depth.',
      'Read the tidal windows with enough water.',
      'Enter a specific time to get the height of tide and total water at that moment.',
    ],
    faq: [
      {
        q: 'How do I calculate height of tide at a given time?',
        a: 'Interpolate between the high and low water before and after that time. The rule of twelfths is the classic method; this tool uses a smooth cosine curve that follows the same shape for any minute.',
      },
      {
        q: 'How is under-keel clearance calculated?',
        a: 'UKC = charted depth + height of tide - draft. The ship has enough water when that figure is equal to or greater than the required UKC.',
      },
      {
        q: 'What is the rule of twelfths?',
        a: 'In a roughly six-hour tide, the water rises or falls by 1/12, 2/12, 3/12, 3/12, 2/12 and 1/12 of the range in each successive hour.',
      },
      {
        q: 'Does the calculator include storm surge?',
        a: 'No. Surge, pressure and wind effects and secondary port corrections are not applied. Use official predictions for navigational decisions.',
      },
    ],
    keywords: [
      'tide calculator',
      'height of tide',
      'under keel clearance',
      'rule of twelfths',
      'tidal window',
    ],
    category: 'ship',
    related: ['draft', 'weather', 'ports', 'planner'],
  },

  weather: {
    name: 'Weather Window Planner',
    title: 'Weather Window Planner for Marine Operations',
    description:
      'Set wind, wave and swell limits for cargo, STS, bunkering or anchoring, enter your forecast and see GO, marginal and no-go periods. Free planning aid.',
    intro:
      'The weather window planner checks a forecast against the limits for a marine operation. Choose an operation such as cargo work alongside, STS transfer, bunkering, anchoring, channel transit or heavy-lift, adjust the wind, wave and swell limits, and enter the forecast periods. Each period is marked GO, marginal (within 15% of a limit) or no-go, with the first GO window highlighted.',
    howTo: [
      'Choose the operation type to load indicative limits, or set your own.',
      'Adjust maximum wind, significant wave height and swell.',
      'Add forecast periods with wind, gust, wave and swell values from your forecast.',
      'Read the GO, marginal and no-go periods and the first GO window.',
    ],
    faq: [
      {
        q: 'What wind limit applies to STS operations?',
        a: 'Limits are set by the STS service provider, terminal and the masters involved, and often sit around 25 to 30 knots of wind with restrictions on wave height. The tool uses indicative defaults you can change.',
      },
      {
        q: 'What is a weather window?',
        a: 'A period when forecast wind, waves and swell all stay within the limits for an operation, long enough to complete it safely.',
      },
      {
        q: 'Does the tool fetch the forecast?',
        a: 'No. You enter the forecast from your weather provider or national met service. The Voyage Planner can show a live forecast along a route.',
      },
      {
        q: 'What does marginal mean?',
        a: 'At least one value is within 15% of its limit. No-go means any value exceeds its limit.',
      },
    ],
    keywords: [
      'weather window',
      'marine operations weather limits',
      'STS weather limits',
      'Beaufort scale',
      'go no-go weather',
    ],
    category: 'ship',
    related: ['planner', 'tide', 'lashing', 'emergency'],
  },

  holidays: {
    name: 'Port Holidays & SHEX Counter',
    title: 'Port Holidays Calendar & SHEX Day Counter',
    description:
      'Public holidays for 14 major maritime countries plus a laytime day counter for SHEX, SHINC and FHEX that shows weekend and holiday days in your period.',
    intro:
      'The holidays calendar lists public holidays for 14 major maritime countries with their weekend days and hub ports. A built-in laytime day counter takes a start and end date and a SHEX, SHINC or FHEX basis, and counts total, weekend and holiday days in the period. Religious and movable holidays are marked as approximate.',
    howTo: [
      'Select a country to see its holidays, weekend days and hub ports.',
      'Choose the laytime basis: SHEX, SHINC or FHEX.',
      'Enter the laytime start and end dates.',
      'Read the total days and how many fall on weekends or holidays.',
    ],
    faq: [
      {
        q: 'What does SHEX mean in a charter party?',
        a: 'Sundays and Holidays Excepted: weekend days and public holidays at the port do not count as laytime, unless the charter party says they count if used.',
      },
      {
        q: 'What is FHEX?',
        a: 'Fridays and Holidays Excepted, used in countries where Friday is the weekly rest day.',
      },
      {
        q: 'What is the difference between SHEX EIU and SHEX UU?',
        a: 'Under "even if used" (EIU), excepted days never count even if work is done. Under "unless used" (UU), time actually worked on an excepted day does count. Check the exact wording.',
      },
      {
        q: 'Are the holiday dates exact?',
        a: 'Fixed holidays are. Religious and movable holidays such as Eid or Lunar New Year can shift by a day, so confirm with the local agent.',
      },
    ],
    keywords: [
      'SHEX SHINC',
      'port holidays',
      'public holidays laytime',
      'FHEX',
      'laytime day counter',
    ],
    category: 'ship',
    related: ['laytime', 'ports', 'visa', 'congestion'],
  },

  diary: {
    name: 'Voyage Diary',
    title: 'Voyage Diary & Ship Operations Log',
    description:
      'Keep a timestamped operations log by category (cargo, port, weather, crew, incidents) and copy a clean summary for the office or charterer in one tap.',
    intro:
      'The voyage diary is a running operations log for a voyage. Each entry has date, time, category, location, title and details, and entries are grouped by day and searchable. One tap copies a clean summary to send to the office, charterer or agent.',
    howTo: [
      'Enter the vessel and voyage name.',
      'Click "New Entry" and choose a category such as operation, port, cargo or weather.',
      'Add date, time, location, title and details.',
      'Search or filter the timeline, then copy the summary or print it.',
    ],
    faq: [
      {
        q: 'What should a voyage operations log record?',
        a: 'Key times and facts: arrival, NOR, berthing, cargo start and stop, weather delays, crew changes and incidents. A clear log supports the SoF and any later claim.',
      },
      {
        q: 'Is this a replacement for the official logbook?',
        a: 'No. It is a working diary. The deck and engine logbooks remain the official record.',
      },
      {
        q: 'How do I share it?',
        a: 'Use "Copy Summary" to paste the entries into an email or message, or print the diary.',
      },
      {
        q: 'Where are entries stored?',
        a: 'In your browser\'s local storage on this device.',
      },
    ],
    keywords: [
      'voyage diary',
      'ship operations log',
      'voyage log template',
      'port operations log',
    ],
    category: 'ship',
    related: ['documents', 'photos', 'incidents', 'laytime'],
  },

  photos: {
    name: 'Photo Evidence Log',
    title: 'Ship Photo Evidence Log for Claims',
    description:
      'Index damage, cargo and survey photos: what they show, where on the ship, who took them and where the files are stored, so evidence is easy to cite.',
    intro:
      'The photo reference log is an index of evidence photos, not a photo store. For each set you record date, category, number of photos, what they show, location on the ship, file reference and who took them. When a damage claim or survey comes up, you can find and cite the right photos quickly.',
    howTo: [
      'Enter the vessel and voyage.',
      'Click "Add Photo Reference" and choose a category such as damage, cargo or survey.',
      'Describe what the photos show, where on the ship, how many and who took them.',
      'Enter the file reference or folder where the images are kept, then search the log when needed.',
    ],
    faq: [
      {
        q: 'Why keep a photo log for claims?',
        a: 'Claims and surveys often depend on dated photos of damage or cargo condition. A log that ties each photo set to a time, place and file makes the evidence easy to find and harder to dispute.',
      },
      {
        q: 'Are photos uploaded?',
        a: 'No. Keep the files in your usual secure location. The log records only where they are.',
      },
      {
        q: 'What should I photograph for a cargo damage claim?',
        a: 'The damage close up and in context, hatch and hold condition, marks and labels, and the time and place, with a scale reference where possible.',
      },
      {
        q: 'Where is the log stored?',
        a: 'In your browser\'s local storage on this device.',
      },
    ],
    keywords: [
      'damage photo log',
      'evidence photos claims',
      'cargo damage evidence',
      'survey photo record',
    ],
    category: 'ship',
    related: ['incidents', 'claims', 'diary', 'documents'],
  },

  contacts: {
    name: 'Maritime Contact Book',
    title: 'Maritime Contact Book for Ports & Agents',
    description:
      'Keep agents, surveyors, bunker suppliers, P&I correspondents and class contacts by port and category, with emergency numbers pinned to the top.',
    intro:
      'The contact book keeps the people a ship or operator deals with in port: agents, surveyors, bunker suppliers, P&I correspondents, class, lawyers, chandlers, repair firms and tugs. Contacts are organised by port and category with phone, VHF channel and email, and emergency or 24-hour numbers stay at the top.',
    howTo: [
      'Click "Add Contact" and enter name, company, category and port.',
      'Add phone, VHF channel and email.',
      'Tick "Emergency / 24h" for numbers that must be easy to find.',
      'Search by name, company, port or phone, and print the list.',
    ],
    faq: [
      {
        q: 'Which contacts should a ship keep for each port?',
        a: 'At least the agent, the P&I correspondent, local surveyors, bunker supplier and the port or VTS contacts, plus 24-hour numbers for each.',
      },
      {
        q: 'How do I find an agent or chandler in a new port?',
        a: 'Search PortServiceFinder by port and service category. It is free for vessel operators and you contact providers directly.',
      },
      {
        q: 'Can I email a contact from the book?',
        a: 'Yes. Each contact with an email address has an Email button that opens your mail app.',
      },
      {
        q: 'Where are contacts stored?',
        a: 'In your browser\'s local storage on this device.',
      },
    ],
    keywords: [
      'ship agent contacts',
      'P&I correspondent',
      'port contacts list',
      'maritime contact book',
    ],
    category: 'ship',
    related: ['ports', 'emergency', 'disbursement', 'spares'],
  },

  // ------------------------------------------------------------
  // HUB SECTIONS
  // ------------------------------------------------------------
  operators: {
    name: 'Shore Office Tools',
    title: 'Ship Operator Tools: Laytime, TCE & Claims',
    description:
      'Free tools for ship operators, owners and charterers: TCE, laytime and demurrage, hire statements, CII, bunkers, claims, DA tracking and fleet view.',
    intro:
      'The Shore Office side of the Voyage Hub brings together the commercial tools a chartering or operations desk uses every day. It covers voyage estimates and TCE, laytime and demurrage, hire statements, charter party performance claims, bunker planning, disbursement accounts, CII and EU ETS costs, and a fleet overview. Every tool runs in the browser with no account.',
    howTo: [
      'Pick a category: charter and commercial, voyage planning, performance and claims, cost and market, or fleet and compliance.',
      'Open a tool and enter your voyage figures.',
      'Save your work in the browser, or print it to PDF.',
      'Find all saved work later on the Saved Items page.',
    ],
    faq: [
      {
        q: 'Which tools are most used by ship operators?',
        a: 'Usually the TCE voyage estimate, the laytime and demurrage calculator, the hire statement and the charter party performance claim tool.',
      },
      {
        q: 'Do I need an account?',
        a: 'No. All tools are free and run in your browser without signup.',
      },
      {
        q: 'Is my commercial data shared?',
        a: 'No. Saved work stays in your browser\'s local storage on this device unless you export it.',
      },
      {
        q: 'Can I print the results?',
        a: 'Yes. Each calculator has a print option that you can save as PDF.',
      },
    ],
    keywords: [
      'ship operator tools',
      'chartering tools',
      'shipping calculators',
      'maritime commercial tools',
      'free shipping software',
    ],
    category: 'hub',
    related: ['tce', 'laytime', 'hire', 'cii'],
  },

  ship: {
    name: 'Ship Side Tools',
    title: 'Free Tools for Ship Officers & Crew',
    description:
      'Free ship-side tools: draft survey, stability, lashing, PSC codes, MARPOL, drills, MLC rest hours, certificates, PMS, tides and weather windows.',
    intro:
      'The Ship Side of the Voyage Hub has tools for masters, officers, engineers and crew. It covers cargo and stowage, stability and lashing checks, PSC and MARPOL preparation, drills and incidents, rest hours, wages and visas, certificates, maintenance and spares, and port, tide and weather planning. All of them are free and work in the browser.',
    howTo: [
      'Pick a category: cargo and stowage, compliance and safety, crew and certificates, vessel and maintenance, port and passage, or records.',
      'Open a tool and enter your ship\'s data.',
      'Save records in the browser or print them for the ship\'s files.',
      'Find saved work later on the Saved Items page.',
    ],
    faq: [
      {
        q: 'Do these tools work offline at sea?',
        a: 'Once a page has loaded, the calculators run in the browser, and saved data is kept on the device. Loading a page for the first time needs a connection.',
      },
      {
        q: 'Can these tools replace the loading computer or official records?',
        a: 'No. They are working aids. The approved loading instrument, stability booklet, Cargo Securing Manual and official record books always govern.',
      },
      {
        q: 'Is there a cost for seafarers?',
        a: 'No. The Ship Side tools are free with no signup.',
      },
      {
        q: 'Where is my data kept?',
        a: 'In your browser\'s local storage on this device. Use the backup option on the Saved Items page to move it.',
      },
    ],
    keywords: [
      'ship officer tools',
      'seafarer tools',
      'deck officer calculator',
      'ship compliance tools',
      'free maritime calculators',
    ],
    category: 'hub',
    related: ['draft', 'psc', 'mlc', 'vault'],
  },

  saved: {
    name: 'Saved Items',
    title: 'Saved Voyage Hub Work & Backup',
    description:
      'See every voyage, calculation and document you saved in the Voyage Hub, stored in your browser. Download a JSON backup or restore it on another device.',
    intro:
      'Saved Items lists everything you have saved from Voyage Hub tools, such as laytime statements, TCE estimates, CII reports and documents. Everything is stored locally in your browser. You can download a JSON backup and restore it later or on another device.',
    howTo: [
      'Use any Voyage Hub tool and click Save.',
      'Open Saved Items to see your work by tool.',
      'Click Open to continue an item, or Delete to remove it.',
      'Download a JSON backup, and paste it into Restore on another device.',
    ],
    faq: [
      {
        q: 'Where is my saved work stored?',
        a: 'In your browser\'s local storage on this device. It is not sent to PortServiceFinder.',
      },
      {
        q: 'Will I lose my work if I clear my browser?',
        a: 'Yes. Clearing site data removes saved items, so download a backup first.',
      },
      {
        q: 'How do I move my work to another computer?',
        a: 'Download the JSON backup, then paste it into "Restore from Backup" on the other device.',
      },
      {
        q: 'Do I need an account to save?',
        a: 'No. Saving works without any account.',
      },
    ],
    keywords: ['voyage hub saved items', 'backup maritime calculations', 'saved voyages'],
    category: 'hub',
    related: ['laytime', 'tce', 'cii', 'documents'],
  },
};

export function getVoyageSeo(slug: string): VoyageToolSeoEntry | undefined {
  return VOYAGE_SEO[slug];
}
