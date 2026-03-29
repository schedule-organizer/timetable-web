type HeadersInit =
  | HeadersPolyfill
  | string[][]
  | Record<string, string>

type BodyInit = string | null

interface ResponseInit {
  status?: number
  statusText?: string
  headers?: HeadersInit
}

interface RequestInit {
  method?: string
  headers?: HeadersInit
  body?: BodyInit
}

class HeadersPolyfill {
  #entries = new Map<string, string>()

  constructor(init?: HeadersInit) {
    if (!init) {
      return
    }

    if (init instanceof HeadersPolyfill) {
      init.forEach((value, name) => this.set(name, value))
    } else if (Array.isArray(init)) {
      for (const [name, value] of init) {
        this.append(name, value)
      }
    } else {
      Object.entries(init).forEach(([name, value]) => {
        this.set(name, value)
      })
    }
  }

  append(name: string, value: string) {
    this.#entries.set(name.toLowerCase(), value)
  }

  delete(name: string) {
    this.#entries.delete(name.toLowerCase())
  }

  forEach(callback: (value: string, name: string) => void) {
    this.#entries.forEach((value, key) => callback(value, key))
  }

  get(name: string) {
    return this.#entries.get(name.toLowerCase()) ?? null
  }

  has(name: string) {
    return this.#entries.has(name.toLowerCase())
  }

  set(name: string, value: string) {
    this.#entries.set(name.toLowerCase(), value)
  }

  entries() {
    return this.#entries.entries()
  }

  keys() {
    return this.#entries.keys()
  }

  values() {
    return this.#entries.values()
  }

  [Symbol.iterator]() {
    return this.entries()
  }
}

class ResponsePolyfill {
  readonly headers: HeadersPolyfill
  readonly status: number
  readonly statusText: string
  readonly ok: boolean
  readonly redirected = false
  url = ''
  readonly type: 'basic' | 'cors' | 'default' = 'default'
  #body: string | null

  constructor(body?: BodyInit, init: ResponseInit = {}) {
    if (body === undefined) {
      this.#body = null
    } else if (typeof body === 'string') {
      this.#body = body
    } else {
      this.#body = body
    }

    this.status = init.status ?? 200
    this.statusText = init.statusText ?? ''
    this.headers = new HeadersPolyfill(init.headers)
    this.ok = this.status >= 200 && this.status < 300
  }

  async json() {
    if (!this.#body) {
      return null
    }
    return JSON.parse(this.#body)
  }

  async arrayBuffer() {
    const text = this.#body ?? ''
    const encoder = new TextEncoder()
    return encoder.encode(text).buffer
  }

  async text() {
    return this.#body ?? ''
  }

  clone() {
    return new ResponsePolyfill(this.#body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    })
  }
}

class RequestPolyfill {
  readonly method: string
  readonly headers: HeadersPolyfill
  readonly url: string
  readonly body: string | null

  constructor(input: string, init: RequestInit = {}) {
    this.url = input
    this.method = init.method?.toUpperCase() ?? 'GET'
    this.headers = new HeadersPolyfill(init.headers)
    this.body = init.body ?? null
  }

  clone() {
    return new RequestPolyfill(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
    })
  }

  async arrayBuffer() {
    const text = this.body ?? ''
    const encoder = new TextEncoder()
    return encoder.encode(text).buffer
  }

  async text() {
    return this.body ?? ''
  }

  async json() {
    if (!this.body) return null
    return JSON.parse(this.body)
  }
}

class BroadcastChannelPolyfill {
  name: string
  onmessage: ((event: { data: unknown }) => void) | null = null

  constructor(name: string) {
    this.name = name
  }

  close() {
    this.onmessage = null
  }

  postMessage(_data: unknown) {
    // No-op
  }

  addEventListener(_type: string, _listener: (event: { data: unknown }) => void) {
    // No-op
  }

  removeEventListener(_type: string, _listener: (event: { data: unknown }) => void) {
    // No-op
  }
}

export async function installGlobalFetchPolyfills() {
  if (typeof globalThis.Headers === 'undefined') {
    // @ts-expect-error Assigning polyfill to DOM globals
    globalThis.Headers = HeadersPolyfill
  }
  if (typeof globalThis.Request === 'undefined') {
    // @ts-expect-error Assigning polyfill to DOM globals
    globalThis.Request = RequestPolyfill
  }
  if (typeof globalThis.Response === 'undefined') {
    // @ts-expect-error Assigning polyfill to DOM globals
    globalThis.Response = ResponsePolyfill
  }

  if (
    typeof globalThis.TransformStream === 'undefined' ||
    typeof globalThis.WritableStream === 'undefined' ||
    typeof globalThis.ReadableStream === 'undefined'
  ) {
    const { TransformStream, WritableStream, ReadableStream } = await import('node:stream/web')
    // @ts-expect-error Assigning polyfill to DOM globals
    globalThis.TransformStream = TransformStream
    // @ts-expect-error Assigning polyfill to DOM globals
    globalThis.WritableStream = WritableStream
    // @ts-expect-error Assigning polyfill to DOM globals
    globalThis.ReadableStream = ReadableStream
  }

  if (typeof globalThis.BroadcastChannel === 'undefined') {
    // @ts-expect-error Assigning polyfill to DOM globals
    globalThis.BroadcastChannel = BroadcastChannelPolyfill
  }
}

await installGlobalFetchPolyfills()
