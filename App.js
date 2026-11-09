import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ORANGE = '#ff8900';
const NAVY = '#183f67';
const DARK = '#191919';
const TAUPE = '#a89591';
const WIDTH = Dimensions.get('window').width;
const SCALE = Math.min(WIDTH / 230, 1.7);
const s = (value) => Math.round(value * SCALE);

const foods = [
  { image: require('./assets/food-fries.png'), price: 'R$ 40,00', name: 'Batata Frita', detail: 'Porção 300g' },
  { image: require('./assets/food-pastel.png'), price: 'R$ 15,00', name: 'Pastel', detail: 'Queijo, Pizza e Carne' },
  { image: require('./assets/food-burger.png'), price: 'R$ 52,00', name: 'Hambúrguer veg...', detail: '2 carnes, Pão' },
  { image: require('./assets/food-pizza.png'), price: 'R$ 45,00', name: 'Pizza grande', detail: 'Queijo e tomate' },
];

const promotions = [
  { image: require('./assets/promo-burger.png'), background: '#81231b' },
  { image: require('./assets/promo-pizza.png'), background: '#791b3b' },
  { image: require('./assets/promo-salad.png'), background: '#204d2b' },
  { image: require('./assets/promo-sushi.png'), background: '#0f3e59' },
  { image: require('./assets/promo-dessert.png'), background: '#572c53' },
  { image: require('./assets/promo-pasta.png'), background: '#913d0b' },
];

function KoalaIcon({ size, tintColor }) {
  return (
    <Image
      source={require('./assets/koala-enhanced.png')}
      style={[{ width: size, height: size }, tintColor ? { tintColor } : null]}
      resizeMode="contain"
    />
  );
}

