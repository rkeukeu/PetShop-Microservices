import React, { useEffect, useState } from "react";
import { IUserAPI } from "../api/users/IUserAPI";
import { decodeJWT } from "../helpers/decode_jwt";
import { readValueByKey, removeValueByKey } from "../helpers/local_storage";
import { UserRole } from "../enums/UserRole";

interface Pet {
  id: number;
  commonName: string;
  latinName: string;
  type: string;
  price: number;
  isSold: boolean;
}

interface Receipt {
  id: number;
  sellerName: string;
  date: string;
  totalAmount: number;
  petName: string;
}

interface DashboardProps {
  userAPI: IUserAPI;
}

export const DashboardPage: React.FC<DashboardProps> = ({ userAPI }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [view, setView] = useState<"pets" | "receipts">("pets");

  // State za formu za dodavanje
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPet, setNewPet] = useState({
    commonName: "",
    latinName: "",
    type: "sisar",
    price: 0,
  });

  const token = readValueByKey("authToken");
  const userData = token ? decodeJWT(token) : null;
  const userRole = userData?.role;
  const userName = userData?.username;

  const fetchPets = async () => {
    try {
      const res = await fetch("http://localhost:6754/api/v1/pets");
      const data = await res.json();
      setPets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReceipts = async () => {
    try {
      const res = await fetch("http://localhost:6754/api/v1/pets/receipts");
      const data = await res.json();
      setReceipts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:6754/api/v1/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPet, isSold: false }),
      });

      if (res.ok) {
        alert("Ljubimac uspešno dodat!");
        setShowAddForm(false);
        setNewPet({ commonName: "", latinName: "", type: "sisar", price: 0 });
        fetchPets();
      } else {
        const err = await res.json();
        alert(
          err.message || "Greška pri dodavanju! Proverite kapacitet (max 10).",
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSell = async (petId: number) => {
    if (!window.confirm("Potvrdi prodaju i izdavanje računa?")) return;
    try {
      const res = await fetch("http://localhost:6754/api/v1/pets/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, sellerName: userName }),
      });

      if (res.ok) {
        alert("Prodaja uspešna!");
        fetchPets();
      } else {
        const err = await res.json();
        alert(
          err.message || "Greška pri prodaji (Proverite radno vreme 08-22h).",
        );
      }
    } catch (e) {
      alert("Greška na serveru!");
    }
  };

  const displayedPets =
    userRole === UserRole.ADMIN ? pets : pets.filter((p) => !p.isSold);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>🐾 Pet Shop Panel</h2>
          <small style={{ color: "#94a3b8" }}>
            Prijavljeni ste kao: <strong>{userName}</strong> ({userRole})
          </small>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={() => setView("pets")} style={styles.btn}>
            Ljubimci
          </button>

          {userRole === UserRole.ADMIN && (
            <>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ ...styles.btn, backgroundColor: "#10b981" }}
              >
                {showAddForm ? "Zatvori formu" : "+ Nabavka"}
              </button>
              <button
                onClick={() => {
                  setView("receipts");
                  fetchReceipts();
                }}
                style={styles.btn}
              >
                Fiskalni Računi
              </button>
            </>
          )}

          <button
            onClick={() => {
              removeValueByKey("authToken");
              window.location.href = "/";
            }}
            style={styles.logout}
          >
            Odjavi se
          </button>
        </div>
      </header>

      {showAddForm && view === "pets" && (
        <div style={styles.formContainer}>
          <h3>Novi ljubimac (Nabavka)</h3>
          <form onSubmit={handleAddPet} style={styles.form}>
            <input
              placeholder="Ime (npr. Zlatni Retriver)"
              required
              value={newPet.commonName}
              onChange={(e) =>
                setNewPet({ ...newPet, commonName: e.target.value })
              }
              style={styles.input}
            />
            <input
              placeholder="Latinski naziv"
              required
              value={newPet.latinName}
              onChange={(e) =>
                setNewPet({ ...newPet, latinName: e.target.value })
              }
              style={styles.input}
            />
            <select
              value={newPet.type}
              onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
              style={styles.input}
            >
              <option value="sisar">Sisar</option>
              <option value="gmizavac">Gmizavac</option>
              <option value="glodar">Glodar</option>
            </select>
            <input
              type="number"
              placeholder="Nabavna cena"
              required
              value={newPet.price || ""}
              onChange={(e) =>
                setNewPet({ ...newPet, price: Number(e.target.value) })
              }
              style={styles.input}
            />
            <button type="submit" style={styles.saveBtn}>
              Sačuvaj u bazu
            </button>
          </form>
        </div>
      )}

      <div style={styles.contentCard}>
        {view === "pets" ? (
          <table style={styles.table}>
            <thead>
              <tr style={{ textAlign: "left", background: "#334155" }}>
                <th style={styles.th}>Ime</th>
                <th style={styles.th}>Latinski naziv</th>
                <th style={styles.th}>Tip</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Cena</th>
                {userRole === UserRole.SELLER && (
                  <th style={styles.th}>Akcija</th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayedPets.map((pet) => (
                <tr key={pet.id} style={{ borderBottom: "1px solid #334155" }}>
                  <td style={styles.td}>{pet.commonName}</td>
                  <td style={styles.td}>
                    <i>{pet.latinName || "-"}</i>
                  </td>
                  <td style={styles.td}>{pet.type || "-"}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        color: pet.isSold ? "#ef4444" : "#10b981",
                        fontWeight: "bold",
                      }}
                    >
                      {pet.isSold ? "Prodat" : "U radnji"}
                    </span>
                  </td>
                  <td style={styles.td}>{pet.price.toLocaleString()} RSD</td>
                  {userRole === UserRole.SELLER && !pet.isSold && (
                    <td style={styles.td}>
                      <button
                        onClick={() => handleSell(pet.id)}
                        style={styles.sellBtn}
                      >
                        Prodaj
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={{ textAlign: "left", background: "#334155" }}>
                <th style={styles.th}>ID Računa</th>
                <th style={styles.th}>Ljubimac</th>
                <th style={styles.th}>Prodavac</th>
                <th style={styles.th}>Iznos (sa popustom/porezom)</th>
                <th style={styles.th}>Datum i vreme</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #334155" }}>
                  <td style={styles.td}>#{r.id.toString().slice(-6)}</td>
                  <td style={styles.td}>{r.petName}</td>
                  <td style={styles.td}>{r.sellerName}</td>
                  <td style={styles.td}>
                    <strong>{r.totalAmount.toFixed(2)} RSD</strong>
                  </td>
                  <td style={styles.td}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "30px",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "white",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
    borderBottom: "1px solid #334155",
    paddingBottom: "20px",
  },
  formContainer: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #10b981",
  },
  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "white",
    minWidth: "150px",
  },
  saveBtn: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  contentCard: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "15px", color: "#94a3b8", fontSize: "14px" },
  td: { padding: "15px", fontSize: "14px" },
  btn: {
    backgroundColor: "#334155",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.2s",
  },
  logout: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  sellBtn: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
