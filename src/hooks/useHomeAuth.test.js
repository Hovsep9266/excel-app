import { findWorkerSessionMatch } from '../hooks/useHomeAuth';

const workers = [
  { id: 3, name: 'Դանել Պ', password: 'դանել պ3123', otherData: ['14.5'] },
  { id: 11, name: 'Դանել Ս', password: 'դանել ս11123', otherData: ['16'] },
];

describe('findWorkerSessionMatch', () => {
  it('finds a worker by id even when the display name changed', () => {
    const session = { id: 3, name: 'Դանել', password: 'դանել պ3123' };
    const match = findWorkerSessionMatch(workers, session);
    expect(match?.name).toBe('Դանել Պ');
  });

  it('falls back to login credentials when id is missing from the sheet order', () => {
    const session = { id: 99, name: 'Դանել Ս', password: 'դանել ս11123' };
    const match = findWorkerSessionMatch(workers, session);
    expect(match?.id).toBe(11);
  });

  it('returns null for empty worker lists', () => {
    expect(findWorkerSessionMatch([], workers[0])).toBeNull();
  });
});
