import { ZTagCommand } from '../types/ztag';
import { BASIC_COMMANDS } from './commands/basic';
import { ADVANCED_NETWORK_COMMANDS } from './commands/advancedNetwork';
import { AAA_COMMANDS } from './commands/aaa';
import { POLICY_VPN_COMMANDS } from './commands/policyVpn';
import { WEB_PROXY_COMMANDS } from './commands/webProxy';
import { HA_SECURITY_COMMANDS } from './commands/haSecurity';
import { SYSTEM_TOOLS_COMMANDS } from './commands/systemTools';

export const ALL_ZTAG_COMMANDS: ZTagCommand[] = [
  ...BASIC_COMMANDS,
  ...ADVANCED_NETWORK_COMMANDS,
  ...AAA_COMMANDS,
  ...POLICY_VPN_COMMANDS,
  ...WEB_PROXY_COMMANDS,
  ...HA_SECURITY_COMMANDS,
  ...SYSTEM_TOOLS_COMMANDS,
];
