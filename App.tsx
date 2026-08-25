import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'calendar' | 'lists' | 'activity' | 'more';
type CalendarItem = { id: string; name: string; color: string; enabled: boolean };
type EventItem = { id: string; title: string; date: string; start: string; end: string; calendarId: string };

const BRAND = '#5B4CF0';
const SPARK = '#FF9F43';
const calendarsSeed: CalendarItem[] = [
  { id: 'personal', name: '私人', color: '#2A9D8F', enabled: true },
  { id: 'shared', name: '星火共享', color: '#7B61A8', enabled: true },
];
const eventsSeed: EventItem[] = [
  { id: '1', title: '神經科回診', date: '2026-11-11', start: '09:00', end: '10:00', calendarId: 'personal' },
  { id: '2', title: '團隊晚餐', date: '2026-11-21', start: '18:30', end: '20:00', calendarId: 'shared' },
  { id: '3', title: '進香', date: '2026-11-22', start: '08:00', end: '17:00', calendarId: 'shared' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const keyFor = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

export default function App() {
  const [tab, setTab] = useState<Tab>('calendar');
  const [calendars, setCalendars] = useState(calendarsSeed);
  const [events, setEvents] = useState(eventsSeed);
  const [selectedDate, setSelectedDate] = useState('2026-11-11');
  const [dayOpen, setDayOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const toggleCalendar = (id: string) => setCalendars(v => v.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  const visibleIds = new Set(calendars.filter(c => c.enabled).map(c => c.id));
  const visibleEvents = events.filter(e => visibleIds.has(e.calendarId));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.app}>
        {tab === 'calendar' && <CalendarScreen calendars={calendars} events={visibleEvents} selectedDate={selectedDate} onToggle={toggleCalendar} onSelectDate={(date) => { setSelectedDate(date); setDayOpen(true); }} />}
        {tab === 'lists' && <ListsScreen calendars={calendars} />}
        {tab === 'activity' && <ActivityScreen events={events} />}
        {tab === 'more' && <MoreScreen />}
        {tab === 'calendar' && <Pressable style={styles.fab} onPress={() => setComposerOpen(true)}><Ionicons name="add" size={38} color="#fff" /></Pressable>}
        <BottomNav tab={tab} setTab={setTab} />
      </View>
      <DaySheet visible={dayOpen} date={selectedDate} events={visibleEvents} calendars={calendars} onClose={() => setDayOpen(false)} onAdd={() => { setDayOpen(false); setComposerOpen(true); }} />
      <Composer visible={composerOpen} date={selectedDate} calendars={calendars} onClose={() => setComposerOpen(false)} onSave={(event) => { setEvents(v => [...v, event]); setComposerOpen(false); }} />
    </SafeAreaView>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.header}><View><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View><View style={styles.spark}><Ionicons name="sparkles" size={18} color={SPARK}/></View></View>;
}

function CalendarScreen({ calendars, events, selectedDate, onToggle, onSelectDate }: any) {
  const year = 2026, month = 10;
  const cells = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    return Array.from({ length: 42 }, (_, i) => {
      const raw = i - first + 1;
      if (raw < 1) return { day: prevDays + raw, current: false, date: keyFor(year, month - 1, prevDays + raw) };
      if (raw > days) return { day: raw - days, current: false, date: keyFor(year, month + 1, raw - days) };
      return { day: raw, current: true, date: keyFor(year, month, raw) };
    });
  }, []);
  return <View style={{flex:1}}><Header title="2026年11月" subtitle="星火日曆"/><ScrollView contentContainerStyle={{paddingBottom:110}}>
    <View style={styles.calendarChips}>{calendars.map((c: CalendarItem) => <Pressable key={c.id} onPress={() => onToggle(c.id)} style={[styles.chip, !c.enabled && {opacity:.4}]}><View style={[styles.check,{backgroundColor:c.color}]}><Ionicons name={c.enabled?'checkmark':'remove'} size={16} color="#fff"/></View><Text style={styles.chipText}>{c.name}</Text></Pressable>)}</View>
    <View style={styles.week}>{['週日','週一','週二','週三','週四','週五','週六'].map((d,i)=><Text key={d} style={[styles.weekText,i===0&&{color:'#E35D6A'}]}>{d}</Text>)}</View>
    <View style={styles.grid}>{cells.map((c:any,i:number)=>{ const dayEvents=events.filter((e:EventItem)=>e.date===c.date); const selected=c.date===selectedDate; return <Pressable key={i} onPress={()=>onSelectDate(c.date)} style={[styles.cell,selected&&styles.selectedCell]}><Text style={[styles.day,!c.current&&styles.muted,i%7===0&&c.current&&{color:'#E35D6A'}]}>{c.day}</Text><View style={styles.eventStack}>{dayEvents.slice(0,2).map((e:EventItem)=>{const cal=calendars.find((x:CalendarItem)=>x.id===e.calendarId);return <View key={e.id} style={[styles.eventPill,{backgroundColor:(cal?.color||BRAND)+'22'}]}><View style={[styles.dot,{backgroundColor:cal?.color||BRAND}]}/><Text numberOfLines={1} style={[styles.eventText,{color:cal?.color||BRAND}]}>{e.title}</Text></View>})}</View></Pressable>})}</View>
  </ScrollView></View>;
}

