import { createClient } from '@supabase/supabase-js';
import { uploadToNativeBackend } from './upload';
import { EX_SUPABASE_ANON_KEY, getSupabaseApiKey, getSupabaseQueryHeaders } from './apiKey';
import {
  clearNativeSession,
  ensureValidNativeSession,
  readNativeSession,
  writeNativeSession,
} from './session';

// Use environment variables for configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://ex_supabase.jimatbiz.com';
const supabaseAnonKey = EX_SUPABASE_ANON_KEY;
export const supabaseUrlvalue = supabaseUrl;

export const useSupabase = () => {
  return { supabase };
};

export const cleanupAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const EX_SUPABASE_ENDPOINT = import.meta.env.VITE_EX_SUPABASE_API_URL || import.meta.env.VITE_EX_SUPABASE_ENDPOINT || "https://ex_supabase.jimatbiz.com";
const QUERY_ENDPOINT = `${EX_SUPABASE_ENDPOINT}/supabase/query`;

// [Types]
interface Filter { method: string; column: string; value: any; }
interface OrderSpec { column: string; ascending: boolean; }
interface QueryDescriptor {
  type: 'from' | 'rpc'; table?: string; operation?: string; select?: string; values?: any; filters?: Filter[]; order?: OrderSpec | OrderSpec[]; limit?: number; offset?: number; range?: { from: number; to: number }; single?: boolean; maybeSingle?: boolean; count?: string; function?: string; params?: Record<string, any>; onConflict?: string;
}
interface SupabaseResponse<T = any> { data: T | null; error: { message: string; code?: string } | null; count?: number | null; }

