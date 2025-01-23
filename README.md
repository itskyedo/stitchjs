# Stitch.js

An experimental 2D graphics library for building applications with the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).

Unlike other graphic libraries that resemble game development, Stitch.js introduces a developer experience that's similar to building webpages. It uses its own layout model to calculate the position and dimensions of elements on the canvas similar to the layout modes used in browsers like the [CSS Flow Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flow_layout) and [Flexbox](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox).

Inspired by [Solid.js](https://www.solidjs.com) and its use of signals for reactivity, this library offers many standard features you'd expect for web development, along with additional capabilities specifically designed for working with the canvas:

- 🧩 Composable components
- 🧱 Elements
- 🔄 State management
- ⚛️ Reactivity
- 🚦 Control flow and rendering

> [!WARNING]
> Due to the experimental nature of this project, the API and examples are subject to frequent changes, which may cause the documentation to become outdated. This represents only a small fraction of the features implemented planned for the future.

## 🚀 Getting Started

### Installation

This is not recommended but if you just want to try it out, get started by running the command:

```console
npm install @stitchjs/core
```

## 📚 API

- `mount`
  - Mounts a new Stitch.js instance onto a canvas.
- `createComponent`
  - Components are reusable and modular pieces of code for handling logic and rendering.
- `box`
  - A rectangular container element.
- `text`
  - An element that renders text with support for multiline text wrapping.
- `image`
  - An image element to render graphics.
- `path`
  - A vector element based on the [Scalable Vector Graphics specification](https://developer.mozilla.org/en-US/docs/Web/SVG).
- `createEffect`
  - Creates a side effect that is run when mounted and again every time its dependencies change. It creates a reactive scope that automatically handles tracking of reactive values.
- `createComputed`
  - Similar to `createEffect`, but instead creates an effect that is run immediately and again every time its dependencies change.
- `createTick`
  - An effect that is run on every frame.
- `createContext`
  - Creates a context object for handling dependency injection which helps avoid passing data between nested components.
- `useContext`
  - Gets the closest context from a parent context provider.
- `createSignal`
  - Creates a reactive value that triggers side effects when its value changes.
- `createMemo`
  - Creates a derived reactive value. Useful for caching the results of an expensive reactive computation.
- `createRef`
  - A utility function to create a reference to an arbitrary value. It's mainly used for storing the reference to an element when it's mounted.
- `untrack`
  - A utility function that will skip tracking of logic in reactive scopes.
- `unwrap` / `unwrapObject` / `unwrapArray`
  - Gets the underlying value from a signal.
- `onMount`
  - Creates an effect that is run only once when the component is mounted.
- `onCleanup`
  - A lifecycle method to clean up side effects in a reactive scope.
- `Dynamic`
  - A component that dynamically renders its children when its dependencies change.
- `useStitchContext`
  - Gets the root Stitch context which provides a bridge for interacting with internal logic like rendering, layout, etc. This normally wouldn't be used in most projects as they would be using prebuilt Stitch Providers created by me or the community. For example, there would be a `WebProvider` and `NodeProvider` for interacting within a browser or Node.js server, etc.

## 💡 Example

![demo.gif](https://github.com/itskyedo/stitchjs/blob/main/demo.gif)

#### 📄 index.ts

```typescript
import { createComponent, mount } from '@stitchjs/core';

import ColorContextProvider from './color-context';
import CustomWebProvider from './custom-web-provider';
import MyComponent from './my-component';

const App = createComponent(() => {
  return ColorContextProvider({
    children: [MyComponent({})],
  });
});

mount(document.querySelector<HTMLCanvasElement>('#canvas')!, () =>
  CustomWebProvider({
    children: [App({})],
  }),
);
```

#### 📄 color-context.ts

```typescript
import {
  type Accessor,
  type Node,
  type Setter,
  createComponent,
  createContext,
  createSignal,
} from '@stitchjs/core';

export interface ColorContextValue {
  value: Accessor<string>;
  setValue: Setter<string>;
}

export const ColorContext = createContext<ColorContextValue>();

export interface ColorContextProviderProps {
  children: [Node] | [];
}

const ColorContextProvider = createComponent<ColorContextProviderProps>(
  (props) => {
    const [value, setValue] = createSignal<string>('black');

    return ColorContext.Provider({
      value: { value, setValue },
      children: props.children,
    });
  },
);

export default ColorContextProvider;
```

#### 📄 my-component.ts

```typescript
import {
  box,
  createComponent,
  onCleanup,
  onMount,
  useContext,
} from '@stitchjs/core';

import { ColorContext } from './color-context';

const MyComponent = createComponent(() => {
  const color = useContext(ColorContext);

  onMount(() => {
    const onKeyUp = (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        color?.setValue(prompt('Set a color.') || 'black');
      }
    };

    document.addEventListener('keyup', onKeyUp);

    onCleanup(() => {
      document.removeEventListener('keyup', onKeyUp);
    });
  });

  return box({
    id: 'root',
    width: 600,
    height: 600,
    fillStyle: 'lightgray',
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    children: [
      box({
        display: 'block',
        width: 'fill',
        height: 'fill',
        fillStyle: color?.value,
        marginBottom: 20,
      }),
      box({
        display: 'inlineBlock',
        width: 100,
        height: 100,
        fillStyle: 'red',
      }),
      box({
        display: 'inlineBlock',
        width: 'fill',
        height: 200,
        fillStyle: 'green',
      }),
      box({
        display: 'inlineBlock',
        width: 'fill',
        height: 300,
        fillStyle: 'blue',
      }),
    ],
  });
});

export default MyComponent;
```

#### 📄 custom-web-provider.ts

> [!NOTE]
> Most users won’t need to create their own provider since prebuilt options will be readily available. This primarily serves to demonstrate how Stitch.js operates under the hood.

```typescript
import {
  type Accessor,
  type Node,
  type StitchContextValue,
  createComponent,
  createComputed,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  untrack,
  useStitchContext,
} from '@stitchjs/core';

interface Point {
  x: number;
  y: number;
}

export interface WebContextValue extends StitchContextValue<HTMLCanvasElement> {
  frameId: Accessor<number>;
  cursorPos: Accessor<Point | null>;
  canvasWidth: Accessor<number>;
  canvasHeight: Accessor<number>;
  play: () => void;
  stop: () => void;
}

export const WebContext = createContext<WebContextValue>();

export interface WebContextProps {
  children?: [Node] | [];
}

const CustomWebProvider = createComponent<WebContextProps>((props) => {
  const stitch = useStitchContext(
    (canvas) => canvas instanceof HTMLCanvasElement,
  );
  if (!stitch) {
    throw new Error('This provider only supports an HTMLCanvasElement.');
  }

  stitch.setPixelRatio(window.devicePixelRatio);

  const [canvasWidth, setCanvasWidth] = createSignal<number>(0);
  const [canvasHeight, setCanvasHeight] = createSignal<number>(0);
  const [cursorPos, setCursorPos] = createSignal<Point | null>(null);

  let playing: boolean = false;

  const refreshBounds = (ratio?: number): void => {
    const pixelRatio = untrack(() =>
      typeof ratio === 'number'
        ? stitch.setPixelRatio(ratio)
        : stitch.pixelRatio(),
    );

    const { clientHeight, clientWidth } = stitch.canvas;
    stitch.canvas.width = clientWidth * pixelRatio;
    stitch.canvas.height = clientHeight * pixelRatio;
    setCanvasWidth(clientWidth);
    setCanvasHeight(clientHeight);
  };

  const onMouseMove = (event: MouseEvent): void => {
    let x: number = 0;
    let y: number = 0;

    if (event.target === stitch.canvas) {
      x = event.offsetX;
      y = event.offsetY;
    } else {
      const canvasRect = stitch.canvas.getBoundingClientRect();
      x = event.clientX - canvasRect.left;
      y = event.clientY - canvasRect.top;
    }

    setCursorPos({
      x,
      y,
    });
  };

  const play = (): void => {
    playing = true;
    stitch.setFrameId(window.requestAnimationFrame(onTick), performance.now());
  };

  const stop = (): void => {
    playing = false;
    window.cancelAnimationFrame(untrack(stitch.frameId));
  };

  const onTick: FrameRequestCallback = (time) => {
    if (!playing) {
      return;
    }

    stitch.render();
    stitch.setFrameId(window.requestAnimationFrame(onTick), time);
  };

  createComputed(() => {
    refreshBounds(stitch.pixelRatio());
  });

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove);
    play();

    onCleanup(() => {
      window.removeEventListener('mousemove', onMouseMove);
      stop();
    });
  });

  return WebContext.Provider({
    children: props.children,
    value: {
      ...stitch,
      cursorPos,
      canvasWidth,
      canvasHeight,
      play,
      stop,
    },
  });
});

export default CustomWebProvider;
```

---

## 📃 License

MIT License. See [LICENSE](https://github.com/itskyedo/stitchjs/blob/main/LICENSE) for details.
