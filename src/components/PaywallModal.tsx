import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { getOfferings, purchasePackage, restorePurchases } from "@/services/purchases";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
  message?: string;
}

export const PaywallModal = ({
  visible,
  onClose,
  onPurchaseSuccess,
  message,
}: PaywallModalProps) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offering = await getOfferings();
      
      if (offering?.availablePackages) {
        setPackages(offering.availablePackages);
        
        // Pre-select annual package (best value)
        const annual = offering.availablePackages.find(
          (p) => p.packageType === "ANNUAL"
        );
        setSelectedPackage(annual || offering.availablePackages[0]);
      }
    } catch (error) {
      console.error("Failed to load offerings:", error);
      Alert.alert(
        "Error",
        "Failed to load subscription plans. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);
      const customerInfo = await purchasePackage(selectedPackage);

      if (
        customerInfo.entitlements.active["pro"] ||
        customerInfo.entitlements.active["business"]
      ) {
        Alert.alert(
          "Welcome to Verbify Pro! 🎉",
          "You now have unlimited access to all features.",
          [
            {
              text: "Get Started",
              onPress: () => {
                onClose();
                onPurchaseSuccess();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert(
          "Purchase Failed",
          "Something went wrong with your purchase. Please try again or contact support."
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const customerInfo = await restorePurchases();

      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert(
          "Restored Successfully! ✅",
          "Your subscription has been restored.",
          [
            {
              text: "OK",
              onPress: () => {
                onClose();
                onPurchaseSuccess();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any active subscriptions for this account."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-dark">
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 border-b border-gray-800">
          <View className="flex-1">
            <Text className="text-white text-2xl font-Poppins_700Bold">
              Upgrade to Pro
            </Text>
            {message && (
              <Text className="text-gray-400 text-sm font-Poppins_400Regular mt-1">
                {message}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} className="ml-4">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View className="items-center py-8">
            <View className="bg-primary/20 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="rocket" size={40} color="#3B82F6" />
            </View>
            <Text className="text-white text-xl font-Poppins_600SemiBold text-center mb-2">
              Unlimited Creativity Awaits
            </Text>
            <Text className="text-gray-400 text-center font-Poppins_400Regular">
              Create unlimited videos with AI-powered features
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8">
            <Feature icon="infinite" text="Unlimited video projects" />
            <Feature icon="sparkles" text="AI voice generation" />
            <Feature icon="color-wand" text="Advanced caption styles" />
            <Feature icon="download-outline" text="Export without watermark" />
            <Feature icon="flash" text="Priority processing" />
            <Feature icon="shield-checkmark" text="Premium support" />
          </View>

          {/* Packages */}
          {loading ? (
            <View className="py-12">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : packages.length > 0 ? (
            <View className="mb-6">
              {packages.map((pkg) => (
                <PackageOption
                  key={pkg.identifier}
                  package={pkg}
                  selected={selectedPackage?.identifier === pkg.identifier}
                  onSelect={() => setSelectedPackage(pkg)}
                />
              ))}
            </View>
          ) : (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <Text className="text-red-500 text-center font-Poppins_500Medium">
                No subscription plans available. Please try again later.
              </Text>
            </View>
          )}

          {/* Purchase Button */}
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={!selectedPackage || purchasing || loading}
            className={`bg-primary rounded-xl p-4 mb-4 ${
              !selectedPackage || purchasing || loading ? "opacity-50" : ""
            }`}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-Poppins_600SemiBold">
                Start 7-Day Free Trial
              </Text>
            )}
          </TouchableOpacity>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} className="mb-4 py-2">
            <Text className="text-primary text-center font-Poppins_500Medium">
              Restore Purchases
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <View className="mb-8">
            <Text className="text-gray-500 text-xs text-center leading-5">
              7-day free trial, then{" "}
              {selectedPackage?.product.priceString}/
              {selectedPackage?.packageType === "ANNUAL" ? "year" : "month"}.
              Cancel anytime in App Store settings.
            </Text>
            <Text className="text-gray-600 text-xs text-center mt-2">
              Payment will be charged to your Apple ID account. Subscription
              automatically renews unless canceled at least 24 hours before the
              end of the current period.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const Feature = ({ icon, text }: { icon: string; text: string }) => (
  <View className="flex-row items-center mb-4">
    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
      <Ionicons name={icon as any} size={20} color="#3B82F6" />
    </View>
    <Text className="text-white text-base font-Poppins_500Medium ml-3 flex-1">
      {text}
    </Text>
  </View>
);

const PackageOption = ({
  package: pkg,
  selected,
  onSelect,
}: {
  package: PurchasesPackage;
  selected: boolean;
  onSelect: () => void;
}) => {
  const isAnnual = pkg.packageType === "ANNUAL";
  const savings = isAnnual ? "SAVE 33%" : null;

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`rounded-xl p-4 mb-3 border-2 ${
        selected
          ? "border-primary bg-primary/10"
          : "border-gray-700 bg-[#1A1A1A]"
      }`}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-Poppins_600SemiBold">
              {pkg.product.title}
            </Text>
            {savings && (
              <View className="bg-green-500/20 rounded-full px-2 py-1 ml-2">
                <Text className="text-green-500 text-xs font-Poppins_600SemiBold">
                  {savings}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-gray-400 text-sm font-Poppins_400Regular mt-1">
            {isAnnual ? "Best value" : "Monthly billing"}
          </Text>
        </View>
        <Text className="text-white text-xl font-Poppins_700Bold">
          {pkg.product.priceString}
        </Text>
      </View>
      {selected && (
        <View className="mt-2 flex-row items-center">
          <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          <Text className="text-primary text-xs font-Poppins_500Medium ml-1">
            Selected
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
