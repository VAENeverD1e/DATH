import { cn } from '../lib/utils';

describe('utils.cn', () => {
  test('merges classes and handles falsy', () => {
    const res = cn('a', false && 'b', null, undefined, 'c');
    expect(res).toContain('a');
    expect(res).toContain('c');
    expect(res).not.toContain('b');
  });
});