function LoadingScreen({ onFinish }) {
  const koalaY = useRef(new Animated.Value(0)).current;
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    const bob = Animated.loop(Animated.sequence([
      Animated.timing(koalaY, { toValue: -s(5), duration: 850, useNativeDriver: true }),
      Animated.timing(koalaY, { toValue: 0, duration: 850, useNativeDriver: true }),
    ]));
    const pulse = Animated.loop(Animated.stagger(180, dots.map((dot) => Animated.sequence([
      Animated.timing(dot, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(dot, { toValue: 0.35, duration: 360, useNativeDriver: true }),
    ]))));
    bob.start();
    pulse.start();
    const timeout = setTimeout(onFinish, 2600);
    return () => { bob.stop(); pulse.stop(); clearTimeout(timeout); };
  }, [dots, koalaY, onFinish]);

  return (
    <SafeAreaView style={styles.loadingScreen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.loadingFrame}>
        <View style={styles.loadingContent}>
          <Animated.View style={[styles.koalaStage, { width: s(88), height: s(88), transform: [{ translateY: koalaY }] }]}>
            <Image source={require('./assets/mascote-loading.png')} style={{ width: s(52), height: s(52) }} resizeMode="contain" />
          </Animated.View>
          <Text style={styles.loadingTitle}>Só um instante...</Text>
          <Text style={styles.loadingSubtitle}>Preparando tudo com carinho para você.</Text>
          <View style={[styles.loadingDots, { marginTop: s(34) }]}>
            {dots.map((dot, index) => (
              <Animated.View key={index} style={[styles.loadingDot, { opacity: dot, transform: [{ scale: dot }] }]} />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function BellIcon() {
  return (
    <View style={styles.bellShape}>
      <View style={styles.bellClapper} />
    </View>
  );
}

function BottomNavigation({ active, onChange }) {
  const items = [
    { key: 'home', label: 'Início', icon: require('./assets/nav-koala.png'), width: s(21), height: s(14) },
    { key: 'search', label: 'Buscar', icon: require('./assets/nav-search.png'), width: s(11), height: s(11) },
    { key: 'orders', label: 'Pedidos', icon: require('./assets/nav-orders.png'), width: s(10), height: s(12) },
    { key: 'profile', label: 'Perfil', icon: require('./assets/nav-profile.png'), width: s(11), height: s(12) },
  ];
  return (
    <View style={[styles.bottomNav, { height: s(45) }]}>
      {items.map((item) => (
        <Pressable key={item.key} style={styles.navItem} onPress={() => onChange(item.key)}>
          <View style={[styles.navIcon, active === item.key && styles.navIconActive]}>
            <Image source={item.icon} style={{ width: item.width, height: item.height }} resizeMode="contain" />
          </View>
          <Text style={[styles.navLabel, active === item.key && styles.navLabelActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function FoodCard({ food }) {
  return (
    <Pressable style={[styles.foodCard, { width: s(55), marginRight: s(7) }]}>
      <Image source={food.image} style={[styles.foodPhoto, { width: s(55), height: s(54) }]} resizeMode="contain" />
      <Text style={styles.foodPrice} numberOfLines={1}>{food.price}</Text>
      <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
      <Text style={styles.foodDetail} numberOfLines={1}>{food.detail}</Text>
      <Text style={styles.foodRating}>4,8 (452) <Text style={styles.ratingStar}>★</Text></Text>
    </Pressable>
  );
}

function HomeScreen({ onNotifications, activeTab, onTabChange }) {
  const [promotionIndex, setPromotionIndex] = useState(0);
  const promotionOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    const interval = setInterval(() => {
      Animated.timing(promotionOpacity, { toValue: 0, duration: 240, useNativeDriver: true }).start(({ finished }) => {
        if (!finished || !active) return;
        setPromotionIndex((current) => (current + 1) % promotions.length);
        Animated.timing(promotionOpacity, { toValue: 1, duration: 240, useNativeDriver: true }).start();
      });
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
      promotionOpacity.stopAnimation();
    };
  }, [promotionOpacity]);

  return (
    <SafeAreaView style={styles.homeScreen}>
      <StatusBar barStyle="dark-content" backgroundColor={TAUPE} />
      <View style={[styles.homeTitleBar, { height: s(25) }]}><Text style={styles.homeTitle}>Home</Text></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeScroll}>
        <View style={[styles.greetingRow, { paddingHorizontal: s(20), paddingTop: s(9), paddingBottom: s(13) }]}>
          <View style={[styles.avatar, { width: s(17), height: s(17), borderRadius: s(9) }]} />
          <View style={styles.greetingText}>
            <Text style={styles.hello}>Olá Ouli!</Text>
            <Text style={styles.address}>Adicione seu endereço</Text>
          </View>
          <Pressable onPress={onNotifications} style={[styles.bellButton, { width: s(24), height: s(24) }]}><BellIcon /></Pressable>
        </View>

        <Pressable style={[styles.tipBanner, { minHeight: s(44), marginHorizontal: s(20), paddingHorizontal: s(13), paddingVertical: s(8) }]}>
          <View style={[styles.tipBubble, { right: s(8), top: -s(7), borderLeftWidth: s(8), borderRightWidth: s(8), borderBottomWidth: s(12) }]} />
          <Text style={styles.tipTitle}>Falta pouco para o match perfeito!</Text>
          <Text style={styles.tipText}>Defina o que você adora para receber nossas melhores opções.</Text>
        </Pressable>

        <View style={[styles.sectionHeading, { marginHorizontal: s(22), marginTop: s(23), marginBottom: s(7) }]}>
          <Text style={styles.sectionTitle}>Promoções do dia</Text>
        </View>
        <View style={[styles.promoCard, { marginHorizontal: s(21), height: s(139), borderRadius: s(12), backgroundColor: promotions[promotionIndex].background }]}>
          <Animated.Image source={promotions[promotionIndex].image} style={[StyleSheet.absoluteFill, { opacity: promotionOpacity }]} resizeMode="contain" />
        </View>

        <View style={[styles.foodHeading, { marginHorizontal: s(22), marginTop: s(10), marginBottom: s(6) }]}>
          <Text style={styles.foodSectionTitle}>Em alta</Text>
          <Text style={styles.foodSectionSubtitle}>Confira os mais amados</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: s(20), paddingRight: s(10) }}>
          {foods.map((food) => <FoodCard key={food.name} food={food} />)}
        </ScrollView>
        <View style={{ height: s(10) }} />
      </ScrollView>
      <BottomNavigation active={activeTab} onChange={onTabChange} />
    </SafeAreaView>
  );
}

function NotificationsScreen({ onBack }) {
  const filters = ['Todas', 'Pagamentos', 'Cancelados', 'Entregas', 'Outros'];
  return (
    <SafeAreaView style={styles.notificationsScreen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={[styles.notificationTop, { paddingHorizontal: s(8), height: s(37) }]}>
        <Pressable style={[styles.backButton, { width: s(24), height: s(24), borderRadius: s(7) }]} onPress={onBack}><Text style={styles.backArrow}>←</Text></Pressable>
      </View>
      <View style={[styles.notificationTabs, { marginLeft: s(11), marginTop: s(9), marginBottom: s(12) }]}>
        <Text style={styles.notificationTabActive}>Notificações</Text><Text style={styles.tabDivider}>|</Text><Text style={styles.notificationTab}>Mensagens</Text>
      </View>
      <View style={[styles.filterRail, { paddingHorizontal: s(10), height: s(29) }]}>
        {filters.map((label, index) => (
          <View key={label} style={[styles.filterChip, { width: s(index === 1 ? 58 : 49), marginRight: s(5) }, index === 0 && styles.filterSelected]}>
            <Text style={[styles.filterText, index === 0 && styles.filterTextSelected]} numberOfLines={1}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={{ paddingHorizontal: s(11) }}>
        <Text style={[styles.todayLabel, { marginTop: s(15), marginBottom: s(12) }]}>Hoje</Text>
        <View style={styles.notificationRow}>
          <View style={[styles.notificationIcon, { width: s(22), height: s(22), marginRight: s(8) }]}><KoalaIcon size={s(17)} /></View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <Text style={styles.notificationTitle}>Alerta Titu</Text>
              <Text style={styles.notificationDate}>1 OUT, 2026</Text>
            </View>
            <Text style={styles.notificationBody}>Vamos completar seu perfil</Text>
            <Text style={styles.notificationDescription}>Adicione suas restrições e seus pratos preferidos para o Titu procurar as melhores opções para você. Certifique-se de ter seu endereço de entrega cadastrado para receber seu pedido!</Text>
            <Text style={styles.configureLink}>CONFIGURAR AQUI</Text>
          </View>
        </View>
        <View style={[styles.notificationDivider, { marginLeft: s(30), marginTop: s(13) }]} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [activeTab, setActiveTab] = useState('home');
  const finishLoading = useCallback(() => setScreen('home'), []);

  if (screen === 'loading') return <LoadingScreen onFinish={finishLoading} />;
  if (screen === 'notifications') return <NotificationsScreen onBack={() => setScreen('home')} />;
  return <HomeScreen onNotifications={() => setScreen('notifications')} activeTab={activeTab} onTabChange={setActiveTab} />;
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#b5a7a3' },
  loadingFrame: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingContent: { alignItems: 'center', width: '100%', transform: [{ translateY: s(34) }] },
  koalaStage: { alignItems: 'center', justifyContent: 'center', marginBottom: s(7), backgroundColor: 'transparent' },
  loadingTitle: { color: NAVY, fontSize: s(12), fontWeight: '700', marginTop: s(1) },
  loadingSubtitle: { color: '#969696', fontSize: s(8), marginTop: s(10) },
  loadingDots: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  loadingDot: { width: s(5), height: s(5), borderRadius: 99, backgroundColor: ORANGE },
  homeScreen: { flex: 1, backgroundColor: '#fff' },
  homeTitleBar: { backgroundColor: TAUPE, justifyContent: 'center', paddingLeft: s(9) },
  homeTitle: { color: '#fff', fontSize: s(11), fontWeight: '400' },
  homeScroll: { paddingBottom: s(8) },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { backgroundColor: '#dedede' },
  greetingText: { flex: 1, marginLeft: s(5) },
  hello: { color: '#222', fontSize: s(8), fontWeight: '700' },
  address: { color: '#777', fontSize: s(5.5), marginTop: s(1) },
  bellButton: { alignItems: 'center', justifyContent: 'center' },
  bellShape: { width: s(9), height: s(11), borderWidth: 1.4, borderBottomWidth: 1.6, borderColor: '#171717', borderTopLeftRadius: s(7), borderTopRightRadius: s(7), alignItems: 'center' },
  bellClapper: { position: 'absolute', bottom: -s(3), width: s(3), height: s(2), borderRadius: 2, backgroundColor: '#171717' },
  tipBanner: { backgroundColor: ORANGE, borderRadius: s(13), justifyContent: 'center', overflow: 'visible' },
  tipBubble: { position: 'absolute', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: ORANGE, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 12 },
  tipTitle: { color: '#fff', fontSize: s(7), fontWeight: '800', marginBottom: s(3) },
  tipText: { color: '#fff4e6', fontSize: s(5.3), lineHeight: s(7), paddingRight: s(7) },
  sectionHeading: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { color: DARK, fontSize: s(9), fontWeight: '800' },
  promoCard: { overflow: 'hidden', justifyContent: 'center' },
  foodHeading: {},
  foodSectionTitle: { color: '#222', fontSize: s(7), fontWeight: '800' },
  foodSectionSubtitle: { color: '#666', fontSize: s(5), marginTop: s(1) },
  foodCard: {},
  foodPhoto: { borderRadius: s(8), backgroundColor: '#f1ede7' },
  foodPrice: { color: '#222', fontSize: s(5.5), fontWeight: '700', marginTop: s(3) },
  foodName: { color: '#242424', fontSize: s(5.1), marginTop: s(1) },
  foodDetail: { color: '#555', fontSize: s(4.8), marginTop: s(1) },
  foodRating: { color: '#565656', fontSize: s(4.8), marginTop: s(3) },
  ratingStar: { color: '#111', fontSize: s(5) },
  bottomNav: { backgroundColor: NAVY, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: s(2) },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navIcon: { height: s(18), minWidth: s(17), alignItems: 'center', justifyContent: 'center', opacity: 0.72 },
  navIconActive: { opacity: 1 },
  navLabel: { color: '#d6e0e9', fontSize: s(5.5), marginTop: s(1) },
  navLabelActive: { color: '#fff' },
  notificationsScreen: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#b5a7a3' },
  notificationTop: { justifyContent: 'center' },
  backButton: { backgroundColor: '#ffb900', alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: '#fff', fontSize: s(16), fontWeight: '700', lineHeight: s(20), marginTop: -s(2) },
  notificationTabs: { flexDirection: 'row', alignItems: 'center' },
  notificationTabActive: { color: NAVY, fontSize: s(8), fontWeight: '800' },
  tabDivider: { color: '#c79d36', fontSize: s(8), marginHorizontal: s(7) },
  notificationTab: { color: NAVY, fontSize: s(8), fontWeight: '700' },
  filterRail: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  filterChip: { height: '100%', borderRadius: s(6), borderWidth: 1, borderColor: '#dedede', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  filterSelected: { borderColor: '#e0bd5b', backgroundColor: '#fffdf5' },
  filterText: { color: '#777', fontSize: s(5.2) },
  filterTextSelected: { color: '#b9911b' },
  todayLabel: { color: NAVY, fontSize: s(7), fontWeight: '800' },
  notificationRow: { flexDirection: 'row', alignItems: 'flex-start' },
  notificationIcon: { borderWidth: 1.5, borderColor: NAVY, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: s(1) },
  notificationContent: { flex: 1 },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notificationTitle: { color: NAVY, fontSize: s(6.5), fontWeight: '800' },
  notificationDate: { color: NAVY, fontSize: s(5.3) },
  notificationBody: { color: NAVY, fontSize: s(6.4), fontWeight: '700', marginTop: s(3) },
  notificationDescription: { color: ORANGE, fontSize: s(5.4), lineHeight: s(7.5), marginTop: s(4) },
  configureLink: { color: '#d2a000', fontSize: s(6), fontWeight: '800', textAlign: 'right', textDecorationLine: 'underline', marginTop: s(5) },
  notificationDivider: { borderBottomWidth: 1, borderColor: '#f0f0f0' },
});
