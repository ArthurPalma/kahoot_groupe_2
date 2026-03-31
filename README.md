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
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### APK

Une version de l'APK est disponible dans le dossier `apk`.

## Firebase

Les règles firestore sont données dans le fichier `firestore.rules`.


## Auteurs

- Equipe 2 : Elie Carrot, Arthur Palma
