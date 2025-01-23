import { type Canvas } from './canvas';
import { ComputationType } from './computation';
import { isDynamicNode } from './dynamic';
import { isElementNode, parseElementLayout } from './elements';
import { getNode, withScope, withStitch } from './globals';
import { type InternalNode, type Node } from './node';
import { createSignal } from './signal';
import {
  StitchContext,
  StitchContextNode,
  isStitchContextNode,
} from './stitch-context';

export class Stitch {
  root: StitchContextNode | null = null;
  mounted: boolean = false;

  mount(root: StitchContextNode): void {
    this.unmount();

    withStitch(this, () => {
      this.root = root;
      this.parseNode(root.ref, null);

      if (this.root) {
        this.layout();

        for (const node of this.root.getAllChildren(true)) {
          node.computations?.forEach((computation) => {
            if (computation.type === ComputationType.Effect) {
              computation.run();
            }
          });
        }
      }

      this.mounted = true;
    });
  }

  unmount(): void {
    withStitch(this, () => {
      if (this.root) {
        for (const node of this.root.getAllChildren(true)) {
          withScope(node, () => {
            if (node.computations) {
              for (const computation of node.computations) {
                computation.cleanup();
                computation.detach();
              }

              node.computations.clear();
            }
          });
        }
      }

      this.root = null;
      this.mounted = false;
    });
  }

  parseNode(node: Node, parent?: InternalNode | null): void {
    withStitch(this, () => {
      const virtualNode = getNode(node);
      if (virtualNode === null) {
        return;
      } else if (!virtualNode) {
        throw new Error('Invalid node.');
        return;
      }

      let parseChildren: boolean;
      if (typeof parent === 'undefined') {
        parseChildren = true;
      } else {
        const isAlreadyParsed = Boolean(virtualNode.parent);
        parseChildren = !isAlreadyParsed;
        virtualNode.setParent(parent);

        if (!this.root) {
          if (isStitchContextNode(virtualNode)) this.root = virtualNode;
          else throw new Error('Invalid root node.');
        }
      }

      if (parseChildren) {
        withScope(virtualNode, () => {
          if (isElementNode(virtualNode)) {
            virtualNode.ref.mount();

            const children =
              ('children' in virtualNode.ref.props &&
                Array.isArray(virtualNode.ref.props.children) &&
                virtualNode.ref.props.children) ||
              [];
            for (const child of children) {
              this.parseNode(child as Node, virtualNode);
            }
          } else if (isDynamicNode(virtualNode)) {
            this.parseNode(virtualNode.contents(), virtualNode);
          } else if (typeof virtualNode.ref === 'function') {
            this.parseNode(virtualNode.ref(), virtualNode);
          }
        });
      }
    });
  }

  reparseNode(node: InternalNode) {
    withStitch(this, () => {
      node.detachChildren();
      this.parseNode(node.ref);
      this.layout();

      for (const childNode of node.getAllChildren()) {
        childNode.computations?.forEach((computation) => {
          if (computation.type === ComputationType.Effect) {
            computation.run();
          }
        });
      }
    });
  }

  layout(): void {
    if (this.root) {
      for (const node of this.root.matchUntil(isElementNode, true)) {
        parseElementLayout(node);
      }
    }
  }

  render(): void {
    const stitch = this.root?.value;
    if (!this.root || !stitch) {
      return;
    }

    const pixelRatio = stitch.pixelRatio();

    stitch.context.clearRect(
      0,
      0,
      stitch.canvas.width ?? 0,
      stitch.canvas.height ?? 0,
    );

    stitch.context.setTransform({
      a: pixelRatio,
      d: pixelRatio,
    });

    stitch.context.save();

    for (const node of this.root.matchAll(isElementNode, true)) {
      node.ref['render'](stitch.context);
    }

    stitch.context.restore();
  }
}

/**
 * Mounts the stitch engine onto a canvas.
 *
 * @param canvas - The canvas.
 * @param fn - The mounting function.
 */
export function mount<T extends Canvas>(canvas: T, fn: () => Node) {
  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) {
    throw new Error('Canvas does not support 2D rendering.');
  }

  const stitch = new Stitch();
  const context: StitchContext<T> = new StitchContext();
  const [pixelRatio, setPixelRatio] = createSignal<number>(1);
  const [frameId, _setFrameId] = createSignal<number>(-1);

  let prevFrameTime: number = 0;
  let frameTime: number = 0;
  let deltaTime: number = 0;

  stitch.mount(
    new StitchContextNode<T>({
      ref: fn,
      context,
      value: {
        canvas,
        context: canvasContext,

        pixelRatio,
        setPixelRatio,

        get time() {
          return frameTime;
        },
        get deltaTime() {
          return deltaTime;
        },

        frameId,
        setFrameId(id: number, time: number): number {
          prevFrameTime = frameTime;
          frameTime = time;
          deltaTime = frameTime - prevFrameTime;
          return _setFrameId(id);
        },

        render() {
          stitch.render();
        },
      },
    }),
  );

  stitch.render();
}
