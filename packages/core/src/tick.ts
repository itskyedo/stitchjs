import { type Canvas } from './canvas';
import { createEffect } from './effects';
import { useStitchContext } from './stitch-context';
import { untrack } from './untrack';

/**
 * Creates an effect runs on every frame tick.
 *
 * @param fn - An effect that runs on every frame tick.
 */
export function createTick(fn: (deltaTime: number) => void): void {
  const stitch = useStitchContext((canvas): canvas is Canvas => true);
  if (!stitch) {
    throw new Error(
      'Cannot call createTick outside of a mounting stitch instance.',
    );
  }

  createEffect(() => {
    stitch.frameId();

    untrack(() => fn(stitch.deltaTime));
  });
}
