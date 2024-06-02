interface iButton {
  CTA: string;
  onClick: () => void;
  disabled: boolean;
}

export const PaginateButton = ({ CTA, onClick, disabled }: iButton) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center px-[1rem] py-[0.4rem] justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90${
        disabled && "pointer-events-none bg-gray-300"
      }  `}
    >
      {CTA}
    </button>
  );
};
