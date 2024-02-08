import { helloWorld } from './main';

describe('main', () => {
  test('helloWorld', () => {
    expect(helloWorld()).toBe('Hello, World!');
  });
});
