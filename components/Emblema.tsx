import Image from "next/image";

export function Emblema({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Emblema da Juventude Metodista Unida"
      width={64}
      height={64}
      className={`${className} rounded-full object-contain`}
      priority
    />
  );
}
