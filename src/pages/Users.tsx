// Page Utilisateurs (administrateur) : liste, création, activation/suspension.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers, createUser, toggleUserStatus, createUserSchema } from "@/services/users";
import type { SafeUser, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { RoleChip, UserStatusChip, Avatar, EmptyState } from "@/components/ui/atoms";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { IconPlus, IconUsers } from "@/lib/icons";

export function Users() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const [createOpen, setCreateOpen] = useState(false);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["users"] });
  }

  async function toggle(u: SafeUser) {
    await toggleUserStatus(u.id, u.status);
    toast.success(u.status === "active" ? "Utilisateur suspendu" : "Utilisateur réactivé", u.fullName);
    refresh();
  }

  return (
    <>
      <div className="mw-page-actions">
        <div className="mw-spacer" />
        <button className="mw-btn mw-btn--primary" onClick={() => setCreateOpen(true)}>
          <IconPlus size={18} /> Nouvel utilisateur
        </button>
      </div>

      <div className="mw-card mw-card--flush">
        {isLoading ? (
          <div style={{ padding: 24 }} className="mw-stack-gap">
            {[0, 1, 2].map((i) => (
              <div key={i} className="mw-skel mw-skel--text" style={{ height: 40 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="Aucun utilisateur" icon={<IconUsers />} />
        ) : (
          <div className="mw-table-wrap">
            <table className="mw-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Courriel</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="mw-cell-user">
                        <Avatar name={u.fullName} size="sm" />
                        <span className="mw-label" style={{ fontWeight: 600 }}>
                          {u.fullName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="mw-mono" style={{ fontSize: 13 }}>
                        {u.email}
                      </span>
                    </td>
                    <td>
                      <RoleChip role={u.role} />
                    </td>
                    <td>
                      <UserStatusChip status={u.status} />
                    </td>
                    <td>
                      <span className="mw-caption">{formatDate(u.createdAt)}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="mw-btn mw-btn--secondary mw-btn--sm" onClick={() => toggle(u)}>
                        {u.status === "active" ? "Suspendre" : "Réactiver"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onDone={refresh} />
    </>
  );
}

function CreateUserModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("agent");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setFullName("");
    setEmail("");
    setRole("agent");
    setPassword("");
    setError(null);
  }

  async function submit() {
    setError(null);
    const parsed = createUserSchema.safeParse({ fullName, email, role, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
    setBusy(true);
    try {
      await createUser(parsed.data);
      toast.success("Utilisateur créé", fullName);
      reset();
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Nouvel utilisateur"
      subtitle="Ajouter un membre du personnel"
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <button className="mw-btn mw-btn--secondary" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button className="mw-btn mw-btn--primary" onClick={submit} disabled={busy}>
            {busy ? "Création…" : "Créer l'utilisateur"}
          </button>
        </>
      }
    >
      <div className="mw-form-grid">
        <div className="mw-field">
          <label className="mw-field__label">Nom complet</label>
          <input className="mw-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom et prénom" />
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Courriel</label>
          <input className="mw-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@mowobank.com" />
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Rôle</label>
          <Select
            value={role}
            onChange={(v) => setRole(v as UserRole)}
            options={[
              { value: "agent", label: "Agent" },
              { value: "admin", label: "Administrateur" },
            ]}
          />
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Mot de passe</label>
          <input className="mw-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" />
        </div>
        {error && (
          <div className="mw-alert mw-alert--danger">
            <span className="mw-alert__body">{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
