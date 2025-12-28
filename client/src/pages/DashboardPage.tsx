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

  const handleSell = async (petId: number) => {
    if (!window.confirm("Potvrdi prodaju?")) return;
    try {
      await fetch("http://localhost:6754/api/v1/pets/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, sellerName: userName }),
      });
      fetchPets();
    } catch (e) {
      alert("Greška!");
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
            Korisnik: {userName} ({userRole})
          </small>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setView("pets")} style={styles.btn}>
            Ljubimci
          </button>
          {userRole === UserRole.ADMIN && (
            <button
              onClick={() => {
                setView("receipts");
                fetchReceipts();
              }}
              style={styles.btn}
            >
              Fiskalni Računi
            </button>
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

      <div style={styles.contentCard}>
        {view === "pets" ? (
          <table style={styles.table}>
            <thead>
              <tr style={{ textAlign: "left", background: "#334155" }}>
                <th style={styles.th}>Ime</th>
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
                    {pet.isSold ? "Prodat" : "Dostupan"}
                  </td>
                  <td style={styles.td}>{pet.price} RSD</td>
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
                <th style={styles.th}>Ljubimac</th>
                <th style={styles.th}>Iznos</th>
                <th style={styles.th}>Datum</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #334155" }}>
                  <td style={styles.td}>{r.petName}</td>
                  <td style={styles.td}>{r.totalAmount} RSD</td>
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

// --- DODAJ OVAJ OBJEKAT NA KRAJ FAJLA DA SKLONIŠ GREŠKU ---
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
  contentCard: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "15px" },
  td: { padding: "15px" },
  btn: {
    backgroundColor: "#334155",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
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
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
