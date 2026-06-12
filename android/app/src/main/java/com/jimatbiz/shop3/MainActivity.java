package com.jimatbiz.shop3;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Keep WebView content below the status bar / cutout (Android 15+ edge-to-edge).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
