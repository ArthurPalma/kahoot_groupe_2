# kahoot_groupe_2

## Compilation

```bash
npm install --force
ionic build
npx cap add android
npx cap sync
cd android
./gradlew assembleRelease
```

## Installation

Avec `adb`:

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

## APK

Une version de l'APK est disponible dans le dossier `apk`.

## Auteurs

- Equipe 2 : Elie Carrot, Arthur Palma
