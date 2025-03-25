import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { logout } from "../../store/authSlice";

type RootStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: { partner: string };
  GoalList: undefined;
  Settings: undefined;
  Help: undefined;
  LinkGeneration: undefined;
  Login: undefined;
};

type NavigationParams = {
  ProfileEdit: { partner: string };
  ProfileMain: undefined;
  GoalList: undefined;
  Settings: undefined;
  Help: undefined;
  LinkGeneration: undefined;
  Login: undefined;
};

type ProfileMainScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileMain"
>;

type IconName =
  | "account-edit"
  | "flag-checkered"
  | "cog"
  | "help-circle"
  | "heart-multiple"
  | "arrow-left"
  | "image-edit"
  | "calendar-heart"
  | "notebook"
  | "book-open-variant"
  | "account"
  | "pencil"
  | "chevron-right"
  | "delete"
  | "logout";

interface Partner {
  name: string;
  age: number;
  motto: string;
  photo: string | null;
}

interface ProfileData {
  couple: {
    name: string;
    since: string;
    meetDays: number;
    diariesCount: number;
    storiesCount: number;
  };
  partner1: Partner;
  partner2: Partner;
}

interface MenuOption {
  id: string;
  label: string;
  icon: IconName;
  screen: keyof RootStackParamList;
  params?: NavigationParams[keyof NavigationParams];
}

interface ProfileMainScreenProps {
  navigation: ProfileMainScreenNavigationProp;
}

