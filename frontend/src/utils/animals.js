export const ANIMALS = {
  fox: {
    key: 'fox',
    emoji: '🦊',
    label: 'Fennec',
    color: '#F97316',   // turuncu
    bg: '#FFF7ED',
  },
  owl: {
    key: 'owl',
    emoji: '🦉',
    label: 'Baykuş',
    color: '#7C3AED',   // mor
    bg: '#F5F3FF',
  },
  rabbit: {
    key: 'rabbit',
    emoji: '🐇',
    label: 'Tavşan',
    color: '#EC4899',   // pembe
    bg: '#FDF2F8',
  },
  cat: {
    key: 'cat',
    emoji: '🐱',
    label: 'Kedi',
    color: '#0EA5E9',   // mavi
    bg: '#F0F9FF',
  },
};

export const DEFAULT_ANIMAL = 'fox';

/** Bir kullanıcının hayvanını döner, yoksa default */
export function getAnimal(key) {
  return ANIMALS[key] || ANIMALS[DEFAULT_ANIMAL];
}

/** Avatar bileşeni için inline stil */
export function avatarStyle(animalKey, size = 44) {
  const a = getAnimal(animalKey);
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: a.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.48,
    flexShrink: 0,
    userSelect: 'none',
  };
}
