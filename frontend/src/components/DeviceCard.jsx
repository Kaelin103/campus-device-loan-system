export default function DeviceCard({ device }) {
  return (
    <div style={styles.card}>
      <h2>{device.name}</h2>
      <p>Status: {device.status}</p>
    </div>
  );
}

const styles = {
  card: {
    background: "#333",
    padding: "20px",
    borderRadius: "10px",
    color: "white",
    marginBottom: "15px",
  },
};
