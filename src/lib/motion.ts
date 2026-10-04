export const MAX_MOTION_MS = 200;
export const MOTION_EASE = 'cubic-bezier(.2,.7,.2,1)';
export const motionDuration = (milliseconds: number, reduced: boolean) => reduced ? 0 : Math.max(0, Math.min(MAX_MOTION_MS, milliseconds));

/** One page owns its listeners, animations and observers. */
export class MotionScope {
  private controller = new AbortController();
  private animations = new Set<Animation>();
  private cleanups: (() => void)[] = [];
  constructor(private media: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')) {
    media.addEventListener('change', () => {
      if (media.matches) this.animations.forEach((animation) => animation.finish());
    }, { signal: this.signal });
  }
  get signal() { return this.controller.signal; }
  get reduced() { return this.media.matches; }
  onCleanup(cleanup: () => void) { this.cleanups.push(cleanup); }
  play(element: Element, frames: Keyframe[], milliseconds: number, finished?: () => void): Animation | null {
    if (this.signal.aborted) return null;
    const duration = motionDuration(milliseconds, this.reduced);
    if (!duration || typeof element.animate !== 'function') { finished?.(); return null; }
    const animation = element.animate(frames, { duration, easing: MOTION_EASE });
    this.animations.add(animation);
    animation.finished.then(() => {
      this.animations.delete(animation);
      if (!this.signal.aborted) finished?.();
    }).catch(() => { this.animations.delete(animation); });
    return animation;
  }
  dispose() {
    if (this.signal.aborted) return;
    this.controller.abort();
    this.animations.forEach((animation) => animation.cancel());
    this.animations.clear();
    this.cleanups.reverse().forEach((cleanup) => cleanup());
    this.cleanups = [];
  }
}

/** A slow or failed image request must never overwrite a newer slide. */
export function latestRequest(signal: AbortSignal) {
  let generation = 0;
  return async <T>(load: () => Promise<T>, commit: (result: T) => void, failed?: () => void) => {
    const ticket = ++generation;
    try {
      const result = await load();
      if (signal.aborted || ticket !== generation) return false;
      commit(result);
      return true;
    } catch {
      if (!signal.aborted && ticket === generation) failed?.();
      return false;
    }
  };
}
