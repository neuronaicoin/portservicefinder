// ============================================================
// BLOG POSTS — Modular structure
// ============================================================
import {
  BLOG_POSTS as LEGACY_BLOG_POSTS,
  formatBlogDate as legacyFormatBlogDate,
} from '../blog-posts';
export type { BlogPost } from '../blog-posts';
import { shanghai } from './shanghai';
import { hongKong } from './hong-kong';
import { hamburg } from './hamburg';
import { antwerp } from './antwerp';
import { houston } from './houston';
import { busan } from './busan';
import { santos } from './santos';
import { yokohama } from './yokohama';
import { piraeus } from './piraeus';
import { newYorkNewJersey } from './new-york-new-jersey';
import { losAngelesLongBeach } from './los-angeles-long-beach';
import { tanjungPelepas } from './tanjung-pelepas';
import { shenzhen } from './shenzhen';
import { ningboZhoushan } from './ningbo-zhoushan';
import { guangzhou } from './guangzhou';
import { qingdao } from './qingdao';
import { tianjin } from './tianjin';
import { genoa } from './genoa';
import { melbourne } from './melbourne';
import { casablanca } from './casablanca';
import { durban } from './durban';
import { rosario } from './rosario';
import { vancouver } from './vancouver';
import { stPetersburg } from './st-petersburg';
import { mormugao } from './mormugao';
import { shipyardsTop15 } from './shipyards-top-15';
import { singaporeVsHongKongVsShanghai } from './singapore-vs-hong-kong-vs-shanghai';
import { rotterdamVsHamburgVsAntwerp } from './rotterdam-vs-hamburg-vs-antwerp';
import { suezVsPanama } from './suez-vs-panama';
import { howToBecomeShipAgent } from './how-to-become-ship-agent';
import { howToStartShipChandler } from './how-to-start-ship-chandler';
import { marketingForShipAgents } from './marketing-for-ship-agents';
import { bestShipAgencySoftware } from './best-ship-agency-software';
import { howToStartBunkerSupply } from './how-to-start-bunker-supply';
import { howToStartHullCleaning } from './how-to-start-hull-cleaning';
import { howToStartCrewChange } from './how-to-start-crew-change';
import { howToStartShipRepair } from './how-to-start-ship-repair';
import { howToStartMarineSurveying } from './how-to-start-marine-surveying';
import { howToStartMarinePainting } from './how-to-start-marine-painting';
import { howToChooseShipAgent } from './how-to-choose-ship-agent';
import { howProvidersReachOperators } from './how-providers-reach-operators';
import { losAngelesVsNewYorkVsHouston } from './los-angeles-vs-new-york-vs-houston';
import { maritimeRegulationsChanges2026 } from './maritime-regulations-changes-2026';
import { top20BunkerHubsWorldwide2026 } from './top-20-bunker-hubs-worldwide-2026';
import { euEtsForShipping2026 } from './eu-ets-for-shipping-2026-complete-operator-guide';
import { whatDoesAShipAgentDo } from './what-does-a-ship-agent-do-complete-guide-2026';
import { whatDoesAShipchandlerDo } from './what-does-a-shipchandler-do-complete-guide-2026';
import { fuelEuMaritime2026 } from './fueleu-maritime-2026-compliance-and-pooling-strategy';
import { ukEtsForShipping2026 } from './uk-ets-for-shipping-2026-complete-operator-guide';
import { howToChooseShipAgentBuyerGuide } from './how-to-choose-a-ship-agent-2026-buyer-guide';
import { sydneyPortGuide } from './sydney-port-botany-complete-guide-2026';
import { portKlangGuide } from './port-klang-malaysia-complete-guide-2026';
import { algecirasPortGuide } from './algeciras-port-spain-complete-guide-2026';
import { jnptMumbaiPortGuide } from './jnpt-mumbai-nhava-sheva-complete-guide-2026';
import { felixstowePortGuide } from './felixstowe-port-uk-complete-guide-2026';
import { jebelAliPortGuide } from './jebel-ali-port-dubai-complete-guide-2026';
import { crewChangePortCall } from './crew-change-port-call-operational-checklist-2026';
import { vesselTechnicalServiceVisits } from './vessel-technical-service-visits-port-coordination-guide-2026';
import { singaporeEngineService } from './ship-engine-service-companies-singapore-2026-operator-buyer-guide';
import { singaporeHullCleaning } from './hull-cleaning-services-singapore-2026-operator-buyer-guide';
import { tuzlaShipRepair } from './ship-repair-services-tuzla-istanbul-2026-operator-buyer-guide';
import { bosphorusShipAgents } from './ship-agents-istanbul-bosphorus-2026-operator-buyer-guide';
import { istanbulBunkerSuppliers } from './bunker-suppliers-istanbul-2026-operator-buyer-guide';
import { rotterdamShipRepair } from './ship-repair-services-rotterdam-2026-operator-buyer-guide';
import { singaporeShipAgents } from './how-to-find-ship-agents-singapore-2026-operator-buyer-guide';
import { singaporeShipchandlers } from './how-to-find-shipchandlers-singapore-2026-operator-buyer-guide';
import { singaporeBwtsService } from './bwts-service-singapore-2026-operator-buyer-guide';
import { singaporeBoilerService } from './boiler-service-singapore-2026-operator-buyer-guide';
import { singaporeEcdisGmdss } from './ecdis-service-gmdss-radio-survey-singapore-2026-operator-buyer-guide';
import { singaporeMasterGuide } from './marine-service-providers-singapore-2026-complete-guide-operators-providers';
import { singaporeOperationsMegaGuide } from './singapore-maritime-operations-bunker-surveys-spare-parts-crew-change-tank-cleaning-2026-complete-guide';
import { singaporeTechnicalServicesGuide } from './singapore-technical-services-electrical-hydraulics-refrigeration-ndt-2026-complete-guide';
import { shipchandlersIstanbul } from './shipchandlers-istanbul-bosphorus-2026-operator-buyer-guide';
import { howOperatorsSearchForProviders } from './how-vessel-operators-search-for-providers-online-2026';
import { howToStartMarineElectrical } from './how-to-start-marine-electrical-services-business-complete-guide-2026';
import { hiddenCostOfBeingInvisible } from './hidden-cost-invisible-online-ship-agents-chandlers-marine-services-2026';
import { losingBidsToCompetitors } from './why-losing-bids-to-companies-never-heard-of-2026';
import { firstCallToRepeatBusiness } from './first-inquiry-to-repeat-business-ship-agents-chandlers-marine-services-2026';
import { eleventhHourProvisioning } from './eleventh-hour-provisioning-shipchandlers-missing-most-profitable-orders-2026';
import { singaporeScaleOpportunity } from './singapore-130000-vessel-calls-ship-agents-chandlers-marine-services-2026';
import { howOperatorsSearchSingapore } from './how-vessel-operators-search-for-providers-singapore-2026';
import { singaporeShipAgentsCompetition } from './singapore-ship-agent-competition-visibility-wins-2026';
import { singaporeShipyardsMarineService } from './singapore-shipyards-marine-service-provider-demand-2026';
import { singaporeShipchandlersScale } from './singapore-shipchandler-provisioning-demand-visibility-2026';
import { amsterdam } from './amsterdam-port-netherlands-complete-guide-2026';
import { howToVetProviders } from './how-vessel-operators-vet-choose-ship-agents-shipchandlers-marine-services-2026';
import { singaporeDrydockRepairGuide } from './singapore-drydock-ship-repair-welding-painting-2026-complete-guide';
import { singaporeSuppliesWasteGuide } from './singapore-vessel-supplies-waste-management-2026-complete-guide';
import { singaporeSafetySolasGuide } from './singapore-safety-solas-services-2026-complete-guide';
import { singaporeUltimatePillar } from './singapore-maritime-services-2026-ultimate-pillar-guide';
import { singaporePortCallCostGuide } from './singapore-port-call-cost-guide-2026';
import { singaporeEmergencyRepairSalvage } from './singapore-emergency-repair-salvage-2026';
import { seafarerShortage2026OperatorImpact } from './seafarer-shortage-2026-operator-impact';
import { imoNetZeroFramework2026 } from './imo-net-zero-framework-2026-operator-guide';
export const BLOG_POSTS = [
  ...LEGACY_BLOG_POSTS,
  imoNetZeroFramework2026,
  seafarerShortage2026OperatorImpact,
  singaporeEmergencyRepairSalvage,
  singaporePortCallCostGuide,
  singaporeUltimatePillar,
  singaporeSafetySolasGuide,
  singaporeSuppliesWasteGuide,
  singaporeDrydockRepairGuide,
  singaporeTechnicalServicesGuide,
  singaporeOperationsMegaGuide,
  singaporeMasterGuide,
  singaporeEcdisGmdss,
  singaporeBoilerService,
  singaporeBwtsService,
  singaporeShipchandlers,
  singaporeShipAgents,
  rotterdamShipRepair,
  istanbulBunkerSuppliers,
  bosphorusShipAgents,
  tuzlaShipRepair,
  singaporeHullCleaning,
  singaporeEngineService,
  vesselTechnicalServiceVisits,
  crewChangePortCall,
  shanghai,
  hongKong,
  hamburg,
  antwerp,
  houston,
  busan,
  santos,
  yokohama,
  piraeus,
  newYorkNewJersey,
  losAngelesLongBeach,
  tanjungPelepas,
  shenzhen,
  ningboZhoushan,
  guangzhou,
  qingdao,
  tianjin,
  genoa,
  melbourne,
  casablanca,
  durban,
  rosario,
  vancouver,
  stPetersburg,
  mormugao,
  shipyardsTop15,
  singaporeVsHongKongVsShanghai,
  rotterdamVsHamburgVsAntwerp,
  suezVsPanama,
  howToBecomeShipAgent,
  howToStartShipChandler,
  marketingForShipAgents,
  bestShipAgencySoftware,
  howToStartBunkerSupply,
  howToStartHullCleaning,
  howToStartCrewChange,
  howToStartShipRepair,
  howToStartMarineSurveying,
  howToStartMarinePainting,
  howToChooseShipAgent,
  howProvidersReachOperators,
  losAngelesVsNewYorkVsHouston,
  maritimeRegulationsChanges2026,
  top20BunkerHubsWorldwide2026,
  euEtsForShipping2026,
  whatDoesAShipAgentDo,
  whatDoesAShipchandlerDo,
  fuelEuMaritime2026,
  ukEtsForShipping2026,
  howToChooseShipAgentBuyerGuide,
  sydneyPortGuide,
  portKlangGuide,
  algecirasPortGuide,
  jnptMumbaiPortGuide,
  felixstowePortGuide,
  jebelAliPortGuide,
  shipchandlersIstanbul,
  howOperatorsSearchForProviders,
  howToStartMarineElectrical,
  hiddenCostOfBeingInvisible,
  losingBidsToCompetitors,
  firstCallToRepeatBusiness,
  eleventhHourProvisioning,
  singaporeScaleOpportunity,
  howOperatorsSearchSingapore,
  singaporeShipAgentsCompetition,
  singaporeShipyardsMarineService,
  singaporeShipchandlersScale,
  amsterdam,
  howToVetProviders,
];
export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}
export function getRelatedPosts(currentSlug: string, limit: number = 3) {
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, limit);
}
export function formatBlogDate(dateString: string): string {
  return legacyFormatBlogDate(dateString);
}
