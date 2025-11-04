import { Text, View } from "react-native";

export type CaptionPosition = "top" | "middle" | "bottom";

export type CaptionSettings = {
  fontSize: number;
  position: CaptionPosition;
  color: string;
};

export const DEFAULT_CAPTION_SETTINGS: CaptionSettings = {
  fontSize: 24,
  position: "bottom",
  color: "#ffffff",
};

type CaptionsOverlayProps = {
  captions: any[];
  currentTime: number;
  fontSize: number;
  position: CaptionPosition;
  color: string;
};

export const CaptionsOverlay = ({
  captions,
  currentTime,
  fontSize,
  position,
  color,
}: CaptionsOverlayProps) => {
  const currentCaption = captions.find(
    (caption) => currentTime >= caption.start && currentTime <= caption.end
  );

  if (!currentCaption) return null;

  const positionStyles = {
    top: { top: 50 },
    middle: { top: 200 },
    bottom: { bottom: 200 },
  };

  return (
    <View
      className="absolute left-0 right-0 items-center justify-center px-2.5"
      style={positionStyles[position]}
    >
      <Text
        className="text-center bg-black/50 p-2 rounded"
        style={{ fontSize, color }}
      >
        {currentCaption.text}
      </Text>
    </View>
  );
};
