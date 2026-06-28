import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { colors, surfaceShadow } from '@/src/theme/tokens';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  elevated?: boolean;
};

export function SearchInput({ elevated = false, onChangeText, placeholder, value }: SearchInputProps) {
  return (
    <View
      className="min-h-14 flex-row items-center gap-3 rounded-full border border-line bg-surface px-5"
      style={elevated ? surfaceShadow : undefined}
    >
      <Search color={colors.muted} size={24} />
      <TextInput
        className="min-w-0 flex-1 text-base text-ink"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')}>
          <X color={colors.muted} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}
