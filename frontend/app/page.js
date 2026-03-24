import HealthCheck from "./components/HealthCheck";

export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "60px auto", padding: "0 20px" }}>
      <h1>Hello World</h1>
      <p>HighLevel Interview App — stack is live.</p>
      <HealthCheck />
    </main>
  );
}
