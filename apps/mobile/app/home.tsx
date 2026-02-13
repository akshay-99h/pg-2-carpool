import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-surface px-4 py-8">
      <Text className="mb-3 text-2xl font-bold text-primary">Car Pool PG2</Text>
      <Text className="rounded-xl border border-primary/20 bg-white p-3 text-sm text-gray-700">
        Expo app scaffold is ready in the monorepo. Next step is wiring secure cookie/token exchange
        and full parity screens (trips, bookings, pool requests, admin).
      </Text>
    </View>
  );
}
