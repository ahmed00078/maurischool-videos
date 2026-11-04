# tour-2026 — texte de la voix (FR / AR)

« MauriSchool en 10 points », la présentation envoyée aux écoles. Seize scènes, une prise par scène :
l'ouverture, trois actes (une carte qui l'annonce, puis ses chapitres : votre argent, vos classes,
vos familles), le tableau de bord où tout arrive, « Et aussi… » et la clôture.

## Comment enregistrer

- Une prise par scène, dans l'ordre, nommées `1` à `16` (ou les noms ElevenLabs dans l'ordre d'enregistrement).
- Ton posé, clair, souriant : on parle à un directeur d'école, on ne lit pas une publicité.
- Marquer une courte pause après le numéro (« Un. », « Deux. ») : le titre du chapitre s'affiche à ce moment.
- Les trois cartes d'acte (prises 2, 6 et 11) sont une seule phrase courte : la carte reste trois secondes et demie à l'écran.
- Même voix pour les seize scènes d'une langue.
- Déposer les fichiers dans `out/audios/tour-2026/fr` et `out/audios/tour-2026/ar`, puis :

```bash
node scripts/fit-voice.mjs tour-2026 fr out/audios/tour-2026/fr --report
```

Le texte est le même que dans `src/videos/tour-2026/copy.ts` (champ `voice`). Si une phrase change ici, la changer là aussi.

L'arabe est en arabe standard. À faire relire, ou réécrire en hassaniya si vous préférez ce registre pour les écoles.

## Français

| # | Scène | Texte |
|---|---|---|
| 1 | Ouverture | Dix heures vingt-quatre : un père paie au guichet. Dix heures vingt-quatre : son téléphone sonne, et le reçu est déjà là. Voici MauriSchool, en dix points. |
| 2 | Acte 1 · Votre argent | Commençons par votre argent. |
| 3 | 1 · Frais et reçus | Un. Les frais de scolarité. Le comptable enregistre le paiement au guichet. Le parent est prévenu sur son téléphone, et le reçu est déjà dans son application. Plus de reçu perdu, plus de litige. |
| 4 | 2 · Finances | Deux. Les finances. Ce qui est encaissé, ce qui est dépensé, le résultat du mois. Le taux de recouvrement, et qui est en retard. Vous n’attendez plus la fin du mois pour savoir. |
| 5 | 3 · Paie | Trois. La paie des enseignants. Les heures viennent de leur présence. L’application prépare les fiches de paie ; vous vérifiez, vous validez. Une paie juste, que chacun peut vérifier. |
| 6 | Acte 2 · Vos classes | Ensuite, vos classes. |
| 7 | 4 · Présence | Quatre. La présence. L’enseignant marque toute la classe en un geste, puis l’élève absent. Le parent le sait le matin même. Et sans réseau, l’appel reste sur le téléphone et part dès que la connexion revient. |
| 8 | 5 · Notes | Cinq. Les notes. L’enseignant saisit le devoir de toute la classe et le publie. Chaque parent reçoit la note de son enfant. Personne n’attend plus la fin du trimestre pour savoir. |
| 9 | 6 · Bulletins | Six. Les bulletins. Les moyennes et les rangs se calculent tout seuls. Vous clôturez le trimestre, et chaque bulletin est prêt : à vos couleurs, avec votre cachet, et dans le téléphone des parents. |
| 10 | 7 · Emploi du temps | Sept. L’emploi du temps. La semaine de chaque classe, de chaque enseignant, de chaque salle. Et si un enseignant est déjà pris sur un créneau, l’application le bloque avant l’erreur. |
| 11 | Acte 3 · Vos familles | Enfin, vos familles. |
| 12 | 8 · Annonces | Huit. Les annonces. Vous écrivez une fois, pour une classe ou pour toute l’école. Chaque famille reçoit le message sur son téléphone. Il ne se perd plus dans un groupe. |
| 13 | 9 · Application des parents | Neuf. L’application des parents. La présence, les notes, les frais et les reçus de leur enfant, au même endroit. Des familles informées, ce sont des familles qui vous font confiance. |
| 14 | 10 · Tableau de bord | Dix. Le tableau de bord du directeur. Tout ce que vous venez de voir arrive ici. Dès le matin, ce qui demande votre attention apparaît en premier : les paiements en retard, les fiches de paie à valider. Juste en dessous, les chiffres de l’école, à jour. |
| 15 | Et aussi… | Et aussi : l’import de vos listes depuis Excel, le français et l’arabe, un espace pour chaque rôle, le travail sans connexion, le téléphone et l’ordinateur, et chaque correction tracée. |
| 16 | Clôture | Et vous n’êtes pas seuls : nous importons vos données, nous formons vos équipes, et nous restons à vos côtés. Demandez une démonstration dans votre école. |

