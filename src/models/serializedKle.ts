import { KleKeyboardMetadata } from './keyboard-metadata';

/**
 * Modifier in the serialized data format
 */
export interface RawModifier {
  /** x offset */
  x?: number;
  /** y offset */
  y?: number;
  /** width */
  w?: number;
  /** height */
  h?: number;
  /** secondary x offset */
  x2?: number;
  /** secondary y offset */
  y2?: number;
  /** secondary width */
  w2?: number;
  /** secondary height */
  h2?: number;
  /** angle */
  r?: number;
  /** rotation point x */
  rx?: number;
  /** rotation point y */
  ry?: number;
  /** stepped */
  l?: boolean;
  /** homing */
  n?: boolean;
  /** decal */
  d?: boolean;
  /** key color */
  c?: string;
  /** text color */
  t?: string;
  /** ghosted */
  g?: boolean;
  /** alignment */
  a?: number;
  /** font height */
  f?: number;
  /** font height */
  fa?: any;
  /** secondary font height */
  f2?: number;
  /** profile */
  p?: string;
  /** Stem mount */
  sm?: string;
  /** Stem brand */
  sb?: string;
  /** Stem type */
  st?: string;
  /**
   * style
   * @deprecated Not Implemented
   */
  s?: string;
}
export type RawCell = string | RawModifier;
export type RawRow = RawCell[];
export type RawMeta = Partial<KleKeyboardMetadata>;
export type RawData = (RawMeta | RawRow)[];
