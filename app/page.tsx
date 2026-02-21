"use client";

import { useClubApp } from "@/hooks/useClubApp";
import { LoginCard } from "@/components/LoginCard";
import { ChangePinCard } from "@/components/ChangePinCard";
import { HeaderBar } from "@/components/HeaderBar";
import { CentralLogs } from "@/components/CentralLogs";
import { VaultForm } from "@/components/VaultForm";
import { OrderForm } from "@/components/OrderForm";

export default function Home() {
  const app = useClubApp();

  return (
    <main className="min-h-screen flex items-center justify-center p-6 select-none">
      <div className="relative w-full max-w-6xl rounded-2xl border border-white/15 bg-white/5 p-6 shadow">
        <h1 className="text-2xl font-bold">ANGELS OF CODES</h1>

        {/* logo “cortando” de leve */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/logo-angels.png"
            alt=""
            className="select-none absolute right-[-140px] top-1/2 -translate-y-1/2 opacity-[0.06] w-[520px] lg:w-[740px] rotate-[-8deg]"
          />
        </div>

        {!app.supabase && (
          <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
            Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
            O sistema funciona só local, mas não sincroniza entre pessoas.
          </div>
        )}

        {app.changingPin && (
          <ChangePinCard
            newPin={app.newPin}
            setNewPin={app.setNewPin}
            error={app.error}
            onConfirm={app.confirmNewPin}
            onCancel={() => {
              app.setChangingPin(false);
              app.setNewPin("");
            }}
          />
        )}

        {!app.loggedMember && !app.changingPin ? (
          <LoginCard
            clubPass={app.clubPass}
            setClubPass={app.setClubPass}
            memberId={app.memberId}
            setMemberId={app.setMemberId}
            memberOptions={app.memberOptions}
            pin={app.pin}
            setPin={app.setPin}
            error={app.error}
            onSubmit={app.handleLogin}
          />
        ) : app.loggedMember ? (
          <div className="mt-6 space-y-6">
            <HeaderBar loggedMember={app.loggedMember} onLogout={app.handleLogout} />

            {/* ✅ CENTRAL EM CIMA */}
            <CentralLogs
              centralTab={app.centralTab}
              setCentralTab={app.setCentralTab}
              centralSearch={app.centralSearch}
              setCentralSearch={app.setCentralSearch}
              centralBy={app.centralBy}
              setCentralBy={app.setCentralBy}
              centralItem={app.centralItem}
              setCentralItem={app.setCentralItem}
              centralParty={app.centralParty}
              setCentralParty={app.setCentralParty}
              memberNameOptions={app.memberNameOptions}
              itemFilterOptions={app.itemFilterOptions}
              partyFilterOptions={app.partyFilterOptions}
              centralVault={app.centralVault}
              centralOrders={app.centralOrders}
              hideVaultForMe={app.hideVaultForMe}
              hideOrderForMe={app.hideOrderForMe}
              isAdminAuthed={app.isAdminAuthed}
              deleteVaultLog={app.deleteVaultLog}
              deleteOrder={app.deleteOrder}
            />

            {/* ✅ VAULT + ORDER LADO A LADO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VaultForm
                vaultDirection={app.vaultDirection}
                setVaultDirection={app.setVaultDirection}
                vaultItemOption={app.vaultItemOption}
                setVaultItemOption={app.setVaultItemOption}
                vaultItemCustom={app.vaultItemCustom}
                setVaultItemCustom={app.setVaultItemCustom}
                vaultQty={app.vaultQty}
                setVaultQty={app.setVaultQty}
                vaultWhere={app.vaultWhere}
                setVaultWhere={app.setVaultWhere}
                vaultObs={app.vaultObs}
                setVaultObs={app.setVaultObs}
                onSubmit={app.addVaultLog}
              />

              <OrderForm
                orderKind={app.orderKind}
                setOrderKind={app.setOrderKind}
                orderItemOption={app.orderItemOption}
                setOrderItemOption={app.setOrderItemOption}
                orderItemCustom={app.orderItemCustom}
                setOrderItemCustom={app.setOrderItemCustom}
                orderQty={app.orderQty}
                setOrderQty={app.setOrderQty}
                orderPartyMemberId={app.orderPartyMemberId}
                setOrderPartyMemberId={app.setOrderPartyMemberId}
                memberOptions={app.memberOptions}
                orderPartyOrgOption={app.orderPartyOrgOption}
                setOrderPartyOrgOption={app.setOrderPartyOrgOption}
                orderPartyOrgCustom={app.orderPartyOrgCustom}
                setOrderPartyOrgCustom={app.setOrderPartyOrgCustom}
                orderNotes={app.orderNotes}
                setOrderNotes={app.setOrderNotes}
                onSubmit={app.addOrder}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}