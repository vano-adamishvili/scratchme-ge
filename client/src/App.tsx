import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./lib/i18n";
import { StoreProvider } from "./lib/store";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";
import LegalPage from "./pages/LegalPage";
import { BundleSelectionDock } from "./components/storefront";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/shop" component={Shop} />
    <Route path="/product/:slug" component={ProductPage} />
    <Route path="/cart" component={CartPage} />
    <Route path="/checkout" component={CheckoutPage} />
    <Route path="/admin" component={AdminPage} />
    <Route path="/contact" component={ContactPage} />
    <Route path="/privacy-policy" component={() => <LegalPage kind="privacy" />} />
    <Route path="/terms" component={() => <LegalPage kind="terms" />} />
    <Route path="/delivery-returns" component={() => <LegalPage kind="delivery" />} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  const [location] = useLocation();
  const showBundleDock = location === "/" || location === "/shop";
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><I18nProvider><StoreProvider><Router />{showBundleDock && <BundleSelectionDock />}</StoreProvider></I18nProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
