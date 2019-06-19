package com.tonchan;

import android.app.Application;
import android.content.Intent;

import com.bitgo.randombytes.RandomBytesPackage;

import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.swmansion.rnscreens.RNScreensPackage;
import io.sentry.RNSentryPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.security.ProviderInstaller;
import com.google.android.gms.security.ProviderInstaller.ProviderInstallListener;

import com.horcrux.svg.SvgPackage;

import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;

import com.oblador.keychain.KeychainPackage;
import com.oblador.vectoricons.VectorIconsPackage;

import com.peel.react.TcpSocketsModule;

import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;

import com.tradle.react.UdpSocketsModule;

import io.realm.react.RealmReactPackage;

import java.util.Arrays;
import java.util.List;

import org.pgsqlite.SQLitePluginPackage;

import org.reactnative.camera.RNCameraPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new NetInfoPackage(),
            new AsyncStoragePackage(),
            new RNScreensPackage(),
            new RNSentryPackage(),
            new RNExitAppPackage(),
            new ReactNativePushNotificationPackage(),
            new RNBackgroundFetchPackage(),
            new RNCameraPackage(),
            new SvgPackage(),
            new KeychainPackage(),
            new VectorIconsPackage(),
            new TcpSocketsModule(),
            new RealmReactPackage(),
            new UdpSocketsModule(),
            new RandomBytesPackage(),
            new RNGestureHandlerPackage(),
            new SQLitePluginPackage(),
            new TurtleCoinPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    upgradeSecurityProvider();
    SoLoader.init(this, /* native exopackage */ false);
  }

  private void upgradeSecurityProvider() {
    ProviderInstaller.installIfNeededAsync(this, new ProviderInstallListener() {
      @Override
      public void onProviderInstalled() {
      }

      @Override
      public void onProviderInstallFailed(int errorCode, Intent recoveryIntent) {
        GooglePlayServicesUtil.showErrorNotification(errorCode, MainApplication.this);
      }
    });
  }
}
