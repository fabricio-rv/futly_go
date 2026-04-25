import { Stack } from 'expo-router';

export default function AuthLayout() {
	return (
		<Stack
			initialRouteName="index"
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: '#05070B' },
				animation: 'fade',
			}}
		/>
	);
}

