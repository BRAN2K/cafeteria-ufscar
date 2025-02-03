interface CurrencyFormatProps {
  value: number;
}

export function CurrencyFormat({ value }: CurrencyFormatProps) {
  return (
    <>
      {new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value)}
    </>
  );
}
