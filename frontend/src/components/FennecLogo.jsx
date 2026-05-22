import logoUrl from '../assets/fennec-logo.svg';

export default function FennecLogo({ size = 32 }) {
  return (
    <img
      src={logoUrl}
      width={size}
      height={size}
      alt="Fısıltı"
      style={{ display: 'block' }}
    />
  );
}
