import Image from "next/image";

interface AvatarProps {
  name: string;
  size: number;
  src?: string;
  className?: string;
}

export function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.\s*/, "").split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export default function Avatar({ name, size, src, className = "" }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`Portrait of ${name}`}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold ${className}`}
    >
      {getInitials(name)}
    </span>
  );
}
