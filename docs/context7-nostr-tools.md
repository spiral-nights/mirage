### Install nostr-tools via npm or jsr

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Instructions for installing the nostr-tools package using either npm or jsr (JavaScript Registry). Ensure you have Node.js and npm installed, or use npx for jsr installation.

```bash
# npm
npm install --save nostr-tools

# jsr
npx jsr add @nostr/tools
```

--------------------------------

### Create, Sign, and Verify Nostr Events

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Demonstrates how to create, sign, and verify Nostr events. Events are finalized with metadata like kind, timestamp, tags, and content, then signed with a private key. Verification ensures the event's integrity. Requires 'finalizeEvent' and 'verifyEvent' from 'nostr-tools/pure'.

```javascript
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'

let event = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'hello',
}, sk)

let isGood = verifyEvent(event)
```

--------------------------------

### Connect to Bunker using URI (Bunker-Initiated)

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Establishes a connection to a remote NIP-46 signer using a bunker-initiated flow. Requires parsing a bunker URI, creating a BunkerSigner instance, and explicitly calling connect(). Handles signature requests and event signing.

```javascript
import { BunkerSigner, parseBunkerInput } from '@nostr/tools/nip46'
import { SimplePool } from '@nostr/tools/pool'

// parse a bunker URI
const bunkerPointer = await parseBunkerInput('bunker://abcd...?relay=wss://relay.example.com')
if (!bunkerPointer) {
  throw new Error('Invalid bunker input')
}

// create the bunker instance
const pool = new SimplePool()
const bunker = BunkerSigner.fromBunker(localSecretKey, bunkerPointer, { pool })
await bunker.connect()

// and use it
const pubkey = await bunker.getPublicKey()
const event = await bunker.signEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'Hello from bunker!'
})

// cleanup
await signer.close()
pool.close([])
```

--------------------------------

### Connect to Bunker using Client-Generated URI (Client-Initiated)

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Initiates a connection to a remote NIP-46 signer using a client-generated URI, ideal for QR code scanning. The BunkerSigner.fromURI() method is asynchronous and returns an already connected instance.

```javascript
import { getPublicKey } from '@nostr/tools/pure'
import { BunkerSigner, createNostrConnectURI } from '@nostr/tools/nip46'
import { SimplePool } from '@nostr/tools/pool'

const clientPubkey = getPublicKey(localSecretKey)

// generate a connection URI for the bunker to scan
const connectionUri = createNostrConnectURI({
  clientPubkey,
  relays: ['wss://relay.damus.io', 'wss://relay.primal.net'],
  secret: 'a-random-secret-string', // A secret to verify the bunker's response
  name: 'My Awesome App'
})

// wait for the bunker to connect
const pool = new SimplePool()
const signer = await BunkerSigner.fromURI(localSecretKey, connectionUri, { pool })

// and use it
const pubkey = await signer.getPublicKey()
const event = await signer.signEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'Hello from a client-initiated connection!'
})

// cleanup
await signer.close()
pool.close([])
```

--------------------------------

### Query Profile Data from NIP-05 Address

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Fetches profile data for a given NIP-05 address. Requires 'nostr-tools/nip05' and an async environment. Output includes public key and relays.

```javascript
import { queryProfile } from 'nostr-tools/nip05'

let profile = await queryProfile('jb55.com')
console.log(profile.pubkey)
// prints: 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245
console.log(profile.relays)
// prints: [wss://relay.damus.io]
```

--------------------------------

### Load nostr-tools in the Browser without a Bundler

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Provides a method to include the nostr-tools library in a web page using a pre-compiled JavaScript bundle from a CDN, suitable for environments without module bundlers.

```html
<script src="https://unpkg.com/nostr-tools/lib/nostr.bundle.js"></script>
<script>
  window.NostrTools.generateSecretKey('...') // and so on
</script>
```

--------------------------------

### Interact with Nostr Relays using SimplePool

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Manages interactions with one or multiple Nostr relays using the `SimplePool` class. This includes querying for specific events, subscribing to event streams, publishing new events, and handling relay connections. Requires 'SimplePool' from 'nostr-tools/pool'.

