// Central export of all EN-US translations
import { enUSCommon } from './common';
import { enUSLogin } from './login';
import { enUSDashboard } from './dashboard';
import { enUSMatches } from './matches';
import { enUSProfile } from './profile';
import { enUSErrors } from './errors';
import { enUSAuth } from './auth';
import { enUSSettings } from './settings';
import { enUSStore } from './store';
import { enUSChat } from './chat';
import { enUSCreate } from './create';
import { enUSExplore } from './explore';
import { enUSAgenda } from './agenda';
import { enUSNotifications } from './notifications';
import { enUSRating } from './rating';
import { enUSHelp } from './help';
import { enUSSupport } from './support';
import { enUSLegal } from './legal';
import type { TranslationResource } from '../../types';

export const enUSTranslations: TranslationResource = {
  common: enUSCommon,
  login: enUSLogin,
  dashboard: enUSDashboard,
  matches: enUSMatches,
  profile: enUSProfile,
  errors: enUSErrors,
  auth: enUSAuth,
  settings: enUSSettings,
  store: enUSStore,
  chat: enUSChat,
  create: enUSCreate,
  explore: enUSExplore,
  agenda: enUSAgenda,
  notifications: enUSNotifications,
  rating: enUSRating,
  help: enUSHelp,
  support: enUSSupport,
  legal: enUSLegal,
};