function ListsScreen({ calendars }: any) { return <ScrollView contentContainerStyle={styles.page}><Header title="日曆清單" subtitle="管理你的私人與共享日曆"/><Text style={styles.section}>我的日曆</Text>{calendars.map((c:CalendarItem)=><View key={c.id} style={styles.listCard}><View style={[styles.calendarArt,{backgroundColor:c.color}]}><Ionicons name="calendar-outline" size={34} color="#fff"/></View><View style={{flex:1}}><Text style={styles.cardTitle}>{c.name}</Text><Text style={styles.cardMeta}>{c.id==='shared'?'3 位成員 · 共享':'只有你可以查看'}</Text></View><Ionicons name="chevron-forward" size={24} color="#B9BBC1"/></View>)}<Pressable style={styles.addCalendar}><Ionicons name="add" size={28} color={BRAND}/><Text style={styles.addCalendarText}>新增日曆</Text></Pressable></ScrollView> }

function ActivityScreen({ events }: any) { return <ScrollView contentContainerStyle={styles.page}><Header title="最新動態" subtitle="共享日曆的變更都會留在這裡"/><View style={styles.segment}><Text style={styles.segmentActive}>行程</Text><Text style={styles.segmentText}>相簿</Text></View>{events.slice().reverse().map((e:EventItem)=><View key={e.id} style={styles.activityCard}><View style={styles.activityAccent}/><View style={{flex:1}}><Text style={styles.cardTitle}>{e.title}</Text><Text style={styles.cardMeta}>{e.date}　{e.start} ～ {e.end}</Text><View style={styles.divider}/><Text style={styles.activityLine}>行程已建立</Text></View></View>)}</ScrollView> }

function MoreScreen(){return <ScrollView contentContainerStyle={styles.page}><Header title="其他" subtitle="星火日曆"/><View style={styles.premium}><Ionicons name="sparkles" size={26} color={SPARK}/><Text style={styles.premiumTitle}>把每個重要時刻，留在一起。</Text><Text style={styles.cardMeta}>WDTD 星火日曆</Text></View><View style={styles.menuGrid}>{[['document-text-outline','備忘錄'],['search','搜尋'],['settings-outline','App設定'],['notifications-outline','通知'],['people-outline','成員'],['flask-outline','Lab']].map(([icon,label])=><View key={label} style={styles.menuItem}><Ionicons name={icon as any} size={27} color={BRAND}/><Text style={styles.menuLabel}>{label}</Text></View>)}</View><Text style={styles.section}>帳號</Text><View style={styles.account}><View style={styles.avatar}><Text style={{fontWeight:'800',color:'#fff'}}>火</Text></View><View><Text style={styles.cardTitle}>黃金火</Text><Text style={styles.cardMeta}>星火日曆使用者</Text></View></View></ScrollView>}

function BottomNav({tab,setTab}:{tab:Tab,setTab:(t:Tab)=>void}){const items:[Tab,string,string][]=[['calendar','calendar-outline','月曆'],['lists','albums-outline','日曆'],['activity','notifications-outline','動態'],['more','grid-outline','其他']];return <View style={styles.nav}>{items.map(([id,icon,label])=><Pressable key={id} style={styles.navItem} onPress={()=>setTab(id)}><Ionicons name={icon as any} size={27} color={tab===id?BRAND:'#A4A6AC'}/><Text style={[styles.navLabel,tab===id&&{color:BRAND}]}>{label}</Text></Pressable>)}</View>}

