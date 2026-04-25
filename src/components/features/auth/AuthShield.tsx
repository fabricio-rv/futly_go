import Svg, {
	Defs,
	LinearGradient,
	Path,
	Stop,
	Text as SvgText,
} from 'react-native-svg';
import { View } from 'react-native';

type AuthShieldProps = {
	size?: number;
};

export function AuthShield({ size = 88 }: AuthShieldProps) {
	const height = (size * 104) / 88;
	const shieldLabel = 'HP';

	return (
		<View style={{ width: size, height }}>
			<Svg width={size} height={height} viewBox="0 0 88 104">
				<Defs>
					<LinearGradient id="shieldGradient" x1="0" y1="0" x2="0" y2="1">
						<Stop offset="0" stopColor="#22B76C" />
						<Stop offset="1" stopColor="#007E44" />
					</LinearGradient>
				</Defs>

				<Path
					d="M44 4 L82 16 L82 52 C82 78 64 94 44 100 C24 94 6 78 6 52 L6 16 Z"
					fill="url(#shieldGradient)"
					stroke="#F6D27A"
					strokeWidth={1.5}
				/>

				<Path
					d="M44 28 L52 36 L60 32 L56 44 L66 50 L54 54 L56 66 L44 60 L32 66 L34 54 L22 50 L32 44 L28 32 L36 36 Z"
					fill="#05070B"
					opacity={0.3}
				/>

				<SvgText
					x="44"
					y="62"
					textAnchor="middle"
					fontSize="22"
					fill="#FFFFFF"
					letterSpacing="2"
					fontWeight="700"
				>
					{shieldLabel}
				</SvgText>
			</Svg>
		</View>
	);
}

