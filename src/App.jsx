import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./pages/HomePage";
import DrinksPage from "./pages/DrinksPage";
import { CartProvider } from "./shop/cart";

// Tiny path router — no extra dependency. Add a page: add a line here and
// its path to vercel.json is NOT needed (the catch-all rewrite covers it).
const routes = {
  "/": HomePage,
  "/drinks": DrinksPage,
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const Page = routes[path] || HomePage;

  return (
    <CartProvider>
      <Header path={path} />
      <main>
        <Page />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
