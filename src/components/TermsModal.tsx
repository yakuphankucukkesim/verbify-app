import { ScrollView, Text, View } from "react-native";

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal = ({ onClose }: TermsModalProps) => {
  return (
    <View className="flex-1 bg-dark px-2 pt-5">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-Poppins_600SemiBold mt-6">
          Terms of Service
        </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 100 }}
      >
        <Text className="text-white text-lg font-Poppins_600SemiBold mb-2">
          1. Acceptance of Terms
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          By accessing and using Verbify ("the App"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          2. Description of Service
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          Verbify is an AI-powered video caption editor that allows users to automatically generate, customize, and export captions for their videos. The service includes AI voice generation and video processing capabilities.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          3. User Accounts
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          You may be required to create an account to use certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          4. Content Ownership and Rights
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          You retain all rights to the videos and content you upload to Verbify. By using our service, you grant us a limited license to process, store, and modify your content solely for the purpose of providing the captioning service.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          5. AI Services
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          Our AI-powered features, including caption generation and voice synthesis, are provided "as is." While we strive for accuracy, we cannot guarantee perfect results. You are responsible for reviewing and verifying all generated content.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          6. Prohibited Uses
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          You agree not to use Verbify for any illegal purposes, to upload content that violates copyright or intellectual property rights, or to generate captions for harmful, offensive, or misleading content.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          7. Limitation of Liability
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          Verbify and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          8. Changes to Terms
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the App after such modifications constitutes acceptance of the updated terms.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          9. Contact Information
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          For questions about these Terms of Service, please contact us through the app's support section.
        </Text>
      </ScrollView>
    </View>
  );
};
