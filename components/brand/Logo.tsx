import Image from "next/image";
import Link from "next/link";

const LOGO = {
  src: "/logo.png",
  width: 1644,
  height: 1534,
} as const;

type LogoSize = "nav" | "footer" | "auth";

/** Görünür alan + büyük render = beyaz padding kırpılır, logo belirginleşir */
const sizes: Record<
  LogoSize,
  { wrap: string; img: string }
> = {
  nav: {
    wrap: "relative h-[4.5rem] w-[10rem] overflow-hidden sm:h-[5.5rem] sm:w-[13rem] md:h-[6.5rem] md:w-[15rem]",
    img: "absolute left-0 top-1/2 h-[9.5rem] w-auto max-w-none -translate-y-1/2 sm:h-[11.5rem] md:h-[14rem]",
  },
  footer: {
    wrap: "relative h-20 w-44 overflow-hidden sm:h-24 sm:w-52",
    img: "absolute left-0 top-1/2 h-[9rem] w-auto max-w-none -translate-y-1/2 sm:h-[11rem]",
  },
  auth: {
    wrap: "relative h-24 w-52 overflow-hidden sm:h-28 sm:w-60",
    img: "absolute left-0 top-1/2 h-[11rem] w-auto max-w-none -translate-y-1/2 sm:h-[13rem]",
  },
};

interface LogoProps {
  size?: LogoSize;
  href?: string;
  className?: string;
  priority?: boolean;
}

export default function Logo({
  size = "nav",
  href = "/",
  className = "",
  priority = false,
}: LogoProps) {
  const s = sizes[size];

  const content = (
    <div className={`${s.wrap} ${className}`}>
      <Image
        src={LOGO.src}
        alt="Ron3D"
        width={LOGO.width}
        height={LOGO.height}
        priority={priority}
        className={s.img}
      />
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
}
