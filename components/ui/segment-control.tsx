import { Pressable, StyleSheet, Text, View } from "react-native";

type SegmentControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: SegmentControlProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected && styles.segmentSelected,
              disabled && styles.disabled,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  segmentSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  labelSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
