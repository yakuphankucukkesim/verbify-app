import { TermsModal } from "@/components/TermsModal";
import { useRouter } from "expo-router";

const Page = () => {
  const router = useRouter();

  return <TermsModal onClose={() => router.back()} />;
};

export default Page;
