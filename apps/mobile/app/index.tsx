import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function IndexScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-white">
        <Text className="text-4xl font-black text-primary">G</Text>
      </View>
      <Text className="text-4xl font-black text-primary">Greens-II</Text>
      <Text className="mb-8 text-base text-secondary">Panchsheel Car Pool</Text>

      <Link
        href="/login"
        className="w-full rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-white"
      >
        Continue
      </Link>
    </View>
  );
}
