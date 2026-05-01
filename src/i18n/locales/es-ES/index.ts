// Exportación central de todas las traducciones ES-ES
import { esESCommon } from './common';
import { esESLogin } from './login';
import { esESDashboard } from './dashboard';
import { esESMatches } from './matches';
import { esESProfile } from './profile';
import { esESErrors } from './errors';
import { esESAuth } from './auth';
import { esESSettings } from './settings';
import { esESStore } from './store';
import { esESChat } from './chat';
import { esESCreate } from './create';
import { esESExplore } from './explore';
import { esESAgenda } from './agenda';
import { esESNotifications } from './notifications';
import { esESRating } from './rating';
import { esESHelp } from './help';
import { esESSupport } from './support';
import { esESLegal } from './legal';
import { esESQuadras } from './quadras';
import type { TranslationResource } from '../../types';

export const esESTranslations: TranslationResource = {
  common: esESCommon,
  login: esESLogin,
  dashboard: esESDashboard,
  matches: esESMatches,
  profile: esESProfile,
  errors: esESErrors,
  auth: esESAuth,
  settings: esESSettings,
  store: esESStore,
  chat: esESChat,
  create: esESCreate,
  explore: esESExplore,
  agenda: esESAgenda,
  notifications: esESNotifications,
  rating: esESRating,
  help: esESHelp,
  support: esESSupport,
  legal: esESLegal,
  quadras: esESQuadras,
};
