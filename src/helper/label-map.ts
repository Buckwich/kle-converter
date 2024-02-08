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

// Map from serialized label position to normalized position,
// depending on the alignment flags.
// prettier-ignore
export const labelMap: number[][] = [
  //0  1  2  3  4  5  6  7  8  9 10 11   // align flags
  [ 0, 6, 2, 8, 9,11, 3, 5, 1, 4, 7,10], // 0 = no centering
  [ 1, 7,-1,-1, 9,11, 4,-1,-1,-1,-1,10], // 1 = center x
  [ 3,-1, 5,-1, 9,11,-1,-1, 4,-1,-1,10], // 2 = center y
  [ 4,-1,-1,-1, 9,11,-1,-1,-1,-1,-1,10], // 3 = center x & y
  [ 0, 6, 2, 8,10,-1, 3, 5, 1, 4, 7,-1], // 4 = center front (default)
  [ 1, 7,-1,-1,10,-1, 4,-1,-1,-1,-1,-1], // 5 = center front & x
  [ 3,-1, 5,-1,10,-1,-1,-1, 4,-1,-1,-1], // 6 = center front & y
  [ 4,-1,-1,-1,10,-1,-1,-1,-1,-1,-1,-1], // 7 = center front & x & y
];
