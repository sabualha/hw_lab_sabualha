import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, Text, Platform, Share } from "react-native";
import { WebView } from "react-native-webview";
import { BottomBarIconProps } from "../types";
import BottomBarIcon from "../Components/BottomBarIcon";

export default function BrowserView() {
  const [url, setUrl] = useState("https://www.google.com");
  const [currentUrl, setCurrentUrl] = useState(url);
  const webViewRef = useRef<WebView>(null);

  const handleLoadUrl = () => {
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = "https://" + target;
    }
    setCurrentUrl(target);
  };

  const handleBack = () => {
    webViewRef.current?.goBack();
  };

  const goForward = () => {
    webViewRef.current?.goForward();
  };

  const handleReload = () => {
    webViewRef.current?.reload();
  };

  const handleStopLoading = () => {
    webViewRef.current?.stopLoading();
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: currentUrl });
    } catch (error) {
      console.error(error);
    }
  };

  const actions: BottomBarIconProps[] = [
    { iconName: "arrow-back", size: 28, onPress: handleBack },
    { iconName: "arrow-forward", size: 28, onPress: goForward },
    { iconName: "share-outline", size: 28, onPress: handleShare },
    { iconName: "refresh", size: 28, onPress: handleReload },
    { iconName: "close", size: 28, onPress: handleStopLoading },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.urlBar}>
        <Text style={styles.label}>URL:</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          onSubmitEditing={handleLoadUrl}
          keyboardType="url"
          returnKeyType="go"
        />
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
      />

      <View style={styles.bottomBar}>
        {actions.map((action, index) => (
          <BottomBarIcon key={index} {...action} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 24,
  },
  urlBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    backgroundColor: "white",
    position: "relative",
  },
  label: {
    fontSize: 16,
    marginRight: 8,
    position: "absolute",
    left: 20,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 7,
    marginRight: 8,
    paddingLeft: 55,
    opacity: 0.8,
  },
  iconButton: {
    padding: 4,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.2)",
    backgroundColor: "white",
  },
  webview: {
    flex: 1,
  },
});