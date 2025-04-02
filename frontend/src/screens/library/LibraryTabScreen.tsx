// // src/screens/library/LibraryTabScreen.tsx
// import React, { useEffect } from 'react';
// import { View, ActivityIndicator } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { theme } from '../../utils/theme';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../types';

// // 이 컴포넌트는 탭 네비게이터의 요구사항을 충족하는 단순한 컴포넌트입니다
// const LibraryTabScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   // 마운트 시 자동으로 Library 네비게이터로 이동
//   useEffect(() => {
//     const redirectToLibrary = setTimeout(() => {
//       navigation.navigate('Library', {
//         screen: 'LibraryMain'
//       });
//     }, 0);
    
//     return () => clearTimeout(redirectToLibrary);
//   }, [navigation]);

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
//       <ActivityIndicator color={theme.colors.primary} size="large" />
//     </View>
//   );
// };

// export default LibraryTabScreen;