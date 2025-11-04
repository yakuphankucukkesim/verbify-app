import { PrivacyModal } from "@/components/PrivacyModal";
import { useRouter } from "expo-router";

const Page = () => {
  const router = useRouter();

  return <PrivacyModal onClose={() => router.back()} />;
};

export default Page;
