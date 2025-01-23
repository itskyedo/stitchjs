import { Display, Fill, type Intrinsic, type Percent } from '@stitchjs/layout';

import { type WithAccessor } from '../properties';
import { type Ref } from '../ref';

export { Display, Fill, type Intrinsic, type Percent };

export type Auto = typeof Auto;
export const Auto = 'auto';

export type Inherit = typeof Inherit;
export const Inherit = 'inherit';

export interface ElementProps<T = any>
  extends BaseElementProps<T>,
    DisplayProps,
    DimensionProps,
    MarginProps,
    PaddingProps {}

export interface BaseElementProps<T = any> {
  ref?: Ref<T> | null;
  id?: WithAccessor<string | null>;
}

export interface DimensionProps {
  width?: WithAccessor<number | Intrinsic | Fill | Percent>;
  height?: WithAccessor<number | Intrinsic | Fill | Percent>;
}

export interface DisplayProps {
  display?: WithAccessor<Display>;
}

export interface MarginProps {
  marginTop?: WithAccessor<number>;
  marginRight?: WithAccessor<number>;
  marginBottom?: WithAccessor<number>;
  marginLeft?: WithAccessor<number>;
  margin?: WithAccessor<
    number | `${number} ${number}` | `${number} ${number} ${number} ${number}`
  >;
}

export interface PaddingProps {
  paddingTop?: WithAccessor<number>;
  paddingRight?: WithAccessor<number>;
  paddingBottom?: WithAccessor<number>;
  paddingLeft?: WithAccessor<number>;
  padding?: WithAccessor<
    number | `${number} ${number}` | `${number} ${number} ${number} ${number}`
  >;
}
