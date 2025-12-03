import { useState } from "react";
import "../styles/Modal.css";

export default function AdminAuthModal({ open, onClose, onConfirm }) {
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay"></div>

      <div className="modal-box">
        <h3 className="modal-title">Admin Authorization Required</h3>
        <p className="modal-text">Please enter the admin password to continue.</p>

        <input
          type="password"
          className="modal-input"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="confirm-btn"
            onClick={() => onConfirm(password)}
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
}
