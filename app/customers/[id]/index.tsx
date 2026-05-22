import { Redirect, useLocalSearchParams } from 'expo-router';

export default function CustomerIndexRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/customers/${id}/history` as any} />;
}
