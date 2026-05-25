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
export const BLOG_POSTS = [
  ...LEGACY_BLOG_POSTS,
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
