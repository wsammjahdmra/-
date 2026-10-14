import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Phone,
  CheckCheck,
  Building,
  User,
  Paperclip,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  listingTitle: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  online: boolean;
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participantName: 'سعود بن عبدالملك العتيبي',
    participantRole: 'معلن معتمد (رخصة فال: 1100023451)',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    listingTitle: 'فيلا مودرن فاخرة مع مسبح ومصعد بحي الملقا',
    lastMessage: 'أهلاً بك أستاذ أحمد، يسعدني الترتيب لمعاينة الفيلا غداً بعد صلاة العصر.',
    lastTime: '10:45 ص',
    unreadCount: 1,
    online: true,
    messages: [
      { id: 'm1', sender: 'user', text: 'السلام عليكم، هل الفيلا ما زالت متاحة للمعاينة؟ وهل السعر قابل للتفاوض البسيط؟', timestamp: '10:30 ص' },
      { id: 'm2', sender: 'other', text: 'وعليكم السلام ورحمة الله وبركاته، نعم الفيلا متاحة والمالك متجاوب مع المشترين الجادين بدفعة أولى نقدية.', timestamp: '10:35 ص' },
      { id: 'm3', sender: 'other', text: 'أهلاً بك أستاذ أحمد، يسعدني الترتيب لمعاينة الفيلا غداً بعد صلاة العصر.', timestamp: '10:45 ص' },
    ],
  },
  {
    id: 'conv_2',
    participantName: 'مكتب مبيعات شركة آل سعيدان للعقارات',
    participantRole: 'مطور عقاري معتمد',
    participantAvatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=150',
    listingTitle: 'مشروع جوهرة السعيدان - فلل حطين',
    lastMessage: 'تم إرسال بروشور المشروع وجدول الدفعات على الخارطة عبر رسالتك.',
    lastTime: 'أمس',
    unreadCount: 0,
    online: false,
    messages: [
      { id: 'm21', sender: 'user', text: 'مرحباً، أود معرفة خطة الدفعات لمشروع جوهرة السعيدان بحي حطين؟', timestamp: 'أمس 02:15 م' },
      { id: 'm22', sender: 'other', text: 'أهلاً وسهلاً بك، خطة الدفعات تبدأ بـ 10% دفعة أولى ثم أقساط ربع سنوية مرتبطة بالإنجاز.', timestamp: 'أمس 02:20 م' },
      { id: 'm23', sender: 'other', text: 'تم إرسال بروشور المشروع وجدول الدفعات على الخارطة عبر رسالتك.', timestamp: 'أمس 02:25 م' },
    ],
  },
  {
    id: 'conv_3',
    participantName: 'طارق بن ناصر المطيري',
    participantRole: 'وسيط عقاري - شركة أركان',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    listingTitle: 'شقة سكنية مؤثثة بالكامل للإيجار بحي النرجس',
    lastMessage: 'العقد الإلكتروني إيجار سيكون جاهزاً للتوثيق فور اتفاقكم.',
    lastTime: 'منذ يومين',
    unreadCount: 0,
    online: true,
    messages: [
      { id: 'm31', sender: 'user', text: 'هل الشقة تشمل الفواتير والإنترنت؟', timestamp: 'منذ يومين' },
      { id: 'm32', sender: 'other', text: 'الشقة تشمل رسوم الخدمات المشتركة وصيانة المصعد، والعداد مستقل.', timestamp: 'منذ يومين' },
      { id: 'm33', sender: 'other', text: 'العقد الإلكتروني إيجار سيكون جاهزاً للتوثيق فور اتفاقكم.', timestamp: 'منذ يومين' },
    ],
  },
];

interface ChatsPageProps {
  onSelectListing?: (id: string) => void;
}

export const ChatsPage: React.FC<ChatsPageProps> = ({ onSelectListing }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv_1');
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: inputText,
            lastTime: 'الآن',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText('');

    // Simulated reply
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `m_rep_${Date.now()}`,
        sender: 'other',
        text: 'شكراً لتواصلك، تم استلام رسالتك وسيتم الرد عليك فوراً بالمعلومات المطلوبة.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              lastMessage: replyMsg.text,
              lastTime: 'الآن',
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName.includes(searchTerm) || c.listingTitle.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-right" dir="rtl">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[680px]">
        {/* Conversations Sidebar (Right in RTL) */}
        <div className="md:col-span-5 lg:col-span-4 border-l border-slate-200 flex flex-col bg-slate-50/50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>المحادثات العقارية</span>
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {conversations.length} نشطة
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في المحادثات أو العقارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Conversations List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConvId(c.id);
                  // clear unread
                  setConversations((prev) =>
                    prev.map((item) => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                  );
                }}
                className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                  activeConvId === c.id ? 'bg-emerald-50/80 border-r-4 border-emerald-600' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={c.participantAvatar}
                    alt={c.participantName}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                  />
                  {c.online && (
                    <span className="absolute bottom-0 left-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{c.participantName}</span>
                    <span className="text-[10px] text-slate-400">{c.lastTime}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold truncate mb-1">
                    {c.listingTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{c.lastMessage}</p>
                </div>

                {c.unreadCount > 0 && (
                  <span className="shrink-0 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area (Left in RTL) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between bg-white">
          {/* Active Chat Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.participantAvatar}
                alt={activeConv.participantName}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{activeConv.participantName}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>موثق بالمنصة</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">{activeConv.participantRole}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 block">العقار قيد النقاش</span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{activeConv.listingTitle}</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
            <div className="text-center my-2">
              <span className="bg-slate-200/60 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full">
                محادثة آمنة ومحمية بأنظمة الهيئة العامة للعقار
              </span>
            </div>

            {activeConv.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="إرفاق ملف أو عقد"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب استفسارك أو طلبك هنا..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4 -scale-x-100" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
