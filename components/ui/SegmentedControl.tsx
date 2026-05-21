import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Segment {
  key: string;
  label: string;
  count?: number;
}

interface SegmentedControlProps {
  segments: Segment[];
  selected: string;
  onSelect: (key: string) => void;
}

export function SegmentedControl({ segments, selected, onSelect }: SegmentedControlProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-grow-0"
      contentContainerClassName="gap-2 px-4 py-1"
    >
      {segments.map((seg) => {
        const active = seg.key === selected;
        return (
          <TouchableOpacity
            key={seg.key}
            onPress={() => onSelect(seg.key)}
            className={`flex-row items-center px-3.5 py-1.5 rounded-full ${
              active
                ? 'bg-flag_red'
                : 'bg-platinum-700 dark:bg-black-600'
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-sm font-medium ${
                active ? 'text-white' : 'text-black-700 dark:text-black-900'
              }`}
            >
              {seg.label}
            </Text>
            {seg.count !== undefined && (
              <View
                className={`ml-1.5 w-5 h-5 rounded-full items-center justify-center ${
                  active ? 'bg-flag_red-400' : 'bg-platinum-500 dark:bg-black-500'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? 'text-white' : 'text-black-700 dark:text-black-800'
                  }`}
                >
                  {seg.count > 99 ? '99+' : seg.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
