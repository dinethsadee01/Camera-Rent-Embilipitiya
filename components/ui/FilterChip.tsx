import { ScrollView, TouchableOpacity, Text } from 'react-native';

interface FilterChip {
  key: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ chips, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {chips.map((chip) => {
        const active = chip.key === selected;
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => onSelect(chip.key)}
            className={`px-3 py-1.5 rounded-full border ${
              active
                ? 'bg-flag_red border-flag_red'
                : 'bg-transparent border-platinum-400 dark:border-black-600'
            }`}
            activeOpacity={0.75}
          >
            <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-black-700 dark:text-black-900'}`}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
