import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { colors, surfaceShadow } from '@/src/theme/tokens';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  clearAccessibilityLabel: string;
  elevated?: boolean;
};

export function SearchInput({
  accessibilityLabel,
  clearAccessibilityLabel,
  elevated = false,
  onChangeText,
  placeholder,
  value,
}: SearchInputProps) {
  return (
    <View
      className="min-h-12 flex-row items-center gap-2 rounded-card border border-control-line bg-surface px-4"
      style={elevated ? surfaceShadow : undefined}
    >
      <Search color={colors.muted} size={20} />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        className="min-w-0 flex-1 text-sm text-ink"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel={clearAccessibilityLabel}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full active:bg-neutral-soft"
          hitSlop={2}
          onPress={() => onChangeText('')}
        >
          <X color={colors.muted} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}