```javascript
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'

const pool = new SimplePool()

const relays = ['wss://relay.example.com', 'wss://relay.example2.com']

// let's query for one event that exists
const event = pool.get(
  relays,
  {
    ids: ['d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027'],
  },
)
if (event) {
  console.log('it exists indeed on this relay:', event)
}

// let's query for more than one event that exists
const events = pool.querySync(
  relays,
  {
    kinds: [1],
    limit: 10
  },
)
if (events) {
  console.log('it exists indeed on this relay:', events)
}

// let's publish a new event while simultaneously monitoring the relay for it
let sk = generateSecretKey()
let pk = getPublicKey(sk)

pool.subscribe(
  ['wss://a.com', 'wss://b.com', 'wss://c.com'],
  {
    kinds: [1],
    authors: [pk],
  },
  {
    onevent(event) {
      console.log('got event:', event)
    }
  }
)

let eventTemplate = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'hello world',
}

// this assigns the pubkey, calculates the event id and signs the event in a single step
const signedEvent = finalizeEvent(eventTemplate, sk)
await Promise.any(pool.publish(['wss://a.com', 'wss://b.com'], signedEvent))

relay.close()
```

--------------------------------

### Use nostr-wasm with AbstractRelay and AbstractSimplePool

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Integrates nostr-wasm's `verifyEvent` function with `AbstractRelay` and `AbstractSimplePool` for potentially faster event verification. Requires importing abstract classes from 'nostr-tools/abstract-relay' and 'nostr-tools/abstract-pool'.

```javascript
import { setNostrWasm, verifyEvent } from 'nostr-tools/wasm'
import { AbstractRelay } from 'nostr-tools/abstract-relay'
import { AbstractSimplePool } from 'nostr-tools/abstract-pool'
import { initNostrWasm } from 'nostr-wasm'

initNostrWasm().then(setNostrWasm)

const relay = AbstractRelay.connect('wss://relayable.org', { verifyEvent })
const pool = new AbstractSimplePool({ verifyEvent })
```

--------------------------------

### Configure WebSocket Implementation for Node.js

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Enables the use of WebSockets in Node.js environments by providing a WebSocket implementation to nostr-tools. This is necessary for relay communication when not in a browser. Requires the 'ws' package and the 'useWebSocketImplementation' function.

```javascript
import { useWebSocketImplementation } from 'nostr-tools/pool'
// or import { useWebSocketImplementation } from 'nostr-tools/relay' if you're using the Relay directly

import WebSocket from 'ws'
useWebSocketImplementation(WebSocket)
```

--------------------------------

### Initialize nostr-wasm for NSTR Tools

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Initializes the nostr-wasm module, which provides WASM-compiled cryptographic functions for Nostr. The `initNostrWasm` promise must resolve before using WASM functions like `finalizeEvent` or `verifyEvent`.

```javascript
import { setNostrWasm, generateSecretKey, finalizeEvent, verifyEvent } from 'nostr-tools/wasm'
import { initNostrWasm } from 'nostr-wasm'

// make sure this promise resolves before your app starts calling finalizeEvent or verifyEvent
initNostrWasm().then(setNostrWasm)

// or use 'nostr-wasm/gzipped' or even 'nostr-wasm/headless',
// see https://www.npmjs.com/package/nostr-wasm for options
```

--------------------------------

### Include NIP-07 Types for WindowNostr

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Declares NIP-07 types for the WindowNostr interface, enabling TypeScript support for browser-based Nostr interactions.

```typescript
import type { WindowNostr } from 'nostr-tools/nip07'

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
```

--------------------------------

### Configure Node-Fetch for Older Node.js Versions

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Configures nostr-tools to use a specific fetch implementation, necessary for Node.js versions older than v18. Requires 'node-fetch@2'.

```javascript
import { useFetchImplementation } from 'nostr-tools/nip05'
useFetchImplementation(require('node-fetch'))
```

--------------------------------

### Generate Nostr Private and Public Keys

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Generates a private key (secret key) and derives the corresponding public key. The private key is a Uint8Array, and the public key is a hex string. Requires the 'generateSecretKey' and 'getPublicKey' functions from 'nostr-tools/pure'.

```javascript
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'

let sk = generateSecretKey() // `sk` is a Uint8Array
let pk = getPublicKey(sk) // `pk` is a hex string
```

--------------------------------

### Parse Nostr References (NIP-27) from Content

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Parses content strings to identify and extract Nostr references (mentions of users, events, or other entities) according to NIP-27. It categorizes different types of references, including text, user/event/profile URIs, URLs, media, and relay addresses.

