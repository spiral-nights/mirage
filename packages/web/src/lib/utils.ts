import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { nip19 } from 'nostr-tools';

export function getAppCanonicalId(naddr: string): string {
  try {
    const decoded = nip19.decode(naddr);
    if (decoded.type === 'naddr') {
      const data = decoded.data as { pubkey: string; identifier: string; kind: number };
      return `${data.kind}:${data.pubkey}:${data.identifier}`;
    }
    return naddr;
  } catch {
    return naddr;
  }
}
