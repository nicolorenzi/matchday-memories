import { StyleSheet, Text, View } from 'react-native';

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
        <Text>Activity Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
