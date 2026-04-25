import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      fill="none"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </IconBase>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </IconBase>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </IconBase>
  );
}

export function BookOpenIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H20v18H4.5A2.5 2.5 0 0 0 2 22z" />
      <path d="M12 6v14" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 6 9 17l-5-5" />
    </IconBase>
  );
}

export function CoinsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </IconBase>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconBase>
  );
}

export function CircleDollarSignIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-5a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H8" />
      <path d="M12 18V6" />
    </IconBase>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 8 4 4 5-7 5 7 4-4v10H3Z" />
      <path d="M3 18h18" />
    </IconBase>
  );
}

export function DropletsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.5 14.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-3-4.5-8.5-4.5-8.5s-4.5 5.5-4.5 8.5Z" />
      <path d="M4 10c0 1.8 1.2 3 3 3" />
    </IconBase>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </IconBase>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3s4 3.5 4 7.5A4 4 0 0 1 12 15a4 4 0 0 1-4-4.5C8 6.5 12 3 12 3Z" />
      <path d="M12 15c2.5 1.5 3 3.5 3 5a3 3 0 1 1-6 0c0-1.5.5-3.5 3-5Z" />
    </IconBase>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 21-1.2-1.1C5.2 14.8 2 11.9 2 8.3A4.3 4.3 0 0 1 6.3 4a4.8 4.8 0 0 1 3.7 1.7A4.8 4.8 0 0 1 13.7 4 4.3 4.3 0 0 1 18 8.3c0 3.6-3.2 6.5-8.8 11.6Z" />
    </IconBase>
  );
}

export function HourglassIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 2h12" />
      <path d="M6 22h12" />
      <path d="M8 2c0 6 8 4 8 10s-8 4-8 10" />
      <path d="M16 2c0 6-8 4-8 10s8 4 8 10" />
    </IconBase>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </IconBase>
  );
}

export function LogInIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H3" />
    </IconBase>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 22s7-3 7-10V5l-7-3-7 3v7c0 7 7 10 7 10Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function SwordsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m14.5 5.5 4 4" />
      <path d="m12 8 6-6" />
      <path d="m8 12-6 6" />
      <path d="m5.5 14.5 4 4" />
      <path d="m9 3 12 12" />
      <path d="m15 21 6-6" />
      <path d="M3 9 9 3" />
    </IconBase>
  );
}

export function RadioIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
      <path d="M18.36 5.64a9 9 0 0 1 0 12.72" />
      <path d="M5.64 18.36a9 9 0 0 1 0-12.72" />
    </IconBase>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </IconBase>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" />
      <path d="M5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z" />
      <path d="M19 14l.6 1.8L21.4 16l-1.8.6L19 18.4l-.6-1.8L16.6 16l1.8-.2L19 14Z" />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 22s7-3 7-10V5l-7-3-7 3v7c0 7 7 10 7 10Z" />
    </IconBase>
  );
}

export function SkullIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3a7 7 0 0 0-4 12.74V19a1 1 0 0 0 1 1h1v2h2v-2h2v2h2v-2h1a1 1 0 0 0 1-1v-3.26A7 7 0 0 0 12 3Z" />
      <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function SlidersHorizontalIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 4H14" />
      <path d="M10 4H3" />
      <path d="M21 12h-7" />
      <path d="M10 12H3" />
      <path d="M21 20H12" />
      <path d="M8 20H3" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="10" cy="20" r="2" />
    </IconBase>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </IconBase>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M22 12h-4l-3 7-6-14-3 7H2" />
    </IconBase>
  );
}

export function TimerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
    </IconBase>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M17 4h3v2a5 5 0 0 1-5 5" />
      <path d="M7 4H4v2a5 5 0 0 0 5 5" />
      <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
    </IconBase>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path d="M16 12h.01" />
      <path d="M6 7V5a2 2 0 0 1 2-2h10" />
    </IconBase>
  );
}

export function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 16.5c-1 1-1.5 3.5-1.5 3.5s2.5-.5 3.5-1.5l2-2-2-2-2 2Z" />
      <path d="M14 10 9 15" />
      <path d="M9 9c0-4.5 3.5-7 7-7 0 3.5-2.5 7-7 7Z" />
      <path d="M15 15c4.5 0 7-3.5 7-7-3.5 0-7 2.5-7 7Z" />
    </IconBase>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </IconBase>
  );
}
