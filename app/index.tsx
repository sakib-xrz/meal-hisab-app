import { ActivityIndicator, StyleSheet, View } from "react-native";

// Placeholder — root _layout auth guard redirects to the correct group.
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
});
