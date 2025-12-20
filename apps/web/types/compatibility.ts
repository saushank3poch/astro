import type { ChineseElement, Asset } from './index';

export interface CompatibleAsset {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  compatibilityScore: number;
  elementHarmony: ElementHarmony;
  planetCompatibility?: PlanetCompatibility;
  overallReasoning: string;
  asset: Asset;
}

export interface ElementHarmony {
  favorableMatch: boolean;
  elementScore: number;
  reasoning: string;
  userElements: ChineseElement[];
  assetElements: ChineseElement[];
  relationship: ElementRelationship;
}

export type ElementRelationship = 'productive' | 'reductive' | 'neutral' | 'controlling' | 'insulting';

export interface PlanetCompatibility {
  score: number;
  harmonicAspects: string[];
  challengingAspects: string[];
  reasoning: string;
}

export interface CompatibilityFilters {
  assetType?: 'all' | 'crypto' | 'stock' | 'commodity';
  sortBy?: 'score' | 'alphabetical';
  searchQuery?: string;
  minScore?: number;
}

export interface CompatibilityDetail extends CompatibleAsset {
  detailedAnalysis: {
    elementAnalysis: string;
    planetaryAnalysis?: string;
    timingAnalysis: string;
  };
  similarAssets: CompatibleAsset[];
  bestEntryPeriods: EntryPeriod[];
}

export interface EntryPeriod {
  start: string;
  end: string;
  score: number;
  reason: string;
}