## العربية

| # | المشهد | النص |
|---|---|---|
| 1 | الافتتاح | العاشرة وأربع وعشرون دقيقة: أبٌ يدفع الرسوم في الشبّاك. العاشرة وأربع وعشرون دقيقة: يرنّ هاتفه، والإيصال بين يديه. هذا هو MauriSchool في عشر نقاط. |
| 2 | الباب 1 · ماليتكم | نبدأ بماليتكم. |
| 3 | 1 · الرسوم والإيصالات | أولًا. الرسوم الدراسية. يسجّل المحاسب الدفعة في الشبّاك، فيُبلَّغ وليّ الأمر على هاتفه، والإيصال موجود في تطبيقه. لا إيصال ضائع ولا خلاف. |
| 4 | 2 · المالية | ثانيًا. المالية. ما حُصِّل وما صُرف وصافي الشهر، ونسبة التحصيل ومن تأخّر في الدفع. لم تعودوا تنتظرون نهاية الشهر لتعرفوا. |
| 5 | 3 · الرواتب | ثالثًا. رواتب المعلمين. تأتي الساعات من حضورهم، ويُعدّ التطبيق كشوف الرواتب، فتراجعونها وتعتمدونها. رواتب عادلة يتحقق منها الجميع. |
| 6 | الباب 2 · أقسامكم | ثم أقسامكم. |
| 7 | 4 · الحضور | رابعًا. الحضور. يسجّل المعلم القسم كله بلمسة ثم يحدّد الغائب، فيعلم وليّ الأمر في الصباح نفسه. وإن انقطعت الشبكة يبقى التسجيل على الهاتف ويُرسَل عند عودتها. |
| 8 | 5 · الدرجات | خامسًا. الدرجات. يُدخل المعلم درجات القسم كله وينشرها، فيستلم كل وليّ أمر درجة ابنه. لا أحد ينتظر نهاية الفصل ليعرف. |
| 9 | 6 · كشوف الدرجات | سادسًا. كشوف الدرجات. تُحسب المعدلات والترتيب تلقائيًا. تُقفلون الفصل فيكون كل كشف جاهزًا: بألوان مدرستكم وختمها، وفي هواتف الأولياء. |
| 10 | 7 · جدول الحصص | سابعًا. جدول الحصص. أسبوع كل قسم وكل معلم وكل قاعة. وإذا كان المعلم مشغولًا في فترة ما، يمنع التطبيق الخطأ قبل وقوعه. |
| 11 | الباب 3 · أسر تلاميذكم | وأخيرًا، أسر تلاميذكم. |
| 12 | 8 · الإعلانات | ثامنًا. الإعلانات. تكتبون مرة واحدة، لقسم أو للمدرسة كلها، فتستلم كل أسرة الرسالة على هاتفها. لن تضيع بعد اليوم في مجموعة. |
| 13 | 9 · تطبيق الأولياء | تاسعًا. تطبيق الأولياء. حضور الابن ودرجاته ورسومه وإيصالاته في مكان واحد. والأسر المطّلعة أسر تثق بكم. |
| 14 | 10 · لوحة المدير | عاشرًا. لوحة المدير. كل ما رأيتموه يصل إلى هنا. منذ الصباح يظهر ما يحتاج انتباهكم أولًا: المدفوعات المتأخرة وكشوف الرواتب التي تنتظر الاعتماد. وتحتها أرقام المدرسة محدَّثة. |
| 15 | وأيضًا… | وأيضًا: استيراد قوائمكم من Excel، العربية والفرنسية، فضاء لكل دور، العمل دون اتصال، الهاتف والحاسوب، وكل تصحيح مسجَّل. |
| 16 | الخاتمة | ولستم وحدكم: نستورد بياناتكم، ونكوّن فرقكم، ونبقى إلى جانبكم. اطلبوا عرضًا توضيحيًا في مدرستكم. |

## Repères pour caler l'image sur la voix

Facultatif. Dans `src/videos/tour-2026/voice-cues.<lang>.json`, chaque chapitre accepte les marques `s1`, `s2`, `s3` (le moment où commence chaque étape listée à l'écran) et `benefit` (la phrase de conclusion). L'ouverture accepte `ring` (« son téléphone sonne » : la notification tombe), `receipt` (« le reçu est déjà là ») et `title` (« en dix points »), la clôture `offer` (« Demandez une démonstration »). Sans marques, les étapes gardent leur rythme de base et la scène s'allonge simplement pour laisser finir la phrase.
