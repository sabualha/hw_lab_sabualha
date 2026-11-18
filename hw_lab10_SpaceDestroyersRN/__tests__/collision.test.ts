import { boundsOverlap } from '../viewModels/collision';

describe('boundsOverlap', () => {
  const A = { left: 0, right: 10, top: 0, bottom: 10 };

  test('identical bounds overlap', () => {
    expect(boundsOverlap(A, A)).toBe(true);
  });

  test('non-overlapping bounds return false', () => {
    expect(boundsOverlap(A, { left: 20, right: 30, top: 0, bottom: 10 })).toBe(false);
    expect(boundsOverlap(A, { left: 0, right: 10, top: 20, bottom: 30 })).toBe(false);
  });

  test('edge-touching does not count as overlap', () => {
    // A ends at x=10, B starts at x=10 -- they touch but don't overlap.
    expect(boundsOverlap(A, { left: 10, right: 20, top: 0, bottom: 10 })).toBe(false);
  });

  test('partial horizontal overlap counts', () => {
    expect(boundsOverlap(A, { left: 5, right: 15, top: 0, bottom: 10 })).toBe(true);
  });

  test('one contains the other', () => {
    expect(boundsOverlap(A, { left: 2, right: 8, top: 2, bottom: 8 })).toBe(true);
  });
});
