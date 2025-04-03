package com.woonii.loveledger;

import android.content.Context;
import com.facebook.flipper.android.AndroidFlipperClient;
import com.facebook.flipper.android.utils.FlipperUtils;
import com.facebook.flipper.core.FlipperClient;
import com.facebook.flipper.plugins.crashreporter.CrashReporterPlugin;
import com.facebook.flipper.plugins.databases.DatabasesFlipperPlugin;
import com.facebook.flipper.plugins.fresco.FrescoFlipperPlugin;
import com.facebook.flipper.plugins.fslogger.FsLoggerFlipperPlugin;
import com.facebook.flipper.plugins.inspector.DescriptorMapping;
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin;
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor;
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin;
import com.facebook.flipper.plugins.react.ReactFlipperPlugin;
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin;
import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.network.NetworkingModule;

public class ReactNativeFlipper {
  public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    if (!FlipperUtils.shouldEnableFlipper(context)) {
      return;
    }

    final FlipperClient client = AndroidFlipperClient.getInstance(context);
    client.addPlugin(new InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()));
    client.addPlugin(new DatabasesFlipperPlugin(context));
    client.addPlugin(new SharedPreferencesFlipperPlugin(context));
    client.addPlugin(new ReactFlipperPlugin());
    client.addPlugin(new FrescoFlipperPlugin());
    client.addPlugin(new NetworkFlipperPlugin());
    client.addPlugin(new CrashReporterPlugin());

    reactInstanceManager.addReactInstanceEventListener(
        new ReactInstanceEventListener() {
          @Override
          public void onReactContextInitialized(ReactContext reactContext) {
            reactContext
                .getJSModule(NetworkingModule.class)
                .addNetworkInterceptor(new FlipperOkhttpInterceptor(client));
          }
        });

    client.start();
  }
} 