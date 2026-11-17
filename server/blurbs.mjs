// Likes and moderated comments for blurbs. Every read and write goes through
// the Postgres functions in sql/2026-11-18-blurb-likes-comments.sql.
const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/;
const SESSION = /^[A-Za-z0-9_-]{8,100}$/;

export const validSlug = (value) => typeof value === 'string' && SLUG.test(value);
export const validSession = (value) => typeof value === 'string' && SESSION.test(value);

/** Returns the cleaned comment, 'spam' when the hidden field was filled, or null when invalid. */
export function validateComment(body) {
  if (!body || typeof body !== 'object' || !validSlug(body.slug)) return null;
  if (typeof body.website === 'string' && body.website.trim()) return 'spam';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const text = typeof body.body === 'string' ? body.body.trim() : '';
  if (!name || name.length > 60 || !text || text.length > 2000) return null;
  return { slug: body.slug, name, body: text };
}

export class StoreError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export function createBlurbStore({ url, key, fetcher = fetch }) {
  async function rpc(name, parameters) {
    if (!url || !key) throw new StoreError('Database connection unavailable', 503);
    const response = await fetcher(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters), signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();
    if (!response.ok) {
      const message = (() => { try { return JSON.parse(text).message; } catch { return ''; } })();
      if (message === 'Too many pending comments') throw new StoreError('Too many comments right now. Try again later.', 429);
      throw new StoreError('Database unavailable', 503);
    }
    return text ? JSON.parse(text) : null;
  }
  return {
    engagement: (slug, sessionId) => rpc('get_blurb_engagement', { p_slug: slug, p_session_id: sessionId ?? null }),
    like: async (slug, sessionId, liked) => ({ likes: await rpc('set_blurb_like', { p_slug: slug, p_session_id: sessionId, p_liked: liked }), liked }),
    comment: (comment) => rpc('submit_blurb_comment', { p_slug: comment.slug, p_name: comment.name, p_body: comment.body }),
  };
}

/** Emails a new comment for review. Failures are reported, never thrown: the comment is already saved. */
export async function notifyComment({ apiKey, from, to, origin, reviewUrl, comment, fetcher = fetch }) {
  if (!apiKey || !from || !to) return false;
  const text = [
    `${comment.name} commented on ${origin}/blurb/${comment.slug}`,
    '',
    comment.body,
    '',
    `Approve or reject it at ${reviewUrl}`,
  ].join('\n');
  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `Rishi's site <${from}>`, to: [to], subject: `New comment from ${comment.name} on ${comment.slug}`, text }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
