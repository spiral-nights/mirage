export interface RelayConfig {
  url: string;
  name: string;
}

export const DEFAULT_RELAYS: RelayConfig[] = [
  { url: 'wss://relay.damus.io', name: 'Damus' },
  { url: 'wss://nos.lol', name: 'Nos.lol' },
  { url: 'wss://relay.nostr.band', name: 'Nostr.band' },
  { url: 'wss://relay.snort.social', name: 'Snort' },
  { url: 'wss://purplepag.es', name: 'Purple Pages' },
  { url: 'wss://relay.primal.net', name: 'Primal' },
  { url: 'wss://eden.nostr.land', name: 'Eden' },
  { url: 'wss://relay.current.fyi', name: 'Current' },
  { url: 'wss://offchain.pub', name: 'Offchain' },
  { url: 'wss://relay.orangepill.dev', name: 'Orange Pill' },
];

export const INITIAL_ENABLED_RELAYS = ['wss://relay.damus.io'];
