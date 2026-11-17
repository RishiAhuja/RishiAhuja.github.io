type Comment = { id: string; name: string; body: string; createdAt: string };
type Engagement = { likes: number; liked: boolean; comments: Comment[] };

const LIKE_KEY = 'blurb_like_id';
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Likes need an identity that outlives the tab, so this one lives in
// localStorage. Without storage the count still shows; liking is disabled.
function likeId() {
  try {
    let id = localStorage.getItem(LIKE_KEY);
    if (!id) { id = `like_${crypto.randomUUID()}`; localStorage.setItem(LIKE_KEY, id); }
    return id;
  } catch { return null; }
}

function endpoint() {
  if (['localhost', '127.0.0.1'].includes(location.hostname)) return 'http://127.0.0.1:4326/api/blurbs';
  return new URL('/api/blurbs', document.body.dataset.analyticsEndpoint || 'https://rishia.in').href;
}

export function mountBlurbEngagement() {
  const root = document.querySelector<HTMLElement>('[data-blurb-engagement]');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  const slug = root.dataset.blurbEngagement!;
  const api = endpoint();
  const session = likeId();
  // The like button sits in the page header, away from the comments.
  const likeButton = document.querySelector<HTMLButtonElement>('[data-like]')!;
  const likeLabel = likeButton.querySelector<HTMLElement>('[data-like-label]')!;
  const likeCount = likeButton.querySelector<HTMLElement>('[data-like-count]')!;
  const list = root.querySelector<HTMLOListElement>('[data-comment-list]')!;
  const status = root.querySelector<HTMLElement>('[data-comments-status]')!;
  const form = root.querySelector<HTMLFormElement>('[data-comment-form]')!;
  const feedback = root.querySelector<HTMLElement>('[data-comment-feedback]')!;
  let likes = 0, liked = false;

  const showLikes = () => {
    likeButton.setAttribute('aria-pressed', String(liked));
    likeLabel.textContent = liked ? 'Liked' : 'Like';
    likeCount.textContent = likes ? String(likes) : '';
    likeButton.setAttribute('aria-label', `${liked ? 'Liked' : 'Like this post'}${likes ? `, ${likes} ${likes === 1 ? 'like' : 'likes'}` : ''}`);
  };
  const showComments = (comments: Comment[]) => {
    list.replaceChildren(...comments.map((comment) => {
      const item = document.createElement('li');
      const meta = document.createElement('p');
      meta.className = 'comment-meta';
      const name = document.createElement('strong');
      name.textContent = comment.name;
      const when = document.createElement('time');
      when.dateTime = comment.createdAt;
      when.textContent = date.format(new Date(comment.createdAt));
      meta.append(name, when);
      const body = document.createElement('p');
      body.className = 'comment-body';
      body.textContent = comment.body;
      item.append(meta, body);
      return item;
    }));
    status.textContent = comments.length ? '' : 'No comments yet.';
    status.hidden = comments.length > 0;
  };

  const query = new URLSearchParams({ slug, ...(session ? { session } : {}) });
  fetch(`${api}?${query}`, { credentials: 'omit' })
    .then((response) => { if (!response.ok) throw new Error(); return response.json() as Promise<Engagement>; })
    .then((data) => {
      likes = data.likes; liked = data.liked; showLikes(); showComments(data.comments);
      likeButton.disabled = !session; likeButton.hidden = false; root.hidden = false;
    })
    .catch(() => { /* Likes and comments stay hidden while the database is unavailable. */ });

  likeButton.addEventListener('click', async () => {
    if (!session) return;
    const previous = { likes, liked };
    liked = !liked; likes += liked ? 1 : -1; showLikes();
    try {
      const response = await fetch(api, {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', slug, sessionId: session, liked }),
      });
      if (!response.ok) throw new Error();
      likes = (await response.json()).likes; showLikes();
    } catch {
      ({ likes, liked } = previous); showLikes();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const body = String(data.get('body') || '').trim();
    if (!name || !body) { feedback.textContent = 'Add your name and a comment first.'; return; }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true; feedback.textContent = 'Posting…';
    try {
      const response = await fetch(api, {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', slug, name, body, website: String(data.get('website') || '') }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Your comment couldn’t be posted. Try again in a bit.');
      form.reset();
      feedback.textContent = 'Thanks! Your comment will appear once I’ve read it.';
    } catch (error) {
      feedback.textContent = (error as Error).message;
    } finally {
      button.disabled = false;
    }
  });
}
