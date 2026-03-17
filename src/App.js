import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://wtvlwxhpehhemghphzdc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dmx3eGhwZWhoZW1naHBoemRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg0NzUsImV4cCI6MjA4OTI5NDQ3NX0.l0BpVaHezL_P5nn6O-3-rTUbisM-Nk_M9Xd_zitVzWE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate class options
const generateClasses = () => {
  const classes = [];
  for (let i = 1; i <= 12; i++) {
    for (let letter of ['A', 'B', 'C', 'D', 'E']) {
      classes.push(i + letter);
    }
  }
  return classes;
};

const CLASSES = generateClasses();

// Event categories
const EVENTS = {
  primaryIndividual: [
    { id: 'G1M', name: '小一 男', minGrade: 1, maxGrade: 1, gender: 'M', minParticipants: 1, maxParticipants: 1 },
    { id: 'G1F', name: '小一 女', minGrade: 1, maxGrade: 1, gender: 'F', minParticipants: 1, maxParticipants: 1 },
    { id: 'G2M', name: '小二 男', minGrade: 2, maxGrade: 2, gender: 'M', minParticipants: 1, maxParticipants: 1 },
    { id: 'G2F', name: '小二 女', minGrade: 2, maxGrade: 2, gender: 'F', minParticipants: 1, maxParticipants: 1 },
    { id: 'G3M', name: '小三 男', minGrade: 3, maxGrade: 3, gender: 'M', minParticipants: 1, maxParticipants: 1 },
    { id: 'G3F', name: '小三 女', minGrade: 3, maxGrade: 3, gender: 'F', minParticipants: 1, maxParticipants: 1 },
    { id: 'G4M', name: '小四 男', minGrade: 4, maxGrade: 4, gender: 'M', minParticipants: 1, maxParticipants: 1 },
    { id: 'G4F', name: '小四 女', minGrade: 4, maxGrade: 4, gender: 'F', minParticipants: 1, maxParticipants: 1 },
    { id: 'G5M', name: '小五 男', minGrade: 5, maxGrade: 5, gender: 'M', minParticipants: 1, maxParticipants: 1 },
    { id: 'G5F', name: '小五 女', minGrade: 5, maxGrade: 5, gender: 'F', minParticipants: 1, maxParticipants: 1 },
    { id: 'G6M', name: '小六 男', minGrade: 6, maxGrade: 6, gender: 'M', minParticipants: 1, maxParticipants: 1 },
    { id: 'G6F', name: '小六 女', minGrade: 6, maxGrade: 6, gender: 'F', minParticipants: 1, maxParticipants: 1 },
  ],
  parentChild: [
    { id: 'PC12', name: '親子 G1+G2組', minGrade: 1, maxGrade: 2, minParticipants: 1, maxParticipants: 1 },
    { id: 'PC34', name: '親子 G3+G4組', minGrade: 3, maxGrade: 4, minParticipants: 1, maxParticipants: 1 },
    { id: 'PC56', name: '親子 G5+G6組', minGrade: 5, maxGrade: 6, minParticipants: 1, maxParticipants: 1 },
  ],
  teacherStudent: [
    { id: 'TS13', name: '師生 G1-G3組', minGrade: 1, maxGrade: 3, minParticipants: 2, maxParticipants: 4, requireTeacher: true },
    { id: 'TS46', name: '師生 G4-G6組', minGrade: 4, maxGrade: 6, minParticipants: 2, maxParticipants: 4, requireTeacher: true },
  ],
  secondaryIndividual: [
    { id: 'SECOPEN', name: '中學公開組', minGrade: 7, maxGrade: 12, minParticipants: 1, maxParticipants: 1 },
  ],
  secondaryTeam: [
    { id: 'SEC3', name: '中學三人組', minGrade: 7, maxGrade: 12, minParticipants: 3, maxParticipants: 3 },
  ],
  interChamber: [
    { id: 'IC', name: 'Inter Chamber', minGrade: 1, maxGrade: 12, minParticipants: 3, maxParticipants: 4, sameChamber: true },
  ],
};

