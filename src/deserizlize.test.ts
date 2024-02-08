/* eslint-disable no-sparse-arrays */
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

import { deserialize } from './deserialize';
import { KleKeyboard } from './models/keyboard';

describe('deserialization', () => {
  it('should return empty keyboard on empty array', function () {
    const input = [];
    const result = deserialize(input);
    expect(result).toBeInstanceOf(KleKeyboard);
    expect(result.keys).toEqual([]);
  });

  describe('of metadata', function () {
    it('should parse from first object if it exists', function () {
      const input: any = [{ name: 'test' }];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.meta.name).toEqual('test');
    });

    it('should throw an exception if found anywhere other than the start', function () {
      const result = () => deserialize([[], { name: 'test' } as any]);
      expect(result).toThrow();
    });
  });

  describe('of key positions', () => {
    test('should default to (0,0)', () => {
      const input = [['1']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0].x).toEqual(0);
      expect(result.keys[0].y).toEqual(0);
    });

    test('should increment x position by the width of the previous key', () => {
      const input = [[{ x: 1 }, '1', '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].x).toEqual(1);
      expect(result.keys[1].x).toEqual(result.keys[0].x + result.keys[0].width);
      expect(result.keys[1].y).toEqual(result.keys[0].y);
    });

    test('should increment y position whenever a new row starts, and reset x to zero', () => {
      const input = [[{ y: 1 }, '1'], ['2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].y).toEqual(1);
      expect(result.keys[1].x).toEqual(0);
      expect(result.keys[1].y).toEqual(result.keys[0].y + 1);
    });

    test('should add x and y to current position', () => {
      const input = [['1', { x: 1 }, '2']];
      let result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].x).toEqual(0);
      expect(result.keys[1].x).toEqual(2);

      const input2 = [['1'], [{ y: 1 }, '2']];
      result = deserialize(input2);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].y).toEqual(0);
      expect(result.keys[1].y).toEqual(2);
    });

    test('should leave x2,y2 at (0,0) if not specified', () => {
      const input = [[{ x: 1, y: 1 }, '1']];
      let result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0].x).not.toEqual(0);
      expect(result.keys[0].y).not.toEqual(0);
      expect(result.keys[0].x2).toEqual(0);
      expect(result.keys[0].y2).toEqual(0);

      const input2 = [[{ x: 1, y: 1, x2: 2, y2: 2 }, '1']];
      result = deserialize(input2);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0].x).not.toEqual(0);
      expect(result.keys[0].y).not.toEqual(0);
      expect(result.keys[0].x2).not.toEqual(0);
      expect(result.keys[0].y2).not.toEqual(0);
    });
  });

  describe('of key sizes', () => {
    it('should reset width and height to 1', () => {
      const input = [[{ w: 5 }, '1', '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].width).toEqual(5);
      expect(result.keys[1].width).toEqual(1);

      const input2 = [[{ h: 5 }, '1', '2']];
      const result2 = deserialize(input2);
      expect(result2).toBeInstanceOf(KleKeyboard);
      expect(result2.keys).toHaveLength(2);
      expect(result2.keys[0].height).toEqual(5);
      expect(result2.keys[1].height).toEqual(1);
    });

    it('should default width2/height2 if not specified', () => {
      const result = deserialize([[{ w: 2, h: 2 }, '1', { w: 2, h: 2, w2: 4, h2: 4 }, '2']]);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].width2).toEqual(result.keys[0].width);
      expect(result.keys[0].height2).toEqual(result.keys[0].height);
      expect(result.keys[1].width2).not.toEqual(result.keys[1].width);
      expect(result.keys[1].height2).not.toEqual(result.keys[1].width);
    });
  });

  describe('of other properties', () => {
    it('should reset stepped, homing, and decal flags to false', () => {
      const input = [[{ l: true, n: true, d: true }, '1', '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].stepped).toBe(true);
      expect(result.keys[0].nub).toBe(true);
      expect(result.keys[0].decal).toBe(true);
      expect(result.keys[1].stepped).toBe(false);
      expect(result.keys[1].nub).toBe(false);
      expect(result.keys[1].decal).toBe(false);
    });

    it('should propagate the ghost flag', () => {
      const input = [['0', { g: true }, '1', '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(3);
      expect(result.keys[0].ghost).toBe(false);
      expect(result.keys[1].ghost).toBe(true);
      expect(result.keys[2].ghost).toBe(true);
    });

    it('should propagate the profile flag', () => {
      const input = [['0', { p: 'DSA' }, '1', '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(3);
      expect(result.keys[0].profile).toBe('');
      expect(result.keys[1].profile).toBe('DSA');
      expect(result.keys[2].profile).toBe('DSA');
    });

    it('should propagate switch properties', () => {
      const input = [['1', { sm: 'cherry' }, '2', '3']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(3);
      expect(result.keys[0].sm).toBe('');
      expect(result.keys[1].sm).toBe('cherry');
      expect(result.keys[2].sm).toBe('cherry');

      const input2 = [['1', { sb: 'cherry' }, '2', '3']];
      const result2 = deserialize(input2);
      expect(result2).toBeInstanceOf(KleKeyboard);
      expect(result2.keys).toHaveLength(3);
      expect(result2.keys[0].sb).toBe('');
      expect(result2.keys[1].sb).toBe('cherry');
      expect(result2.keys[2].sb).toBe('cherry');

      const input3 = [['1', { st: 'MX1A-11Nx' }, '2', '3']];
      const result3 = deserialize(input3);
      expect(result3).toBeInstanceOf(KleKeyboard);
      expect(result3.keys).toHaveLength(3);
      expect(result3.keys[0].st).toBe('');
      expect(result3.keys[1].st).toBe('MX1A-11Nx');
      expect(result3.keys[2].st).toBe('MX1A-11Nx');
    });
  });

  describe('of text color', () => {
    it('should apply colors to all subsequent keys', () => {
      const input = [[{ c: '#ff0000', t: '#00ff00' }, '1', '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].color).toEqual('#ff0000');
      expect(result.keys[1].color).toEqual('#ff0000');
      expect(result.keys[0].default.textColor).toEqual('#00ff00');
      expect(result.keys[1].default.textColor).toEqual('#00ff00');
    });

    it('should apply `t` to all legends', () => {
      const input = [[{ a: 0, t: '#444444' }, '0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0].default.textColor).toEqual('#444444');
      for (let i = 0; i < 12; ++i) {
        expect(result.keys[0].textColor[i]).toBeUndefined();
      }
    });

    it('should handle generic case', () => {
      const labels =
        '#111111\n#222222\n#333333\n#444444\n' +
        '#555555\n#666666\n#777777\n#888888\n' +
        '#999999\n#aaaaaa\n#bbbbbb\n#cccccc';
      const input = [[{ a: 0, t: /*colors*/ labels }, /*labels*/ labels]];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0].default.textColor).toEqual('#111111');
      for (let i = 0; i < 12; ++i) {
        expect(result.keys[0].textColor[i] || result.keys[0].default.textColor).toEqual(result.keys[0].labels[i]);
      }
    });

    it('should handle blanks', () => {
      const labels =
        '#111111\nXX\n#333333\n#444444\n' + 'XX\n#666666\nXX\n#888888\n' + '#999999\n#aaaaaa\n#bbbbbb\n#cccccc';
      const input = [[{ a: 0, t: /*colors*/ labels.replace(/XX/g, '') }, /*labels*/ labels]];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(1);
      expect(result.keys[0].default.textColor).toEqual('#111111');
      for (let i = 0; i < 12; ++i) {
        // if blank, should be same as color[0] / default
        const color = result.keys[0].textColor[i] || result.keys[0].default.textColor;
        if (result.keys[0].labels[i] === 'XX') expect(color).toEqual('#111111');
        else expect(color).toEqual(result.keys[0].labels[i]);
      }
    });

    it('should not reset default color if blank', () => {
      const input = [[{ t: '#ff0000' }, '1', { t: '\n#00ff00' }, '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].default.textColor).toEqual('#ff0000');
      expect(result.keys[1].default.textColor).toEqual('#ff0000');
    });

    it('should delete values equal to the default', () => {
      const input = [[{ t: '#ff0000' }, '1', { t: '\n#ff0000' }, '\n2', { t: '\n#00ff00' }, '\n3']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(3);
      expect(result.keys[1].labels[6]).toEqual('2');
      expect(result.keys[1].textColor[6]).toBeUndefined();
      expect(result.keys[2].labels[6]).toEqual('3');
      expect(result.keys[2].textColor[6]).toEqual('#00ff00');
    });
  });

  describe('of rotation', () => {
    it('should not be allowed on anything but the first key in a row', () => {
      const r1 = () => deserialize([[{ r: 45 }, '1', '2']]);
      expect(r1).not.toThrow();
      const rx1 = () => deserialize([[{ rx: 45 }, '1', '2']]);
      expect(rx1).not.toThrow();
      const ry1 = () => deserialize([[{ ry: 45 }, '1', '2']]);
      expect(ry1).not.toThrow();

      const r2 = () => deserialize([['1', { r: 45 }, '2']]);
      expect(r2).toThrow();
      const rx2 = () => deserialize([['1', { rx: 45 }, '2']]);
      expect(rx2).toThrow();
      const ry2 = () => deserialize([['1', { ry: 45 }, '2']]);
      expect(ry2).toThrow();
    });
  });

  describe('of legends', function () {
    test('should align legend positions correctly', function () {
      // Some history, to make sense of this:
      // 1. Originally, you could only have top & botton legends, and they were
      //    left-aligned. (top:0 & bottom:1)
      // 2. Next, we added right-aligned labels (top:2 & bottom:3).
      // 3. Next, we added front text (left:4, right:5).
      // 4. Next, we added the alignment flags that allowed you to move the
      //    labels (0-5) to the centered positions (via checkboxes).
      // 5. Nobody understood the checkboxes.  They were removed in favor of
      //    twelve separate label editors, allowing text to be placed anywhere.
      //    This introduced labels 6 through 11.
      // 6. The internal rendering is now Top->Bottom, Left->Right, but to keep
      //    the file-format unchanged, the serialization code now translates
      //    the array from the old layout to the new internal one.

      // prettier-ignore
      const expected = [
            // top row   /**/ middle row /**/ bottom row  /**/   front
            ["0","8","2",/**/"6","9","7",/**/"1","10","3",/**/"4","11","5"], // a=0
            [   ,"0",   ,/**/   ,"6",   ,/**/   , "1",   ,/**/"4","11","5"], // a=1 (center horz)
            [   ,   ,   ,/**/"0","8","2",/**/   ,    ,   ,/**/"4","11","5"], // a=2 (center vert)
            [   ,   ,   ,/**/   ,"0",   ,/**/   ,    ,   ,/**/"4","11","5"], // a=3 (center both)

            ["0","8","2",/**/"6","9","7",/**/"1","10","3",/**/   , "4",   ], // a=4 (center front)
            [   ,"0",   ,/**/   ,"6",   ,/**/   , "1",   ,/**/   , "4",   ], // a=5 (center front+horz)
            [   ,   ,   ,/**/"0","8","2",/**/   ,    ,   ,/**/   , "4",   ], // a=6 (center front+vert)
            [   ,   ,   ,/**/   ,"0",   ,/**/   ,    ,   ,/**/   , "4",   ], // a=7 (center front+both)
        ];

      for (let a = 0; a <= 7; ++a) {
        const input = [[{ a: a }, '0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11']];
        const result = deserialize(input);
        expect(expected[a]).toBeDefined();
        expect(result).toBeInstanceOf(KleKeyboard);
        expect(result.keys).toHaveLength(1);
        expect(result.keys[0].labels).toHaveLength(expected[a].length);
        expect(JSON.stringify(result.keys[0].labels)).toEqual(JSON.stringify(expected[a]));
      }
    });
  });

  describe('of font sizes', () => {
    it('should handle `f` at all alignments', () => {
      for (let a = 0; a < 7; ++a) {
        const input = [[{ f: 1, a: a }, '0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11']];
        const result = deserialize(input);
        expect(result).toBeInstanceOf(KleKeyboard);
        expect(result.keys).toHaveLength(1);
        expect(result.keys[0].default.textSize).toBe(1);
        expect(result.keys[0].textSize).toHaveLength(0);
      }
    });

    it('should handle `f2` at all alignments', () => {
      for (let a = 0; a < 7; ++a) {
        const input = [[{ f: 1, f2: 2, a: a }, '0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11']];
        const result = deserialize(input);
        expect(result).toBeInstanceOf(KleKeyboard);
        expect(result.keys).toHaveLength(1);
        for (let i = 0; i < 12; ++i) {
          if (result.keys[0].labels[i]) {
            if (result.keys[0].labels[i] === '0') {
              expect(result.keys[0].textSize[i]).toBeUndefined();
            } else {
              expect(result.keys[0].textSize[i]).toBe(2);
            }
          } else {
            expect(result.keys[0].textSize[i]).toBeUndefined();
          }
        }
      }
    });

    it('should handle `fa` at all alignments', () => {
      for (let a = 0; a < 7; ++a) {
        const input = [
          [{ f: 1, fa: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], a: a }, '2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13'],
        ];
        const result = deserialize(input);
        expect(result).toBeInstanceOf(KleKeyboard);
        expect(result.keys).toHaveLength(1);

        for (let i = 0; i < 12; ++i) {
          if (result.keys[0].labels[i]) {
            expect(result.keys[0].textSize[i]).toBe(parseInt(result.keys[0].labels[i]));
          }
        }
      }
    });

    it('should handle blanks in `fa`', () => {
      for (let a = 0; a < 7; ++a) {
        const input = [[{ f: 1, fa: [, 2, , 4, , 6, , 8, 9, 10, , 12], a: a }, 'x\n2\nx\n4\nx\n6\nx\n8\n9\n10\nx\n12']];

        const result = deserialize(input);
        expect(result).toBeInstanceOf(KleKeyboard);
        expect(result.keys).toHaveLength(1);

        for (let i = 0; i < 12; ++i) {
          if (result.keys[0].labels[i] === 'x') {
            expect(result.keys[0].textSize[i]).toBeUndefined();
          }
        }
      }
    });

    it('should not reset default size if blank', () => {
      const input = [[{ f: 1 }, '1', { fa: [, 2] }, '2']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].default.textSize).toBe(1);
      expect(result.keys[1].default.textSize).toBe(1);
    });

    it('should delete values equal to the default', () => {
      const input = [[{ f: 1 }, '1', { fa: '\n1' }, '\n2', { fa: '\n2' }, '\n3']];
      const result = deserialize(input);
      expect(result).toBeInstanceOf(KleKeyboard);
      expect(result.keys).toHaveLength(3);
      expect(result.keys[1].labels[6]).toBe('2');
      expect(result.keys[1].textSize[6]).toBeUndefined();
      expect(result.keys[2].labels[6]).toBe('3');
      expect(result.keys[2].textSize[6]).toBe('2');
    });
  });
});
