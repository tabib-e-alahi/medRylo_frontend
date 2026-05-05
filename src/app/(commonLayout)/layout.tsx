import { Footer } from "@/components/shared/Footer/Footer";
import { Navbar } from "@/components/shared/Navbar/Navbar";
import "@/features/public-discovery/discovery.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Navbar></Navbar>
    <main>
      {children}
    </main>
    <Footer></Footer>
    </>
  );
}
