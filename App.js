import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Animated, Dimensions, StatusBar, SafeAreaView,
} from 'react-native';
import MapView, { Polygon, Circle, Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ── TRANSLATIONS ──────────────────────────────────────────────
const T = {
  tk: {
    appTitle: 'Betbagtçylyk GIS',
    appSub: 'Merkezi Aziýa · Howp Seljermesi',
    layers: 'Gatlar',
    seismic: 'Seysmik',
    flood: 'Suw basma',
    drought: 'Gurakçylyk',
    cities: 'Şäherler',
    hazardLevel: 'Howp derejesi',
    high: 'Ýokary',
    medium: 'Orta',
    low: 'Pes',
    water: 'Suw',
    population: 'Ilat',
    area: 'Meýdan km²',
    riskIndicators: 'Howp görkezijileri',
    navMap: 'Karta',
    navRisk: 'Howplar',
    navData: 'Maglumat',
    navAbout: 'Barada',
    tapCountry: 'Ýurdy saýlaň',
    tapHint: 'Karta üstündäki reňkli zolaga basyň',
    sources: 'Maglumat çeşmeleri',
    about: 'Diplom işi hakynda',
    aboutText: 'Merkezi Aziýa üçin Tebigy Betbagtçylyklary Dolandyrmak GIS Ulgamy\n\nHowp bahasy we Risk seljermesi',
    copyright: '© 2025 · Karta: OpenStreetMap (ODbL)',
    close: 'Ýap',
  },
  ru: {
    appTitle: 'ГИС управления бедствиями',
    appSub: 'Центральная Азия · Оценка рисков',
    layers: 'Слои',
    seismic: 'Сейсмика',
    flood: 'Наводнение',
    drought: 'Засуха',
    cities: 'Города',
    hazardLevel: 'Уровень риска',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
    water: 'Вода',
    population: 'Население',
    area: 'Площадь км²',
    riskIndicators: 'Показатели риска',
    navMap: 'Карта',
    navRisk: 'Угрозы',
    navData: 'Данные',
    navAbout: 'О приложении',
    tapCountry: 'Выберите страну',
    tapHint: 'Нажмите на цветную зону на карте',
    sources: 'Источники данных',
    about: 'О дипломной работе',
    aboutText: 'ГИС-система управления стихийными бедствиями Центральной Азии\n\nОценка опасности и анализ рисков',
    copyright: '© 2025 · Карта: OpenStreetMap (лиц. ODbL)',
    close: 'Закрыть',
  },
  en: {
    appTitle: 'Disaster Management GIS',
    appSub: 'Central Asia · Risk Assessment',
    layers: 'Layers',
    seismic: 'Seismic',
    flood: 'Flooding',
    drought: 'Drought',
    cities: 'Cities',
    hazardLevel: 'Hazard Level',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    water: 'Water',
    population: 'Population',
    area: 'Area km²',
    riskIndicators: 'Risk indicators',
    navMap: 'Map',
    navRisk: 'Hazards',
    navData: 'Data',
    navAbout: 'About',
    tapCountry: 'Select a country',
    tapHint: 'Tap on a colored zone on the map',
    sources: 'Data Sources',
    about: 'About the Thesis',
    aboutText: 'Disaster Management GIS System for Central Asia\n\nHazard Assessment & Risk Analysis',
    copyright: '© 2025 · Map: OpenStreetMap (ODbL)',
    close: 'Close',
  },
};

// ── COUNTRY DATA ──────────────────────────────────────────────
const COUNTRIES = {
  TM: {
    name: { tk: 'Türkmenistan', ru: 'Туркменистан', en: 'Turkmenistan' },
    capital: { tk: 'Aşgabat', ru: 'Ашхабад', en: 'Ashgabat' },
    flag: '🇹🇲',
    pop: '5.1M',
    area: '488K',
    color: '#f59e0b',
    center: { latitude: 39.0, longitude: 59.5 },
    coords: [
      { latitude: 35.1, longitude: 52.3 },
      { latitude: 35.1, longitude: 66.7 },
      { latitude: 42.8, longitude: 66.7 },
      { latitude: 42.8, longitude: 52.3 },
    ],
    badges: {
      tk: ['🔴 Seysmik 9-zona', '🌵 Gurakçylyk', '🏜️ Çäge göçmesi', '🌿 Aral krizisi'],
      ru: ['🔴 Сейсм. зона 9', '🌵 Засуха', '🏜️ Миграция песков', '🌿 Аральский кризис'],
      en: ['🔴 Seismic Zone 9', '🌵 Drought', '🏜️ Sand migration', '🌿 Aral Sea crisis'],
    },
    bars: [
      { key: 'seismic', v: 88, c: '#dc2626' },
      { key: 'drought', v: 82, c: '#f59e0b' },
      { key: 'flood', v: 45, c: '#3b82f6' },
      { key: 'eco', v: 70, c: '#16a34a' },
    ],
    barLabels: {
      tk: ['Seysmik', 'Gurakçylyk', 'Suw basma', 'Ekologik'],
      ru: ['Сейсмика', 'Засуха', 'Паводки', 'Экология'],
      en: ['Seismic', 'Drought', 'Flooding', 'Ecological'],
    },
  },
  KG: {
    name: { tk: 'Gyrgyzystan', ru: 'Кыргызстан', en: 'Kyrgyzstan' },
    capital: { tk: 'Bişkek', ru: 'Бишкек', en: 'Bishkek' },
    flag: '🇰🇬',
    pop: '6.7M',
    area: '200K',
    color: '#dc2626',
    center: { latitude: 41.5, longitude: 74.8 },
    coords: [
      { latitude: 39.2, longitude: 69.3 },
      { latitude: 39.2, longitude: 80.2 },
      { latitude: 43.3, longitude: 80.2 },
      { latitude: 43.3, longitude: 69.3 },
    ],
    badges: {
      tk: ['🔴 Ýer titremesi', '🏔️ Dag süýşmesi', '❄️ Çuw joşmasy'],
      ru: ['🔴 Землетрясение', '🏔️ Оползни', '❄️ Сели'],
      en: ['🔴 Earthquakes', '🏔️ Landslides', '❄️ Avalanches'],
    },
    bars: [
      { key: 'seismic', v: 91, c: '#dc2626' },
      { key: 'flood', v: 75, c: '#3b82f6' },
      { key: 'land', v: 60, c: '#f59e0b' },
      { key: 'drought', v: 28, c: '#16a34a' },
    ],
    barLabels: {
      tk: ['Seysmik', 'Suw basma', 'Dag süýşmesi', 'Gurakçylyk'],
      ru: ['Сейсмика', 'Паводки', 'Оползни', 'Засуха'],
      en: ['Seismic', 'Flooding', 'Landslides', 'Drought'],
    },
  },
  UZ: {
    name: { tk: 'Özbegistan', ru: 'Узбекистан', en: 'Uzbekistan' },
    capital: { tk: 'Daşkent', ru: 'Ташкент', en: 'Tashkent' },
    flag: '🇺🇿',
    pop: '35.3M',
    area: '449K',
    color: '#f97316',
    center: { latitude: 41.0, longitude: 63.5 },
    coords: [
      { latitude: 37.2, longitude: 56.0 },
      { latitude: 37.2, longitude: 73.2 },
      { latitude: 45.6, longitude: 73.2 },
      { latitude: 45.6, longitude: 56.0 },
    ],
    badges: {
      tk: ['🔴 Seysmik', '💧 Suw ýetmezçiligi', '🌊 Joşma'],
      ru: ['🔴 Сейсмика', '💧 Дефицит воды', '🌊 Паводки'],
      en: ['🔴 Seismic', '💧 Water scarcity', '🌊 Flooding'],
    },
    bars: [
      { key: 'seismic', v: 80, c: '#dc2626' },
      { key: 'water', v: 85, c: '#f59e0b' },
      { key: 'flood', v: 65, c: '#3b82f6' },
      { key: 'land', v: 55, c: '#16a34a' },
    ],
    barLabels: {
      tk: ['Seysmik', 'Suw ýetm.', 'Suw basma', 'Dag'],
      ru: ['Сейсмика', 'Дефицит воды', 'Паводки', 'Горы'],
      en: ['Seismic', 'Water scarcity', 'Flooding', 'Mountains'],
    },
  },
  KZ: {
    name: { tk: 'Gazagystan', ru: 'Казахстан', en: 'Kazakhstan' },
    capital: { tk: 'Astana', ru: 'Астана', en: 'Astana' },
    flag: '🇰🇿',
    pop: '19.2M',
    area: '2.7M',
    color: '#16a34a',
    center: { latitude: 48.0, longitude: 67.0 },
    coords: [
      { latitude: 40.6, longitude: 46.5 },
      { latitude: 40.6, longitude: 87.3 },
      { latitude: 55.4, longitude: 87.3 },
      { latitude: 55.4, longitude: 46.5 },
    ],
    badges: {
      tk: ['🌊 Uly joşma', '❄️ Gyş howpy', '🔥 Tokaý ýangyny'],
      ru: ['🌊 Крупные паводки', '❄️ Морозы', '🔥 Лесные пожары'],
      en: ['🌊 Major floods', '❄️ Extreme cold', '🔥 Wildfires'],
    },
    bars: [
      { key: 'flood', v: 72, c: '#3b82f6' },
      { key: 'cold', v: 68, c: '#f59e0b' },
      { key: 'fire', v: 55, c: '#dc2626' },
      { key: 'seismic', v: 40, c: '#16a34a' },
    ],
    barLabels: {
      tk: ['Suw basma', 'Gyş sowugy', 'Ýangyn', 'Seysmik'],
      ru: ['Паводки', 'Морозы', 'Пожары', 'Сейсмика'],
      en: ['Flooding', 'Extreme cold', 'Fires', 'Seismic'],
    },
  },
  TJ: {
    name: { tk: 'Täjigistan', ru: 'Таджикистан', en: 'Tajikistan' },
    capital: { tk: 'Duşanbe', ru: 'Душанбе', en: 'Dushanbe' },
    flag: '🇹🇯',
    pop: '10.1M',
    area: '143K',
    color: '#7c3aed',
    center: { latitude: 38.8, longitude: 71.0 },
    coords: [
      { latitude: 36.7, longitude: 67.3 },
      { latitude: 36.7, longitude: 75.2 },
      { latitude: 41.0, longitude: 75.2 },
      { latitude: 41.0, longitude: 67.3 },
    ],
    badges: {
      tk: ['🔴 Ýer titremesi', '⛰️ Dag süýşmesi', '🌊 Joşma'],
      ru: ['🔴 Землетрясение', '⛰️ Оползни', '🌊 Паводки'],
      en: ['🔴 Earthquakes', '⛰️ Landslides', '🌊 Flooding'],
    },
    bars: [
      { key: 'seismic', v: 95, c: '#dc2626' },
      { key: 'land', v: 88, c: '#f59e0b' },
      { key: 'flood', v: 78, c: '#3b82f6' },
      { key: 'mud', v: 50, c: '#16a34a' },
    ],
    barLabels: {
      tk: ['Seysmik', 'Dag süýşmesi', 'Suw basma', 'Çuw'],
      ru: ['Сейсмика', 'Оползни', 'Паводки', 'Сели'],
      en: ['Seismic', 'Landslides', 'Flooding', 'Mudflows'],
    },
  },
};

const SEISMIC_PTS = [
  { lat: 37.95, lng: 58.38, r: 9, name: 'Aşgabat' },
  { lat: 42.87, lng: 74.57, r: 8, name: 'Bişkek' },
  { lat: 38.55, lng: 68.77, r: 9, name: 'Duşanbe' },
  { lat: 41.3, lng: 69.25, r: 7, name: 'Daşkent' },
  { lat: 39.47, lng: 75.98, r: 9, name: 'Oş' },
  { lat: 38.56, lng: 72.98, r: 9, name: 'Khorugh' },
  { lat: 40.5, lng: 72.8, r: 8, name: 'Fergana' },
];

const FLOOD_ZONES = [
  { lat: 43.8, lng: 59.0, r: 80000, name: 'Amyderýa delta' },
  { lat: 41.5, lng: 60.5, r: 60000, name: 'Aral deňzi' },
  { lat: 41.1, lng: 74.0, r: 35000, name: 'Naryn' },
];

const DATA_SOURCES = [
  { icon: '📡', name: 'USGS Earthquake Hazards', url: 'earthquake.usgs.gov' },
  { icon: '🛰️', name: 'NASA FIRMS / MODIS', url: 'firms.modaps.eosdis.nasa.gov' },
  { icon: '🗺️', name: 'OpenStreetMap (ODbL)', url: 'openstreetmap.org' },
  { icon: '🌊', name: 'NOAA Climate Data', url: 'ncdc.noaa.gov' },
  { icon: '📊', name: 'EM-DAT Disaster DB', url: 'emdat.be' },
  { icon: '🏛️', name: 'UNDRR Sendai Framework', url: 'sendaiframework.undrr.org' },
  { icon: '💹', name: 'World Bank Open Data', url: 'data.worldbank.org' },
  { icon: '🛰️', name: 'Copernicus / ESA Sentinel', url: 'dataspace.copernicus.eu' },
];

// ── COMPONENTS ────────────────────────────────────────────────
function RiskBar({ label, value, color }) {
  return (
    <View style={styles.barWrap}>
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barPct}>{value}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function Badge({ text }) {
  const isRed = text.includes('🔴');
  const isBlue = text.includes('🌊') || text.includes('💧');
  const isGreen = text.includes('🌿') || text.includes('❄️');
  const bg = isRed ? '#fef2f2' : isBlue ? '#eff6ff' : isGreen ? '#f0fdf4' : '#fffbeb';
  const color = isRed ? '#dc2626' : isBlue ? '#2563eb' : isGreen ? '#16a34a' : '#d97706';
  const border = isRed ? '#fecaca' : isBlue ? '#bfdbfe' : isGreen ? '#bbf7d0' : '#fde68a';
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

// ── SCREENS ───────────────────────────────────────────────────
function MapScreen({ lang }) {
  const t = T[lang];
  const mapRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showSeismic, setShowSeismic] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [showDrought, setShowDrought] = useState(true);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const openCountry = (code) => {
    setSelectedCountry(code);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70 }).start();
    const c = COUNTRIES[code].center;
    mapRef.current?.animateToRegion({ latitude: c.latitude, longitude: c.longitude, latitudeDelta: 8, longitudeDelta: 8 }, 600);
  };

  const closeCountry = () => {
    Animated.timing(slideAnim, { toValue: 400, useNativeDriver: true, duration: 250 }).start(() => setSelectedCountry(null));
  };

  const country = selectedCountry ? COUNTRIES[selectedCountry] : null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{ latitude: 43, longitude: 63, latitudeDelta: 22, longitudeDelta: 30 }}
        mapType="standard"
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* Country polygons */}
        {Object.entries(COUNTRIES).map(([code, c]) => (
          <Polygon
            key={code}
            coordinates={c.coords}
            fillColor={c.color + '40'}
            strokeColor={c.color}
            strokeWidth={2}
            tappable
            onPress={() => openCountry(code)}
          />
        ))}

        {/* Country label markers */}
        {Object.entries(COUNTRIES).map(([code, c]) => (
          <Marker
            key={`lbl-${code}`}
            coordinate={c.center}
            onPress={() => openCountry(code)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.countryLabel, { borderColor: c.color }]}>
              <Text style={styles.countryLabelText}>{c.flag} {code}</Text>
            </View>
          </Marker>
        ))}

        {/* Seismic markers */}
        {showSeismic && SEISMIC_PTS.map((p, i) => (
          <Circle
            key={`s${i}`}
            center={{ latitude: p.lat, longitude: p.lng }}
            radius={p.r >= 9 ? 80000 : 60000}
            fillColor={p.r >= 9 ? '#dc262650' : p.r >= 8 ? '#f59e0b50' : '#16a34a50'}
            strokeColor={p.r >= 9 ? '#dc2626' : p.r >= 8 ? '#f59e0b' : '#16a34a'}
            strokeWidth={2}
          />
        ))}

        {/* Flood zones */}
        {showFlood && FLOOD_ZONES.map((z, i) => (
          <Circle
            key={`f${i}`}
            center={{ latitude: z.lat, longitude: z.lng }}
            radius={z.r}
            fillColor="#3b82f630"
            strokeColor="#3b82f6"
            strokeWidth={1.5}
          />
        ))}

        {/* Drought rectangle corners */}
        {showDrought && (
          <Polygon
            coordinates={[
              { latitude: 35.5, longitude: 55 },
              { latitude: 35.5, longitude: 67 },
              { latitude: 42, longitude: 67 },
              { latitude: 42, longitude: 55 },
            ]}
            fillColor="#f59e0b20"
            strokeColor="#f59e0b"
            strokeWidth={1.5}
          />
        )}
      </MapView>

      {/* Layer toggles */}
      <View style={styles.layerPanel}>
        <Text style={styles.layerTitle}>{t.layers}</Text>
        {[
          { key: 'seismic', val: showSeismic, set: setShowSeismic, color: '#dc2626', emoji: '🔴' },
          { key: 'flood', val: showFlood, set: setShowFlood, color: '#3b82f6', emoji: '🔵' },
          { key: 'drought', val: showDrought, set: setShowDrought, color: '#f59e0b', emoji: '🟡' },
        ].map(item => (
          <TouchableOpacity key={item.key} style={styles.layerRow} onPress={() => item.set(!item.val)}>
            <Text style={styles.layerLbl}>{item.emoji} {t[item.key]}</Text>
            <View style={[styles.toggle, item.val && { backgroundColor: item.color }]}>
              <View style={[styles.toggleThumb, item.val && styles.toggleThumbOn]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legendBox}>
        <Text style={styles.legendTitle}>{t.hazardLevel}</Text>
        {[
          { c: '#dc2626', l: t.high },
          { c: '#f59e0b', l: t.medium },
          { c: '#16a34a', l: t.low },
          { c: '#3b82f6', l: t.water },
        ].map((item, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.c }]} />
            <Text style={styles.legendLbl}>{item.l}</Text>
          </View>
        ))}
      </View>

      {/* Tap hint */}
      {!selectedCountry && (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>👆 {t.tapHint}</Text>
        </View>
      )}

      {/* Bottom sheet */}
      {selectedCountry && country && (
        <>
          <TouchableOpacity style={styles.overlay} onPress={closeCountry} activeOpacity={1} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity style={styles.closeBtn} onPress={closeCountry}>
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetFlag}>{country.flag}</Text>
                <View>
                  <Text style={styles.sheetName}>{country.name[lang]}</Text>
                  <Text style={styles.sheetCapital}>📍 {country.capital[lang]}</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
                {(country.badges[lang] || []).map((b, i) => <Badge key={i} text={b} />)}
              </ScrollView>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statVal}>{country.pop}</Text>
                  <Text style={styles.statLbl}>{t.population}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statVal}>{country.area}</Text>
                  <Text style={styles.statLbl}>{t.area}</Text>
                </View>
              </View>

              <View style={styles.barsSection}>
                <Text style={styles.barsSectionTitle}>{t.riskIndicators}</Text>
                {country.bars.map((bar, i) => (
                  <RiskBar
                    key={i}
                    label={(country.barLabels[lang] || country.barLabels.en)[i]}
                    value={bar.v}
                    color={bar.c}
                  />
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

function RiskScreen({ lang }) {
  const t = T[lang];
  const riskData = Object.entries(COUNTRIES).map(([code, c]) => ({
    code,
    name: c.name[lang],
    flag: c.flag,
    color: c.color,
    topRisk: c.bars[0].v,
    topLabel: (c.barLabels[lang] || c.barLabels.en)[0],
    topColor: c.bars[0].c,
  })).sort((a, b) => b.topRisk - a.topRisk);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.screenTitle}>⚠️ {t.navRisk}</Text>
      {riskData.map((item, i) => (
        <View key={item.code} style={styles.riskCard}>
          <View style={styles.riskCardTop}>
            <View style={[styles.riskRank, { backgroundColor: i === 0 ? '#fef2f2' : i === 1 ? '#fffbeb' : '#f0fdf4' }]}>
              <Text style={[styles.riskRankText, { color: i === 0 ? '#dc2626' : i === 1 ? '#d97706' : '#16a34a' }]}>#{i + 1}</Text>
            </View>
            <Text style={styles.riskFlag}>{item.flag}</Text>
            <Text style={styles.riskName}>{item.name}</Text>
            <Text style={styles.riskPct}>{item.topRisk}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${item.topRisk}%`, backgroundColor: item.topColor }]} />
          </View>
          <Text style={styles.riskLabelSmall}>{item.topLabel}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function DataScreen({ lang }) {
  const t = T[lang];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.screenTitle}>📋 {t.sources}</Text>
      {DATA_SOURCES.map((src, i) => (
        <View key={i} style={styles.srcCard}>
          <Text style={styles.srcIcon}>{src.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.srcName}>{src.name}</Text>
            <Text style={styles.srcUrl}>{src.url}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function AboutScreen({ lang }) {
  const t = T[lang];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
      <View style={styles.aboutIcon}>
        <Text style={{ fontSize: 48 }}>🛰️</Text>
      </View>
      <Text style={styles.aboutTitle}>{t.appTitle}</Text>
      <Text style={styles.aboutSub}>{t.appSub}</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutText}>{t.aboutText}</Text>
      </View>
      <Text style={styles.aboutCopy}>{t.copyright}</Text>

      <View style={styles.statsRow}>
        {Object.entries(COUNTRIES).map(([code, c]) => (
          <View key={code} style={[styles.miniCard, { borderColor: c.color }]}>
            <Text style={styles.miniFlag}>{c.flag}</Text>
            <Text style={styles.miniCode}>{code}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('map');
  const [lang, setLang] = useState('tk');
  const t = T[lang];

  const tabs = [
    { key: 'map', icon: 'map', label: t.navMap },
    { key: 'risk', icon: 'warning', label: t.navRisk },
    { key: 'data', icon: 'document-text', label: t.navData },
    { key: 'about', icon: 'information-circle', label: t.navAbout },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}><Text style={{ fontSize: 18 }}>🛰️</Text></View>
          <View>
            <Text style={styles.headerTitle}>{t.appTitle}</Text>
            <Text style={styles.headerSub}>{t.appSub}</Text>
          </View>
        </View>
        <View style={styles.langBtns}>
          {['tk', 'ru', 'en'].map(l => (
            <TouchableOpacity key={l} style={[styles.langBtn, lang === l && styles.langBtnActive]} onPress={() => setLang(l)}>
              <Text style={[styles.langBtnText, lang === l && styles.langBtnTextActive]}>{l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {tab === 'map' && <MapScreen lang={lang} />}
        {tab === 'risk' && <RiskScreen lang={lang} />}
        {tab === 'data' && <DataScreen lang={lang} />}
        {tab === 'about' && <AboutScreen lang={lang} />}
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {tabs.map(item => (
          <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => setTab(item.key)}>
            <View style={[styles.navIconWrap, tab === item.key && styles.navIconActive]}>
              <Ionicons name={item.icon} size={22} color={tab === item.key ? '#2563eb' : '#94a3b8'} />
            </View>
            <Text style={[styles.navLabel, tab === item.key && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerIcon: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  langBtns: { flexDirection: 'row', gap: 4 },
  langBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  langBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: '#fff' },
  langBtnText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  langBtnTextActive: { color: '#fff' },

  // Layer panel
  layerPanel: { position: 'absolute', top: 12, left: 12, backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, minWidth: 150 },
  layerTitle: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  layerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  layerLbl: { fontSize: 12, color: '#334155', fontWeight: '500' },
  toggle: { width: 34, height: 20, borderRadius: 10, backgroundColor: '#e2e8f0', justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Legend
  legendBox: { position: 'absolute', right: 12, bottom: 80, backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  legendTitle: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLbl: { fontSize: 11, color: '#475569' },

  // Tap hint
  tapHint: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(37,99,235,0.9)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  tapHintText: { fontSize: 12, color: '#fff', fontWeight: '500' },

  // Overlay + Sheet
  overlay: { position: 'absolute', inset: 0, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.65, paddingBottom: 16, elevation: 20 },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  closeBtn: { position: 'absolute', top: 12, right: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 12 },
  sheetFlag: { fontSize: 32 },
  sheetName: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  sheetCapital: { fontSize: 13, color: '#64748b', marginTop: 2 },
  badgesScroll: { paddingHorizontal: 20, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 14, padding: 14 },
  statVal: { fontSize: 22, fontWeight: '700', color: '#2563eb' },
  statLbl: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  barsSection: { paddingHorizontal: 20 },
  barsSectionTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  barWrap: { marginBottom: 10 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 12, color: '#64748b' },
  barPct: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  barTrack: { height: 7, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  // Country label marker
  countryLabel: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1.5 },
  countryLabelText: { fontSize: 11, fontWeight: '700', color: '#1e293b' },

  // Screens
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  screenTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },

  riskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  riskCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  riskRank: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  riskRankText: { fontSize: 11, fontWeight: '800' },
  riskFlag: { fontSize: 20 },
  riskName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a' },
  riskPct: { fontSize: 16, fontWeight: '700', color: '#dc2626' },
  riskLabelSmall: { fontSize: 11, color: '#94a3b8', marginTop: 4 },

  srcCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  srcIcon: { fontSize: 22 },
  srcName: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  srcUrl: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  aboutIcon: { width: 90, height: 90, backgroundColor: '#eff6ff', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 8 },
  aboutTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  aboutSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  aboutCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  aboutText: { fontSize: 14, color: '#334155', lineHeight: 22, textAlign: 'center' },
  aboutCopy: { fontSize: 11, color: '#94a3b8', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  miniCard: { width: 64, height: 64, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', elevation: 2 },
  miniFlag: { fontSize: 22 },
  miniCode: { fontSize: 10, fontWeight: '700', color: '#475569', marginTop: 2 },

  // Bottom Nav
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: 8, paddingTop: 6 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIconWrap: { width: 44, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#eff6ff' },
  navLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },
  navLabelActive: { color: '#2563eb', fontWeight: '700' },
});
