import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function SearchInput({ onChangeText, placeholder, value }: SearchInputProps) {
  return (
    <View className="min-h-12 flex-row items-center gap-2 rounded-full border border-line-200 bg-paper-50 px-4">
      <Search color="#69727e" size={18} />
      <TextInput
        className="min-w-0 flex-1 text-base text-ink-950"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#69727e"
        value={value}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')}>
          <X color="#69727e" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}
