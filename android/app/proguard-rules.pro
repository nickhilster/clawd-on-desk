# OkHttp
-dontwarn okhttp3.**

# kotlinx.serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class kotlinx.serialization.json.** { kotlinx.serialization.KSerializer serializer(...); }
-keep @kotlinx.serialization.Serializable class com.teambotics.deskbuddy.mobile.** { *; }
-keep,includedescriptorclasses class com.teambotics.deskbuddy.mobile.**$$serializer { *; }
-keepclassmembers class com.teambotics.deskbuddy.mobile.** { *** Companion; }
-keepclasseswithmembers class com.teambotics.deskbuddy.mobile.** { kotlinx.serialization.KSerializer serializer(...); }

# zxing
-dontwarn com.google.zxing.**

# Tink / EncryptedSharedPreferences (errorprone annotations)
-dontwarn com.google.errorprone.annotations.CanIgnoreReturnValue
-dontwarn com.google.errorprone.annotations.CheckReturnValue
-dontwarn com.google.errorprone.annotations.Immutable
-dontwarn com.google.errorprone.annotations.RestrictedApi

# Strip debug/info/verbose logs from release builds to avoid leaking sensitive data
-assumenosideeffects class android.util.Log {
    public static int d(...);
    public static int v(...);
    public static int i(...);
}
