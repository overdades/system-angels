"use client";

export function ChangePinCard(props: {
  newPin: string;
  setNewPin: (v: string) => void;
  error: string | null;
  onConfirm: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-6 panel p-4 max-w-md">
      <form onSubmit={props.onConfirm} className="space-y-3">
        <div className="text-lg font-semibold">Crie seu PIN pessoal</div>
        <div className="text-sm text-white/70">
          Primeira vez nesse perfil: você precisa trocar o PIN padrão.
        </div>

        <input
          value={props.newPin}
          onChange={(e) => props.setNewPin(e.target.value)}
          placeholder="Novo PIN"
          className="input"
        />

        {props.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
            {props.error}
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90">
            Confirmar
          </button>
          <button type="button" onClick={props.onCancel} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}