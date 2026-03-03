// Users can: 
// - Set account information (pfp, name, bio, location, top 3 matches, lists)
// - View their logs
// - View followers and following 

import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
        <Text>Profile Screen</Text>
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
