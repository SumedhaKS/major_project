export default function Button({ onClick, children, type = "button" }) {
  return (
    <button
      onClick={onClick}
      type={type}
      style={{
        width: "100%",
        padding: "10px",
        backgroundColor: "#2563eb",
        color: "white",
        fontWeight: "bold",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
