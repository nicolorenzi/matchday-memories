// Users can:
// - Select match by search
// - Can review, rate, or just log match as watched

import { StyleSheet, Text, View } from 'react-native';

export default function LogScreen() {
  return (
    <View style={styles.container}>
        <Text>Log Screen</Text>
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
