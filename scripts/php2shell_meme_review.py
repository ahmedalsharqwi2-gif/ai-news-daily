"""Fresh verified PHP2Shell news-meme short; standalone, no Buffer publishing."""
import math,os,subprocess,wave
from pathlib import Path
import numpy as np,cv2
from PIL import Image,ImageDraw,ImageFont
from voice_provider.client import generate
O=Path('output/php2shell_meme');O.mkdir(parents=True,exist_ok=True)
lines=[
'تخيّل تصحى تلاقي سيرفرات PHP بتقول لك: أنا محتاجة إجازة أمنية! بس المرّة دي الموضوع مش ميم وبس.',
'يوم واحد وعشرين أكتوبر، اتكشف عن PHP2Shell: ثغرتين خطيرتين في قلب لغة PHP، مش بس في ووردبريس أو إضافة معينة.',
'الباحثين في كاليف وويز استخدموا نماذج ذكاء اصطناعي زي جي بي تي خمسة فاصلة ستة سول، وجيمناي أربعة أرجون، علشان يكتشفوا ويحللوا المشكلة.',
'الثغرات ممكن تسمح بتسريب بيانات من ذاكرة السيرفر، وفي ظروف معينة بتشغيل كود عن بعد من غير تسجيل دخول. مستوى الخطورة عالي جدًا.',
'بيقولوا سبعين في المية من الويب؟ استنى! ده تقدير المواقع اللي بتستخدم PHP، مش نسبة المواقع اللي اتهكرت فعلا.',
'الخبر الكويس إن فريق PHP نشر تصحيحات، وشركات حماية زي كلاودفلير فعّلت إجراءات دفاعية. يعني ده مش وقت الذعر، ده وقت التحديث.',
'لو عندك موقع، راجع إصدار PHP مع الاستضافة، وطبّق التحديث الأمني الرسمي، وخد نسخة احتياطية قبل أي تغيير.',
'الخلاصة؟ الذكاء الاصطناعي ساعد يكتشف الخطر، لكنه كمان خلى سباق الحماية أسرع. موقعك مش محتاج ميم، محتاج باتش!'
]
speech=' '.join(lines)
(O/'script.txt').write_text(speech,encoding='utf-8')
audio=generate(speech,str(O/'narration.wav'))
with wave.open(str(audio)) as wa:duration=wa.getnframes()/wa.getframerate()
if not 55 <= duration <= 170:raise RuntimeError(f'Unexpected speech duration: {duration:.2f}')
W,H,FPS=540,960,20
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
F1=ImageFont.truetype(font,50);F2=ImageFont.truetype(font,29);F3=ImageFont.truetype(font,22)
heads=['PHP SERVER','PHP2SHELL','AI FOUND IT','CRITICAL','70% ?!','PATCH NOW','CHECK YOUR SITE','AI × CYBER']
arab=['السيرفر خد أجازة؟!','ثغرتين في قلب PHP','ذكاء اصطناعي ضد الثغرات','تسريب بيانات وتنفيذ كود','مش ٧٠٪ مواقع مخترقة!','التصحيح الأمني متاح','راجع إصدار PHP','التحديث أهم من الميم']
sub=['لما الموقع يقول: مش قادر!','اكتشاف ٢١ أكتوبر ٢٠٢٦','Calif + Wiz + AI','خطورة عالية جدًا','الانتشار مش معناه اختراق','Cloudflare + PHP Security','نسخة احتياطية ← تحديث','AI على السريع']
rng=np.random.default_rng(25);dots=rng.random((90,2))
pr=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-crf','23','-preset','veryfast','-pix_fmt','yuv420p',str(O/'mute.mp4')],stdin=subprocess.PIPE)
n=math.ceil(duration*FPS)
for k in range(n):
 t=k/FPS;sec=min(7,int(t/duration*8));u=(t/duration*8)%1
 fr=np.zeros((H,W,3),np.uint8);fr[:]=(18,13,8)
 # movement and bright neon tracks; depth by perspective grid
 for y in range(-100,H,66):
  yp=int((y+t*30)%H);cv2.line(fr,(0,yp),(W,yp),(32,46,35),1,cv2.LINE_AA)
 for x in range(-300,850,85):
  a=int((x+t*8)%W);cv2.line(fr,(a,0),(int(W/2+(a-W/2)*1.7),H),(35,48,34),1,cv2.LINE_AA)
 for idx,(xx,yy) in enumerate(dots):
  cx=int((xx*W+math.sin(t*.2+idx)*20)%W);cy=int((yy*H+t*(2+idx%4))%H)
  cv2.circle(fr,(cx,cy),1,(150,155,75),-1)
 # reactive radar concentric server / security imagery
 X,Y=W//2,397
 pulse=10*math.sin(t*2)
 for ring in range(4):
  r=int(120+ring*42+pulse)
  cv2.ellipse(fr,(X,Y),(r,int(r*.67)),int(10*math.sin(t*.6)),0,360,(90+ring*12,166,87),2,cv2.LINE_AA)
 # moving racks / core server and pulsing warning beacon
 for row in range(4):
  yy=Y-115+row*62
  cv2.rectangle(fr,(X-112,yy),(X+112,yy+45),(44,61,65),-1)
  cv2.rectangle(fr,(X-112,yy),(X+112,yy+45),(155,176,142),2)
  cv2.circle(fr,(X-78,yy+22),7,(90,240 if math.sin(t*5+row)>0 else 80,190),-1)
  cv2.line(fr,(X-45,yy+22),(X+72,yy+22),(90,119,108),3,cv2.LINE_AA)
 # screen shock, camera shake and warning on headlines
 shake=round(7*math.exp(-u*9)*math.sin(u*67))
 text=Image.fromarray(cv2.cvtColor(fr,cv2.COLOR_BGR2RGB))
 d=ImageDraw.Draw(text,'RGBA')
 d.rounded_rectangle((24,29,516,195),radius=24,fill=(3,15,25,221),outline=(93,244,220,210),width=3)
 d.text((W//2+shake,52),heads[sec],font=F1,anchor='mt',fill=(255,222,154,255),stroke_width=1)
 d.text((W//2+shake,129),arab[sec],font=F2,anchor='mt',direction='rtl',fill=(241,247,255,255))
 d.rounded_rectangle((26,664,514,855),radius=25,fill=(2,13,23,232),outline=(92,221,227,180),width=2)
 d.text((W//2,705),sub[sec],font=F2,anchor='mt',direction='rtl',fill=(243,244,242,255))
 d.text((W//2,795),'PHP2SHELL   |   21.10.2026',font=F3,anchor='mt',fill=(129,238,226,255))
 d.rounded_rectangle((24,877,516,933),radius=17,fill=(5,35,51,235))
 d.rectangle((35,915,35+int(470*t/duration),924),fill=(90,245,223,255))
 d.text((W//2,883),'AI NEWS  •  VERIFIED',font=F3,anchor='mt',fill=(251,251,251,255))
 fr=cv2.cvtColor(np.asarray(text),cv2.COLOR_RGB2BGR)
 pr.stdin.write(fr.tobytes())
pr.stdin.close()
if pr.wait()!=0:raise RuntimeError('Failed to render visual')
# original sound bed + meme glitches, intentional below voice
sr=24000;N=math.ceil(duration*sr);tt=np.arange(N)/sr
bed=(.009*np.sin(2*np.pi*82*tt)+.006*np.sin(2*np.pi*123.47*tt))*(.5+.5*np.sin(tt*.3)**2)
fx=np.zeros(N,np.float32)
for k in range(8):
 a=k*duration/8;d=tt-a;m=(d>=0)&(d<.5)
 dx=d[m];fx[m]+=(.11*np.sin(2*np.pi*(220*dx+840*dx*dx))*np.exp(-13*dx)).astype('float32')
mix=np.clip(bed+fx,-.8,.8)
with wave.open(str(O/'bed_fx.wav'),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((mix*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i',str(O/'mute.mp4'),'-i',str(audio),'-i',str(O/'bed_fx.wav'),'-filter_complex','[1:a]volume=1.0[a];[2:a]volume=0.50[b];[a][b]amix=inputs=2:duration=first:normalize=0[out]','-map','0:v','-map','[out]','-c:v','copy','-c:a','aac','-b:a','160k','-shortest',str(O/'php2shell-memes-full.mp4')],check=True)
from visual_quality_gate import audit
# this technical gate expects 1080x1920, upscale finalized video before gate
subprocess.run(['ffmpeg','-y','-v','error','-i',str(O/'php2shell-memes-full.mp4'),'-vf','scale=1080:1920','-c:v','libx264','-preset','veryfast','-crf','20','-c:a','copy',str(O/'php2shell-final-1080x1920.mp4')],check=True)
audit(O/'php2shell-final-1080x1920.mp4',O/'visual_quality.json')
print('NEW_MEME_VIDEO',duration,flush=True)
