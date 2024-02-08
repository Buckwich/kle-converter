/**
MIT License

Copyright (c) 2013-2019 Ian Prest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
**/

import { DetailedError } from './helper/detailed-error';
import { labelMap } from './helper/label-map';
import { KleKey } from './models/key';
import { KleKeyboard } from './models/keyboard';
import { KleKeyboardMetadata } from './models/keyboard-metadata';
import { RawRow } from './models/serializedKle';

export function deserialize(rows: RawRow[]): KleKeyboard {
  if (!(rows instanceof Array)) {
    throw new DetailedError('expected an array of objects');
  }

  // Initialize with defaults
  let current: KleKey = new KleKey();
  let keyboard = new KleKeyboard();
  var align = 4;

  rows.forEach((row, rowIndex) => {
    if (Array.isArray(row)) {
      for (var key = 0; key < row.length; ++key) {
        var item = row[key];
        if (typeof item === 'string') {
          var newKey: KleKey = copy(current);

          // Calculate some generated values
          newKey.width2 = newKey.width2 === 0 ? current.width : current.width2;
          newKey.height2 = newKey.height2 === 0 ? current.height : current.height2;
          newKey.labels = reorderLabelsIn(item.split('\n'), align);
          newKey.textSize = reorderLabelsIn(newKey.textSize, align);

          // Clean up the data
          for (var i = 0; i < 12; ++i) {
            if (!newKey.labels[i]) {
              delete newKey.textSize[i];
              delete newKey.textColor[i];
            }
            if (newKey.textSize[i] == newKey.default.textSize) delete newKey.textSize[i];
            if (newKey.textColor[i] == newKey.default.textColor) delete newKey.textColor[i];
          }

          // Add the key!
          keyboard.keys.push(newKey);

          // Set up for the next key
          current.x += current.width;
          current.width = current.height = 1;
          current.x2 = current.y2 = current.width2 = current.height2 = 0;
          current.nub = current.stepped = current.decal = false;
        } else {
          if (key != 0 && (item.r != null || item.rx != null || item.ry != null)) {
            throw new DetailedError('rotation can only be specified on the first key in a row', item);
          }
          if (item.r != null) current.rotation_angle = item.r;
          if (item.rx != null) current.rotation_x = item.rx;
          if (item.ry != null) current.rotation_y = item.ry;
          if (item.a != null) align = item.a;
          if (item.f) {
            current.default.textSize = item.f;
            current.textSize = [];
          }
          if (item.f2) for (var i = 1; i < 12; ++i) current.textSize[i] = item.f2;
          if (item.fa) current.textSize = item.fa;
          if (item.p) current.profile = item.p;
          if (item.c) current.color = item.c;
          if (item.t) {
            var split = item.t.split('\n');
            if (split[0] != '') current.default.textColor = split[0];
            current.textColor = reorderLabelsIn(split, align);
          }
          if (item.x) current.x += item.x;
          if (item.y) current.y += item.y;
          if (item.w) current.width = current.width2 = item.w;
          if (item.h) current.height = current.height2 = item.h;
          if (item.x2) current.x2 = item.x2;
          if (item.y2) current.y2 = item.y2;
          if (item.w2) current.width2 = item.w2;
          if (item.h2) current.height2 = item.h2;
          if (item.n) current.nub = item.n;
          if (item.l) current.stepped = item.l;
          if (item.d) current.decal = item.d;
          if (item.g != null) current.ghost = item.g;
          if (item.sm) current.sm = item.sm;
          if (item.sb) current.sb = item.sb;
          if (item.st) current.st = item.st;
        }
      }

      // End of the row
      current.y++;
      current.x = current.rotation_x;
    } else if (typeof row === 'object') {
      if (rowIndex != 0) {
        throw new DetailedError('keyboard metadata must the be first element', row);
      }
      for (let prop in keyboard.meta) {
        if (row[prop]) keyboard.meta[prop as keyof KleKeyboardMetadata] = row[prop];
      }
    } else {
      throw new DetailedError('unexpected', row);
    }
  });
  return keyboard;
}

// depending on the alignment flags.
function reorderLabelsIn(labels: string | any[], align: number) {
  var ret: Array<any> = [];
  for (var i = 0; i < labels.length; ++i) {
    if (labels[i]) ret[labelMap[align][i]] = labels[i];
  }
  return ret;
}
function copy(o: any): any {
  if (typeof o !== 'object') {
    return o; // primitive value
  } else if (o instanceof Array) {
    var result: any[] = [];
    for (var i = 0; i < o.length; i++) {
      result[i] = copy(o[i]);
    }
    return result;
  } else {
    var oresult: any = Object.create(Object.getPrototypeOf(o));
    new oresult.constructor();
    for (var prop in o) {
      oresult[prop] = copy(o[prop]);
    }
    return oresult;
  }
}
