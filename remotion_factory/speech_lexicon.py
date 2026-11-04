"""Conservative spelling equivalences for recognized names and explicit numeric tokens.

Raw ASR text/timestamps are retained. No absent narration is filled from the script.
"""
import re
from .alignment import recognized_key as base_key
NUMBERS={'1':'واحد','4':'اربعه','6':'سته','10':'عشره','16':'ستعشر','30':'ثلاثين','49':'تسعه واربعين','72':'اثنين وسبعين','82':'اثنين وثمانين','512':'خمسمية واتناشر'}
NUMBERS.update({'2':'اتنين','3':'تلاتة','15':'خمستاشر','20':'عشرين','22':'اتنين وعشرين','1870':'ألف تمنمية وسبعين','1960':'ألف وتسعمية وستين','1968':'ألف وتسعمية تمانية وستين','2022':'ألفين واتنين وعشرين','2026':'ألفين وستة وعشرين','2030':'ألفين وتلاتين'})
NAMES={'hugging':'هاجينغ','face':'فيس','vllm':'في ال ال ام','cpp':'سي بي بي'}
ALIASES={'هاجينج':'هاجينغ','اتنين':'اثنين','اللاما':'لاما','واللاما':'ولاما'}
def recognized_key(text):
    raw=str(text).strip().translate(str.maketrans('٠١٢٣٤٥٦٧٨٩','0123456789'))
    if raw=='%':return base_key('بالمية')
    if raw=='.6':return base_key('وستة')
    match=re.fullmatch(r'([وفب]?)([0-9]+)[،,.؟!;:]?',raw)
    if match and match[2] in NUMBERS:return base_key(match[1]+NUMBERS[match[2]])
    name=re.sub(r'[^a-zA-Z\u0621-\u064a]','',raw).lower()
    prefix=''
    if len(name)>1 and name[0] in 'وف' and re.search('[a-z]',name):prefix,name=name[0],name[1:]
    if name in NAMES:return base_key(prefix+NAMES[name])
    if name in ALIASES:return base_key(ALIASES[name])
    return base_key(raw)

# Context-only spellings of the same source names. Never translate arbitrary words.
CONTEXT_NAMES={'openai':'أوبن إيه آي','pair':'بيير','pear':'بيير','pierre':'بيير','بيري':'بيير','بير':'بيير','computer':'كمبيوتر','codex':'كودكس','كوديكس':'كودكس','trees':'تريز','diffs':'ديفز','divs':'ديفز','دفز':'ديفز','pando':'باندو','highlights':'هايلايتس','code':'كود','storage':'ستوريدج','ستوريج':'ستوريدج','سترج':'ستوريدج','جات':'جيت'}
def for_story(story):
 expected=''.join(recognized_key(w) for scene in story['scenes'] for w in scene['narration'].split())
 aliases={name:value for name,value in CONTEXT_NAMES.items() if recognized_key(value) in expected}
 def key(text):
  name=re.sub(r'[^a-zA-Z\u0621-\u064a]','',str(text)).lower();prefix=''
  if len(name)>1 and name[0] in 'وف' and re.search('[a-z]',name):prefix,name=name[0],name[1:]
  return recognized_key(prefix+aliases[name]) if name in aliases else recognized_key(text)
 key.aliases=aliases
 return key
