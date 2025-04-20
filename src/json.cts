export type SupportType = string;

export interface RawFeatureStats {
  aol: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  'apple-mail': {
    ios: Record<string, SupportType>;
    macos: Record<string, SupportType>;
  };
  fastmail: { 'desktop-webmail': Record<string, SupportType> };
  gmail: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
    'mobile-webmail': Record<string, SupportType>;
  };
  hey: { 'desktop-webmail': Record<string, SupportType> };
  laposte: { 'desktop-webmail': Record<string, SupportType> };
  'mail-ru': { 'desktop-webmail': Record<string, SupportType> };
  orange: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  outlook: {
    android: Record<string, SupportType>;
    ios: Record<string, SupportType>;
    macos: Record<string, SupportType>;
    'outlook-com': Record<string, SupportType>;
    windows: Record<string, SupportType>;
    'windows-mail': Record<string, SupportType>;
  };
  protonmail: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  'samsung-email': { android: Record<string, SupportType> };
  sfr: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  thunderbird: { macos: Record<string, SupportType> };
  yahoo: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
}

export interface RawFeatureData {
  category: 'html' | 'css' | 'image';
  description: string | null;
  keywords: string | null;
  last_test_date: string;
  notes: string | null;
  notes_by_num: null | Record<string, string>;
  slug: string;
  stats: RawFeatureStats;
  test_results_url: string | null;
  test_url: string;
  title: string;
  url: string;
}

export interface CanIEmailJson {
  api_version: string;
  data: RawFeatureData[];
  last_update_date: string;
  nice_names: any;
}

// Note: This is due to Node v20 and Node v22 diverging on `with 'json'` and `assert 'json'` on importing JSON
export const caniEmailJson = require('../data/caniemail.json') as CanIEmailJson;
