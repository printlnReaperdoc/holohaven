import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { saveToken } from "../auth/token";
import { apiFetch } from "../api/api";
import { registerForPush } from "../notifications/push";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://YOUR_IP:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return Alert.alert("Login failed");

      const { token } = await res.json();
      await saveToken(token);

      const pushToken = await registerForPush();
      if (pushToken) {
        await apiFetch("/users/push-token", {
          method: "POST",
          body: JSON.stringify({ token: pushToken }),
        });
      }

      Alert.alert("Logged in successfully");
      // navigate to home screen if you have one
    } catch (err) {
      console.log(err);
      Alert.alert("Error logging in");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