const CHAMBERS = { PS: ['Kindness', 'Faith', 'Wisdom', 'Courtesy', 'Justice'], SS: ['Aristotle', 'Beethoven', 'Columbus', 'Da Vinci', 'Einstein'] };
const getGradeNum = (c) => parseInt(c?.charAt(0)) || 0;
const getSection = (c) => getGradeNum(c) <= 6 ? 'PS' : 'SS';
const getChambers = (c) => getGradeNum(c) <= 6 ? CHAMBERS.PS : CHAMBERS.SS;

function App() {
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [currentPage, setCurrentPage] = useState('students');
  const [collapsed, setCollapsed] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [pageSize] = useState(50);
  const [searchRFID, setSearchRFID] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [formData, setFormData] = useState({ rfidNo: '', studentId: '', className: '', classNumber: '', englishName: '', chineseName: '', gender: '', chamber: '' });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchClass, setSearchClass] = useState('');
  const [searchStudentId, setSearchStudentId] = useState('');

  // Load data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: studentsData } = await supabase.from('students').select('*');
        if (studentsData) setStudents(studentsData);
        
        const { data: regData } = await supabase.from('registrations').select('*');
        if (regData) setRegistrations(regData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save to Supabase when students change
  useEffect(() => {
    if (!loading && students.length > 0) {
      // Sync with Supabase - we'll handle individual inserts/deletes
    }
  }, [students, loading]);

  const totalCount = students.length;
  const maleCount = students.filter(s => s.gender === 'M').length;
  const femaleCount = students.filter(s => s.gender === 'F').length;
  const displayedStudents = students.slice(0, pageSize);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleClassChange = (e) => setFormData(prev => ({ ...prev, className: e.target.value, chamber: '' }));
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    const newStudent = { id: Date.now(), ...formData };
    // Add to local state first (works even without database)
    setStudents(prev => [...prev, newStudent]);
    // Try to save to Supabase
    try {
      await supabase.from('students').insert([newStudent]);
    } catch (err) {
      console.log('Supabase not available, saved locally');
    }
    setFormData({ rfidNo: '', studentId: '', className: '', classNumber: '', englishName: '', chineseName: '', gender: '', chamber: '' }); 
  };
  const handleDelete = async (id) => { 
    if (window.confirm('確定刪除？')) {
      await supabase.from('students').delete().eq('id', id);
      setStudents(students.filter(s => s.id !== id)); 
    }
  };
  const handleEdit = (student) => setEditingStudent({...student});
  const handleUpdate = async (e) => { 
    e.preventDefault(); 
    await supabase.from('students').update(editingStudent).eq('id', editingStudent.id);
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s)); 
    setEditingStudent(null); 
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (type === 'csv') {
        const lines = evt.target.result.split('\n');
        const newStudents = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i]?.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts?.length >= 7) newStudents.push({ id: Date.now() + i, rfidNo: parts[0], studentId: parts[1], className: parts[2], classNumber: parts[3], englishName: parts[4], chineseName: parts[5], gender: parts[6], chamber: parts[7] });
        }
        const { data, error } = await supabase.from('students').insert(newStudents).select();
        if (!error && data) {
          setStudents([...students, ...data]);
        }
        alert(`成功上傳 ${newStudents.length} 位學生！`);
      } else {
        try {
          const data = JSON.parse(evt.target.result);
          if (Array.isArray(data)) { 
            const { data: inserted } = await supabase.from('students').insert(data).select();
            if (inserted) setStudents([...students, ...inserted]);
            alert(`成功匯入 ${data.length} 位學生！`); 
          }
        } catch { alert('JSON格式錯誤'); }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'students.json';
    a.click();
  };

  const searchByRFID = () => {
    const student = students.find(s => s.rfidNo === searchRFID);
    if (student) { setSearchResult(student); setRegistrationError(''); } 
    else { setSearchResult(null); setRegistrationError('搵唔到該RFID既學生資料'); }
  };

  const addTeamMember = () => {
    if (!searchResult) return;
    if (teamMembers.find(m => m.rfidNo === searchResult.rfidNo)) { setRegistrationError('學生已經加入'); return; }
    setTeamMembers([...teamMembers, searchResult]);
    setSearchResult(null);
    setSearchRFID('');
  };

  const removeTeamMember = (rfidNo) => setTeamMembers(teamMembers.filter(m => m.rfidNo !== rfidNo));

  const validateRegistration = () => {
    const event = [...EVENTS.primaryIndividual, ...EVENTS.parentChild, ...EVENTS.teacherStudent, ...EVENTS.secondaryIndividual, ...EVENTS.secondaryTeam, ...EVENTS.interChamber].find(e => e.id === selectedEvent);
    if (!event) return '請選擇比賽項目';
    const participantCount = event.requireTeacher ? teamMembers.length + 1 : teamMembers.length;
    if (participantCount < event.minParticipants) return `需要至少 ${event.minParticipants} 位參加者`;
    if (participantCount > event.maxParticipants) return `最多 ${event.maxParticipants} 位參加者`;
    if (event.sameChamber) {
      const chambers = teamMembers.map(m => m.chamber);
      if (!chambers.every(c => c === chambers[0])) return '所有隊員必須屬於同一個Chamber';
    }
    return '';
  };

  const submitRegistration = () => {
    const error = validateRegistration();
    if (error) { setRegistrationError(error); return; }
    const event = [...EVENTS.primaryIndividual, ...EVENTS.parentChild, ...EVENTS.teacherStudent, ...EVENTS.secondaryIndividual, ...EVENTS.secondaryTeam, ...EVENTS.interChamber].find(e => e.id === selectedEvent);
    setRegistrations([...registrations, { id: Date.now(), eventId: selectedEvent, eventName: event?.name, teacherName: teacherName || null, members: teamMembers, timestamp: new Date().toISOString() }]);
    setSelectedEvent(''); setTeamMembers([]); setTeacherName(''); setSearchRFID('');
    alert('報名成功！');
  };

  const styles = {
    container: { display: 'flex', gap: 20, maxWidth: 1600, margin: '0 auto', padding: 20, fontFamily: "'Microsoft JhengHei', Arial, sans-serif", background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', position: 'relative' },
    sidebar: { background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', transition: 'all 0.3s ease', overflow: 'hidden', position: 'fixed', top: 20, left: 20, zIndex: 100, height: 'calc(100vh - 40px)' },
    sidebarHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 20, borderBottom: '2px solid #f0f0f0' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1e3c72' },
    subtitle: { fontSize: 12, color: '#666' },
    menuItem: { padding: 15, marginBottom: 10, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, transition: 'all 0.3s' },
    main: { flex: 1, marginLeft: 90 },
    card: { background: 'white', borderRadius: 20, padding: 30, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: 20 },
    header: { textAlign: 'center', marginBottom: 20 },
    stats: { display: 'flex', gap: 10, marginBottom: 20 },
    statCard: { flex: 1, padding: 15, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 10, textAlign: 'center' },
    statNumber: { fontSize: 18, fontWeight: 'bold' },
    form: { marginBottom: 20 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 15 },
    formGroup: { display: 'flex', flexDirection: 'column' },
    input: { padding: 10, border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14 },
    required: { color: '#e74c3c' },
    hint: { fontSize: 11, color: '#666', marginTop: 3 },
    buttonGroup: { display: 'flex', gap: 10, marginTop: 15, flexWrap: 'wrap' },
    btnPrimary: { flex: 1, padding: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnSecondary: { flex: 1, padding: 12, background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnDanger: { flex: 1, padding: 12, background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' },
    emptyState: { padding: 40, textAlign: 'center', color: '#999' },
    pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTop: '1px solid #eee' },
    btnEdit: { padding: '4px 8px', fontSize: 11, background: '#3498db', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 2 },
    btnDelete: { padding: '4px 8px', fontSize: 11, background: '#e74c3c', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' },
    rightSidebar: { width: 200, background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', height: 'fit-content' },
    sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 15, color: '#333' },
    functionBox: { padding: 15, marginBottom: 15, borderRadius: 10, background: '#f8f9fa' },
    downloadLink: { display: 'block', padding: 10, background: '#27ae60', color: 'white', textDecoration: 'none', borderRadius: 8, textAlign: 'center', fontWeight: 600 },
    fileInput: { width: '100%', marginBottom: 10 },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: 30, borderRadius: 20, maxWidth: 500, width: '90%' },
    modalHeader: { marginBottom: 20, fontSize: 20 },
    modalButtons: { display: 'flex', gap: 10, marginTop: 20 },
    searchBox: { display: 'flex', gap: 10, marginBottom: 20 },
    searchInput: { flex: 1, padding: 12, border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14 },
    studentInfo: { background: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 20 },
    eventSelect: { padding: 12, border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 15 },
    teamList: { marginBottom: 15 },
    teamMember: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: '#f8f9fa', borderRadius: 8, marginBottom: 5 },
    error: { color: '#e74c3c', padding: 10, background: '#fee', borderRadius: 8, marginBottom: 15 },
    regSection: { marginBottom: 30 },
    regSectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 15, color: '#1e3c72', borderBottom: '2px solid #eee', paddingBottom: 10 }
  };

  const sidebarWidth = collapsed ? 60 : 200;

  return (
    <div style={styles.container}>
      {loading && <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: 20, borderRadius: 10, zIndex: 1000}}>Loading...</div>}
      <div style={{...styles.sidebar, width: sidebarWidth}} onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => setCollapsed(true)}>
        <div style={styles.sidebarHeader}><h1 style={{fontSize: collapsed ? 20 : 24}}>🏃</h1>{!collapsed && <div><div style={styles.title}>校園活力跑</div><div style={styles.subtitle}>Campus Run</div></div>}</div>
        <div style={{...styles.menuItem, ...(currentPage === 'students' ? {background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'} : {})}} onClick={() => setCurrentPage('students')}><span>👤</span>{!collapsed && <span>學生資料</span>}</div>
        <div style={{...styles.menuItem, ...(currentPage === 'registration' ? {background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'} : {})}} onClick={() => setCurrentPage('registration')}><span>📝</span>{!collapsed && <span>報名</span>}</div>
        <div style={styles.menuItem}><span>🏁</span>{!collapsed && <span>起點記錄</span>}</div>
        <div style={styles.menuItem}><span>🏅</span>{!collapsed && <span>終點記錄</span>}</div>
        <div style={styles.menuItem}><span>📊</span>{!collapsed && <span>成績總覽</span>}</div>
      </div>

      <div style={styles.main}>
        {currentPage === 'students' ? (
          <div style={styles.card}>
            <div style={styles.header}><h1>👤 學生資料</h1></div>
            <div style={styles.stats}><div style={styles.statCard}><div style={styles.statNumber}>{totalCount}</div><div>總學生數</div></div><div style={styles.statCard}><div style={styles.statNumber}>{maleCount}</div><div>男同學 (M)</div></div><div style={styles.statCard}><div style={styles.statNumber}>{femaleCount}</div><div>女同學 (F)</div></div></div>
            <button onClick={() => setShowAddModal(true)} style={styles.btnPrimary}>➕ 新增學生</button>
            <h3 style={{marginTop: 20}}>📋 學生列表</h3>
            <div style={styles.tableContainer}>{students.length === 0 ? <div style={styles.emptyState}>暫時未有學生資料</div> : <table style={styles.table}><thead><tr><th>RFID</th><th>Student ID</th><th>Class</th><th>No.</th><th>English Name</th><th>中文姓名</th><th>Gender</th><th>Chamber</th><th></th></tr></thead><tbody>{displayedStudents.map(s => <tr key={s.id}><td>{s.rfidNo}</td><td>{s.studentId}</td><td>{s.className}</td><td>{s.classNumber || ''}</td><td>{s.englishName}</td><td>{s.chineseName}</td><td style={{textAlign:'center'}}>{s.gender}</td><td>{s.chamber}</td><td style={{textAlign:'center'}}><button onClick={() => handleEdit(s)} style={styles.btnEdit}>✏️</button><button onClick={() => handleDelete(s.id)} style={styles.btnDelete}>🗑️</button></td></tr>)}</tbody></table>}</div>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={styles.header}><h1>📝 報名</h1></div>
            <button onClick={() => setShowSearchModal(true)} style={styles.btnPrimary}>🔍 搜尋學生</button>
            <div style={styles.regSection}>
              <div style={styles.regSectionTitle}>🏅 選擇比賽項目</div>
              <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} style={styles.eventSelect}><option value="">請選擇比賽項目</option><optgroup label="小學個人賽">{EVENTS.primaryIndividual.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup><optgroup label="親子組">{EVENTS.parentChild.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup><optgroup label="師生組">{EVENTS.teacherStudent.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup><optgroup label="中學">{EVENTS.secondaryIndividual.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}{EVENTS.secondaryTeam.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup><optgroup label="Inter Chamber">{EVENTS.interChamber.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup></select>
              {selectedEvent?.startsWith('TS') && <div style={styles.formGroup}><label>老師姓名 <span style={styles.required}>*</span></label><input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="輸入老師姓名" style={styles.input} /></div>}
            </div>
            <div style={styles.regSection}><div style={styles.regSectionTitle}>👥 參賽隊伍 ({teamMembers.length}人)</div>{teamMembers.length === 0 ? <div style={styles.emptyState}>未有隊員</div> : <div style={styles.teamList}>{teamMembers.map((m, idx) => <div key={m.rfidNo} style={styles.teamMember}><span>{idx + 1}. {m.englishName} ({m.className}) - {m.chamber}</span><button onClick={() => removeTeamMember(m.rfidNo)} style={styles.btnDelete}>移除</button></div>)}</div>}</div>
            <button onClick={submitRegistration} style={styles.btnPrimary}>✅ 確認報名</button>
            <div style={{marginTop: 30}}><h3 style={styles.regSectionTitle}>📋 已報名列表 ({registrations.length})</h3>{registrations.map(r => <div key={r.id} style={{...styles.studentInfo, marginBottom: 10}}><strong>{r.eventName}</strong>{r.teacherName && <span> - 老師: {r.teacherName}</span>}<div>{r.members.map(m => m.englishName).join(', ')}</div></div>)}</div>
          </div>
        )}
      </div>

      <div style={styles.rightSidebar}>
        <div style={styles.sectionTitle}>⚙️ 功能</div>
        <div style={styles.functionBox}><h4>📥 下載範本</h4><a href="https://files.catbox.moe/k72cos.csv" download="template.csv" style={styles.downloadLink}>Download CSV</a></div>
        <div style={styles.functionBox}><h4>📤 Upload CSV</h4><input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, 'csv')} style={styles.fileInput} /></div>
        <div style={styles.functionBox}><h4>🔄 匯入JSON</h4><input type="file" accept=".json" onChange={(e) => handleFileUpload(e, 'json')} style={styles.fileInput} /></div>
      </div>

      {editingStudent && <div style={styles.modal} onClick={() => setEditingStudent(null)}><div style={styles.modalContent} onClick={e => e.stopPropagation()}><h2 style={styles.modalHeader}>✏️ 編輯學生資料</h2><form onSubmit={handleUpdate} style={styles.form}><div style={styles.formGrid}><div style={styles.formGroup}><label>RFID No.</label><input value={editingStudent.rfidNo} onChange={(e) => setEditingStudent({...editingStudent, rfidNo: e.target.value})} style={styles.input} /></div><div style={styles.formGroup}><label>Student ID</label><input value={editingStudent.studentId} onChange={(e) => setEditingStudent({...editingStudent, studentId: e.target.value})} style={styles.input} /></div><div style={styles.formGroup}><label>Class</label><select value={editingStudent.className} onChange={(e) => setEditingStudent({...editingStudent, className: e.target.value, chamber: ''})} style={styles.input}>{CLASSES.map(c => <option key={c} value={c}>{c} ({getSection(c)})</option>)}</select></div><div style={styles.formGroup}><label>Gender</label><select value={editingStudent.gender} onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})} style={styles.input}><option value="M">M (男)</option><option value="F">F (女)</option></select></div><div style={styles.formGroup}><label>English Name</label><input value={editingStudent.englishName} onChange={(e) => setEditingStudent({...editingStudent, englishName: e.target.value})} style={styles.input} /></div><div style={styles.formGroup}><label>Chinese Name</label><input value={editingStudent.chineseName} onChange={(e) => setEditingStudent({...editingStudent, chineseName: e.target.value})} style={styles.input} /></div><div style={styles.formGroup}><label>Chamber</label><select value={editingStudent.chamber} onChange={(e) => setEditingStudent({...editingStudent, chamber: e.target.value})} style={styles.input}>{getChambers(editingStudent.className).map(c => <option key={c} value={c}>{c}</option>)}</select></div></div><div style={styles.modalButtons}><button type="submit" style={styles.btnPrimary}>💾 儲存</button><button type="button" onClick={() => setEditingStudent(null)} style={styles.btnSecondary}>✖ 取消</button></div></form></div></div>}

      {showAddModal && <div style={styles.modal} onClick={() => setShowAddModal(false)}><div style={styles.modalContent} onClick={e => e.stopPropagation()}><h2 style={styles.modalHeader}>➕ 新增學生</h2><form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); setShowAddModal(false); }} style={styles.form}><div style={styles.formGrid}><div style={styles.formGroup}><label>RFID No. <span style={styles.required}>*</span></label><input name="rfidNo" value={formData.rfidNo} onChange={handleInputChange} required placeholder="RFID001" style={styles.input} /></div><div style={styles.formGroup}><label>Student ID <span style={styles.required}>*</span></label><input name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="23000001" style={styles.input} /></div><div style={styles.formGroup}><label>Class <span style={styles.required}>*</span></label><select name="className" value={formData.className} onChange={handleClassChange} required style={styles.input}><option value="">請選擇</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div style={styles.formGroup}><label>Class No.</label><input name="classNumber" value={formData.classNumber} onChange={handleInputChange} placeholder="01" style={styles.input} /></div><div style={styles.formGroup}><label>Gender <span style={styles.required}>*</span></label><select name="gender" value={formData.gender} onChange={handleInputChange} required style={styles.input}><option value="">請選擇</option><option value="M">M (男)</option><option value="F">F (女)</option></select></div><div style={styles.formGroup}><label>English Name <span style={styles.required}>*</span></label><input name="englishName" value={formData.englishName} onChange={handleInputChange} required placeholder="Chan Tai Man" style={styles.input} /></div><div style={styles.formGroup}><label>Chinese Name <span style={styles.required}>*</span></label><input name="chineseName" value={formData.chineseName} onChange={handleInputChange} required placeholder="陳大文" style={styles.input} /></div><div style={styles.formGroup}><label>Chamber</label><select name="chamber" value={formData.chamber} onChange={handleInputChange} disabled={!formData.className} style={styles.input}><option value="">請先選擇Class</option>{getChambers(formData.className).map(c => <option key={c} value={c}>{c}</option>)}</select></div></div><div style={styles.modalButtons}><button type="submit" style={styles.btnPrimary}>💾 儲存</button><button type="button" onClick={() => setShowAddModal(false)} style={styles.btnSecondary}>✖ 取消</button></div></form></div></div>}

      {showSearchModal && <div style={styles.modal} onClick={() => setShowSearchModal(false)}><div style={styles.modalContent} onClick={e => e.stopPropagation()}><h2 style={styles.modalHeader}>🔍 搜尋學生</h2><div style={styles.form}><div style={styles.formGroup}><label>RFID No.</label><input value={searchRFID} onChange={(e) => setSearchRFID(e.target.value)} placeholder="RFID001" style={styles.input} /></div><div style={styles.formGroup}><label>Student ID</label><input value={searchStudentId} onChange={(e) => setSearchStudentId(e.target.value)} placeholder="23000001" style={styles.input} /></div><div style={styles.formGroup}><label>Class</label><select value={searchClass} onChange={(e) => setSearchClass(e.target.value)} style={styles.input}><option value="">全部</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div style={styles.modalButtons}><button type="button" onClick={() => { searchByRFID(); setShowSearchModal(false); }} style={styles.btnPrimary}>🔍 搜尋</button><button type="button" onClick={() => setShowSearchModal(false)} style={styles.btnSecondary}>✖ 取消</button></div></div>{searchResult && <div style={styles.studentInfo}><h4>👤 學生資料</h4><p><strong>RFID:</strong> {searchResult.rfidNo} | <strong>Student ID:</strong> {searchResult.studentId}</p><p><strong>Name:</strong> {searchResult.englishName} ({searchResult.chineseName})</p><p><strong>Class:</strong> {searchResult.className} | <strong>Chamber:</strong> {searchResult.chamber}</p><button onClick={() => { addTeamMember(); setShowSearchModal(false); }} style={{...styles.btnPrimary, marginTop: 10}}>➕ 加入隊伍</button></div>}</div></div>}
    </div>
  );
}

export default App;
