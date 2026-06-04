// Logo CAMPOST réutilisable (image carrée, coins arrondis).
import { CAMPOST_LOGO } from "@/lib/logo";

interface Props {
  size?: number;
  radius?: number;
  className?: string;
}

export function BrandLogo({ size = 40, radius, className }: Props) {
  return (
    <img
      src={CAMPOST_LOGO}
      alt="CAMPOST"
      width={size}
      height={size}
      className={className}
      style={{
        borderRadius: radius ?? Math.round(size * 0.26),
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
