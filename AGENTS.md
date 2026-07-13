# Expo SDK is pinned — do not upgrade

This app is pinned to **Expo SDK 54**, matching the Expo Go app currently published on the
Play Store / App Store. SDK 57 exists upstream but Expo Go doesn't support it yet — upgrading
would break on-device testing via Expo Go (used through Phase 5; see PLAN.md).

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any
integration code. Do not consult newer (e.g. v57) docs or upgrade the `expo` package unless
the user explicitly says the Expo Go constraint no longer applies.
