import { ScrollView, Text, View } from "react-native";

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal = ({ onClose }: PrivacyModalProps) => {
  return (
    <View className="flex-1 bg-dark px-5 pt-7">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-Poppins_600SemiBold">
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 16,
          paddingTop: 70,
        }}
      >
        <Text className="text-white text-lg font-Poppins_600SemiBold mb-10">
          1. Information We Collect
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          We collect information you provide directly to us, including your
          email address, account credentials, and the videos you upload for
          captioning. We also collect usage data and device information to
          improve our services.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          2. How We Use Your Information
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          We use the information we collect to:
          {"\n"}• Provide, maintain, and improve Verbify
          {"\n"}• Process your videos and generate captions
          {"\n"}• Communicate with you about updates and features
          {"\n"}• Ensure the security of our services
          {"\n"}• Comply with legal obligations
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          3. Video Content Processing
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          Your uploaded videos are processed using AI services to generate
          captions and audio. Videos are temporarily stored on secure servers
          during processing and may be cached for performance optimization. We
          do not use your videos for training AI models without explicit
          consent.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          4. Data Storage and Security
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          We store your data on secure cloud infrastructure with
          industry-standard encryption. Your videos and generated content are
          stored securely and are only accessible to you. We implement
          appropriate technical and organizational measures to protect your
          personal data.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          5. Third-Party Services
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          Verbify integrates with third-party services including:
          {"\n"}• ElevenLabs for AI voice generation
          {"\n"}• Convex for backend infrastructure
          {"\n"}• Clerk for authentication
          {"\n\n"}These services have their own privacy policies governing how
          they handle your data.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          6. Data Retention
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          We retain your account information and uploaded content for as long as
          your account is active. You can delete your videos at any time through
          the app. Upon account deletion, we will remove your data from our
          systems within 30 days.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          7. Your Rights
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          You have the right to:
          {"\n"}• Access your personal data
          {"\n"}• Correct inaccurate data
          {"\n"}• Request deletion of your data
          {"\n"}• Export your data
          {"\n"}• Opt-out of marketing communications
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          8. Children's Privacy
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          Verbify is not intended for users under the age of 13. We do not
          knowingly collect personal information from children under 13. If we
          become aware of such collection, we will take steps to delete that
          information.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          9. Changes to Privacy Policy
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the new policy on this page and
          updating the "Last updated" date.
        </Text>

        <Text className="text-white text-lg font-Poppins_600SemiBold mb-3">
          10. Contact Us
        </Text>
        <Text className="text-gray-300 text-base mb-6 font-Poppins_400Regular leading-6">
          If you have questions about this Privacy Policy or our data practices,
          please contact us through the app's support section.
        </Text>
      </ScrollView>
    </View>
  );
};