```javascript
import * as nip27 from '@nostr/tools/nip27'

for (let block of nip27.parse(evt.content)) {
  switch (block.type) {
    case 'text':
      console.log(block.text)
      break
    case 'reference': {
      if ('id' in block.pointer) {
        console.log("it's a nevent1 uri", block.pointer)
      } else if ('identifier' in block.pointer) {
        console.log("it's a naddr1 uri", block.pointer)
      } else {
        console.log("it's an npub1 or nprofile1 uri", block.pointer)
      }
      break
    }
    case 'url': {
      console.log("it's a normal url:", block.url)
      break
    }
    case 'image':
    case 'video':
    case 'audio':
      console.log("it's a media url:", block.url)
      break
    case 'relay':
      console.log("it's a websocket url, probably a relay address:", block.url)
      break
    default:
      break
  }
}
```

--------------------------------

### Generate Local Secret Key for Bunker Connection

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Generates a local secret key required for secure communication with a NIP-46 bunker. This key should be persisted for the user's session.

```javascript
import { generateSecretKey } from '@nostr/tools/pure'

const localSecretKey = generateSecretKey()
```

--------------------------------

### Convert Nostr Keys between Uint8Array and Hex

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Converts Nostr keys between Uint8Array and hexadecimal string formats using utility functions from the '@noble/hashes/utils' package. This is useful for displaying or storing keys in a readable format.

```javascript
import { bytesToHex, hexToBytes } from '@noble/hashes/utils' // already an installed dependency

let skHex = bytesToHex(sk)
let backToBytes = hexToBytes(skHex)
```

--------------------------------

### Encode and Decode NIP-19 Codes

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Demonstrates encoding and decoding of Nostr NIP-19 identifiers such as nsec, npub, and nprofile. Uses functions from 'nostr-tools/pure' and 'nostr-tools/nip19'.

```javascript
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'

let sk = generateSecretKey()
let nsec = nip19.nsecEncode(sk)
let { type, data } = nip19.decode(nsec)
assert(type === 'nsec')
assert(data === sk)

let pk = getPublicKey(generateSecretKey())
let npub = nip19.npubEncode(pk)
let { type, data } = nip19.decode(npub)
assert(type === 'npub')
assert(data === pk)

let pk = getPublicKey(generateSecretKey())
let relays = ['wss://relay.nostr.example.mydomain.example.com', 'wss://nostr.banana.com']
let nprofile = nip19.nprofileEncode({ pubkey: pk, relays })
let { type, data } = nip19.decode(nprofile)
assert(type === 'nprofile')
assert(data.pubkey === pk)
assert(data.relays.length === 2)
```

--------------------------------

### Parse Nostr Event Threads using NIP-10

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Parses a Nostr event to identify its place within a conversation thread according to NIP-10. It extracts information about the root event, parent reply, mentions, quotes, and referenced profiles.

```javascript
import * as nip10 from '@nostr/tools/nip10'

// event is a nostr event with tags
const refs = nip10.parse(event)

// get the root event of the thread
if (refs.root) {
  console.log('root event:', refs.root.id)
  console.log('root event relay hints:', refs.root.relays)
  console.log('root event author:', refs.root.author)
}

// get the immediate parent being replied to
if (refs.reply) {
  console.log('reply to:', refs.reply.id)
  console.log('reply relay hints:', refs.reply.relays)
  console.log('reply author:', refs.reply.author)
}

// get any mentioned events
for (let mention of refs.mentions) {
  console.log('mentioned event:', mention.id)
  console.log('mention relay hints:', mention.relays)
  console.log('mention author:', mention.author)
}

// get any quoted events
for (let quote of refs.quotes) {
  console.log('quoted event:', quote.id)
  console.log('quote relay hints:', quote.relays)
}

// get any referenced profiles
for (let profile of refs.profiles) {
  console.log('referenced profile:', profile.pubkey)
  console.log('profile relay hints:', profile.relays)
}
```

--------------------------------

### Enable Ping Heartbeat for Relays

Source: https://github.com/nbd-wtf/nostr-tools/blob/master/README.md

Activates regular pings to connected Nostr relays to ensure the connection remains active and detect disconnections. This feature helps improve reliability on platforms that might not reliably report WebSocket disconnections. Configured via the 'enablePing' option in SimplePool.

```javascript
import { SimplePool } from 'nostr-tools/pool'

const pool = new SimplePool({ enablePing: true })
```

=== COMPLETE CONTENT === This response contains all available snippets from this library. No additional content exists. Do not make further requests.