function DaySheet({visible,date,events,calendars,onClose,onAdd}:any){const items=events.filter((e:EventItem)=>e.date===date);return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><Pressable style={styles.backdrop} onPress={onClose}/><View style={styles.sheet}><View style={styles.handle}/><View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>{date.replaceAll('-',' / ')}</Text><Text style={styles.cardMeta}>{items.length} 個行程</Text></View><Pressable style={styles.roundButton} onPress={onAdd}><Ionicons name="add" size={28}/></Pressable></View>{items.length===0?<Text style={styles.empty}>這一天還沒有行程</Text>:items.map((e:EventItem)=>{const c=calendars.find((x:CalendarItem)=>x.id===e.calendarId);return <View key={e.id} style={styles.dayEvent}><View style={[styles.timeBar,{backgroundColor:c?.color}]}/><Text style={styles.time}>{e.start}{'\n'}<Text style={styles.cardMeta}>{e.end}</Text></Text><Text style={styles.dayEventTitle}>{e.title}</Text></View>})}</View></Modal>}

function Composer({visible,date,calendars,onClose,onSave}:any){const [title,setTitle]=useState('');return <Modal visible={visible} animationType="slide" onRequestClose={onClose}><SafeAreaView style={styles.composer}><View style={styles.composerHeader}><Pressable onPress={onClose}><Text style={styles.cancel}>取消</Text></Pressable><Text style={styles.composerTitle}>新增行程</Text><Pressable onPress={()=>{if(title.trim())onSave({id:String(Date.now()),title:title.trim(),date,start:'10:00',end:'11:00',calendarId:calendars[0].id})}}><Text style={styles.save}>儲存</Text></Pressable></View><TextInput value={title} onChangeText={setTitle} placeholder="行程名稱" autoFocus style={styles.input}/><View style={styles.formRow}><Ionicons name="calendar-outline" size={22} color={BRAND}/><Text style={styles.formText}>{date}</Text></View><View style={styles.formRow}><Ionicons name="time-outline" size={22} color={BRAND}/><Text style={styles.formText}>10:00 ～ 11:00</Text></View><View style={styles.formRow}><View style={[styles.dot,{backgroundColor:calendars[0]?.color}]}/><Text style={styles.formText}>{calendars[0]?.name}</Text></View></SafeAreaView></Modal>}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#fff'},app:{flex:1,backgroundColor:'#fff'},header:{paddingHorizontal:22,paddingTop:18,paddingBottom:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},title:{fontSize:29,fontWeight:'800',color:'#202126'},subtitle:{marginTop:3,fontSize:13,color:'#9A9CA3',fontWeight:'600'},spark:{width:40,height:40,borderRadius:20,backgroundColor:'#FFF4E8',alignItems:'center',justifyContent:'center'},calendarChips:{flexDirection:'row',paddingHorizontal:16,paddingBottom:12,gap:9},chip:{height:42,borderWidth:1,borderColor:'#ECECF0',borderRadius:14,paddingHorizontal:9,flexDirection:'row',alignItems:'center',gap:8},check:{width:28,height:28,borderRadius:9,alignItems:'center',justifyContent:'center'},chipText:{fontWeight:'700',fontSize:15},week:{flexDirection:'row',borderBottomWidth:1,borderColor:'#F0F0F2'},weekText:{width:'14.2857%',textAlign:'center',paddingVertical:10,color:'#8B8D94',fontSize:12},grid:{flexDirection:'row',flexWrap:'wrap'},cell:{width:'14.2857%',height:94,borderBottomWidth:1,borderColor:'#F3F3F5',paddingTop:8,paddingHorizontal:3},selectedCell:{backgroundColor:'#F4F2FF'},day:{textAlign:'center',fontSize:15,color:'#25262B'},muted:{color:'#D2D3D7'},eventStack:{marginTop:7,gap:3},eventPill:{height:19,borderRadius:5,flexDirection:'row',alignItems:'center',paddingHorizontal:3,gap:3},dot:{width:7,height:7,borderRadius:4},eventText:{fontSize:9,fontWeight:'700',flex:1},fab:{position:'absolute',right:20,bottom:88,width:62,height:62,borderRadius:31,backgroundColor:BRAND,alignItems:'center',justifyContent:'center',zIndex:4,shadowColor:'#000',shadowOpacity:.15,shadowRadius:8,elevation:5},nav:{height:74,borderTopWidth:1,borderColor:'#EFEFF2',backgroundColor:'#fff',flexDirection:'row'},navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:3},navLabel:{fontSize:10,color:'#A4A6AC',fontWeight:'700'},page:{paddingBottom:110},section:{fontSize:14,color:'#9B9DA4',fontWeight:'700',marginHorizontal:22,marginTop:18,marginBottom:10},listCard:{marginHorizontal:18,marginBottom:12,flexDirection:'row',alignItems:'center',gap:15,padding:12,borderRadius:20,backgroundColor:'#fff',borderWidth:1,borderColor:'#F0F0F3'},calendarArt:{width:74,height:74,borderRadius:20,alignItems:'center',justifyContent:'center'},cardTitle:{fontSize:18,fontWeight:'800',color:'#25262B'},cardMeta:{fontSize:13,color:'#96989F',marginTop:4},addCalendar:{marginHorizontal:18,marginTop:5,height:60,borderWidth:1,borderStyle:'dashed',borderColor:'#D8D7E8',borderRadius:18,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},addCalendarText:{fontWeight:'800',color:BRAND},segment:{marginHorizontal:18,height:48,backgroundColor:'#F5F5F7',borderRadius:15,flexDirection:'row',alignItems:'center',padding:4},segmentActive:{flex:1,textAlign:'center',paddingVertical:10,backgroundColor:'#fff',borderRadius:12,fontWeight:'800',color:BRAND},segmentText:{flex:1,textAlign:'center',fontWeight:'700',color:'#999BA1'},activityCard:{margin:18,marginBottom:0,padding:18,borderWidth:1,borderColor:'#EEEEF2',borderRadius:22,flexDirection:'row',gap:13},activityAccent:{width:4,borderRadius:4,backgroundColor:BRAND},divider:{height:1,backgroundColor:'#EFEFF2',marginVertical:14},activityLine:{fontSize:15,fontWeight:'600'},premium:{margin:18,padding:24,borderRadius:24,backgroundColor:'#FAF8FF',alignItems:'center'},premiumTitle:{fontSize:20,fontWeight:'800',marginTop:10,color:'#292A30'},menuGrid:{margin:18,flexDirection:'row',flexWrap:'wrap',borderWidth:1,borderColor:'#EFEFF2',borderRadius:22,overflow:'hidden'},menuItem:{width:'33.333%',height:105,alignItems:'center',justifyContent:'center',gap:9,borderWidth:.5,borderColor:'#EFEFF2'},menuLabel:{fontWeight:'700',fontSize:13},account:{marginHorizontal:18,padding:18,borderWidth:1,borderColor:'#EFEFF2',borderRadius:22,flexDirection:'row',alignItems:'center',gap:13},avatar:{width:50,height:50,borderRadius:25,backgroundColor:SPARK,alignItems:'center',justifyContent:'center'},backdrop:{flex:1,backgroundColor:'#0005'},sheet:{minHeight:'55%',backgroundColor:'#fff',borderTopLeftRadius:30,borderTopRightRadius:30,padding:22},handle:{width:40,height:4,borderRadius:2,backgroundColor:'#D5D5D9',alignSelf:'center',marginBottom:20},sheetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sheetTitle:{fontSize:25,fontWeight:'800'},roundButton:{width:48,height:48,borderRadius:24,backgroundColor:'#F2F0FF',alignItems:'center',justifyContent:'center'},empty:{textAlign:'center',color:'#A0A1A7',marginTop:70},dayEvent:{flexDirection:'row',alignItems:'center',marginTop:25,gap:14},timeBar:{width:4,height:54,borderRadius:3},time:{fontSize:14,fontWeight:'800',lineHeight:24},dayEventTitle:{fontSize:18,fontWeight:'800',flex:1},composer:{flex:1,backgroundColor:'#FAFAFC'},composerHeader:{height:64,paddingHorizontal:20,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:'#EFEFF2'},composerTitle:{fontSize:18,fontWeight:'800'},cancel:{color:'#777982',fontSize:16},save:{color:BRAND,fontSize:16,fontWeight:'800'},input:{margin:18,padding:20,borderRadius:18,backgroundColor:'#fff',fontSize:21,fontWeight:'700'},formRow:{marginHorizontal:18,marginBottom:1,padding:18,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:14},formText:{fontSize:16,fontWeight:'600'}});