export default function ProfileMainScreen({
  navigation,
}: ProfileMainScreenProps) {
  const dispatch = useAppDispatch();

  // This would typically come from a database or state management
  const [profileData, setProfileData] = useState<ProfileData>({
    couple: {
      name: "철수 & 영희",
      since: "2023년부터 함께",
      meetDays: 365,
      diariesCount: 15,
      storiesCount: 8,
    },
    partner1: {
      name: "철수",
      age: 29,
      motto: "매일 행복하게",
      photo: null,
    },
    partner2: {
      name: "영희",
      age: 27,
      motto: "우리의 여행 기록하기",
      photo: null,
    },
  });

  const menuOptions: MenuOption[] = [
    {
      id: "editProfile",
      label: "개인 정보 수정",
      icon: "account-edit",
      screen: "ProfileEdit",
      params: { partner: "partner1" },
    },
    {
      id: "goals",
      label: "목표 관리",
      icon: "flag-checkered",
      screen: "GoalList",
    },
    {
      id: "settings",
      label: "앱 설정",
      icon: "cog",
      screen: "Settings",
    },
    {
      id: "help",
      label: "도움말 및 지원",
      icon: "help-circle",
      screen: "Help",
    },
  ];

  const handleMenuPress = (option: MenuOption) => {
    if (option.screen === "ProfileEdit") {
      navigation.navigate("ProfileEdit", option.params as { partner: string });
    } else {
      navigation.navigate(option.screen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={styles.headerTitle}>마이 페이지</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.coverImageContainer}>
            <Image
              source={{
                uri: "https://api.a0.dev/assets/image?text=a%20loving%20couple%20silhouette%20against%20sunset%20background%20warm%20colors&aspect=16:9",
              }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            <Pressable style={styles.editCoverButton}>
              <MaterialCommunityIcons
                name="image-edit"
                size={20}
                color={theme.colors.white}
              />
            </Pressable>
          </View>

          <Text style={styles.coupleName}>{profileData.couple.name}</Text>
          <Text style={styles.sinceDate}>{profileData.couple.since}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="calendar-heart"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.statValue}>
                {profileData.couple.meetDays}
              </Text>
              <Text style={styles.statLabel}>함께한 일수</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="notebook"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.statValue}>
                {profileData.couple.diariesCount}
              </Text>
              <Text style={styles.statLabel}>일기</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.statValue}>
                {profileData.couple.storiesCount}
              </Text>
              <Text style={styles.statLabel}>이야기</Text>
            </View>
          </View>
        </View>
        <View style={styles.partnerSection}>
          <Text style={styles.sectionTitle}>파트너 정보</Text>

          <View style={styles.partnerCardsContainer}>
            <Pressable
              style={styles.partnerCard}
              onPress={() =>
                navigation.navigate({
                  name: "ProfileEdit",
                  params: { partner: "partner1" },
                })
              }
            >
              <View style={styles.partnerPhotoContainer}>
                {profileData.partner1.photo ? (
                  <Image
                    source={{ uri: profileData.partner1.photo }}
                    style={styles.partnerPhoto}
                  />
                ) : (
                  <View
                    style={[
                      styles.partnerPhotoPlaceholder,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={40}
                      color={theme.colors.white}
                    />
                  </View>
                )}
                <View style={styles.partnerEditBadge}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={12}
                    color={theme.colors.white}
                  />
                </View>
              </View>
              <Text style={styles.partnerName}>
                {profileData.partner1.name}
              </Text>
              <Text style={styles.partnerAge}>
                {profileData.partner1.age}세
              </Text>
              <Text style={styles.partnerMotto}>
                "{profileData.partner1.motto}"
              </Text>
            </Pressable>

            <Pressable
              style={styles.partnerCard}
              onPress={() =>
                navigation.navigate({
                  name: "ProfileEdit",
                  params: { partner: "partner2" },
                })
              }
            >
              <View style={styles.partnerPhotoContainer}>
                {profileData.partner2.photo ? (
                  <Image
                    source={{ uri: profileData.partner2.photo }}
                    style={styles.partnerPhoto}
                  />
                ) : (
                  <View
                    style={[
                      styles.partnerPhotoPlaceholder,
                      { backgroundColor: theme.colors.accent },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={40}
                      color={theme.colors.white}
                    />
                  </View>
                )}
                <View style={styles.partnerEditBadge}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={12}
                    color={theme.colors.white}
                  />
                </View>
              </View>
              <Text style={styles.partnerName}>
                {profileData.partner2.name}
              </Text>
              <Text style={styles.partnerAge}>
                {profileData.partner2.age}세
              </Text>
              <Text style={styles.partnerMotto}>
                "{profileData.partner2.motto}"
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>메뉴</Text>

          <Pressable
            style={[styles.menuItem, styles.highlightedMenuItem]}
            onPress={() => navigation.navigate("LinkGeneration")}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: `${theme.colors.primary}30` },
              ]}
            >
              <MaterialCommunityIcons
                name="heart-multiple"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>부부 연동</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.textLight}
            />
          </Pressable>

          {menuOptions.map((option) => (
            <Pressable
              key={option.id}
              style={styles.menuItem}
              onPress={() => {
                if (option.screen === "Settings" || option.screen === "Help") {
                  Alert.alert("개발 중", "이 기능은 현재 개발 중입니다.");
                } else {
                  handleMenuPress(option);
                }
              }}
            >
              <View style={styles.menuIconContainer}>
                <MaterialCommunityIcons
                  name={option.icon}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.menuItemText}>{option.label}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.textLight}
              />
            </Pressable>
          ))}

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              Alert.alert("로그아웃", "정말로 로그아웃하시겠습니까?", [
                { text: "취소", style: "cancel" },
                {
                  text: "로그아웃",
                  onPress: () => {
                    Alert.alert(
                      "로그아웃 성공",
                      "성공적으로 로그아웃되었습니다.",
                      [
                        {
                          text: "확인",
                          onPress: () => {
                            dispatch(logout());
                          },
                        },
                      ]
                    );
                  },
                },
              ]);
            }}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: `${theme.colors.textLight}20` },
              ]}
            >
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={theme.colors.textLight}
              />
            </View>
            <Text
              style={[styles.menuItemText, { color: theme.colors.textLight }]}
            >
              로그아웃
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.textLight}
            />
          </Pressable>

          <Pressable
            style={[styles.menuItem, styles.dangerMenuItem]}
            onPress={() => {
              Alert.alert(
                "계정 삭제",
                "정말로 계정을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.",
                [
                  { text: "취소", style: "cancel" },
                  {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => {
                      Alert.alert(
                        "계정 삭제 완료",
                        "계정이 성공적으로 삭제되었습니다.",
                        [
                          {
                            text: "확인",
                            onPress: () => {
                              dispatch(logout());
                            },
                          },
                        ]
                      );
                    },
                  },
                ]
              );
            }}
          >
            <View
              style={[styles.menuIconContainer, styles.dangerIconContainer]}
            >
              <MaterialCommunityIcons
                name="delete"
                size={24}
                color={theme.colors.error}
              />
            </View>
            <Text style={styles.dangerMenuText}>계정 삭제</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.error}
            />
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Love Ledger v1.0</Text>
          <Text style={styles.copyrightText}>© 2025 Love Ledger</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  highlightedMenuItem: {
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: theme.colors.white,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadows.small,
  },
  coverImageContainer: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  editCoverButton: {
    position: "absolute",
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  coupleName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  sinceDate: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  partnerSection: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  partnerCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  partnerCard: {
    width: "48%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    ...theme.shadows.small,
  },
  partnerPhotoContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  partnerPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  partnerPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  partnerEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 4,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  partnerAge: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  partnerMotto: {
    fontSize: 12,
    fontStyle: "italic",
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  menuSection: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  dangerMenuItem: {
    marginTop: theme.spacing.md,
    borderBottomWidth: 0,
  },
  dangerIconContainer: {
    backgroundColor: `${theme.colors.error}20`,
  },
  dangerMenuText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.error,
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
});
