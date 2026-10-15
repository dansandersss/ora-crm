import type { CSSProperties } from "react";

const particles = [
  [9, 15, 2, .42, 13, -9], [18, 72, 1, .32, 17, 12], [27, 36, 2, .52, 16, -13],
  [37, 84, 1, .34, 15, 8], [46, 18, 1, .36, 19, 11], [56, 62, 2, .44, 14, -7],
  [65, 31, 1, .35, 18, 12], [74, 77, 2, .48, 16, -10], [84, 23, 1, .34, 15, 9],
  [92, 55, 2, .46, 17, -12], [13, 48, 1, .3, 20, 7], [31, 9, 1, .38, 18, -8],
  [53, 90, 1, .3, 19, 10], [71, 50, 1, .4, 14, -7], [88, 88, 1, .32, 20, 8],
] as const;

export function PremiumAuthBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden bg-[#080808]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,#17110b_0%,#0b0a09_42%,#060606_100%)]" />
      <div className="ambient-glow-a absolute -left-[18vw] top-[4vh] h-[58vw] w-[58vw] rounded-full bg-[#d98c2e]/[0.13] blur-[120px]" />
      <div className="ambient-glow-b absolute -right-[15vw] bottom-[-18vw] h-[56vw] w-[56vw] rounded-full bg-[#f2a33b]/[0.11] blur-[130px]" />
      <div className="absolute left-[38%] top-[34%] h-72 w-72 rounded-full bg-[#9c6023]/[0.08] blur-[100px]" />
      <div className="ambient-streak absolute -left-[12%] top-[18%] h-px w-[68%] origin-left bg-gradient-to-r from-transparent via-[#eda747]/35 to-transparent shadow-[0_0_20px_rgba(226,158,62,.2)]" />
      <div className="ambient-streak absolute -right-[18%] top-[68%] h-px w-[72%] origin-right bg-gradient-to-r from-transparent via-[#d9a441]/25 to-transparent [animation-delay:-7s]" />
      {particles.map(([left, top, size, opacity, duration, x], index) => (
        <span
          className="firefly absolute rounded-full bg-[#ffc468] shadow-[0_0_9px_rgba(255,166,0,.78)]"
          key={`${left}-${top}`}
          style={{
            left: `${left}%`, top: `${top}%`, width: size, height: size,
            "--particle-opacity": opacity,
            "--particle-duration": `${duration}s`,
            "--particle-delay": `${-(index % 6) * 1.7}s`,
            "--particle-x": `${x}px`,
          } as CSSProperties}
        />
      ))}
      <div className="absolute inset-0 opacity-[0.025] [background-image:repeating-radial-gradient(circle_at_30%_20%,white_0,transparent_1px,transparent_3px)] [background-size:5px_5px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(0,0,0,.72)_115%)]" />
    </div>
  );
}
