import type { SVGProps } from "react";

type SVGPropsType = SVGProps<SVGSVGElement>;

export function Anthropometry(props: SVGPropsType) {
  return (
    <svg
      width={58}
      height={58}
      viewBox="0 0 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Fondo */}
      <circle cx="29" cy="29" r="29" fill="#18BFFF" />

      {/* Cabeza */}
      <circle cx="22" cy="18" r="4" fill="#fff" />

      {/* Cuerpo */}
      <rect x="19" y="23" width="6" height="14" rx="3" fill="#fff" />

      {/* Regla antropométrica */}
      <rect x="34" y="14" width="4" height="26" rx="2" fill="#fff" />

      {/* Marcas de medición */}
      <line x1="34" y1="18" x2="38" y2="18" stroke="#18BFFF" strokeWidth="1" />
      <line x1="34" y1="22" x2="38" y2="22" stroke="#18BFFF" strokeWidth="1" />
      <line x1="34" y1="26" x2="38" y2="26" stroke="#18BFFF" strokeWidth="1" />
      <line x1="34" y1="30" x2="38" y2="30" stroke="#18BFFF" strokeWidth="1" />
      <line x1="34" y1="34" x2="38" y2="34" stroke="#18BFFF" strokeWidth="1" />
    </svg>
  );
}
