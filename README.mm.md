# Habit Manager

**ဘာသာစကား:** မြန်မာ | [English version](README.md)

ဤ workspace တွင် React/Vite frontend နှင့် Spring Boot API ကို သီးခြား folder များအဖြစ် ထည့်ထားသည်။

**Credential များကို ချက်ချင်းပြောင်းပါ။** ပေးထားသော backend archive ထဲတွင် database၊ mail နှင့် JWT credential များ ပါရှိခဲ့သည်။ Application source ထဲမှ ဖယ်ရှားပြီးဖြစ်သော်လည်း ပေါက်ကြားပြီးသား credential များကို code ပြောင်းရုံဖြင့် ပယ်ဖျက်မရပါ။ Deploy မလုပ်မီ credential အသစ်များဖြင့် အစားထိုးပါ။

## လိုအပ်ချက်များ

- Java 25၊ Maven wrapper ပါဝင်ပြီးဖြစ်သောကြောင့် Maven သီးခြား install လုပ်ရန်မလိုပါ
- Node.js 20.19+ သို့မဟုတ် 22.12+၊ npm
- MySQL 8

## Local မှာ စတင်အသုံးပြုရန်

အောက်ပါအဆင့်တွေကို အစဉ်လိုက်လုပ်ပါ။ Windows အသုံးပြုသူအတွက် command အားလုံးကို PowerShell မှာ ရိုက်နိုင်သည်။

### အဆင့် ၁ — MySQL ကိုဖွင့်ပြီး database ပြုလုပ်ပါ

MySQL Server 8 ကို install လုပ်ပြီး အလုပ်လုပ်နေကြောင်း စစ်ပါ။ MySQL Workbench ကိုဖွင့်ကာ server သို့ချိတ်ဆက်ပြီး Query tab အသစ်ဖွင့်ပါ။ အောက်က SQL ကို ကူးထည့်ပါ။ `Choose-A-New-Password` နေရာမှာ ကိုယ်ပိုင် password အသစ်တစ်ခု ထည့်ပြီး မီးစိမ်း Run ခလုတ်ကိုနှိပ်ပါ။ ဒီအဆင့်မှာသာ MySQL admin account ကို သုံးပါ။ App ကို `root` ဖြင့် run မည်မဟုတ်ပါ။

```sql
CREATE DATABASE habit_manager CHARACTER SET utf8mb4;
CREATE USER 'habit_manager'@'localhost' IDENTIFIED BY 'Choose-A-New-Password';
GRANT ALL PRIVILEGES ON habit_manager.* TO 'habit_manager'@'localhost';
```

### အဆင့် ၂ — Backend အတွက် local config ကို တစ်ကြိမ်ပြင်ပါ

`.env.example` ကို `.env` အဖြစ် copy လုပ်ပြီး ဖွင့်ပါ။

```powershell
cd D:\Habit-Manager\Habit-Manager-Backend-main
Copy-Item .env.example .env
notepad .env
```

Notepad ထဲရှိ `DB_PASSWORD` ကို အဆင့် ၁ မှာ MySQL user အတွက် ရွေးခဲ့သော password နဲ့ အစားထိုးပါ။ `JWT_SECRET` ကိုလည်း ထူးခြားပြီး လျှို့ဝှက်ထားမည့် အနည်းဆုံး ၃၂ byte တန်ဖိုးနဲ့ အစားထိုးပါ။ ဥပမာ PowerShell မှာ အောက်ပါ command ကို run လုပ်ပြီး ထွက်လာတဲ့တန်ဖိုးကို `JWT_SECRET=` နောက်မှာ ထည့်ပါ။

```powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

ဖိုင်ကို Save လုပ်ပါ။ `.env` သည် Git ထဲမဝင်အောင် လျစ်လျူရှုထားပြီးသားဖြစ်သည်။ ဒီ config ပြင်ဆင်မှုကို တစ်ကြိမ်ပဲလုပ်ရပါမည်။

### အဆင့် ၃ — Backend ကိုဖွင့်ပါ

နောက်ပိုင်း Backend folder ကိုဖွင့်ပြီး အောက်ပါ command တစ်ကြောင်းတည်း run လုပ်နိုင်ပါပြီ။

```powershell
cd D:\Habit-Manager\Habit-Manager-Backend-main
.\mvnw.cmd spring-boot:run
```

Spring Boot သည် backend folder ရှိ `.env` မှ တန်ဖိုးများကို ဖတ်မည်။ ပထမဆုံး run ချိန်တွင် Maven dependency များ download လုပ်နိုင်သည်။ အောင်မြင်စွာစတင်ပါက `Started HabitManagerApplication` ပေါ်ပြီး backend သည် `http://localhost:8080` တွင် အလုပ်လုပ်မည်။ Database အသစ်ဆို Flyway က tables များကို ဖန်တီးပေးမည်။ ရပ်ရန် `Ctrl+C` နှိပ်ပါ။

