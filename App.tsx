import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { FlashCardDemo } from "./src/components/FlashCard.demo";

export default function App() {
  return (
    <>
      <FlashCardDemo />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
