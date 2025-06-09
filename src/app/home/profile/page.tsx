import { AccountTabs } from "./_components/account-tabs";
import { Footer } from "../../../components/ui/footer";
import { Header } from "../../../components/ui/header";

export default function MyAccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Header />
      <h1 className="mb-8 text-center text-2xl font-medium">My Account</h1>
      <AccountTabs />
      <Footer />
    </div>
  );
}
