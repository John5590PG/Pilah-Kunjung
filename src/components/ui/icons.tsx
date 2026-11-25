type P = { className?: string };
const base = {
  width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
};
export const CheckIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const PauseIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M9 6v12M15 6v12" /></svg>);
export const XIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const HelpIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M9.2 9a2.9 2.9 0 1 1 4.3 2.5c-.9.5-1.5 1.1-1.5 2.1M12 17.5v.1" /></svg>);
export const PhoneIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M6.5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7L16 13l4 1.5v3A2.5 2.5 0 0 1 17.5 20 13.5 13.5 0 0 1 4 6.5 2.5 2.5 0 0 1 6.5 4z" /></svg>);
export const WalkIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M12 4.5v.1M10 20l2-6 3 3v3M12 14l-1-4.5 3 .5 2 3M8 12l2-3" /></svg>);
export const SendIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M4 12l16-8-6 16-3-7z" /></svg>);
export const ArrowIcon = ({ className }: P) => (<svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
