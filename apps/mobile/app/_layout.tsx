import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#F5F9F2',
          },
          headerTintColor: '#1c5e33',
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#F5F9F2',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Car Pool PG2' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
      </Stack>
    </>
  );
}