Register အသစ်တွင် password ၅–၁၂ လုံး လက်ခံသည်။ လက်ရှိ project ထဲတွင် password အရှည်ကန့်သတ်ထားသောကြောင့် public production မတင်မီ ပိုမိုလုံခြုံသည့် password/passphrase အရှည်ကို ပြန်စဉ်းစားပါ။ Password reset အတွက် SMTP mail account ကို သတ်မှတ်ရန်လိုသည်။ Local development အတွက် PowerShell မှာ `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` နှင့် `FRONTEND_BASE_URL` ကိုသတ်မှတ်ပါ။ Reset လင့်ခ်သည် မိနစ် ၂၀ အတွင်း တစ်ကြိမ်သာ အသုံးပြုနိုင်သည်။ Password များအသစ်ကို PBKDF2 ဖြင့်သိမ်းပြီး အရင် BCrypt password များကိုလည်း login ဝင်နိုင်အောင် ထောက်ပံ့ထားသည်။

### AI Habit Coach ကိုဖွင့်ရန် (optional)

AI Coach ကို အခမဲ့ local model ဖြင့် သုံးနိုင်သည်။ [Ollama ကို download လုပ်ပြီး install လုပ်ပါ](https://ollama.com/download)။ ထို့နောက် backend folder ထဲတွင် terminal ဖွင့်ပြီး အောက်ပါ command ကို တစ်ကြိမ် run ပါ။ Model download အတွက် internet နှင့် disk space 1.9 GB ခန့် လိုအပ်သည်။ AI ဖန်တီးမှုကို သင့်ကွန်ပျူတာပေါ်မှာပဲ လုပ်ဆောင်ပြီး paid API key မလိုပါ။

```powershell
ollama pull qwen2.5:3b
```

Ollama ကိုဖွင့်ထားပြီး backend ကိုစတင်ပါ။ Sidebar မှ **AI Coach** ကိုဖွင့်ပြီး **Get my coaching plan** ကိုနှိပ်ပါ။ အကြံပြုချက်ကို English ဖြင့်ရရှိမည်။ ပထမဆုံးတောင်းဆိုမှုတွင် model ကိုဖွင့်ချိန်ကြာနိုင်သည်။ လက်ရှိ habit နှင့် နောက်ဆုံး ၇ ရက် progress ကို local model သို့ပေးပြီး အကြံပြုချက်ဖန်တီးမည်။ Ollama သည် ပုံမှန်အားဖြင့် `http://localhost:11434` တွင် အလုပ်လုပ်သည်။ `.env` ထဲတွင် `OLLAMA_BASE_URL` နှင့် `OLLAMA_MODEL` ကို ပြောင်းနိုင်သည်။

SMTP ကိုသတ်မှတ်လိုပါက backend ဖွင့်မည့် PowerShell window တစ်ခုတည်းမှာ အောက်ပါ variable များကို သင့် mail provider ၏ တန်ဖိုးများဖြင့် သတ်မှတ်ပါ။ Gmail အသုံးပြုပါက ပုံမှန် account password အစား app password သုံးပါ။

```powershell
$env:FRONTEND_BASE_URL = "http://localhost:5173"
$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "your-email@example.com"
$env:MAIL_PASSWORD = "your-mail-provider-app-password"
```

Backend ကို အဲဒီ window မှာ စတင်ပြီး app ကို ဖွင့်ထားမှ password reset email ပို့နိုင်မည်။

### အဆင့် ၃ — Frontend ကိုဖွင့်ပါ

PowerShell window ဒုတိယတစ်ခုဖွင့်ပါ။ Backend window ကို ဖွင့်ထားပြီးမှ အောက်ပါ command များကို run ပါ။

```powershell
cd D:\Habit-Manager\Habit-Manager-Frontend-main
npm ci
npm run dev
```

Terminal မှာပြသော local URL ကို browser ဖွင့်ပါ။ ပုံမှန်အားဖြင့် `http://localhost:5173` ဖြစ်သည်။ အဲဒီစာမျက်နှာမှာ register လုပ်ပြီး login ဝင်နိုင်ပါပြီ။ Frontend က `/api` request များကို development proxy ဖြင့် `http://localhost:8080` backend ဆီ အလိုအလျောက်ပို့ပေးထားသောကြောင့် local run အတွက် `VITE_API_URL` သို့မဟုတ် CORS setting ပြောင်းစရာမလိုပါ။

### အမှားတွေ့လျှင်

- MySQL ကိုမချိတ်နိုင်ဟု ပြပါက MySQL Server အလုပ်လုပ်နေခြင်း၊ database အမည်နှင့် port `3306` မှန်ခြင်းကို စစ်ပါ။
- `Access denied` ပြပါက `DB_USERNAME` နှင့် `DB_PASSWORD` ကို MySQL user နဲ့တိုက်စစ်ပါ။
- `JWT_SECRET` မရှိဟု ပြပါက backend folder ထဲရှိ `.env` ဖိုင်တွင် `JWT_SECRET` ပါမပါ စစ်ပါ။ `.env` သည် `.env.example` အဖြစ်ပဲ ကျန်နေခြင်းရှိမရှိလည်း စစ်ပါ။
- Port အသုံးပြုနေပြီးသားဟု ပြပါက အရင် backend/frontend process ကိုပိတ်ပြီး ပြန်စပါ။

Deploy လုပ်သောအခါတော့ `VITE_API_URL` ကို API base path (ပုံမှန်အားဖြင့် `/api`) အဖြစ်သတ်မှတ်ပြီး `CORS_ALLOWED_ORIGINS` တွင် frontend origin အတိအကျကို ထည့်ရမည်။

## ရှိပြီးသား database ကို အသုံးပြုခြင်း

ဤ version ကို deploy မလုပ်မီ database ကို backup လုပ်ပါ။ Database အသစ်ဆို Flyway က V1–V6 migration များကို အစဉ်လိုက်လုပ်ပါမည်။ အရင် version မှ schema ရှိပြီးသားဆိုပါက မိမိ schema ကို စစ်ဆေးပြီး Flyway ကို လက်ရှိ schema version တွင် baseline လုပ်ပါ။ Schema ကို မစစ်ဘဲ baseline မလုပ်ပါနှင့်။ Production တွင် `DB_DDL_AUTO=update` မသုံးပါနှင့်။

## အသုံးပြုသူအတွက် ပါဝင်သော feature များ

- Dashboard တွင် ယနေ့ schedule ရှိသော habit များကိုသာပြပြီး goal ပြည့်ခြင်းနှင့် တစ်စိတ်တစ်ပိုင်းတိုးတက်မှုကို ခွဲပြသည်။ မပြီးသေးသော check-in ကို ပြန်ပြင်နိုင်သည်။
- Habit ကို ဖန်တီး/ပြင်ဆင်၊ category အလိုက် စီစစ်၊ archive လုပ်ပြီး နောက်မှ restore လုပ်နိုင်သည်။ Archive လုပ်ခြင်းက check-in history ကို မဖျက်ပါ။
- Calendar နဲ့ weekly insights တွင် habit schedule ရှိသောနေ့များအပေါ်သာ progress တွက်သည်။ User settings မှ timezone ကို ပြောင်းနိုင်သည်။
- Habit တစ်ခုစီအတွက် reminder အချိန်နှင့် ရက်များ သတ်မှတ်နိုင်သည်။ In-app reminder သည် browser ထဲတွင် app ဖွင့်ထားသည့်အချိန်သာ ပေါ်မည်။ Email ပို့ရန် SMTP သတ်မှတ်ရန်လိုသည်။
- Settings မှ data ကို JSON အဖြစ် download လုပ်ခြင်း၊ password ဖြင့်အတည်ပြုပြီး account ဖျက်ခြင်း လုပ်နိုင်သည်။ Login စာမျက်နှာမှ password reset email တောင်းနိုင်သည်။

## Production အတွက် ပြင်ဆင်ခြင်း

Secret အားလုံးကို secret manager သို့မဟုတ် environment variable များမှ ပေးပါ။ Client နှင့် API ကြား TLS အသုံးပြုပါ၊ ခွင့်ပြုချက်ကန့်သတ်ထားသော MySQL account သုံးပါ၊ ထူးခြားခိုင်မာသော JWT signing key ဖန်တီးပါ၊ app အတွက် သီးသန့် mail account သို့မဟုတ် provider အသုံးပြုပါ။ `CORS_ALLOWED_ORIGINS` တွင် ခွင့်ပြုမည့် public frontend origin များကို အတိအကျ သတ်မှတ်ပါ။ ဖြစ်နိုင်ပါက frontend နှင့် API ကို origin တစ်ခုတည်းရှိ reverse proxy နောက်တွင် ထားပါ။

Backend တွင် Spring Boot health နှင့် readiness/liveness probe endpoint များကို `/actuator/health` အောက်တွင် ဖွင့်ထားသည်။ အသေးစိတ် health အချက်အလက်များကို ပြင်ပသို့ မဖော်ပြပါ။

Register လုပ်ရာတွင် username ၃–၅၀ လုံး၊ မှန်ကန်သော email နှင့် password ၅–၁၂ လုံး လိုအပ်သည်။ လက်ရှိ browser session အတွင်း authentication token ကို `sessionStorage` ထဲတွင်ထားပြီး ပုံမှန်အားဖြင့် တစ်နာရီအကြာ သက်တမ်းကုန်မည်။ Public production မတင်မီ password အရှည်ကန့်သတ်ချက်ကို ပြန်စဉ်းစားပြီး HttpOnly cookie သို့ပြောင်းခြင်းနှင့် authentication rate limit ထည့်ခြင်းတို့ကို စီစဉ်ပါ။ Settings စာမျက်နှာမှ user က data export သို့မဟုတ် account deletion လုပ်နိုင်သည်။

## စစ်ဆေးရန် command များ

- Frontend lint စစ်ရန်: `npm run lint`
- Frontend production bundle တည်ဆောက်ရန်: `npm run build`
- Test များမမောင်းဘဲ backend compile/package လုပ်ရန်: `mvn -DskipTests package`
