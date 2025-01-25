import { describe, expect, test } from 'vitest';

import { Display, Fill, type Rect, createLayoutParser } from '../src';
import { type LayoutProps } from '../src/item';

interface Element extends Partial<LayoutProps> {
  children?: Element[];
  outerRect?: Rect;
  clientRect?: Rect;
  contentRect?: Rect;
}

const parseLayout = createLayoutParser<Element>((element) => ({
  children: element.children ?? [],
  props: element,
  onLayout(target, rects) {
    target.outerRect = rects.outerRect;
    target.clientRect = rects.clientRect;
    target.contentRect = rects.contentRect;
  },
}));

describe('display: block', () => {
  const root: Element = {
    display: Display.block,
    width: 300,
    height: 300,
    children: [
      { display: Display.block, width: 100, height: 50 },
      { display: Display.block, width: 150, height: 100 },
    ],
  };

  parseLayout(root);

  test('items on separate rows', () => {
    expect(root.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
    });
    expect(root.children?.[0]?.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });
    expect(root.children?.[1]?.outerRect).toMatchObject({
      x: 0,
      y: 50,
      width: 150,
      height: 100,
    });
  });
});

describe('display: inlineBlock', () => {
  const root: Element = {
    display: Display.inlineBlock,
    width: 300,
    height: 300,
    children: [
      { display: Display.inlineBlock, width: 100, height: 50 },
      { display: Display.inlineBlock, width: 150, height: 100 },
      { display: Display.inlineBlock, width: 100, height: 50 },
      { display: Display.inlineBlock, width: 300, height: 200 },
    ],
  };

  parseLayout(root);

  test('non-overflow on same row', () => {
    expect(root.children?.[0]?.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });
    expect(root.children?.[1]?.outerRect).toMatchObject({
      x: 100,
      y: 0,
      width: 150,
      height: 100,
    });
  });

  test('overflow on separate row', () => {
    expect(root.children?.[2]?.outerRect).toMatchObject({
      x: 0,
      y: 100,
      width: 100,
      height: 50,
    });
    expect(root.children?.[3]?.outerRect).toMatchObject({
      x: 0,
      y: 150,
      width: 300,
      height: 200,
    });
  });
});

describe('percentage values', () => {
  const root: Element = {
    display: Display.block,
    width: 300,
    height: 300,
    children: [{ display: Display.block, width: '50%', height: '75%' }],
  };

  parseLayout(root);

  test('value is computed based on container bounds', () => {
    expect(root.children?.[0]?.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 300 * 0.5,
      height: 300 * 0.75,
    });
  });
});

describe('intrinsic values', () => {
  const root: Element = {
    display: Display.inlineBlock,
    width: 'intrinsic',
    height: 'intrinsic',
    children: [
      { display: Display.inlineBlock, width: 50, height: Fill },
      { display: Display.inlineBlock, width: Fill, height: 100 },
      { display: Display.inlineBlock, width: 100, height: 200 },
      { display: Display.block, width: Fill, height: 200 },
    ],
  };

  parseLayout(root);

  test('value is computed based on content bounds', () => {
    expect(root.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 100,
      height: 500,
    });
  });

  test('children can use computed intrinsic values', () => {
    expect(root.children?.[0]?.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 50,
      height: 100,
    });

    expect(root.children?.[1]?.outerRect).toMatchObject({
      x: 50,
      y: 0,
      width: 50,
      height: 100,
    });

    expect(root.children?.[2]?.outerRect).toMatchObject({
      x: 0,
      y: 100,
      width: 100,
      height: 200,
    });

    expect(root.children?.[3]?.outerRect).toMatchObject({
      x: 0,
      y: 300,
      width: 100,
      height: 200,
    });
  });
});

describe('fill values', () => {
  const root: Element = {
    display: Display.block,
    width: 300,
    height: 300,
    children: [
      { display: Display.inlineBlock, width: Fill, height: Fill },
      { display: Display.inlineBlock, width: 100, height: 200 },
      { display: Display.block, width: Fill, height: Fill },
    ],
  };

  parseLayout(root);

  test('value is computed based on row bounds', () => {
    expect(root.children?.[0]?.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  test('value is computed based on container bounds', () => {
    expect(root.children?.[2]?.outerRect).toMatchObject({
      x: 0,
      y: 200,
      width: 300,
      height: 100,
    });
  });
});

describe('margin', () => {
  const root: Element = {
    display: Display.inlineBlock,
    width: 200,
    height: 200,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
    children: [
      {
        display: Display.inlineBlock,
        width: 'fill',
        height: 'fill',
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
        marginLeft: 20,
      },
    ],
  };

  parseLayout(root);

  test('root has valid outerRect', () => {
    expect(root.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  test('root has valid clientRect', () => {
    expect(root.clientRect).toMatchObject({
      x: 20,
      y: 20,
      width: 160,
      height: 160,
    });
  });

  test('root has valid contentRect', () => {
    expect(root.contentRect).toMatchObject({
      x: 20,
      y: 20,
      width: 160,
      height: 160,
    });
  });

  test('child has valid outerRect', () => {
    expect(root.children?.[0]?.outerRect).toMatchObject({
      x: 20,
      y: 20,
      width: 160,
      height: 160,
    });
  });

  test('child has valid clientRect', () => {
    expect(root.children?.[0]?.clientRect).toMatchObject({
      x: 40,
      y: 40,
      width: 120,
      height: 120,
    });
  });

  test('child has valid contentRect', () => {
    expect(root.children?.[0]?.contentRect).toMatchObject({
      x: 40,
      y: 40,
      width: 120,
      height: 120,
    });
  });
});

describe('padding', () => {
  const root: Element = {
    display: Display.inlineBlock,
    width: 200,
    height: 200,
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    children: [
      {
        display: Display.inlineBlock,
        width: 'fill',
        height: 'fill',
        paddingTop: 20,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 20,
      },
    ],
  };

  parseLayout(root);

  test('root has valid outerRect', () => {
    expect(root.outerRect).toMatchObject({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  test('root has valid clientRect', () => {
    expect(root.clientRect).toMatchObject({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  test('root has valid contentRect', () => {
    expect(root.contentRect).toMatchObject({
      x: 20,
      y: 20,
      width: 160,
      height: 160,
    });
  });

  test('child has valid outerRect', () => {
    expect(root.children?.[0]?.outerRect).toMatchObject({
      x: 20,
      y: 20,
      width: 160,
      height: 160,
    });
  });

  test('child has valid clientRect', () => {
    expect(root.children?.[0]?.clientRect).toMatchObject({
      x: 20,
      y: 20,
      width: 160,
      height: 160,
    });
  });

  test('child has valid contentRect', () => {
    expect(root.children?.[0]?.contentRect).toMatchObject({
      x: 40,
      y: 40,
      width: 120,
      height: 120,
    });
  });
});
