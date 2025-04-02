module.exports = {
  expo: {
    name: "LoveLedger",
    slug: "love-ledger",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    scheme: "loveledger",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.woonii.loveledger",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["loveledger"],
          },
        ],
      },
    },
    android: {
      package: "com.woonii.loveledger",
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "loveledger",
              host: "auth",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      permissions: ["INTERNET"],
    },
    web: {},
    extra: {
      eas: {
        projectId: "df309547-43fb-4742-87fa-54f1821139d9",
      },
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
      GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    },
  },
};
