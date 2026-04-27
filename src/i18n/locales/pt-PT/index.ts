// Exportação central de todas as traduções PT-PT
import { ptPTCommon } from './common';
import { ptPTLogin } from './login';
import { ptPTDashboard } from './dashboard';
import { ptPTMatches } from './matches';
import { ptPTProfile } from './profile';
import { ptPTErrors } from './errors';
import { ptPTAuth } from './auth';
import { ptPTSettings } from './settings';
import { ptPTStore } from './store';
import { ptPTChat } from './chat';
import { ptPTCreate } from './create';
import { ptPTExplore } from './explore';
import { ptPTAgenda } from './agenda';
import { ptPTNotifications } from './notifications';
import { ptPTRating } from './rating';
import { ptPTHelp } from './help';
import { ptPTSupport } from './support';
import { ptPTLegal } from './legal';
import type { TranslationResource } from '../../types';

export const ptPTTranslations: TranslationResource = {
  common: ptPTCommon,
  login: ptPTLogin,
  dashboard: ptPTDashboard,
  matches: ptPTMatches,
  profile: ptPTProfile,
  errors: ptPTErrors,
  auth: ptPTAuth,
  settings: ptPTSettings,
  store: ptPTStore,
  chat: ptPTChat,
  create: ptPTCreate,
  explore: ptPTExplore,
  agenda: ptPTAgenda,
  notifications: ptPTNotifications,
  rating: ptPTRating,
  help: ptPTHelp,
  support: ptPTSupport,
  legal: ptPTLegal,
};