// [SupabaseQueryBuilder]
class SupabaseQueryBuilder implements PromiseLike<SupabaseResponse> {
  private descriptor: QueryDescriptor;
  private _countMode: string | null = null;
  constructor(descriptor: QueryDescriptor) { this.descriptor = descriptor; }
  select(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    if (!this.descriptor.operation || this.descriptor.operation === 'select') { this.descriptor.operation = 'select'; }
    if (columns) this.descriptor.select = columns;
    if (options?.count) { this._countMode = options.count; this.descriptor.count = options.count; }
    return this;
  }
  insert(values: any, options?: { onConflict?: string }) { this.descriptor.operation = 'insert'; this.descriptor.values = values; if (options?.onConflict) this.descriptor.onConflict = options.onConflict; return this; }
  update(values: any) { this.descriptor.operation = 'update'; this.descriptor.values = values; return this; }
  upsert(values: any, options?: { onConflict?: string }) { this.descriptor.operation = 'upsert'; this.descriptor.values = values; if (options?.onConflict) this.descriptor.onConflict = options.onConflict; return this; }
  delete() { this.descriptor.operation = 'delete'; return this; }
  private addFilter(method: string, column: string, value: any) { if (!this.descriptor.filters) this.descriptor.filters = []; this.descriptor.filters.push({ method, column, value }); return this; }
  eq(column: string, value: any) { return this.addFilter('eq', column, value); }
  neq(column: string, value: any) { return this.addFilter('neq', column, value); }
  gt(column: string, value: any) { return this.addFilter('gt', column, value); }
  gte(column: string, value: any) { return this.addFilter('gte', column, value); }
  lt(column: string, value: any) { return this.addFilter('lt', column, value); }
  lte(column: string, value: any) { return this.addFilter('lte', column, value); }
  like(column: string, value: any) { return this.addFilter('like', column, value); }
  ilike(column: string, value: any) { return this.addFilter('ilike', column, value); }
  is(column: string, value: any) { return this.addFilter('is', column, value); }
  in(column: string, values: any[]) { return this.addFilter('in', column, values); }
  contains(column: string, value: any) { return this.addFilter('cs', column, value); }
  or(filters: string) { return this.addFilter('or', '', filters); }
  not(column: string, operator: string, value: any) { return this.addFilter('not', column, { operator, value }); }
  order(column: string, options?: { ascending?: boolean; foreignTable?: string }) {
    const spec: OrderSpec = { column, ascending: options?.ascending ?? true };
    if (!this.descriptor.order) { this.descriptor.order = spec; } else if (Array.isArray(this.descriptor.order)) { this.descriptor.order.push(spec); } else { this.descriptor.order = [this.descriptor.order, spec]; }
    return this;
  }
  limit(count: number) { this.descriptor.limit = count; return this; }
  range(from: number, to: number) { this.descriptor.range = { from, to }; return this; }
  single() { this.descriptor.single = true; return this; }
  maybeSingle() { this.descriptor.maybeSingle = true; return this; }
  returns<TData = any>() { return this as any; }
  private async execute(): Promise<SupabaseResponse> {
    try {
      const response = await fetch(QUERY_ENDPOINT, { method: 'POST', headers: getSupabaseQueryHeaders(), body: JSON.stringify(this.descriptor) });
      const result = await response.json();
      if (!response.ok) { return { data: null, error: result.error || { message: `HTTP ${response.status}` }, count: null }; }
      return { data: result.data ?? null, error: result.error ?? null, count: result.count ?? null };
    } catch (err: any) { return { data: null, error: { message: err.message || 'Network error' }, count: null }; }
  }
  then<TResult1 = SupabaseResponse, TResult2 = never>(onfulfilled?: ((value: SupabaseResponse) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> { return this.execute().then(onfulfilled, onrejected); }
}

// [SupabaseStorageProxy]
class SupabaseStorageProxy {
  private bucket: string;
  constructor(bucket: string = '') { this.bucket = bucket; }
  from(bucket: string) { return new SupabaseStorageProxy(bucket); }
  async upload(path: string, file: File, options?: any) {
    try { const publicUrl = await uploadToNativeBackend(file, this.bucket, path); return { data: { path, publicUrl }, error: null }; } catch (err: any) { return { data: null, error: { message: err.message || 'Network error' } }; }
  }
  getPublicUrl(path: string) { return { data: { publicUrl: `${EX_SUPABASE_ENDPOINT}/uploads/${this.bucket}/${path}` } }; }
  async list(path: string = '', options?: { limit?: number; offset?: number; sortBy?: { column?: string; order?: string }; search?: string }) {
    try {
      const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/media/list`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: this.bucket, path, options }) });
      const result = await response.json();
      if (!response.ok) { return { data: null, error: result.error || { message: `HTTP ${response.status}` } }; }
      return { data: result.data, error: null };
    } catch (err: any) { return { data: null, error: { message: err.message || 'Network error' } }; }
  }
  async remove(paths: string[]) {
    try {
      const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/media/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: this.bucket, paths }) });
      const result = await response.json();
      if (!response.ok) { return { data: null, error: result.error || { message: `HTTP ${response.status}` } }; }
      return { data: result.data, error: null };
    } catch (err: any) { return { data: null, error: { message: err.message || 'Network error' } }; }
  }
}

// [SupabaseProxy class]
class SupabaseProxy {
  private realSupabase = createClient(supabaseUrl, supabaseAnonKey);
  
  private authListeners: Array<(event: string, session: any) => void> = [];

  private notifyAuthListeners = (event: string, session: any) => {
    this.authListeners.forEach(listener => listener(event, session));
  };

  private persistSession = (session: any, event: string) => {
    writeNativeSession(session);
    this.notifyAuthListeners(event, session);
  };

  auth = {
    getSession: async () => {
      try {
        const previous = readNativeSession();
        const session = await ensureValidNativeSession();
        if (!session) {
          if (previous) {
            this.notifyAuthListeners('SIGNED_OUT', null);
          }
          return { data: { session: null }, error: null };
        }
        if (previous && session.access_token !== previous.access_token) {
          this.notifyAuthListeners('TOKEN_REFRESHED', session);
        }
        return { data: { session }, error: null };
      } catch {
        clearNativeSession();
        this.notifyAuthListeners('SIGNED_OUT', null);
        return { data: { session: null }, error: null };
      }
    },
    refreshSession: async () => {
      const previous = readNativeSession();
      const session = await ensureValidNativeSession();
      if (session && previous && session.access_token !== previous.access_token) {
        this.notifyAuthListeners('TOKEN_REFRESHED', session);
      } else if (!session) {
        this.notifyAuthListeners('SIGNED_OUT', null);
      }
      return { data: { session }, error: session ? null : { message: 'Session expired' } };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.authListeners.push(callback);
      return { data: { subscription: { unsubscribe: () => { this.authListeners = this.authListeners.filter(l => l !== callback); } } } };
    },
    signInWithPassword: async (options: { email: string; password: string }) => {
      try {
        const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options),
        });
        const result = await response.json();
        if (!response.ok || result.error) {
          return { data: { user: null, session: null }, error: result.error || { message: 'Login failed' } };
        }
        if (result.data?.session) {
          this.persistSession(result.data.session, 'SIGNED_IN');
        }
        return { data: result.data, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error: { message: error.message || 'Network error during login' } };
      }
    },
    signInWithOAuth: async (options: any) => {
      // The current ex_supabase backend does not support the unified OAuth redirect flow
      // It only supports ID token login via /supabase/auth/google
      return { data: { url: null }, error: { message: 'Google OAuth redirect flow is not supported on this backend. Please use Google Sign-In with ID Token.' } };
    },
    signUp: async (options: any) => {
      try {
        const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options),
        });
        const result = await response.json();
        if (!response.ok || result.error) {
          return { data: { user: null, session: null }, error: result.error || { message: 'Signup failed' } };
        }
        if (result.data?.session) {
          this.persistSession(result.data.session, 'SIGNED_IN');
        }
        return { data: result.data, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error: { message: error.message || 'Network error during signup' } };
      }
    },
    resetPasswordForEmail: (email: string, options: any) => this.realSupabase.auth.resetPasswordForEmail(email, options),
    updateUser: async (attributes: any) => {
      const session = await ensureValidNativeSession();
      if (session) {
        try {
          const accessToken = session.access_token || getSupabaseApiKey();
          const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/auth/update-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: accessToken, 'Authorization': `Bearer ${accessToken}` },
            body: JSON.stringify({ data: attributes.data, user_id: session.user?.id })
          });
          const result = await response.json();
          if (result.data?.user) {
            session.user = session.user || { id: result.data.user.id };
            session.user.user_metadata = result.data.user.user_metadata;
            writeNativeSession(session);
            this.notifyAuthListeners('USER_UPDATED', session);
          }
          return result;
        } catch (e: any) {
          return { data: { user: null }, error: e };
        }
      }
      return this.realSupabase.auth.updateUser(attributes);
    },
    setSession: async (sessionInfo: any) => {
      const result = await this.realSupabase.auth.setSession(sessionInfo);
      if (result.data?.session) {
        this.persistSession(result.data.session, 'SIGNED_IN');
      }
      return result;
    },
    exchangeCodeForSession: async (code: string) => {
      const result = await this.realSupabase.auth.exchangeCodeForSession(code);
      if (result.data?.session) {
        this.persistSession(result.data.session, 'SIGNED_IN');
      }
      return result;
    },
    signOut: async () => {
      clearNativeSession();
      this.notifyAuthListeners('SIGNED_OUT', null);
      return this.realSupabase.auth.signOut();
    },
    getUser: async (token?: string) => {
      if (token) {
        try {
          const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/auth/get-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: token, 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({}),
          });
          return await response.json();
        } catch (e) { console.error('Failed to get user via token:', e); }
      }
      const session = await ensureValidNativeSession();
      if (session?.user) {
        return { data: { user: session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    },
    signInWithIdToken: async (options: { provider: string; token: string; fullName?: string }) => {
      const providerPath = options.provider === "apple" ? "apple-buyer" : "google";
      const endpoint = `${EX_SUPABASE_ENDPOINT}/supabase/auth/${providerPath}`;
      const body: Record<string, string> = { idToken: options.token };
      if (options.fullName) body.fullName = options.fullName;

      console.log(`[auth][proxy] signInWithIdToken start`, {
        provider: options.provider,
        endpoint,
        hasFullName: !!options.fullName,
        tokenLength: options.token.length,
        tokenPrefix: options.token.slice(0, 20) + "...",
      });

      try {
        const response = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        console.log(`[auth][proxy] signInWithIdToken HTTP response`, {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });

        let result: any;
        try {
          result = await response.json();
        } catch (parseErr: any) {
          console.error(`[auth][proxy] signInWithIdToken failed to parse JSON response`, parseErr);
          return { data: { user: null, session: null }, error: { message: `Invalid JSON from ${options.provider} login: ${parseErr.message}` } };
        }

        console.log(`[auth][proxy] signInWithIdToken result`, {
          hasData: !!result.data,
          hasSession: !!result.data?.session,
          hasUser: !!result.data?.user,
          hasError: !!result.error,
          error: result.error ?? null,
        });

        if (!response.ok || result.error) {
          console.error(`[auth][proxy] signInWithIdToken backend error`, { status: response.status, error: result.error });
          return { data: { user: null, session: null }, error: result.error || { message: `${options.provider} login failed` } };
        }
        if (result.data?.session) {
          this.persistSession(result.data.session, 'SIGNED_IN');
        }
        return { data: result.data, error: null };
      } catch (error: any) {
        console.error(`[auth][proxy] signInWithIdToken network/fetch error`, {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        return { data: { user: null, session: null }, error: { message: error.message || `Network error during ${options.provider} login` } };
      }
    }
  };

  from(table: string) {
    return new SupabaseQueryBuilder({ type: 'from', table, operation: 'select' });
  }

  rpc(functionName: string, params?: Record<string, any>) {
    return new SupabaseQueryBuilder({ type: 'rpc', function: functionName, params: params || {} });
  }

  channel(name: string) {
    const mockChannel = {
      on: (type: string, filter: any, callback: any) => mockChannel,
      subscribe: () => mockChannel,
      unsubscribe: () => {}
    };
    return mockChannel;
  }

  removeChannel(channel: any) {
    if (channel && channel.unsubscribe) channel.unsubscribe();
  }

  functions = {
    invoke: async (functionName: string, options?: { body?: any; headers?: Record<string, string>; method?: string }) => {
      try {
        const response = await fetch(QUERY_ENDPOINT, {
          method: 'POST',
          headers: getSupabaseQueryHeaders(),
          body: JSON.stringify({ type: 'function', function: functionName, body: options?.body, headers: options?.headers, method: options?.method }),
        });
        const result = await response.json();
        if (!response.ok) { return { data: null, error: result.error || { message: `HTTP ${response.status}` } }; }
        return { data: result.data ?? null, error: result.error ?? null };
      } catch (err: any) { return { data: null, error: { message: err.message || 'Network error' } }; }
    }
  };

  get storage() { return new SupabaseStorageProxy(); }
}

export const supabase = new SupabaseProxy() as any;
