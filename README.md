# 🛰️ GIS Betbagtçylyk App — Expo Go

## Telefonda görmek üçin (Expo Go):

### 1️⃣ Expo Go programmasyny gurnuň:
- **Android:** Play Store → "Expo Go" gözläň → Gurnuň
- **iOS:** App Store → "Expo Go" gözläň → Gurnuň

### 2️⃣ Kompýuterde Node.js gurnuň:
👉 https://nodejs.org — LTS wersiýasyny ýükläň

### 3️⃣ Proýekti açyň:
```bash
# Bu papkany islän ýeriňize çykaryň, soň:
cd gis-disaster-app
npm install
npx expo start
```

### 4️⃣ QR kody skanirläň:
- Terminal-da QR kod çykar
- Expo Go app açyň → QR skanirläň
- App telefonda açylýar! ✅

---

## Hakyky APK (Android) üçin:
```bash
npm install -g eas-cli
eas login          # expo.dev-de hasap gerek
eas build -p android --profile preview
```
APK faýl 10-15 minutdan taýyn bolýar.

---

## App-yň aýratynlyklary:
- 🗺️ Hakyky OpenStreetMap karta
- 5 ýurt: TM, KG, UZ, KZ, TJ
- Ýurdy basyň → maglumat paneli açylýar
- Gatlar: Seysmik / Suw basma / Gurakçylyk
- 3 dil: Türkmen / Русский / English
- Howp reýtingi, maglumat çeşmeleri
- Açyk reňkli dizaýn (Material Design 3)
