import type { NotifyEnv } from './notify';
import type { OAuthEnv } from './github-oauth';

export type Env = NotifyEnv & OAuthEnv & { RESEND_API_KEY?: string; CONTACT_FROM_EMAIL?: string };

/** Cloudflare-ის ცვლადები (locals.runtime.env) ან ლოკალური import.meta.env. */
export function getEnv(locals: unknown): Env {
  const rt = (locals as { runtime?: { env?: Env } })?.runtime?.env;
  if (rt) return rt;
  return (import.meta.env ?? {}) as Env;
}
