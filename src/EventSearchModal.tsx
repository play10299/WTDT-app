import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarItem, EventItem } from './storage';

const BRAND = '#5B4CF0';

type Props = {
  visible: boolean;
  events: EventItem[];
  calendars: CalendarItem[];
  onClose: () => void;
  onOpenEvent: (event: EventItem) => void;
};

export default function EventSearchModal({ visible, events, calendars, onClose, onOpenEvent }: Props) {
  const [query, setQuery] = useState('');
  const [calendarId, setCalendarId] = useState<string>('all');

  const results = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return events
      .filter(event => calendarId === 'all' || event.calendarId === calendarId)
      .filter(event => {
        if (!keyword) return true;
        return [event.title, event.location, event.notes, event.date]
          .filter(Boolean)
          .some(value => String(value).toLocaleLowerCase().includes(keyword));
      })
      .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  }, [events, query, calendarId]);

  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.close}><Ionicons name="chevron-back" size={26} color="#222"/></Pressable>
        <Text style={styles.title}>搜尋行程</Text>
        <View style={{width:42}} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#888"/>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="搜尋標題、地點、備註或日期"
          autoFocus
          style={styles.input}
          returnKeyType="search"
        />
        {!!query && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color="#AAA"/></Pressable>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Pressable style={[styles.filter, calendarId === 'all' && styles.filterActive]} onPress={() => setCalendarId('all')}>
          <Text style={[styles.filterText, calendarId === 'all' && styles.filterTextActive]}>全部</Text>
        </Pressable>
        {calendars.map(calendar => <Pressable key={calendar.id} style={[styles.filter, calendarId === calendar.id && styles.filterActive]} onPress={() => setCalendarId(calendar.id)}>
          <View style={[styles.dot,{backgroundColor:calendar.color}]}/>
          <Text style={[styles.filterText, calendarId === calendar.id && styles.filterTextActive]}>{calendar.name}</Text>
        </Pressable>)}
      </ScrollView>

      <Text style={styles.count}>{results.length} 個結果</Text>
      <ScrollView contentContainerStyle={styles.results} keyboardShouldPersistTaps="handled">
        {results.length === 0 ? <View style={styles.empty}><Ionicons name="search-outline" size={42} color="#C7C7CC"/><Text style={styles.emptyTitle}>找不到符合的行程</Text><Text style={styles.emptyText}>可以試著搜尋其他關鍵字或切換日曆。</Text></View> : results.map(event => {
          const calendar = calendars.find(item => item.id === event.calendarId);
          return <Pressable key={event.id} style={styles.card} onPress={() => onOpenEvent(event)}>
            <View style={[styles.accent,{backgroundColor:calendar?.color || BRAND}]}/>
            <View style={{flex:1}}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.meta}>{event.date}　{event.allDay ? '全天' : `${event.start} ～ ${event.end}`}</Text>
              {!!event.location && <Text style={styles.meta}>📍 {event.location}</Text>}
              <Text style={[styles.calendarName,{color:calendar?.color || BRAND}]}>{calendar?.name || '未知日曆'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BBB"/>
          </Pressable>;
        })}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F8F8FA'},header:{height:62,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:12,borderBottomWidth:1,borderBottomColor:'#EEEEF1'},close:{width:42,height:42,alignItems:'center',justifyContent:'center'},title:{fontSize:18,fontWeight:'800',color:'#24252A'},searchBox:{height:50,margin:16,marginBottom:10,borderRadius:15,backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E7EB',paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:9},input:{flex:1,fontSize:16},filters:{paddingHorizontal:16,paddingBottom:10,gap:8},filter:{height:38,paddingHorizontal:12,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E7EB',flexDirection:'row',alignItems:'center',gap:7},filterActive:{backgroundColor:'#F1EFFF',borderColor:BRAND},filterText:{fontSize:13,fontWeight:'700',color:'#666'},filterTextActive:{color:BRAND},dot:{width:9,height:9,borderRadius:5},count:{fontSize:12,fontWeight:'700',color:'#9A9CA3',paddingHorizontal:18,paddingVertical:6},results:{padding:16,paddingTop:4,paddingBottom:40,gap:10},card:{minHeight:84,borderRadius:17,backgroundColor:'#fff',borderWidth:1,borderColor:'#ECECF0',padding:13,flexDirection:'row',alignItems:'center',gap:11},accent:{width:4,alignSelf:'stretch',borderRadius:2},eventTitle:{fontSize:16,fontWeight:'800',color:'#28292E'},meta:{fontSize:12,color:'#8F9198',marginTop:4},calendarName:{fontSize:12,fontWeight:'800',marginTop:6},empty:{alignItems:'center',paddingTop:80,gap:8},emptyTitle:{fontSize:17,fontWeight:'800',color:'#555'},emptyText:{fontSize:13,color:'#999'}
});
