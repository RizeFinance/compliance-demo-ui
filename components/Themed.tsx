import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export default function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  props?: { light?: string; dark?: string }
): string {
  const theme = useColorScheme();
  const colorFromProps = props && props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
