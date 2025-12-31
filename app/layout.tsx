export const metadata = {
  title: "CRM Licente",
  description: "CRM pentru vanzare licente"
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body style={{ fontFamily: "Arial", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}