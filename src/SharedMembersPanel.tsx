import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createInviteCode, roleLabel } from './sharing';
import { CalendarItem, CalendarMember, MemberRole, loadMembers, saveMembers } from './storage';

const BRAND = '#5B4CF0';
const ROLE_OPTIONS: MemberRole[] = ['editor', 'viewer'];

const defaultMembers = (calendarId: string): CalendarMember[] => [
  { id: 'me', calendarId, name: '星火使用者', role: 'owner', avatarText: '火' },
];

export default function SharedMembersPanel({ calendar }: { calendar: CalendarItem }) {
  const [members, setMembers] = useState<CalendarMember[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('editor');
  const [inviteCode, setInviteCode] = useState(calendar.inviteCode || createInviteCode());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadMembers(defaultMembers(calendar.id)).then(all => {
      const own = all.filter(member => member.calendarId === calendar.id);
      setMembers(own.length ? own : defaultMembers(calendar.id));
      setReady(true);
    });
  }, [calendar.id]);

  useEffect(() => {
    if (!ready) return;
    loadMembers([]).then(all => {
      const others = all.filter(member => member.calendarId !== calendar.id);
      saveMembers([...others, ...members]).catch(() => undefined);
    });
  }, [members, ready, calendar.id]);

  const canManage = useMemo(() => members.some(member => member.id === 'me' && member.role === 'owner'), [members]);

  const addMember = () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert('請輸入成員名稱');
    setMembers(current => [...current, {
      id: `member-${Date.now()}`,
      calendarId: calendar.id,
      name: trimmed,
      role,
      avatarText: trimmed.slice(0, 1),
    }]);
    setName('');
  };

  const updateRole = (id: string, nextRole: MemberRole) => {
    setMembers(current => current.map(member => member.id === id ? { ...member, role: nextRole } : member));
  };

  const removeMember = (id: string) => {
    const target = members.find(member => member.id === id);
    if (!target || target.role === 'owner') return;
    Alert.alert('移除成員', `確定要移除「${target.name}」嗎？`, [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: () => setMembers(current => current.filter(member => member.id !== id)) },
    ]);
  };

  if (!calendar.shared) return null;

  return <View style={styles.wrapper}>
    <Text style={styles.sectionTitle}>共享與成員</Text>
    <View style={styles.inviteCard}>
      <View style={{flex:1}}>
        <Text style={styles.label}>邀請碼</Text>
        <Text style={styles.inviteCode}>{inviteCode}</Text>
        <Text style={styles.meta}>朋友輸入邀請碼後即可加入。雲端同步接上後會改成真正跨裝置加入。</Text>
      </View>
      <Pressable style={styles.refresh} onPress={() => setInviteCode(createInviteCode())}>
        <Ionicons name="refresh" size={20} color={BRAND}/>
      </Pressable>
    </View>

    <View style={styles.memberList}>
      {members.map(member => <View key={member.id} style={styles.memberRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{member.avatarText || member.name.slice(0, 1)}</Text></View>
        <View style={{flex:1}}>
          <Text style={styles.name}>{member.name}{member.id === 'me' ? '（你）' : ''}</Text>
          <Text style={styles.meta}>{roleLabel(member.role)}</Text>
        </View>
        {member.role !== 'owner' && canManage && <View style={styles.actions}>
          <Pressable style={styles.roleButton} onPress={() => updateRole(member.id, member.role === 'editor' ? 'viewer' : 'editor')}>
            <Text style={styles.roleButtonText}>{member.role === 'editor' ? '改僅查看' : '改可編輯'}</Text>
          </Pressable>
          <Pressable style={styles.remove} onPress={() => removeMember(member.id)}><Ionicons name="close" size={18} color="#D94B58"/></Pressable>
        </View>}
      </View>)}
    </View>

    {canManage && <View style={styles.addBox}>
      <TextInput value={name} onChangeText={setName} placeholder="成員名稱" style={styles.input}/>
      <View style={styles.roles}>{ROLE_OPTIONS.map(option => <Pressable key={option} onPress={() => setRole(option)} style={[styles.roleChip, role === option && styles.roleChipActive]}><Text style={[styles.roleChipText, role === option && styles.roleChipTextActive]}>{roleLabel(option)}</Text></Pressable>)}</View>
      <Pressable style={styles.addButton} onPress={addMember}><Ionicons name="person-add-outline" size={20} color="#fff"/><Text style={styles.addButtonText}>加入測試成員</Text></Pressable>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  wrapper:{gap:10,marginTop:4},sectionTitle:{fontSize:13,fontWeight:'800',color:'#8C8E95',marginTop:4},inviteCard:{padding:14,borderRadius:16,backgroundColor:'#F4F2FF',flexDirection:'row',alignItems:'center',gap:12},label:{fontSize:12,color:'#777',fontWeight:'700'},inviteCode:{fontSize:26,fontWeight:'900',letterSpacing:3,color:BRAND,marginVertical:4},meta:{fontSize:12,color:'#92949B',lineHeight:17},refresh:{width:42,height:42,borderRadius:14,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},memberList:{borderRadius:16,backgroundColor:'#fff',borderWidth:1,borderColor:'#ECECF0',overflow:'hidden'},memberRow:{minHeight:68,paddingHorizontal:12,paddingVertical:10,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:'#F1F1F3'},avatar:{width:40,height:40,borderRadius:20,backgroundColor:BRAND,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'800'},name:{fontSize:15,fontWeight:'800',color:'#28292E'},actions:{flexDirection:'row',alignItems:'center',gap:6},roleButton:{paddingHorizontal:9,paddingVertical:7,borderRadius:9,backgroundColor:'#F1EFFF'},roleButtonText:{fontSize:11,fontWeight:'800',color:BRAND},remove:{width:30,height:30,borderRadius:10,backgroundColor:'#FFF0F1',alignItems:'center',justifyContent:'center'},addBox:{padding:12,borderRadius:16,backgroundColor:'#fff',borderWidth:1,borderColor:'#ECECF0',gap:9},input:{height:44,borderRadius:12,backgroundColor:'#F7F7F9',paddingHorizontal:12,fontSize:15},roles:{flexDirection:'row',gap:8},roleChip:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,borderWidth:1,borderColor:'#E5E5E8'},roleChipActive:{backgroundColor:'#F1EFFF',borderColor:BRAND},roleChipText:{fontSize:12,fontWeight:'700',color:'#666'},roleChipTextActive:{color:BRAND},addButton:{height:44,borderRadius:12,backgroundColor:BRAND,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},addButtonText:{color:'#fff',fontWeight:'800'}
});
