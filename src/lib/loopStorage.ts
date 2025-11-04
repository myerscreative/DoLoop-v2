import { Loop } from '@/types/loop';

const STORAGE_KEY = 'doloop-loops';

export function getStoredLoops(): Loop[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      const loops = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      const convertedLoops = loops.map((loop: any) => {
        try {
          return {
            ...loop,
            createdAt: new Date(loop.createdAt),
            updatedAt: new Date(loop.updatedAt),
            lastCompletedAt: loop.lastCompletedAt ? new Date(loop.lastCompletedAt) : undefined,
          };
        } catch (e) {
          console.error('Error converting dates for loop:', loop.id, e);
          return null;
        }
      }).filter((loop: any) => loop !== null);
      
      return convertedLoops;
    } catch (e) {
      console.error('Error parsing stored loops:', e);
      return [];
    }
  }
  return [];
}

export function saveLoops(loops: Loop[]): void {
  if (typeof window === 'undefined') {
    console.error('saveLoops - window is undefined, cannot save');
    return;
  }
  
  try {
    // Convert Date objects to ISO strings for storage
    const serializedLoops = loops.map(loop => {
      try {
        return {
          ...loop,
          createdAt: loop.createdAt.toISOString(),
          updatedAt: loop.updatedAt.toISOString(),
          lastCompletedAt: loop.lastCompletedAt ? loop.lastCompletedAt.toISOString() : undefined,
        };
      } catch (e) {
        console.error('saveLoops - Error serializing loop:', loop.id, e);
        throw e;
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedLoops));
  } catch (e) {
    console.error('Error saving loops:', e);
  }
}

export function addLoop(loop: Loop): void {
  const loops = getStoredLoops();
  loops.push(loop);
  saveLoops(loops);
}

export function getAllLoops(): Loop[] {
  return getStoredLoops();
}

export function deleteLoop(loopId: string): void {
  const loops = getStoredLoops();
  const filteredLoops = loops.filter(loop => loop.id !== loopId);
  saveLoops(filteredLoops);
}

export function updateLoop(updatedLoop: Loop): void {
  const loops = getStoredLoops();
  const updatedLoops = loops.map(loop => 
    loop.id === updatedLoop.id ? updatedLoop : loop
  );
  saveLoops(updatedLoops);
}

export function getLoopById(loopId: string): Loop | undefined {
  const loops = getStoredLoops();
  return loops.find(loop => loop.id === loopId);
}

