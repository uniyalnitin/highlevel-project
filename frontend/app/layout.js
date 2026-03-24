export const metadata = {
  title: "HighLevel Interview",
  description: "Interview full-stack app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
