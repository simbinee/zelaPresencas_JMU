export function Emblema({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M24 4C24 4 15 15.5 15 24.5C15 30.5 19 35 24 35C29 35 33 30.5 33 24.5C33 15.5 24 4 24 4Z"
        fill="#C1440E"
      />
      <path
        d="M24 15C24 15 20 20.5 20 25.5C20 28.7 21.8 31 24 31C26.2 31 28 28.7 28 25.5C28 20.5 24 15 24 15Z"
        fill="#B8862B"
      />
      <rect x="21.4" y="30" width="5.2" height="14" rx="1" fill="#12203D" />
      <rect x="15.5" y="35" width="17" height="4.4" rx="1" fill="#12203D" />
    </svg>
  );
}
