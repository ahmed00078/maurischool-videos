import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from './fx';
import { Bi, Lang, LangProvider } from './lang';
import { ChatList, ChatListItem, ChatMessage, ChatSender, ChatThread, threadLayout } from './ui/chat';
import { Device } from './ui/Device';

/** The generic chat app on its own, list and thread side by side, to check it in both directions. */
const who = (name: Bi, color: string, glyph: string, lang: Lang): ChatSender => ({ name: name[lang], color, avatar: { color, glyph } });

export const KitChat: React.FC<{ lang: Lang }> = ({ lang }) => {
  const a = who({ fr: 'Maman de Mariem', ar: 'أم مريم' }, '#d4507a', 'M', lang);
  const b = who({ fr: 'Papa d’Ahmedou', ar: 'أبو أحمدو' }, '#2f7fd1', 'A', lang);
  const c = who({ fr: 'Directeur', ar: 'المدير' }, '#8a5cd0', 'D', lang);
  const items: ChatListItem[] = [
    { name: lang === 'fr' ? 'Parents 5e A 🎒' : 'أولياء الخامسة أ 🎒', avatar: { color: '#f2a23a', glyph: '🎒' }, preview: `${a.name} : Amine 🤲`, time: '21:47', unread: 312 },
    { name: lang === 'fr' ? 'Famille' : 'العائلة', avatar: { color: '#3aa17e', glyph: '🏠' }, preview: 'On arrive vers 20h', time: '20:12', unread: 2 },
    { name: 'Moussa', avatar: { color: '#6b7fd7', glyph: 'M' }, preview: 'Ok merci', time: '18:30', mine: true },
  ];
  const messages: ChatMessage[] = [
    { kind: 'unread', label: lang === 'fr' ? '312 messages non lus' : '312 رسالة غير مقروءة' },
    { kind: 'image', from: a, art: 'flowers', caption: lang === 'fr' ? 'Bonjour à tous 🌸' : 'صباح الخير للجميع 🌸', time: '07:02' },
    { kind: 'voice', from: b, duration: '0:47', time: '07:15' },
    { kind: 'text', from: b, text: 'Amine 🤲', time: '07:16' },
    { kind: 'text', from: a, text: lang === 'fr' ? 'Le savoir est une lumière. Partagez !' : 'العلم نور. انشروا!', time: '12:40', forwarded: true },
    { kind: 'day', label: lang === 'fr' ? 'Mardi' : 'الثلاثاء' },
    {
      kind: 'text',
      from: c,
      text: lang === 'fr' ? 'Composition de maths jeudi.\nRévisez le chapitre 3. Apportez une calculatrice.' : 'امتحان الرياضيات يوم الخميس.\nراجعوا الفصل الثالث. أحضروا آلة حاسبة.',
      lines: 3,
      time: '18:04',
    },
    { kind: 'sticker', from: a, time: '18:06' },
    { kind: 'text', from: b, text: 'Merci 🙏', time: '18:07', mine: true },
  ];
  const layout = threadLayout(messages);
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill>
        <Backdrop mood="paper" />
        <div style={{ position: 'absolute', left: 10, top: 300, scale: '0.82', transformOrigin: '0 0' }}>
          <Device time="21:47">
            <ChatList items={items} emphasis={[1]} />
          </Device>
        </div>
        <div style={{ position: 'absolute', left: 540, top: 300, scale: '0.82', transformOrigin: '0 0' }}>
          <Device time="21:47" statusTone="light">
            <ChatThread
              name={items[0].name}
              subtitle={lang === 'fr' ? 'Maman de Mariem, Papa d’Ahmedou, Directeur…' : 'أم مريم، أبو أحمدو، المدير…'}
              avatar={items[0].avatar}
              messages={messages}
              scroll={Math.max(0, layout.total - layout.viewport)}
              scrolling={1}
              highlight={{ index: 6, amount: 1 }}
            />
          </Device>
        </div>
      </AbsoluteFill>
    </LangProvider>
  );
};
