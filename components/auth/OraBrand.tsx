import Image from "next/image";

export function OraBrand() {
  return (
    <div className="mb-8 text-center sm:mb-11 lg:mb-12">
      <div suppressHydrationWarning data-auth-logo className="mx-auto flex h-[86px] items-center justify-center drop-shadow-[0_0_26px_rgba(217,164,65,.14)] mb-7 sm:h-[96px]">
        <Image src="/assets/main-logo.svg" alt="ORA Project" width={248} height={137} priority />
      </div>
      <p suppressHydrationWarning data-auth-subtitle className="mt-3 text-sm font-medium uppercase tracking-[.3em] text-white/55 sm:text-[15px]">Control Panel</p>
    </div>
  );
}
