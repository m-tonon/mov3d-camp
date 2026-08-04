const CONTACTS = [
  { name: "Secretaria IPVO", phone: "(44) 3226-4473" },
  { name: "Ana Carla", phone: "(44) 9 9115-8078" },
];

export function PaymentCompletedScreen() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="max-w-sm w-full text-center space-y-5">
        <span className="text-6xl block">✅</span>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Inscrição realizada com sucesso!
          </h2>
          <p className="text-muted-foreground text-sm">
            Seu pagamento ainda está em processo de confirmação.
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          A equipe confirmará sua inscrição após a validação do pagamento.
          Em caso de dúvida, use os contatos abaixo.
        </p>

        <div className="bg-card border border-border rounded-2xl px-5 py-4 space-y-2 text-sm text-left">
          <p className="font-medium text-foreground">Em caso de dúvidas:</p>
          {CONTACTS.map((c) => (
            <p key={c.phone} className="text-muted-foreground">
              📞 <strong className="text-foreground">{c.name}:</strong>{" "}
              {c.phone}
            </p>
          ))}
          <p className="text-xs text-muted-foreground pt-2">Ou entre em contato com a secretaria da sua igreja.</p>
        </div>
      </div>
    </div>
  );
}
