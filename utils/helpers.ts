
import { ReferralSource, ReferralSourceType } from '../types';

export const MVM_LOGO_URL = 'https://mvm-ltd.co.uk/wp-content/themes/mvm-ltd/assets/images/mvm-logo.svg';

export const formatReferralSource = (source?: ReferralSource): string => {
  if (!source) return 'N/A';
  if ((source.type === ReferralSourceType.REFERRAL || source.type === ReferralSourceType.OTHER) && source.detail) {
    return `${source.type} (${source.detail})`;
  }
  return source.type;
};
