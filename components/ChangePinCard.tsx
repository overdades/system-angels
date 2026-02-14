"use client";

export function ChangePinCard({
  newPin,
  setNewPin,
  error,
  onConfirm,
  onCancel,
}: {
  newPin: string;
  setNewPin: (v: string) => void;
  error: string | null;
  onConfirm: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 max-w-md">
      <form onSubmit={onConfirm} className="space-y-3">
        <div className="text-lg font-semibold">Crie seu PIN pessoal</div>
        <div className="text-sm text-white/70">
          Primeira vez nesse perfil: você precisa trocar o PIN padrão.
        </div>

        <input
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          placeholder="Novo PIN"
          className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
        />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90">
            Confirmar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
